import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createTicketSchema } from "@/lib/validations/ticket";
import { hashEmployeeCode, maskEmployeeCode, encryptEmployeeCode } from "@/lib/employee-code";
import { generateTicketCode } from "@/lib/ticket-code";
import { findResponsibleTeam } from "@/lib/assignment";
import { AuditLogger, AuditAction } from "@/lib/security/audit-logger";
import crypto from "crypto";

// Rate limiting: เก็บ IP และเวลาที่ส่งล่าสุด
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 นาที
const MAX_REQUESTS_PER_WINDOW = 3; // สูงสุด 3 requests ต่อนาที

// Duplicate detection: เก็บ hash ของ request ล่าสุด
const recentSubmissions = new Map<string, number>();
const DUPLICATE_WINDOW = 5 * 60 * 1000; // 5 นาที

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return ip;
}

function generateRequestHash(data: { employeeCode: string; subject: string; description: string }): string {
  const content = `${data.employeeCode}|${data.subject}|${data.description}`;
  return crypto.createHash("md5").update(content).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const now = Date.now();

    // Rate Limiting Check
    const rateLimit = rateLimitMap.get(clientIP);
    if (rateLimit) {
      if (now - rateLimit.lastReset > RATE_LIMIT_WINDOW) {
        // Reset window
        rateLimitMap.set(clientIP, { count: 1, lastReset: now });
      } else if (rateLimit.count >= MAX_REQUESTS_PER_WINDOW) {
        return NextResponse.json(
          { error: "คุณส่งคำร้องบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่" },
          { status: 429 }
        );
      } else {
        rateLimit.count++;
      }
    } else {
      rateLimitMap.set(clientIP, { count: 1, lastReset: now });
    }

    const body = await request.json();
    
    // Validate input
    const validationResult = createTicketSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "ข้อมูลไม่ถูกต้อง", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Duplicate Detection Check
    const requestHash = generateRequestHash({
      employeeCode: data.employeeCode,
      subject: data.subject,
      description: data.description,
    });

    const lastSubmission = recentSubmissions.get(requestHash);
    if (lastSubmission && now - lastSubmission < DUPLICATE_WINDOW) {
      return NextResponse.json(
        { error: "คำร้องนี้ถูกส่งไปแล้ว กรุณารอสักครู่หรือตรวจสอบสถานะคำร้องเดิม" },
        { status: 409 }
      );
    }
    recentSubmissions.set(requestHash, now);

    // Cleanup old entries (ทุก 100 requests)
    if (recentSubmissions.size > 100) {
      for (const [hash, time] of recentSubmissions.entries()) {
        if (now - time > DUPLICATE_WINDOW) {
          recentSubmissions.delete(hash);
        }
      }
    }

    // Generate unique ticket code
    let ticketCode: string;
    let attempts = 0;
    do {
      ticketCode = generateTicketCode();
      const existing = await prisma.ticket.findUnique({
        where: { ticketCode },
      });
      if (!existing) break;
      attempts++;
    } while (attempts < 10);

    if (attempts >= 10) {
      return NextResponse.json(
        { error: "ไม่สามารถสร้างรหัส Ticket ได้ กรุณาลองใหม่อีกครั้ง" },
        { status: 500 }
      );
    }

    // Process employee code
    const employeeCodeHash = hashEmployeeCode(data.employeeCode);
    const employeeCodeMasked = maskEmployeeCode(data.employeeCode);
    const employeeCodeEnc = encryptEmployeeCode(data.employeeCode);

    // Find responsible team based on assignment rules
    const { teamId } = await findResponsibleTeam(data.systemId, data.categoryId);

    // Get user agent
    const userAgent = request.headers.get("user-agent") || undefined;

    // Create ticket
    const ticket = await prisma.ticket.create({
      data: {
        ticketCode,
        employeeCodeHash,
        employeeCodeMasked,
        employeeCodeEnc,
        fullName: data.fullName,
        email: data.email || null,
        phone: data.phone || null,
        bureau: data.bureau,
        division: data.division,
        department: data.department,
        orgUnitId: data.orgUnitId,
        categoryId: data.categoryId,
        priorityId: data.priorityId,
        systemId: data.systemId,
        teamId: teamId, // Auto-assign team
        subject: data.subject,
        description: data.description,
        status: "NEW",
        requesterIp: clientIP,
        requesterUserAgent: userAgent,
      },
    });

    // Create initial status log
    await prisma.ticketStatusLog.create({
      data: {
        ticketId: ticket.id,
        toStatus: "NEW",
        note: "สร้างรายการแจ้งปัญหาใหม่",
      },
    });

    // Log ticket creation
    await AuditLogger.log({
      action: AuditAction.CREATE_TICKET,
      entityType: "ticket",
      entityId: ticket.id,
      after: {
        ticketCode: ticket.ticketCode,
        subject: ticket.subject,
        fullName: ticket.fullName,
        categoryId: ticket.categoryId,
        priorityId: ticket.priorityId,
      },
      ip: clientIP,
      userAgent,
    });

    // Create attachments if any
    if (data.attachments && data.attachments.length > 0) {
      await prisma.attachment.createMany({
        data: data.attachments.map((att) => ({
          ticketId: ticket.id,
          uploaderType: "USER" as const,
          fileUrl: att.fileUrl,
          fileName: att.fileName,
          mimeType: att.mimeType,
          sizeBytes: att.sizeBytes,
        })),
      });
    }

    // Send notification for new ticket
    try {
      const { NotificationManager } = await import('@/lib/notification/manager');
      const notificationManager = new NotificationManager();
      await notificationManager.initialize();

      // Get ticket details for notification
      const ticketWithDetails = await prisma.ticket.findUnique({
        where: { id: ticket.id },
        include: {
          category: { select: { name: true } },
          priority: { select: { name: true } },
          system: { select: { name: true } },
          team: { select: { name: true } },
        }
      });

      if (ticketWithDetails) {
        const notificationData = {
          ticketId: ticket.id,
          ticketCode: ticket.ticketCode,
          subject: ticket.subject,
          description: ticket.description,
          status: 'ใหม่',
          priority: ticketWithDetails.priority?.name || 'ไม่ระบุ',
          category: ticketWithDetails.category?.name || 'ไม่ระบุ',
          requesterName: ticket.fullName,
          url: `${process.env.NEXTAUTH_URL}/admin/tickets/${ticket.id}`,
        };

        // Get team members to notify (only if teamId exists)
        if (teamId) {
          const teamMembers = await prisma.staffTeamMap.findMany({
            where: { teamId },
            select: { staff: { select: { email: true } } }
          });

          const recipients = teamMembers
            .map((member: { staff: { email: string | null } }) => member.staff?.email)
            .filter(Boolean) as string[];
          
          if (recipients.length > 0) {
            await notificationManager.notifyTicketCreated(notificationData, recipients);
          }
        }
      }
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
      // Don't fail the ticket creation if notification fails
    }

    return NextResponse.json({
      success: true,
      ticketCode: ticket.ticketCode,
      message: "สร้างรายการแจ้งปัญหาเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างรายการ กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}

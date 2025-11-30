import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { trackTicketSchema } from "@/lib/validations/ticket";
import { hashEmployeeCode } from "@/lib/employee-code";
import { normalizeTicketCode } from "@/lib/ticket-code";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = trackTicketSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "ข้อมูลไม่ถูกต้อง", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { ticketCode, employeeCode } = validationResult.data;

    // Find ticket
    const normalizedTicketCode = normalizeTicketCode(ticketCode);
    const employeeCodeHash = hashEmployeeCode(employeeCode);

    const ticket = await prisma.ticket.findFirst({
      where: {
        ticketCode: normalizedTicketCode,
        employeeCodeHash: employeeCodeHash,
      },
      include: {
        category: {
          select: { name: true },
        },
        priority: {
          select: { name: true, severity: true },
        },
        system: {
          select: { name: true },
        },
        assignee: {
          select: { displayName: true },
        },
        attachments: {
          where: { uploaderType: "USER" },
          select: {
            id: true,
            fileName: true,
            fileUrl: true,
            mimeType: true,
            sizeBytes: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
        comments: {
          where: { visibility: "PUBLIC" },
          select: {
            id: true,
            authorType: true,
            message: true,
            createdAt: true,
            staffUser: {
              select: { displayName: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        statusLogs: {
          select: {
            id: true,
            fromStatus: true,
            toStatus: true,
            note: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
        satisfactionSurvey: {
          select: {
            rating: true,
            feedback: true,
            createdAt: true,
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: "ไม่พบรายการ Ticket หรือรหัสพนักงานไม่ถูกต้อง" },
        { status: 404 }
      );
    }

    // Prepare response (hide sensitive data)
    const response = {
      ticketCode: ticket.ticketCode,
      status: ticket.status,
      subject: ticket.subject,
      description: ticket.description,
      fullName: ticket.fullName,
      employeeCodeMasked: ticket.employeeCodeMasked,
      bureau: ticket.bureau,
      division: ticket.division,
      department: ticket.department,
      category: ticket.category?.name,
      priority: ticket.priority?.name,
      prioritySeverity: ticket.priority?.severity,
      system: ticket.system?.name,
      assignee: ticket.assignee?.displayName,
      attachments: ticket.attachments,
      comments: ticket.comments.map((c: {
        id: string;
        authorType: string;
        message: string;
        createdAt: Date;
        staffUser: { displayName: string } | null;
      }) => ({
        id: c.id,
        authorType: c.authorType,
        authorName: c.authorType === "STAFF" ? c.staffUser?.displayName : "ผู้แจ้ง",
        message: c.message,
        createdAt: c.createdAt,
      })),
      statusLogs: ticket.statusLogs,
      survey: ticket.satisfactionSurvey,
      canSubmitSurvey: 
        !ticket.satisfactionSurvey && 
        (ticket.status === "RESOLVED" || ticket.status === "CLOSED"),
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      resolvedAt: ticket.resolvedAt,
      closedAt: ticket.closedAt,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error tracking ticket:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการค้นหา กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}

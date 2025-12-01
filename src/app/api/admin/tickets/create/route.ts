import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashEmployeeCode, maskEmployeeCode, encryptEmployeeCode } from "@/lib/employee-code";
import { generateTicketCode } from "@/lib/ticket-code";
import { findResponsibleTeam } from "@/lib/assignment";
import { z } from "zod";

// Schema สำหรับ Admin สร้าง Ticket
const adminCreateTicketSchema = z.object({
  employeeCode: z.string().length(7).regex(/^[0-9]{7}$/),
  fullName: z.string().min(2).max(120),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().regex(/^[0-9]{9,10}$/).optional().or(z.literal("")),
  bureau: z.string().min(1),
  division: z.string().min(1),
  department: z.string().min(1),
  categoryId: z.string().optional(),
  priorityId: z.string().optional(),
  systemId: z.string().optional(),
  subject: z.string().min(5).max(150),
  description: z.string().min(10).max(4000),
  assigneeId: z.string().optional(),
  teamId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validationResult = adminCreateTicketSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "ข้อมูลไม่ถูกต้อง", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

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

    // Find responsible team if not specified
    let teamId = data.teamId;
    if (!teamId) {
      const result = await findResponsibleTeam(data.systemId, data.categoryId);
      teamId = result.teamId || undefined;
    }

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
        categoryId: data.categoryId,
        priorityId: data.priorityId,
        systemId: data.systemId,
        teamId: teamId,
        assigneeId: data.assigneeId,
        subject: data.subject,
        description: data.description,
        status: "NEW",
        createdByStaffId: session.user.id,
      },
    });

    // Create initial status log
    await prisma.ticketStatusLog.create({
      data: {
        ticketId: ticket.id,
        changedByStaffId: session.user.id,
        toStatus: "NEW",
        note: `สร้างรายการแจ้งปัญหาโดย ${session.user.name || session.user.email}`,
      },
    });

    return NextResponse.json({
      success: true,
      ticketId: ticket.id,
      ticketCode: ticket.ticketCode,
      message: "สร้าง Ticket สำเร็จ",
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้าง Ticket" },
      { status: 500 }
    );
  }
}

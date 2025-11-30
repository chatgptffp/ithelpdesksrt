import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createTicketSchema } from "@/lib/validations/ticket";
import { hashEmployeeCode, maskEmployeeCode, encryptEmployeeCode } from "@/lib/employee-code";
import { generateTicketCode } from "@/lib/ticket-code";
import { findResponsibleTeam } from "@/lib/assignment";

export async function POST(request: NextRequest) {
  try {
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

    // Create ticket
    const ticket = await prisma.ticket.create({
      data: {
        ticketCode,
        employeeCodeHash,
        employeeCodeMasked,
        employeeCodeEnc,
        fullName: data.fullName,
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

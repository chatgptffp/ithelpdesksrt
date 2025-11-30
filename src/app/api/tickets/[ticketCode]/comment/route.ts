import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { userCommentSchema } from "@/lib/validations/ticket";
import { hashEmployeeCode } from "@/lib/employee-code";
import { normalizeTicketCode } from "@/lib/ticket-code";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ticketCode: string }> }
) {
  try {
    const { ticketCode: ticketCodeParam } = await params;
    const body = await request.json();
    
    // Validate input
    const validationResult = userCommentSchema.safeParse({
      ...body,
      ticketCode: ticketCodeParam,
    });
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "ข้อมูลไม่ถูกต้อง", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { ticketCode, employeeCode, message } = validationResult.data;

    // Verify ticket ownership
    const normalizedTicketCode = normalizeTicketCode(ticketCode);
    const employeeCodeHash = hashEmployeeCode(employeeCode);

    const ticket = await prisma.ticket.findFirst({
      where: {
        ticketCode: normalizedTicketCode,
        employeeCodeHash: employeeCodeHash,
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: "ไม่พบรายการ Ticket หรือรหัสพนักงานไม่ถูกต้อง" },
        { status: 404 }
      );
    }

    // Check if ticket allows comments
    if (ticket.status === "CLOSED" || ticket.status === "REJECTED") {
      return NextResponse.json(
        { error: "ไม่สามารถเพิ่มข้อความในรายการที่ปิดแล้ว" },
        { status: 400 }
      );
    }

    // Create comment
    await prisma.comment.create({
      data: {
        ticketId: ticket.id,
        authorType: "USER",
        visibility: "PUBLIC",
        message,
      },
    });

    // Update ticket updatedAt
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: "เพิ่มข้อความเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}

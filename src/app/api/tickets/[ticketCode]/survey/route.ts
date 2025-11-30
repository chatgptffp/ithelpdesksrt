import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { surveySchema } from "@/lib/validations/ticket";
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
    const validationResult = surveySchema.safeParse({
      ...body,
      ticketCode: ticketCodeParam,
    });
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "ข้อมูลไม่ถูกต้อง", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { ticketCode, employeeCode, rating, feedback } = validationResult.data;

    // Verify ticket ownership
    const normalizedTicketCode = normalizeTicketCode(ticketCode);
    const employeeCodeHash = hashEmployeeCode(employeeCode);

    const ticket = await prisma.ticket.findFirst({
      where: {
        ticketCode: normalizedTicketCode,
        employeeCodeHash: employeeCodeHash,
      },
      include: {
        satisfactionSurvey: true,
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: "ไม่พบรายการ Ticket หรือรหัสพนักงานไม่ถูกต้อง" },
        { status: 404 }
      );
    }

    // Check if already submitted
    if (ticket.satisfactionSurvey) {
      return NextResponse.json(
        { error: "คุณได้ประเมินความพึงพอใจไปแล้ว" },
        { status: 400 }
      );
    }

    // Check status
    if (ticket.status !== "RESOLVED" && ticket.status !== "CLOSED") {
      return NextResponse.json(
        { error: "สามารถประเมินได้เมื่อสถานะเป็น แก้ไขแล้ว หรือ ปิดงาน เท่านั้น" },
        { status: 400 }
      );
    }

    // Create survey
    await prisma.satisfactionSurvey.create({
      data: {
        ticketId: ticket.id,
        rating,
        feedback: feedback || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "ขอบคุณสำหรับการประเมินความพึงพอใจ",
    });
  } catch (error) {
    console.error("Error submitting survey:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}

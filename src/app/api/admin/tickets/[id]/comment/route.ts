import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { message, isInternal } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: "กรุณาระบุข้อความ" }, { status: 400 });
    }

    // Verify ticket exists
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!ticket) {
      return NextResponse.json({ error: "ไม่พบข้อมูล Ticket" }, { status: 404 });
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        ticketId: id,
        authorType: "STAFF",
        staffUserId: session.user.id,
        message: message.trim(),
        visibility: isInternal ? "INTERNAL" : "PUBLIC",
      },
    });

    // Update ticket updatedAt
    await prisma.ticket.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      comment,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการเพิ่มข้อความ" },
      { status: 500 }
    );
  }
}

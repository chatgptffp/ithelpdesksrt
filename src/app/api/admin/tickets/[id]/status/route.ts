import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PUT(
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
    const { status, note } = body;

    // Validate status
    const validStatuses = ["NEW", "IN_PROGRESS", "WAITING_USER", "RESOLVED", "CLOSED", "REJECTED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "สถานะไม่ถูกต้อง" }, { status: 400 });
    }

    // Get current ticket
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!ticket) {
      return NextResponse.json({ error: "ไม่พบข้อมูล Ticket" }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = { status };

    // Set resolved/closed timestamps
    if (status === "RESOLVED" && ticket.status !== "RESOLVED") {
      updateData.resolvedAt = new Date();
    } else if (status === "CLOSED" && ticket.status !== "CLOSED") {
      updateData.closedAt = new Date();
    } else if (status !== "RESOLVED" && status !== "CLOSED") {
      updateData.resolvedAt = null;
      updateData.closedAt = null;
    }

    // Update ticket and create status log
    const [updatedTicket] = await prisma.$transaction([
      prisma.ticket.update({
        where: { id },
        data: updateData,
      }),
      prisma.ticketStatusLog.create({
        data: {
          ticket: { connect: { id } },
          fromStatus: ticket.status,
          toStatus: status,
          note: note || null,
          changedBy: { connect: { id: session.user.id } },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("Error updating status:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการเปลี่ยนสถานะ" },
      { status: 500 }
    );
  }
}

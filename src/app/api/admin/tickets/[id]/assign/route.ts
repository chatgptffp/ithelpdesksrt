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
    const { assigneeId, teamId } = body;

    if (!assigneeId && !teamId) {
      return NextResponse.json({ error: "กรุณาระบุผู้รับผิดชอบหรือทีม" }, { status: 400 });
    }

    let assigneeName = "";
    let teamName = "";

    // Verify assignee exists if provided
    if (assigneeId) {
      const assignee = await prisma.staffUser.findUnique({
        where: { id: assigneeId },
        select: { id: true, displayName: true },
      });
      if (!assignee) {
        return NextResponse.json({ error: "ไม่พบผู้ใช้งาน" }, { status: 404 });
      }
      assigneeName = assignee.displayName;
    }

    // Verify team exists if provided
    if (teamId) {
      const team = await prisma.supportTeam.findUnique({
        where: { id: teamId },
        select: { id: true, name: true },
      });
      if (!team) {
        return NextResponse.json({ error: "ไม่พบทีม" }, { status: 404 });
      }
      teamName = team.name;
    }

    // Get current ticket
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      select: { status: true, assigneeId: true, teamId: true },
    });

    if (!ticket) {
      return NextResponse.json({ error: "ไม่พบข้อมูล Ticket" }, { status: 404 });
    }

    // Update ticket
    const updateData: { assigneeId?: string | null; teamId?: string | null; status?: string } = {};
    
    if (assigneeId !== undefined) {
      updateData.assigneeId = assigneeId || null;
    }
    if (teamId !== undefined) {
      updateData.teamId = teamId || null;
    }
    
    // Auto change status to IN_PROGRESS if currently NEW and assigning
    if (ticket.status === "NEW" && (assigneeId || teamId)) {
      updateData.status = "IN_PROGRESS";
    }

    // Build note
    const notes: string[] = [];
    if (teamName) notes.push(`โอนไปทีม ${teamName}`);
    if (assigneeName) notes.push(`มอบหมายให้ ${assigneeName}`);
    const note = notes.join(", ");

    const [updatedTicket] = await prisma.$transaction([
      prisma.ticket.update({
        where: { id },
        data: updateData,
      }),
      // Create status log if status changed or assignment changed
      ...(updateData.status || note
        ? [
            prisma.ticketStatusLog.create({
              data: {
                ticketId: id,
                fromStatus: ticket.status,
                toStatus: updateData.status || ticket.status,
                note: note || null,
                changedById: session.user.id,
              },
            }),
          ]
        : []),
    ]);

    return NextResponse.json({
      success: true,
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("Error assigning ticket:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการมอบหมายงาน" },
      { status: 500 }
    );
  }
}

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

    // Send notification for new comment (only for public comments)
    if (!isInternal) {
      try {
        const { NotificationManager } = await import('@/lib/notification/manager');
        const notificationManager = new NotificationManager();
        await notificationManager.initialize();

        // Get ticket details for notification
        const ticketWithDetails = await prisma.ticket.findUnique({
          where: { id },
          include: {
            assignee: { select: { email: true } },
            team: { 
              select: { 
                members: { 
                  select: { 
                    staff: { select: { email: true } }
                  } 
                }
              } 
            },
          }
        });

        if (ticketWithDetails) {
          const notificationData = {
            ticketId: id,
            ticketCode: ticketWithDetails.ticketCode,
            subject: ticketWithDetails.subject,
            comment: message.trim(),
            url: `${process.env.NEXTAUTH_URL}/admin/tickets/${id}`,
          };

          // Get recipients (assignee + team members)
          const recipients: string[] = [];
          if (ticketWithDetails.assignee?.email) {
            recipients.push(ticketWithDetails.assignee.email);
          }
          if (ticketWithDetails.team?.members) {
            ticketWithDetails.team.members.forEach((member: { staff: { email: string | null } }) => {
              if (member.staff?.email && !recipients.includes(member.staff.email)) {
                recipients.push(member.staff.email);
              }
            });
          }
          
          if (recipients.length > 0) {
            await notificationManager.notifyCommentAdded(notificationData, recipients);
          }
        }
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
        // Don't fail the comment creation if notification fails
      }
    }

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

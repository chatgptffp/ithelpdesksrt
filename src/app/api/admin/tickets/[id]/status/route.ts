import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { del } from "@vercel/blob";

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

    // Get current ticket with attachments
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      select: { 
        status: true,
        attachments: {
          select: { id: true, fileUrl: true }
        }
      },
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

    // ลบไฟล์แนบเมื่อ Ticket ถูกปิดหรือแก้ไขแล้ว
    if ((status === "RESOLVED" || status === "CLOSED") && ticket.attachments.length > 0) {
      try {
        // ลบไฟล์จาก Vercel Blob
        const deletePromises = ticket.attachments
          .filter((att: { id: string; fileUrl: string }) => att.fileUrl.includes("blob.vercel-storage.com"))
          .map((att: { id: string; fileUrl: string }) => del(att.fileUrl));
        
        await Promise.allSettled(deletePromises);

        // ลบ record จาก database
        await prisma.attachment.deleteMany({
          where: { ticketId: id }
        });

        console.log(`Deleted ${ticket.attachments.length} attachments for ticket ${id}`);
      } catch (deleteError) {
        console.error("Error deleting attachments:", deleteError);
        // ไม่ throw error เพราะการเปลี่ยนสถานะสำเร็จแล้ว
      }
    }

    // Send notification for status change
    try {
      const { NotificationManager } = await import('@/lib/notification/manager');
      const notificationManager = new NotificationManager();
      await notificationManager.initialize();

      // Get ticket details for notification
      const ticketWithDetails = await prisma.ticket.findUnique({
        where: { id },
        include: {
          category: { select: { name: true } },
          priority: { select: { name: true } },
          assignee: { select: { displayName: true, email: true } },
          team: { 
            select: { 
              name: true,
              members: { select: { email: true } }
            } 
          },
        }
      });

      if (ticketWithDetails) {
        const statusLabels: Record<string, string> = {
          NEW: "ใหม่",
          IN_PROGRESS: "กำลังดำเนินการ", 
          WAITING_USER: "รอข้อมูล",
          RESOLVED: "แก้ไขแล้ว",
          CLOSED: "ปิดงาน",
          REJECTED: "ปฏิเสธ",
        };

        const notificationData = {
          ticketId: id,
          ticketCode: ticketWithDetails.ticketCode,
          subject: ticketWithDetails.subject,
          status: statusLabels[status] || status,
          assigneeName: ticketWithDetails.assignee?.displayName || 'ไม่ระบุ',
          url: `${process.env.NEXTAUTH_URL}/admin/tickets/${id}`,
        };

        // Get recipients (assignee + team members)
        const recipients: string[] = [];
        if (ticketWithDetails.assignee?.email) {
          recipients.push(ticketWithDetails.assignee.email);
        }
        if (ticketWithDetails.team?.members) {
          ticketWithDetails.team.members.forEach((member: { email: string | null }) => {
            if (member.email && !recipients.includes(member.email)) {
              recipients.push(member.email);
            }
          });
        }
        
        if (recipients.length > 0) {
          await notificationManager.notifyStatusChanged(notificationData, recipients);
        }
      }
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
      // Don't fail the status update if notification fails
    }

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

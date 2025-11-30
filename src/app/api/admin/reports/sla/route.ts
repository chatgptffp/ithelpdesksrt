import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

interface TicketWithSLA {
  id: string;
  ticketCode: string;
  subject: string;
  status: string;
  fullName: string;
  bureau: string;
  createdAt: Date;
  priority: {
    name: string;
    slaFirstResponseMins: number | null;
    slaResolveMins: number | null;
  } | null;
  team: { name: string } | null;
  assignee: { displayName: string } | null;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get open tickets with priority SLA info
    const openTickets = await db.ticket.findMany({
      where: {
        status: {
          in: ["NEW", "IN_PROGRESS", "WAITING_USER"],
        },
      },
      include: {
        priority: {
          select: {
            name: true,
            slaFirstResponseMins: true,
            slaResolveMins: true,
          },
        },
        team: { select: { name: true } },
        assignee: { select: { displayName: true } },
      },
      orderBy: { createdAt: "asc" },
    }) as TicketWithSLA[];

    const now = new Date();

    // Calculate SLA status for each ticket
    const ticketsWithSLA = openTickets.map((ticket) => {
      const createdAt = new Date(ticket.createdAt);
      const ageMinutes = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60));
      const ageHours = Math.floor(ageMinutes / 60);
      const ageDays = Math.floor(ageHours / 24);

      const slaResponseMinutes = ticket.priority?.slaFirstResponseMins || 480; // Default 8 hours
      const slaResolveMinutes = ticket.priority?.slaResolveMins || 1440; // Default 24 hours

      const responseBreached = ageMinutes > slaResponseMinutes;
      const resolveBreached = ageMinutes > slaResolveMinutes;
      const responsePercent = Math.min(100, Math.round((ageMinutes / slaResponseMinutes) * 100));
      const resolvePercent = Math.min(100, Math.round((ageMinutes / slaResolveMinutes) * 100));

      // Format age
      let ageText = "";
      if (ageDays > 0) {
        ageText = `${ageDays} วัน ${ageHours % 24} ชม.`;
      } else if (ageHours > 0) {
        ageText = `${ageHours} ชม. ${ageMinutes % 60} นาที`;
      } else {
        ageText = `${ageMinutes} นาที`;
      }

      return {
        id: ticket.id,
        ticketCode: ticket.ticketCode,
        subject: ticket.subject,
        status: ticket.status,
        fullName: ticket.fullName,
        bureau: ticket.bureau,
        createdAt: ticket.createdAt,
        priority: ticket.priority?.name || "ไม่ระบุ",
        team: ticket.team?.name || "ไม่ระบุ",
        assignee: ticket.assignee?.displayName || "ยังไม่มอบหมาย",
        ageMinutes,
        ageText,
        slaResponseMinutes,
        slaResolveMinutes,
        responseBreached,
        resolveBreached,
        responsePercent,
        resolvePercent,
      };
    });

    // Separate breached and at-risk tickets
    const breachedTickets = ticketsWithSLA.filter((t) => t.resolveBreached);
    const atRiskTickets = ticketsWithSLA.filter(
      (t) => !t.resolveBreached && t.resolvePercent >= 75
    );
    const onTrackTickets = ticketsWithSLA.filter(
      (t) => !t.resolveBreached && t.resolvePercent < 75
    );

    // Summary stats
    const summary = {
      total: ticketsWithSLA.length,
      breached: breachedTickets.length,
      atRisk: atRiskTickets.length,
      onTrack: onTrackTickets.length,
      breachedPercent: ticketsWithSLA.length > 0 
        ? Math.round((breachedTickets.length / ticketsWithSLA.length) * 100) 
        : 0,
    };

    return NextResponse.json({
      summary,
      breachedTickets,
      atRiskTickets,
      onTrackTickets,
      allTickets: ticketsWithSLA,
    });
  } catch (error) {
    console.error("SLA report error:", error);
    return NextResponse.json(
      { error: "Failed to generate SLA report" },
      { status: 500 }
    );
  }
}

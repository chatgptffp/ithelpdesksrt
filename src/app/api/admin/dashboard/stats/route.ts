import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get date range for last 7 days
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 6);
    last7Days.setHours(0, 0, 0, 0);

    // Get tickets by day for last 7 days
    const ticketsByDay = await db.ticket.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: {
          gte: last7Days,
          lte: today,
        },
      },
      _count: true,
    });

    // Process into daily counts
    const dailyData: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      
      const count = ticketsByDay.filter((t: { createdAt: Date; _count: number }) => {
        const ticketDate = new Date(t.createdAt).toISOString().split("T")[0];
        return ticketDate === dateStr;
      }).reduce((sum: number, t: { _count: number }) => sum + t._count, 0);
      
      dailyData.push({
        date: date.toLocaleDateString("th-TH", { weekday: "short", day: "numeric" }),
        count,
      });
    }

    // Get tickets by status
    const ticketsByStatus = await db.ticket.groupBy({
      by: ["status"],
      _count: true,
    });

    const statusLabels: Record<string, string> = {
      NEW: "รับแจ้งใหม่",
      IN_PROGRESS: "กำลังดำเนินการ",
      WAITING_USER: "รอข้อมูล",
      RESOLVED: "แก้ไขแล้ว",
      CLOSED: "ปิดงาน",
      REJECTED: "ไม่รับดำเนินการ",
    };

    const statusData = ticketsByStatus.map((s: { status: string; _count: number }) => ({
      name: statusLabels[s.status] || s.status,
      value: s._count,
      status: s.status,
    }));

    // Get tickets by category
    const ticketsByCategory = await db.ticket.groupBy({
      by: ["categoryId"],
      _count: true,
      orderBy: {
        _count: {
          categoryId: "desc",
        },
      },
      take: 5,
    });

    const categoryIds = ticketsByCategory.map((t) => t.categoryId).filter(Boolean) as string[];
    const categories = categoryIds.length > 0 ? await db.mdCategory.findMany({
      where: {
        id: { in: categoryIds },
      },
    }) : [];

    const categoryData = ticketsByCategory
      .filter((t) => t.categoryId)
      .map((t) => ({
        name: categories.find((c) => c.id === t.categoryId)?.name || "ไม่ระบุ",
        value: t._count,
      }));

    // Get tickets by team
    const ticketsByTeam = await db.ticket.groupBy({
      by: ["teamId"],
      _count: true,
      orderBy: {
        _count: {
          teamId: "desc",
        },
      },
    });

    const teamIds = ticketsByTeam.map((t) => t.teamId).filter(Boolean) as string[];
    const teams = teamIds.length > 0 ? await db.supportTeam.findMany({
      where: {
        id: { in: teamIds },
      },
    }) : [];

    const teamData = ticketsByTeam
      .filter((t) => t.teamId)
      .map((t) => ({
        name: teams.find((team) => team.id === t.teamId)?.name || "ไม่ระบุ",
        value: t._count,
      }));

    // Get satisfaction distribution
    const satisfactionData = await db.satisfactionSurvey.groupBy({
      by: ["rating"],
      _count: true,
    });

    const ratingLabels: Record<number, string> = {
      1: "แย่มาก",
      2: "แย่",
      3: "ปานกลาง",
      4: "ดี",
      5: "ดีมาก",
    };

    const ratingData = [1, 2, 3, 4, 5].map((rating) => ({
      name: ratingLabels[rating],
      value: satisfactionData.find((s) => s.rating === rating)?._count || 0,
      rating,
    }));

    return NextResponse.json({
      dailyData,
      statusData,
      categoryData,
      teamData,
      ratingData,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}

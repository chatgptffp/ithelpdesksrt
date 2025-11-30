import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import * as XLSX from "xlsx";

export async function GET(request: NextRequest) {
  console.log("[Reports API] Starting request...");
  try {
    const session = await getServerSession(authOptions);
    console.log("[Reports API] Session:", session ? "authenticated" : "no session");
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");
    const format = searchParams.get("format") || "json";

    // Build where clause
    const where: Record<string, unknown> = {};
    
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate + "T23:59:59.999Z"),
      };
    }
    
    if (status && status !== "all") {
      where.status = status;
    }

    console.log("[Reports API] Querying tickets with where:", JSON.stringify(where));
    const tickets = await db.ticket.findMany({
      where,
      include: {
        category: true,
        priority: true,
        system: true,
        team: true,
        assignee: {
          select: { displayName: true },
        },
        satisfactionSurvey: {
          select: { rating: true, feedback: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    console.log("[Reports API] Found", tickets.length, "tickets");

    // Return JSON for preview
    if (format === "json") {
      return NextResponse.json({
        count: tickets.length,
        tickets: tickets.map((t: typeof tickets[number]) => ({
          ticketCode: t.ticketCode,
          subject: t.subject,
          status: t.status,
          fullName: t.fullName,
          bureau: t.bureau,
          division: t.division,
          department: t.department,
          category: t.category?.name || "-",
          priority: t.priority?.name || "-",
          system: t.system?.name || "-",
          team: t.team?.name || "-",
          assignee: t.assignee?.displayName || "-",
          createdAt: t.createdAt,
          resolvedAt: t.resolvedAt,
          closedAt: t.closedAt,
        })),
      });
    }

    // Export to Excel
    const statusLabels: Record<string, string> = {
      NEW: "รับแจ้งใหม่",
      IN_PROGRESS: "กำลังดำเนินการ",
      WAITING_USER: "รอข้อมูลจากผู้แจ้ง",
      RESOLVED: "แก้ไขแล้ว",
      CLOSED: "ปิดงาน",
      REJECTED: "ไม่รับดำเนินการ",
    };

    const ratingLabels: Record<number, string> = {
      1: "แย่มาก",
      2: "แย่",
      3: "ปานกลาง",
      4: "ดี",
      5: "ดีมาก",
    };

    const data = tickets.map((t: typeof tickets[number], index: number) => ({
      "ลำดับ": index + 1,
      "รหัส Ticket": t.ticketCode,
      "หัวข้อ": t.subject,
      "สถานะ": statusLabels[t.status] || t.status,
      "ชื่อผู้แจ้ง": t.fullName,
      "สำนัก/ฝ่าย": t.bureau || "-",
      "กอง": t.division || "-",
      "แผนก": t.department || "-",
      "หมวดหมู่": t.category?.name || "-",
      "ความเร่งด่วน": t.priority?.name || "-",
      "ระบบ": t.system?.name || "-",
      "ทีมรับผิดชอบ": t.team?.name || "-",
      "ผู้รับผิดชอบ": t.assignee?.displayName || "-",
      "คะแนนความพึงพอใจ": t.satisfactionSurvey?.rating ? `${t.satisfactionSurvey.rating}/5 (${ratingLabels[t.satisfactionSurvey.rating] || ''})` : "-",
      "ความคิดเห็น": t.satisfactionSurvey?.feedback || "-",
      "วันที่แจ้ง": t.createdAt.toLocaleString("th-TH"),
      "วันที่แก้ไข": t.resolvedAt?.toLocaleString("th-TH") || "-",
      "วันที่ปิดงาน": t.closedAt?.toLocaleString("th-TH") || "-",
    }));

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tickets");

    // Set column widths
    ws["!cols"] = [
      { wch: 6 },  // ลำดับ
      { wch: 12 }, // รหัส
      { wch: 40 }, // หัวข้อ
      { wch: 15 }, // สถานะ
      { wch: 20 }, // ชื่อผู้แจ้ง
      { wch: 20 }, // สำนัก/ฝ่าย
      { wch: 20 }, // กอง
      { wch: 20 }, // แผนก
      { wch: 15 }, // หมวดหมู่
      { wch: 12 }, // ความเร่งด่วน
      { wch: 15 }, // ระบบ
      { wch: 15 }, // ทีม
      { wch: 15 }, // ผู้รับผิดชอบ
      { wch: 18 }, // คะแนนความพึงพอใจ
      { wch: 40 }, // ความคิดเห็น
      { wch: 18 }, // วันที่แจ้ง
      { wch: 18 }, // วันที่แก้ไข
      { wch: 18 }, // วันที่ปิดงาน
    ];

    // Generate buffer
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    // Return Excel file
    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="tickets_report_${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Report error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate report", details: errorMessage },
      { status: 500 }
    );
  }
}

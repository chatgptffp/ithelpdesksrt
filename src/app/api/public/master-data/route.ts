import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const [categories, priorities, systems] = await Promise.all([
      prisma.mdCategory.findMany({
        where: { isActive: true },
        select: { id: true, code: true, name: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      }),
      prisma.mdPriority.findMany({
        where: { isActive: true },
        select: { id: true, code: true, name: true, severity: true },
        orderBy: [{ sortOrder: "asc" }, { severity: "desc" }],
      }),
      prisma.mdSystem.findMany({
        where: { isActive: true },
        select: { id: true, code: true, name: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      }),
    ]);

    return NextResponse.json({
      categories,
      priorities,
      systems,
    });
  } catch (error) {
    console.error("Error fetching master data:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการโหลดข้อมูล" },
      { status: 500 }
    );
  }
}

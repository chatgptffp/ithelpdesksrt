import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rules = await prisma.assignmentRule.findMany({
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      include: {
        team: { select: { name: true } },
        system: { select: { name: true } },
        category: { select: { name: true } },
      },
    });

    return NextResponse.json(rules);
  } catch (error) {
    console.error("Error fetching assignment rules:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูล" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { teamId, systemId, categoryId, priority, isActive } = body;

    if (!teamId) {
      return NextResponse.json({ error: "กรุณาเลือกทีม" }, { status: 400 });
    }

    if (!systemId && !categoryId) {
      return NextResponse.json(
        { error: "กรุณาเลือกระบบหรือหมวดหมู่อย่างน้อยหนึ่งอย่าง" },
        { status: 400 }
      );
    }

    const rule = await prisma.assignmentRule.create({
      data: {
        teamId,
        systemId: systemId || null,
        categoryId: categoryId || null,
        priority: priority ?? 0,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    console.error("Error creating assignment rule:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างข้อมูล" },
      { status: 500 }
    );
  }
}

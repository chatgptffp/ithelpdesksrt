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

    const priorities = await prisma.mdPriority.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(priorities);
  } catch (error) {
    console.error("Error fetching priorities:", error);
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
    const { code, name, severity, slaFirstResponseMins, slaResolveMins, isActive, sortOrder } = body;

    if (!code || !name) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
    }

    const existing = await prisma.mdPriority.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json({ error: "รหัสนี้มีอยู่แล้ว" }, { status: 400 });
    }

    const priority = await prisma.mdPriority.create({
      data: {
        code,
        name,
        severity: severity ?? 3,
        slaFirstResponseMins: slaFirstResponseMins || null,
        slaResolveMins: slaResolveMins || null,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
    });

    return NextResponse.json(priority, { status: 201 });
  } catch (error) {
    console.error("Error creating priority:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างข้อมูล" },
      { status: 500 }
    );
  }
}

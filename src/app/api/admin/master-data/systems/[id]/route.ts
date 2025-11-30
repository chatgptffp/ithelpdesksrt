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
    const { code, name, isActive, sortOrder } = body;

    if (!code || !name) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
    }

    const existing = await prisma.mdSystem.findFirst({
      where: { code, NOT: { id } },
    });
    if (existing) {
      return NextResponse.json({ error: "รหัสนี้มีอยู่แล้ว" }, { status: 400 });
    }

    const system = await prisma.mdSystem.update({
      where: { id },
      data: { code, name, isActive, sortOrder },
    });

    return NextResponse.json(system);
  } catch (error) {
    console.error("Error updating system:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการแก้ไขข้อมูล" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const ticketsCount = await prisma.ticket.count({
      where: { systemId: id },
    });

    if (ticketsCount > 0) {
      return NextResponse.json(
        { error: `ไม่สามารถลบได้ เนื่องจากมี Ticket ใช้งานอยู่ ${ticketsCount} รายการ` },
        { status: 400 }
      );
    }

    await prisma.mdSystem.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting system:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการลบข้อมูล" },
      { status: 500 }
    );
  }
}

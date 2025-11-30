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
    const { code, name, type, parentId, isActive, sortOrder } = body;

    if (!name || !type) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
    }

    // Check duplicate code if provided (exclude current)
    if (code) {
      const existing = await prisma.orgUnit.findFirst({
        where: { type, code, NOT: { id } },
      });
      if (existing) {
        return NextResponse.json({ error: "รหัสนี้มีอยู่แล้ว" }, { status: 400 });
      }
    }

    const unit = await prisma.orgUnit.update({
      where: { id },
      data: {
        code: code || null,
        name,
        type,
        parentId: parentId || null,
        isActive,
        sortOrder,
      },
    });

    return NextResponse.json(unit);
  } catch (error) {
    console.error("Error updating org unit:", error);
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

    // Get all children IDs recursively
    async function getChildIds(parentId: string): Promise<string[]> {
      const children = await prisma.orgUnit.findMany({
        where: { parentId },
        select: { id: true },
      });
      
      const ids: string[] = [];
      for (const child of children) {
        ids.push(child.id);
        const grandChildIds = await getChildIds(child.id);
        ids.push(...grandChildIds);
      }
      return ids;
    }

    const childIds = await getChildIds(id);
    const allIds = [id, ...childIds];

    // Check if any unit is in use by tickets
    const ticketsCount = await prisma.ticket.count({
      where: { orgUnitId: { in: allIds } },
    });

    if (ticketsCount > 0) {
      return NextResponse.json(
        { error: `ไม่สามารถลบได้ เนื่องจากมี Ticket ใช้งานอยู่ ${ticketsCount} รายการ` },
        { status: 400 }
      );
    }

    // Delete all children first, then the parent
    await prisma.orgUnit.deleteMany({
      where: { id: { in: allIds } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting org unit:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการลบข้อมูล" },
      { status: 500 }
    );
  }
}

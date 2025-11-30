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
    const { email, displayName, roleId, status } = body;

    if (!email || !displayName) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
    }

    // Check duplicate email (exclude current)
    const existing = await prisma.staffUser.findFirst({
      where: { email, NOT: { id } },
    });
    if (existing) {
      return NextResponse.json({ error: "อีเมลนี้มีอยู่แล้ว" }, { status: 400 });
    }

    // Update user
    const user = await prisma.staffUser.update({
      where: { id },
      data: { email, displayName, status },
    });

    // Update role if provided
    if (roleId) {
      // Remove existing roles
      await prisma.staffRoleMap.deleteMany({ where: { staffUserId: id } });
      // Add new role
      await prisma.staffRoleMap.create({
        data: { staffUserId: id, roleId },
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
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

    // Prevent deleting self
    if (session.user.id === id) {
      return NextResponse.json({ error: "ไม่สามารถลบบัญชีตัวเองได้" }, { status: 400 });
    }

    // Check if user has assigned tickets
    const ticketsCount = await prisma.ticket.count({
      where: { assigneeId: id },
    });

    if (ticketsCount > 0) {
      return NextResponse.json(
        { error: `ไม่สามารถลบได้ เนื่องจากมี Ticket ที่รับผิดชอบอยู่ ${ticketsCount} รายการ` },
        { status: 400 }
      );
    }

    await prisma.staffUser.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการลบข้อมูล" },
      { status: 500 }
    );
  }
}

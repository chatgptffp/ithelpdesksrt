import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: teamId } = await params;
    const body = await request.json();
    const { staffId, isLeader } = body;

    if (!staffId) {
      return NextResponse.json({ error: "กรุณาระบุเจ้าหน้าที่" }, { status: 400 });
    }

    // Check if already a member
    const existing = await prisma.staffTeamMap.findUnique({
      where: {
        staffId_teamId: { staffId, teamId },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "เจ้าหน้าที่นี้เป็นสมาชิกทีมอยู่แล้ว" }, { status: 400 });
    }

    const member = await prisma.staffTeamMap.create({
      data: {
        staffId,
        teamId,
        isLeader: isLeader || false,
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("Error adding team member:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการเพิ่มสมาชิก" },
      { status: 500 }
    );
  }
}

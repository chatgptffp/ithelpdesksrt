import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Get staff members in a specific team
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: teamId } = await params;

    const members = await prisma.staffTeamMap.findMany({
      where: { teamId },
      include: {
        staff: {
          select: { id: true, displayName: true, email: true, status: true },
        },
      },
      orderBy: [
        { isLeader: "desc" },
        { createdAt: "asc" },
      ],
    });

    const activeMembers = members
      .filter((m: { staff: { status: string } }) => m.staff.status === "ACTIVE")
      .map((m: { staff: { id: string; displayName: string; email: string }; isLeader: boolean }) => ({
        id: m.staff.id,
        displayName: m.staff.displayName,
        email: m.staff.email,
        isLeader: m.isLeader,
      }));

    return NextResponse.json(activeMembers);
  } catch (error) {
    console.error("Error fetching team staff:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูล" },
      { status: 500 }
    );
  }
}

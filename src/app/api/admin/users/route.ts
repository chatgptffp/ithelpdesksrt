import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hash } from "bcryptjs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.staffUser.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        staffRoles: {
          include: {
            role: { select: { code: true, name: true } },
          },
        },
        staffTeams: {
          include: {
            team: { select: { name: true } },
          },
        },
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
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
    const { email, displayName, password, roleId, status } = body;

    if (!email || !displayName || !password) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
    }

    // Check duplicate email
    const existing = await prisma.staffUser.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "อีเมลนี้มีอยู่แล้ว" }, { status: 400 });
    }

    const passwordHash = await hash(password, 12);

    const user = await prisma.staffUser.create({
      data: {
        email,
        displayName,
        passwordHash,
        status: status || "ACTIVE",
        staffRoles: roleId
          ? {
              create: { roleId },
            }
          : undefined,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างข้อมูล" },
      { status: 500 }
    );
  }
}

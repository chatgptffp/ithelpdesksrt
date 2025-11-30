import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET - ดึงข้อมูล Organization ปัจจุบัน
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ดึง Organization จาก Staff User
    const staff = await prisma.staffUser.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    });

    if (!staff?.organization) {
      // ถ้ายังไม่มี Organization ให้สร้างค่า default
      const defaultOrg = await prisma.organization.findFirst();
      if (defaultOrg) {
        return NextResponse.json(defaultOrg);
      }
      
      // สร้าง Organization ใหม่ถ้ายังไม่มี
      const newOrg = await prisma.organization.create({
        data: {
          code: "default",
          name: "IT Helpdesk",
          primaryColor: "#3b82f6",
          secondaryColor: "#64748b",
          accentColor: "#f59e0b",
        },
      });
      return NextResponse.json(newOrg);
    }

    return NextResponse.json(staff.organization);
  } catch (error) {
    console.error("Error fetching organization:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูลองค์กร" },
      { status: 500 }
    );
  }
}

// PUT - อัปเดตข้อมูล Organization
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      logoUrl,
      faviconUrl,
      primaryColor,
      secondaryColor,
      accentColor,
      email,
      phone,
      address,
      website,
    } = body;

    // หา Organization ปัจจุบัน
    const staff = await prisma.staffUser.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true },
    });

    let orgId = staff?.organizationId;

    // ถ้ายังไม่มี Organization ให้หาหรือสร้างใหม่
    if (!orgId) {
      const existingOrg = await prisma.organization.findFirst();
      if (existingOrg) {
        orgId = existingOrg.id;
      } else {
        const newOrg = await prisma.organization.create({
          data: {
            code: "default",
            name: name || "IT Helpdesk",
            primaryColor: primaryColor || "#3b82f6",
            secondaryColor: secondaryColor || "#64748b",
            accentColor: accentColor || "#f59e0b",
          },
        });
        orgId = newOrg.id;
      }
    }

    // อัปเดต Organization
    const updatedOrg = await prisma.organization.update({
      where: { id: orgId },
      data: {
        name,
        description,
        logoUrl,
        faviconUrl,
        primaryColor,
        secondaryColor,
        accentColor,
        email,
        phone,
        address,
        website,
      },
    });

    return NextResponse.json(updatedOrg);
  } catch (error) {
    console.error("Error updating organization:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูลองค์กร" },
      { status: 500 }
    );
  }
}

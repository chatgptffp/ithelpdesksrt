import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - ดึงข้อมูล Branding สำหรับแสดงผลหน้าเว็บ (Public API)
export async function GET() {
  try {
    // ดึง Organization แรก (หรือ default)
    const organization = await prisma.organization.findFirst({
      where: { isActive: true },
      select: {
        id: true,
        code: true,
        name: true,
        logoUrl: true,
        faviconUrl: true,
        primaryColor: true,
        secondaryColor: true,
        accentColor: true,
        email: true,
        phone: true,
        website: true,
      },
    });

    if (!organization) {
      // Return default branding
      return NextResponse.json({
        name: "IT Helpdesk",
        logoUrl: null,
        faviconUrl: null,
        primaryColor: "#3b82f6",
        secondaryColor: "#64748b",
        accentColor: "#f59e0b",
      });
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error("Error fetching branding:", error);
    return NextResponse.json({
      name: "IT Helpdesk",
      logoUrl: null,
      faviconUrl: null,
      primaryColor: "#3b82f6",
      secondaryColor: "#64748b",
      accentColor: "#f59e0b",
    });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const parentId = searchParams.get("parentId");

    const where: {
      isActive: boolean;
      type?: "BUREAU" | "DIVISION" | "DEPARTMENT";
      parentId?: string | null;
    } = {
      isActive: true,
    };

    if (type && ["BUREAU", "DIVISION", "DEPARTMENT"].includes(type)) {
      where.type = type as "BUREAU" | "DIVISION" | "DEPARTMENT";
    }

    if (parentId) {
      where.parentId = parentId;
    } else if (type === "BUREAU") {
      where.parentId = null;
    }

    const orgUnits = await prisma.orgUnit.findMany({
      where,
      select: {
        id: true,
        code: true,
        name: true,
        type: true,
        parentId: true,
      },
      orderBy: [
        { sortOrder: "asc" },
        { name: "asc" },
      ],
    });

    return NextResponse.json(orgUnits);
  } catch (error) {
    console.error("Error fetching org units:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการโหลดข้อมูล" },
      { status: 500 }
    );
  }
}

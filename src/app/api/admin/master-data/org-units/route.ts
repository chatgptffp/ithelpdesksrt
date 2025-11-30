import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface OrgUnitWithChildren {
  id: string;
  code: string | null;
  name: string;
  type: string;
  parentId: string | null;
  isActive: boolean;
  sortOrder: number;
  children?: OrgUnitWithChildren[];
}

function buildTree(items: OrgUnitWithChildren[], parentId: string | null = null): OrgUnitWithChildren[] {
  return items
    .filter((item) => item.parentId === parentId)
    .map((item) => ({
      ...item,
      children: buildTree(items, item.id),
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const units = await prisma.orgUnit.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({
      flat: units,
      tree: buildTree(units),
    });
  } catch (error) {
    console.error("Error fetching org units:", error);
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
    const { code, name, type, parentId, isActive, sortOrder } = body;

    if (!name || !type) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
    }

    // Check duplicate code if provided
    if (code) {
      const existing = await prisma.orgUnit.findFirst({
        where: { type, code },
      });
      if (existing) {
        return NextResponse.json({ error: "รหัสนี้มีอยู่แล้ว" }, { status: 400 });
      }
    }

    const unit = await prisma.orgUnit.create({
      data: {
        code: code || null,
        name,
        type,
        parentId: parentId || null,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
    });

    return NextResponse.json(unit, { status: 201 });
  } catch (error) {
    console.error("Error creating org unit:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างข้อมูล" },
      { status: 500 }
    );
  }
}

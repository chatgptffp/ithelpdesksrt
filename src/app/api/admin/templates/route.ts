import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const templates = await db.ticketTemplate.findMany({
      include: {
        category: { select: { id: true, name: true } },
        priority: { select: { id: true, name: true } },
        system: { select: { id: true, name: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
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
    const { name, description, subject, body: templateBody, categoryId, priorityId, systemId, isActive, sortOrder } = body;

    if (!name || !subject || !templateBody) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 }
      );
    }

    const template = await db.ticketTemplate.create({
      data: {
        name,
        description,
        subject,
        body: templateBody,
        categoryId: categoryId || null,
        priorityId: priorityId || null,
        systemId: systemId || null,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
      include: {
        category: { select: { id: true, name: true } },
        priority: { select: { id: true, name: true } },
        system: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}

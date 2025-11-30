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

    const responses = await db.mdCannedResponse.findMany({
      include: {
        category: { select: { id: true, name: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    });

    return NextResponse.json(responses);
  } catch (error) {
    console.error("Error fetching canned responses:", error);
    return NextResponse.json(
      { error: "Failed to fetch canned responses" },
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
    const { title, body: responseBody, categoryId, isActive, sortOrder } = body;

    if (!title || !responseBody) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 }
      );
    }

    const response = await db.mdCannedResponse.create({
      data: {
        title,
        body: responseBody,
        categoryId: categoryId || null,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error creating canned response:", error);
    return NextResponse.json(
      { error: "Failed to create canned response" },
      { status: 500 }
    );
  }
}

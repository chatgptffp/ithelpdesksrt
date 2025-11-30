import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, body: responseBody, categoryId, isActive, sortOrder } = body;

    const response = await db.mdCannedResponse.update({
      where: { id },
      data: {
        title,
        body: responseBody,
        categoryId: categoryId || null,
        isActive,
        sortOrder,
      },
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error updating canned response:", error);
    return NextResponse.json(
      { error: "Failed to update canned response" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await db.mdCannedResponse.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting canned response:", error);
    return NextResponse.json(
      { error: "Failed to delete canned response" },
      { status: 500 }
    );
  }
}

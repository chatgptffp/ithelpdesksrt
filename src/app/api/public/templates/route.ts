import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const templates = await db.ticketTemplate.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        subject: true,
        body: true,
        categoryId: true,
        priorityId: true,
        systemId: true,
        category: { select: { name: true } },
        priority: { select: { name: true } },
        system: { select: { name: true } },
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

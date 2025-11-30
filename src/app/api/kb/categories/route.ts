import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - List active KB categories (public)
export async function GET() {
  try {
    const categories = await prisma.kbCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        icon: true,
        color: true,
        _count: {
          select: {
            articles: {
              where: { isPublished: true },
            },
          },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching KB categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

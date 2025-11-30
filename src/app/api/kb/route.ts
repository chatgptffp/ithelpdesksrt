import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - List published KB articles (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");
    const limit = searchParams.get("limit");

    const where: Record<string, unknown> = {
      isPublished: true,
    };

    if (categoryId) where.categoryId = categoryId;
    if (featured === "true") where.isFeatured = true;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
        { content: { contains: search } },
      ];
    }

    const articles = await prisma.kbArticle.findMany({
      where,
      take: limit ? parseInt(limit) : undefined,
      orderBy: [
        { isFeatured: "desc" },
        { publishedAt: "desc" },
      ],
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        viewCount: true,
        isFeatured: true,
        publishedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
        author: {
          select: {
            displayName: true,
          },
        },
      },
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error("Error fetching KB articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}

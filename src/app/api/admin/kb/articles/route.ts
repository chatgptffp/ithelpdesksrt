import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET - List all KB articles
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const isPublished = searchParams.get("isPublished");

    const where: Record<string, unknown> = {};
    if (categoryId) where.categoryId = categoryId;
    if (isPublished !== null) where.isPublished = isPublished === "true";

    const articles = await prisma.kbArticle.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        category: {
          select: { id: true, name: true, color: true },
        },
        author: {
          select: { id: true, displayName: true },
        },
        tags: {
          include: {
            tag: true,
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

// POST - Create new KB article
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      categoryId,
      title,
      slug,
      excerpt,
      content,
      coverImage,
      isPublished,
      isFeatured,
      tags,
    } = body;

    if (!categoryId || !title || !slug || !content) {
      return NextResponse.json(
        { error: "Category, title, slug, and content are required" },
        { status: 400 }
      );
    }

    // Check for duplicate slug
    const existing = await prisma.kbArticle.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Article slug already exists" },
        { status: 400 }
      );
    }

    // Create article
    const article = await prisma.kbArticle.create({
      data: {
        categoryId,
        title,
        slug,
        excerpt,
        content,
        coverImage,
        isPublished: isPublished ?? false,
        isFeatured: isFeatured ?? false,
        publishedAt: isPublished ? new Date() : null,
        authorId: session.user.id,
        tags: tags?.length
          ? {
              create: tags.map((tagId: string) => ({
                tagId,
              })),
            }
          : undefined,
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
        author: {
          select: { id: true, displayName: true },
        },
      },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error("Error creating KB article:", error);
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET - Get single KB article
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const article = await prisma.kbArticle.findUnique({
      where: { id },
      include: {
        category: true,
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

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error("Error fetching KB article:", error);
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}

// PUT - Update KB article
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
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

    // Check if article exists
    const existing = await prisma.kbArticle.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Check for duplicate slug (excluding current article)
    if (slug && slug !== existing.slug) {
      const slugExists = await prisma.kbArticle.findFirst({
        where: {
          slug,
          NOT: { id },
        },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "Article slug already exists" },
          { status: 400 }
        );
      }
    }

    // Update article
    const article = await prisma.kbArticle.update({
      where: { id },
      data: {
        categoryId,
        title,
        slug,
        excerpt,
        content,
        coverImage,
        isPublished,
        isFeatured,
        publishedAt: isPublished && !existing.isPublished ? new Date() : existing.publishedAt,
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

    // Update tags if provided
    if (tags !== undefined) {
      // Remove existing tags
      await prisma.kbArticleTag.deleteMany({
        where: { articleId: id },
      });

      // Add new tags
      if (tags.length > 0) {
        await prisma.kbArticleTag.createMany({
          data: tags.map((tagId: string) => ({
            articleId: id,
            tagId,
          })),
        });
      }
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error("Error updating KB article:", error);
    return NextResponse.json(
      { error: "Failed to update article" },
      { status: 500 }
    );
  }
}

// DELETE - Delete KB article
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.kbArticle.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting KB article:", error);
    return NextResponse.json(
      { error: "Failed to delete article" },
      { status: 500 }
    );
  }
}

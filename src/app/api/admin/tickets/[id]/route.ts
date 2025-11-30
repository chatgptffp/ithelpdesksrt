import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

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

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        priority: { select: { id: true, name: true, severity: true } },
        system: { select: { id: true, name: true } },
        team: { select: { id: true, name: true } },
        assignee: { select: { id: true, displayName: true } },
        attachments: {
          select: {
            id: true,
            fileName: true,
            fileUrl: true,
            mimeType: true,
            sizeBytes: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
        comments: {
          select: {
            id: true,
            authorType: true,
            message: true,
            visibility: true,
            createdAt: true,
            staffUser: { select: { displayName: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        statusLogs: {
          select: {
            id: true,
            fromStatus: true,
            toStatus: true,
            note: true,
            changedBy: { select: { displayName: true } },
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
        satisfactionSurvey: {
          select: {
            rating: true,
            feedback: true,
            createdAt: true,
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "ไม่พบข้อมูล Ticket" }, { status: 404 });
    }

    // Transform data for frontend
    const { satisfactionSurvey, comments, ...rest } = ticket;
    
    // Transform comments to match frontend expectations
    const transformedComments = comments.map((c: {
      id: string;
      authorType: string;
      message: string;
      visibility: string;
      createdAt: Date;
      staffUser: { displayName: string } | null;
    }) => ({
      id: c.id,
      authorType: c.authorType,
      authorName: c.staffUser?.displayName || (c.authorType === "USER" ? ticket.fullName : "ระบบ"),
      message: c.message,
      isInternal: c.visibility === "INTERNAL",
      createdAt: c.createdAt,
    }));

    return NextResponse.json({
      ...rest,
      comments: transformedComments,
      survey: satisfactionSurvey,
    });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูล" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const newTicketsCount = await db.ticket.count({
      where: { status: "NEW" },
    });

    return NextResponse.json({ count: newTicketsCount });
  } catch (error) {
    console.error("Error counting tickets:", error);
    return NextResponse.json({ error: "Failed to count tickets" }, { status: 500 });
  }
}

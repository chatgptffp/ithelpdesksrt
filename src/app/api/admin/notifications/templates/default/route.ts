import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createDefaultTemplates } from "@/lib/notification/default-templates";

// POST - Create default notification templates
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create default templates
    await createDefaultTemplates();

    return NextResponse.json({
      success: true,
      message: "สร้าง Template เริ่มต้นเรียบร้อยแล้ว"
    });
  } catch (error) {
    console.error("Error creating default templates:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้าง Template" },
      { status: 500 }
    );
  }
}

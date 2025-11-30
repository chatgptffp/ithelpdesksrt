import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed file types
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
];

const ALLOWED_EXTENSIONS = [
  "jpg", "jpeg", "png", "gif", "webp",
  "pdf", "doc", "docx", "xls", "xlsx", "txt"
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (files.length > 5) {
      return NextResponse.json(
        { error: "Maximum 5 files allowed" },
        { status: 400 }
      );
    }

    const uploadedFiles: { fileName: string; fileUrl: string; mimeType: string; sizeBytes: number }[] = [];

    for (const file of files) {
      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `ไฟล์ ${file.name} ไม่รองรับ กรุณาอัปโหลดไฟล์ภาพ, PDF, Word หรือ Excel` },
          { status: 400 }
        );
      }

      // Validate extension
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return NextResponse.json(
          { error: `นามสกุลไฟล์ .${ext} ไม่รองรับ` },
          { status: 400 }
        );
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `ไฟล์ ${file.name} มีขนาดใหญ่เกินไป (สูงสุด 10MB)` },
          { status: 400 }
        );
      }

      // Generate unique filename
      const filename = `${uuidv4()}.${ext}`;

      // Create upload directory if not exists
      const uploadDir = path.join(process.cwd(), "public", "uploads", "attachments");
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      // Write file to disk
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, buffer);

      uploadedFiles.push({
        fileName: file.name,
        fileUrl: `/uploads/attachments/${filename}`,
        mimeType: file.type,
        sizeBytes: file.size,
      });
    }

    return NextResponse.json({ files: uploadedFiles });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload files" },
      { status: 500 }
    );
  }
}

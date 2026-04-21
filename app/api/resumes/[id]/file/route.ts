import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const resumeId = parseInt(id);
  if (isNaN(resumeId)) {
    return NextResponse.json({ error: "Invalid resume ID" }, { status: 400 });
  }

  const resume = await prisma.resume.findUnique({
    where: { resumeId },
    select: { filePath: true, fileName: true, fileType: true },
  });

  if (!resume?.filePath) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const uploadsDir = path.join(process.cwd(), "uploads");
  const fullPath = path.resolve(uploadsDir, resume.filePath);

  // Prevent path traversal
  if (!fullPath.startsWith(uploadsDir)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  try {
    const fileBuffer = await readFile(fullPath);
    const download = request.nextUrl.searchParams.has("download");
    const disposition = download
      ? `attachment; filename="${resume.fileName}"`
      : `inline; filename="${resume.fileName}"`;

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": resume.fileType,
        "Content-Disposition": disposition,
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found on disk" }, { status: 404 });
  }
}

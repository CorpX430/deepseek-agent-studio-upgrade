import { auth } from "@clerk/nextjs/server";
import { del, list, put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

async function requireUser() {
  const { userId } = await auth();
  return userId;
}

export async function GET() {
  const userId = await requireUser();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { blobs } = await list({ prefix: `workspaces/${userId}/` });
  return NextResponse.json({ files: blobs.map(({ pathname, size, uploadedAt }) => ({ pathname, size, uploadedAt })) });
}

export async function POST(request: NextRequest) {
  const userId = await requireUser();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: "A file is required" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Files must be 10 MB or smaller" }, { status: 413 });
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 120) || "upload";
  const blob = await put(`workspaces/${userId}/${crypto.randomUUID()}-${safeName}`, file, { access: "private", addRandomSuffix: false });
  return NextResponse.json({ pathname: blob.pathname, size: blob.size, uploadedAt: blob.uploadedAt }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const userId = await requireUser();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { pathname } = await request.json();
  if (typeof pathname !== "string" || !pathname.startsWith(`workspaces/${userId}/`)) return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  await del(pathname);
  return NextResponse.json({ ok: true });
}

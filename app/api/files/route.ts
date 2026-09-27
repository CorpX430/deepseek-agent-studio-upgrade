import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "File is required" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Maximum file size is 10 MB" }, { status: 413 });
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const blob = await put(`uploads/${crypto.randomUUID()}-${safeName}`, file, { access: "private" });
  const text = file.type.startsWith("text/") || /\.(md|txt|json|csv|tsx?|jsx?|py|sol)$/i.test(file.name) ? (await file.text()).slice(0, 120000) : "";
  return NextResponse.json({ name: file.name, pathname: blob.pathname, text });
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({ error: "Deletion requires an authenticated workspace" }, { status: 501 });
}

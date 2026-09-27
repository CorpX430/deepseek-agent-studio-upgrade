import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { ensureSession, readSessionMessages, replaceSessionMessages, upsertCharacter } from "@/lib/persistence";
import { z } from "zod";

export const runtime = "nodejs";
const messageSchema = z.object({ role: z.enum(["user", "assistant", "system"]), content: z.string().max(20000), reasoning: z.string().max(20000).optional() });
const characterSchema = z.object({ name: z.string().min(1).max(100), personality: z.string().max(1000), speech_style: z.string().max(1000), backstory: z.string().max(2000), rules: z.array(z.string().max(500)).max(20) });
const bodySchema = z.object({ sessionId: z.string().uuid(), messages: z.array(messageSchema).max(200).optional(), character: characterSchema.optional() });

export async function GET(request: NextRequest) {
  try { const ownerId = (await auth()).userId; if (!ownerId) return NextResponse.json({ messages: [], persisted: false }); const sessionId = z.string().uuid().parse(request.nextUrl.searchParams.get("sessionId")); return NextResponse.json({ messages: await readSessionMessages(sessionId, ownerId), persisted: true }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load history" }, { status: 400 }); }
}
export async function POST(request: NextRequest) {
  try { const ownerId = (await auth()).userId; if (!ownerId) return NextResponse.json({ persisted: false }); const body = bodySchema.parse(await request.json()); const character = body.character ? await upsertCharacter(ownerId, body.character) : undefined; await ensureSession(body.sessionId, ownerId, "character", character?.id); await replaceSessionMessages(body.sessionId, ownerId, body.messages ?? []); return NextResponse.json({ persisted: true, character }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save history" }, { status: 400 }); }
}

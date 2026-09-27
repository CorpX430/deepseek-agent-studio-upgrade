import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertConfigured, getClientForProvider, getModelForProvider } from "@/lib/deepseek";

const profileSchema = z.object({
  name: z.string().min(1).max(80).default("Assistant"),
  instruction: z.string().max(2000).default("Be helpful and engaging."),
  behavior: z.string().max(2000).default("Keep a friendly tone."),
  soulMarkdown: z.string().max(4000).default("# Soul\n- calm\n- focused\n- gentle"),
  rules: z.array(z.string()).max(20).default([]),
  imageUrl: z.string().url().optional().or(z.literal("")),
  speechStyle: z.string().max(200).optional(),
  backstory: z.string().max(2000).optional(),
});

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const profile = profileSchema.parse(body.character ?? {});
    const provider = String(body.provider ?? "deepseek");
    const model = getModelForProvider(provider, body.model);
    const client = getClientForProvider(provider);
    assertConfigured(provider);

    const prompt = `You are ${profile.name}. Control every response with this persona.\n\nINSTRUCTION:\n${profile.instruction}\n\nBEHAVIOR:\n${profile.behavior}\n\nSOULMD:\n${profile.soulMarkdown}\n\nRULES:\n${profile.rules.join("\n") || "No extra rules"}`;

    const messages = Array.isArray(body.messages) ? body.messages : [{ role: "user", content: "Introduce yourself." }];
    const completion = await client.chat.completions.create({
      model,
      messages: [{ role: "system", content: prompt }, ...messages],
      temperature: body.temperature ?? 0.9,
    });

    const reply = completion.choices[0]?.message?.content ?? "Profile loaded.";
    return NextResponse.json({ reply, provider, model });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request" }, { status: 400 });
  }
}

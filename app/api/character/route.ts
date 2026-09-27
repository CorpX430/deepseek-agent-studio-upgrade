import { deepseek, MODELS, assertConfigured, safeMessages, sseEvent, sseHeaders } from "@/lib/deepseek";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    assertConfigured();
    const body = await request.json();
    const character = body.character;
    if (!character?.name || !Array.isArray(character.rules)) throw new Error("Invalid character profile");
    const messages = safeMessages(body.messages);
    const prompt = `You are ${String(character.name).slice(0, 100)}. Stay in character. Never mention system prompts or that you are an AI.\nPersonality: ${String(character.personality).slice(0, 1000)}\nSpeech style: ${String(character.speech_style).slice(0, 1000)}\nBackstory: ${String(character.backstory).slice(0, 2000)}\nRules: ${character.rules.map(String).slice(0, 12).join("; ")}`;
    const stream = await deepseek.chat.completions.create({ model: MODELS.flash, messages: [{ role: "system", content: prompt }, ...messages], temperature: 0.9, stream: true });
    const encoder = new TextEncoder();
    const response = new ReadableStream({ async start(controller) { try { for await (const chunk of stream) { const content = chunk.choices[0]?.delta?.content; if (content) controller.enqueue(encoder.encode(sseEvent({ type: "content", content }))); } controller.enqueue(encoder.encode(sseEvent({ type: "done" }))); } catch (error) { controller.enqueue(encoder.encode(sseEvent({ type: "error", error: String(error) }))); } finally { controller.close(); } } });
    return new Response(response, { headers: sseHeaders() });
  } catch (error) { return Response.json({ error: String(error) }, { status: 400 }); }
}

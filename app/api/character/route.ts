import { assertConfigured, getClientForProvider, getModelForProvider, safeMessages, sseEvent, sseHeaders } from "@/lib/deepseek";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const provider = String(body.provider ?? "deepseek");
    const model = getModelForProvider(provider, body.model);
    const client = getClientForProvider(provider);

    assertConfigured(provider);

    const character = body.character;
    const messages = safeMessages(body.messages);
    const prompt = character
      ? `You are ${String(character.name ?? "Assistant")}.\nInstruction: ${String(character.instruction ?? "")}\nBehavior: ${String(character.behavior ?? "")}\nSoulMD:\n${String(character.soulMarkdown ?? "")}\nRules:\n${Array.isArray(character.rules) ? character.rules.join("\n") : ""}`
      : "You are a helpful assistant.";

    const stream = await client.chat.completions.create({
      model,
      messages: [{ role: "system", content: prompt }, ...messages],
      temperature: body.temperature ?? 0.9,
      stream: true,
    });

    const encoder = new TextEncoder();
    const response = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) controller.enqueue(encoder.encode(sseEvent({ type: "content", content })));
          }
          controller.enqueue(encoder.encode(sseEvent({ type: "done" })));
        } catch (error) {
          controller.enqueue(encoder.encode(sseEvent({ type: "error", error: String(error) })));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(response, { headers: sseHeaders() });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 400 });
  }
}

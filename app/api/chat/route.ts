import {
  assertConfigured,
  deepseek,
  getClientForProvider,
  getModelForProvider,
  MODELS,
  safeMessages,
  sseEvent,
  sseHeaders,
} from "@/lib/deepseek";
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

    const messages = safeMessages(body.messages);
    const stream = await client.chat.completions.create({
      model,
      messages,
      temperature: body.temperature ?? 0.7,
      stream: true,
    });

    const encoder = new TextEncoder();
    const response = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta;
            if (delta?.content) controller.enqueue(encoder.encode(sseEvent({ type: "content", content: delta.content })));
            const reasoningContent = (delta as typeof delta & { reasoning_content?: string })?.reasoning_content;
            if (reasoningContent) controller.enqueue(encoder.encode(sseEvent({ type: "reasoning", content: reasoningContent })));
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

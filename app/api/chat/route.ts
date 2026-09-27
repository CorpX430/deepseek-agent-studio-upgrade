import { deepseek, MODELS, assertConfigured, safeMessages, sseEvent, sseHeaders } from "@/lib/deepseek";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    assertConfigured();
    const body = await request.json();
    const messages = safeMessages(body.messages);
    const model = body.model === MODELS.pro ? MODELS.pro : MODELS.flash;
    const context = typeof body.context === "string" ? body.context.slice(0, 120000) : "";
    const url = typeof body.url === "string" ? body.url.slice(0, 2000) : messages.at(-1)?.content.match(/https?:\/\/[^\s]+/)?.[0];
    let webContext = "";
    if (url) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const page = await fetch(url, { signal: controller.signal, headers: { "User-Agent": "DeepSeek-Agent-Studio/1.0" } });
        clearTimeout(timeout);
        if (page.ok) webContext = (await page.text()).replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 30000);
      } catch { webContext = "The URL could not be retrieved; answer from the URL and user-provided context only."; }
    }
    const combinedContext = [context, url ? `Fetched URL: ${url}\\n${webContext}` : ""].filter(Boolean).join("\\n\\n");
    const enrichedMessages = combinedContext
      ? [...messages, { role: "user" as const, content: `Reference context supplied by the user:\n\n${combinedContext}` }]
      : messages;
    const stream = await deepseek.chat.completions.create({ model, messages: enrichedMessages, temperature: 0.7, stream: true });
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
        } catch (error) { controller.enqueue(encoder.encode(sseEvent({ type: "error", error: String(error) }))); }
        finally { controller.close(); }
      },
    });
    return new Response(response, { headers: sseHeaders() });
  } catch (error) { return Response.json({ error: String(error) }, { status: 400 }); }
}

import { deepseek, MODELS, assertConfigured, safeMessages, sseEvent, sseHeaders } from "@/lib/deepseek";
import { agentTools, executeTool } from "@/lib/tools";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 300;
const SYSTEM = "You are an expert full-stack engineer with an isolated Linux sandbox. Use tools to create real files, run tests, inspect errors, and iterate. Never claim work was completed without verifying it. Keep responses concise and summarize changed files and verification.";

export async function POST(request: NextRequest) {
  try {
    assertConfigured();
    const body = await request.json();
    const sessionId = typeof body.sessionId === "string" && body.sessionId.length < 200 ? body.sessionId : crypto.randomUUID();
    const messages = safeMessages(body.messages);
    const encoder = new TextEncoder();
    const response = new ReadableStream({
      async start(controller) {
        const send = (value: unknown) => controller.enqueue(encoder.encode(sseEvent(value)));
        try {
          const conversation: any[] = [{ role: "system", content: SYSTEM }, ...messages];
          for (let iteration = 0; iteration < 12; iteration++) {
            const stream = await deepseek.chat.completions.create({ model: MODELS.pro, messages: conversation, tools: agentTools, tool_choice: "auto", reasoning_effort: "high", extra_body: { thinking: { type: "enabled" } }, stream: true, signal: AbortSignal.timeout(45000) } as any) as unknown as AsyncIterable<any>;
            let content = "";
            let reasoningContent = "";
            const calls: any[] = [];
            for await (const chunk of stream) {
              const delta = chunk.choices[0]?.delta;
              if (delta?.content) { content += delta.content; send({ type: "content", content: delta.content }); }
              const reasoning = (delta as typeof delta & { reasoning_content?: string })?.reasoning_content;
              if (reasoning) { reasoningContent += reasoning; send({ type: "reasoning", content: reasoning }); }
              for (const toolCall of delta?.tool_calls ?? []) {
                const index = toolCall.index ?? calls.length;
                calls[index] ??= { id: toolCall.id ?? `call_${index}`, type: "function", function: { name: "", arguments: "" } };
                if (toolCall.id) calls[index].id = toolCall.id;
                if (toolCall.function?.name) calls[index].function.name = toolCall.function.name;
                if (toolCall.function?.arguments) calls[index].function.arguments += toolCall.function.arguments;
              }
            }
            if (!calls.length) { send({ type: "done" }); break; }
            conversation.push({ role: "assistant", content: content || null, reasoning_content: reasoningContent || undefined, tool_calls: calls });
            for (const call of calls) {
              send({ type: "tool_call", id: call.id, name: call.function.name, arguments: call.function.arguments });
              let result: string;
              try { result = await executeTool(sessionId, call.function.name, call.function.arguments); } catch (error) { result = JSON.stringify({ error: String(error) }); }
              send({ type: "tool_result", id: call.id, name: call.function.name, result });
              conversation.push({ role: "tool", tool_call_id: call.id, content: result });
            }
          }
        } catch (error) { send({ type: "error", error: String(error) }); }
        finally { controller.close(); }
      },
    });
    return new Response(response, { headers: sseHeaders() });
  } catch (error) { return Response.json({ error: String(error) }, { status: 400 }); }
}

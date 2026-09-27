import OpenAI from "openai";

if (!process.env.DEEPSEEK_API_KEY) console.warn("DEEPSEEK_API_KEY is not configured.");

export const deepseek = new OpenAI({
  // Route modules are evaluated during `next build`; requests still fail closed below.
  apiKey: process.env.DEEPSEEK_API_KEY ?? "build-placeholder",
  baseURL: "https://api.deepseek.com",
});

export const MODELS = {
  flash: "deepseek-chat",
  pro: "deepseek-reasoner",
} as const;

export function assertConfigured() {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY is not configured.");
  }
}

export function sseHeaders() {
  return {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  };
}

export function sseEvent(value: unknown) {
  return `data: ${JSON.stringify(value)}\n\n`;
}

export function safeMessages(value: unknown) {
  if (!Array.isArray(value)) throw new Error("messages must be an array");
  return value.slice(-40).map((message) => {
    if (!message || typeof message !== "object") throw new Error("Invalid message");
    const item = message as { role?: string; content?: string };
    if (!["user", "assistant", "system"].includes(item.role ?? "")) {
      throw new Error("Invalid message role");
    }
    if (typeof item.content !== "string" || item.content.length > 20000) {
      throw new Error("Invalid message content");
    }
    return { role: item.role as "user" | "assistant" | "system", content: item.content };
  });
}

export const runtimeConfig = { runtime: "nodejs" as const };

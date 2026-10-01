import OpenAI from "openai";

if (!process.env.DEEPSEEK_API_KEY) console.warn("DEEPSEEK_API_KEY is not configured.");

export const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY ?? "build-placeholder",
  baseURL: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
});

/** Current official API identifiers. deepseek-flash maps to DeepSeek-V4.1-Flash. */
export const MODELS = {
  flash: "deepseek-flash",
  pro: "deepseek-v4-pro",
} as const;

export function assertConfigured() {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY is not configured. Copy .env.example to .env.local and add your key.");
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
  if (!Array.isArray(value) || value.length === 0) throw new Error("messages must be a non-empty array");
  return value.slice(-40).map((message) => {
    if (!message || typeof message !== "object") throw new Error("Invalid message");
    const item = message as { role?: string; content?: string };
    if (!["user", "assistant", "system"].includes(item.role ?? "")) throw new Error("Invalid message role");
    if (typeof item.content !== "string" || item.content.length > 20000) throw new Error("Invalid message content");
    return { role: item.role as "user" | "assistant" | "system", content: item.content };
  });
}

export const runtimeConfig = { runtime: "nodejs" as const };

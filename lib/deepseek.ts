import OpenAI from "openai";

if (!process.env.DEEPSEEK_API_KEY && !process.env.OPENROUTER_API_KEY) {
  console.warn("No LLM provider is configured. Set DEEPSEEK_API_KEY or OPENROUTER_API_KEY.");
}

export const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY ?? "",
  baseURL: "https://api.deepseek.com",
});

export const openrouter = process.env.OPENROUTER_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
        "X-Title": "DeepSeek Agent Studio",
      },
    })
  : null;

export const MODELS = {
  deepseek: {
    flash: "deepseek-chat",
    pro: "deepseek-reasoner",
  },
  openrouter: {
    default: "openai/gpt-4o-mini",
    uncensored: "meta-llama/llama-3.3-70b-instruct",
  },
} as const;

export function getClientForProvider(provider: string | undefined) {
  const normalized = (provider ?? "deepseek").toLowerCase();
  if (normalized === "openrouter") return openrouter ?? deepseek;
  return deepseek;
}

export function getModelForProvider(provider: string | undefined, requestedModel?: string) {
  const normalized = (provider ?? "deepseek").toLowerCase();

  if (normalized === "openrouter") {
    if (requestedModel) return requestedModel;
    return MODELS.openrouter.default;
  }

  if (requestedModel) return requestedModel;
  return MODELS.deepseek.flash;
}

export function assertConfigured(provider?: string) {
  const normalized = (provider ?? "deepseek").toLowerCase();
  const apiKey = normalized === "openrouter" ? process.env.OPENROUTER_API_KEY : process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error(
      normalized === "openrouter"
        ? "OPENROUTER_API_KEY is not configured."
        : "DEEPSEEK_API_KEY is not configured."
    );
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

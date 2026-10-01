"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import MessageList from "./MessageList";
import { streamDeepSeek } from "@/services/deepseekClient.js";

interface Msg {
  role: "user" | "assistant";
  content: string;
  reasoning?: string;
}

const FILE_LIMIT = 16_000;
const MODEL_OPTIONS = [
  { value: "deepseek-v4-pro", label: "V4 Pro · confirmed" },
  { value: "deepseek-flash", label: "V4.1 Flash · experimental" },
];

export default function ChatPanel() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("deepseek-v4-pro");
  const [attachment, setAttachment] = useState<{
    name: string;
    content: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function attachFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > FILE_LIMIT) {
      setNotice("Files are limited to 16 KB for safe prompt context.");
      return;
    }
    try {
      const content = await file.text();
      setAttachment({ name: file.name, content });
      setNotice(
        `${file.name} attached. Its text will be sent with your next prompt.`,
      );
    } catch {
      setNotice(
        "That file could not be read as text. Try a text, Markdown, JSON, code, CSV, or PDF-to-text export.",
      );
    }
  }

  async function send(event?: FormEvent) {
    event?.preventDefault();
    if (!input.trim() || busy) return;
    const prompt = attachment
      ? `${input.trim()}\n\n[Attached file: ${attachment.name}]\n${attachment.content}`
      : input.trim();
    const next = [...messages, { role: "user" as const, content: prompt }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setAttachment(null);
    setNotice("");
    setBusy(true);
    try {
      let answer = "";
      let reasoning = "";
      await streamDeepSeek({
        model,
        messages: next,
        onEvent: (event) => {
          if (event.type === "content") answer += event.content;
          if (event.type === "reasoning") reasoning += event.content;
          if (event.type === "error") throw new Error(event.error);
          setMessages([
            ...next,
            {
              role: "assistant",
              content: answer,
              reasoning: reasoning || undefined,
            },
          ]);
        },
      });
    } catch (error) {
      setMessages([
        ...next,
        {
          role: "assistant",
          content: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel">
      <div className="panel-intro">
        <span className="eyebrow">GENERAL CHAT</span>
        <h2>What are you working on?</h2>
        <p>
          Choose a DeepSeek model, attach a text file, and ask for focused help.
        </p>
      </div>
      <div className="chat-tools">
        <label className="model-picker">
          Model
          <select
            value={model}
            onChange={(event) => setModel(event.target.value)}
            disabled={busy}
          >
            {MODEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="upload-button">
          Attach file
          <input
            type="file"
            accept=".txt,.md,.json,.csv,.ts,.tsx,.js,.jsx,.py,.html,.css,.sql,.yaml,.yml,text/*"
            onChange={attachFile}
            disabled={busy}
          />
        </label>
        {attachment && (
          <button
            className="file-chip"
            type="button"
            onClick={() => setAttachment(null)}
            disabled={busy}
          >
            × {attachment.name}
          </button>
        )}
      </div>
      {notice && (
        <p className="upload-notice" role="status">
          {notice}
        </p>
      )}
      <div className="scroll-area">
        <MessageList messages={messages} />
        <div ref={bottom} />
      </div>
      <form className="composer" onSubmit={send}>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask anything…"
          aria-label="Message"
          disabled={busy}
        />
        <button type="submit" disabled={busy || !input.trim()}>
          {busy ? "Thinking" : "Send"}
        </button>
      </form>
    </div>
  );
}

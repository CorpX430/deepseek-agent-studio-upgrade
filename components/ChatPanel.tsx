"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import MessageList from "./MessageList";
interface Msg { role: "user" | "assistant"; content: string; reasoning?: string }

export default function ChatPanel() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [context, setContext] = useState("");
  const [attachment, setAttachment] = useState("");
  const [model, setModel] = useState("deepseek-chat");
  const [busy, setBusy] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function attach(file: File) {
    setAttachment("Uploading…");
    const form = new FormData(); form.append("file", file);
    const response = await fetch("/api/files", { method: "POST", body: form });
    const data = await response.json();
    if (!response.ok) { setAttachment(data.error || "Upload failed"); return; }
    setContext(data.text || `Uploaded file: ${data.name} (${data.pathname})`);
    setAttachment(data.name);
  }

  async function send(event?: FormEvent) {
    event?.preventDefault();
    if (!input.trim() || busy) return;
    const prompt = input.trim();
    const next = [...messages, { role: "user" as const, content: prompt }];
    setMessages([...next, { role: "assistant", content: "" }]); setInput(""); setBusy(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next, model, context }) });
      if (!res.ok || !res.body) throw new Error("Unable to reach DeepSeek");
      const reader = res.body.getReader(); const decoder = new TextDecoder(); let buffer = ""; let answer = ""; let reasoning = "";
      while (true) { const { done, value } = await reader.read(); if (done) break; buffer += decoder.decode(value, { stream: true }); const lines = buffer.split("\n\n"); buffer = lines.pop() || "";
        for (const line of lines) { if (!line.startsWith("data: ")) continue; const event = JSON.parse(line.slice(6)); if (event.type === "content") answer += event.content; if (event.type === "reasoning") reasoning += event.content; if (event.type === "error") throw new Error(event.error); setMessages([...next, { role: "assistant", content: answer, reasoning: reasoning || undefined }]); }
      }
    } catch (error) { setMessages([...next, { role: "assistant", content: `Error: ${error instanceof Error ? error.message : String(error)}` }]); } finally { setBusy(false); }
  }

  return <div className="panel"><div className="panel-intro"><span className="eyebrow">DEEPSEEK V4 FLASH PRO</span><h2>What are you working on?</h2><p>Paste a URL, attach a text file, or ask DeepSeek to reason through it.</p><label className="model-picker">Model<select value={model} onChange={e => setModel(e.target.value)} disabled={busy}><option value="deepseek-chat">DeepSeek V4 Flash</option><option value="deepseek-reasoner">DeepSeek V4 Flash Pro</option></select></label></div><div className="scroll-area"><MessageList messages={messages} /><div ref={bottom} /></div><form className="composer" onSubmit={send}><div className="composer-tools"><label className="attach-button">Attach file<input type="file" accept=".txt,.md,.json,.csv,.tsx,.ts,.js,.py,.sol" onChange={e => e.target.files?.[0] && attach(e.target.files[0])} /></label>{attachment && <span className="attachment-name">{attachment}</span>}<button type="button" className="clear-context" onClick={() => { setContext(""); setAttachment(""); }} disabled={!context}>Clear context</button></div><div className="composer-row"><input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask anything or paste an X/Twitter URL…" aria-label="Message" disabled={busy} /><button type="submit" disabled={busy || !input.trim()}>{busy ? "Thinking" : "Send"}</button></div></form></div>;
}

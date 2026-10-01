"use client";

import { FormEvent, useState } from "react";

export default function AgentPanel({ sessionId }: { sessionId: string }) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function send(event?: FormEvent) {
    event?.preventDefault();
    if (!input.trim() || busy) return;
    const prompt = input.trim();
    setInput("");
    setOutput("");
    setLogs([]);
    setBusy(true);
    try {
      const response = await fetch("/api/agent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: prompt }], sessionId }) });
      if (!response.ok || !response.body) throw new Error("DeepSeek Terminal is unavailable.");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() || "";
        for (const chunk of chunks) {
          if (!chunk.startsWith("data: ")) continue;
          const event = JSON.parse(chunk.slice(6));
          if (event.type === "content") setOutput((previous) => previous + event.content);
          if (event.type === "tool_call") setLogs((previous) => [...previous, `▶ ${event.name}\n${event.arguments}`]);
          if (event.type === "tool_result") setLogs((previous) => [...previous, `✓ ${event.name}\n${event.result}`]);
          if (event.type === "error") setOutput((previous) => previous + `\n\nError: ${event.error}`);
        }
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setBusy(false);
    }
  }

  return <div className="workspace"><div className="workspace-main"><div className="panel-intro"><span className="eyebrow green">DEEPSEEK TERMINAL</span><h2>Work in an isolated sandbox.</h2><p>Ask DeepSeek to create files, run commands, inspect errors, and verify the result through E2B.</p></div><div className="output-card">{output || <span className="muted">Terminal agent output will appear here.</span>}</div><form className="composer" onSubmit={send}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Build a FastAPI todo backend with tests…" aria-label="Terminal task" disabled={busy} /><button className="green-button" type="submit" disabled={busy || !input.trim()}>{busy ? "Running" : "Run task"}</button></form></div><aside className="tool-pane"><div className="pane-title"><span className="status-dot" />Terminal activity <small>{sessionId.slice(0, 8)}</small></div><pre>{logs.join("\n\n") || "Tool calls will appear here…"}</pre></aside></div>;
}

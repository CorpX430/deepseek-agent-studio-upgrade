"use client";
import { useState } from "react";
import ModeSwitcher from "@/components/ModeSwitcher";
import ChatPanel from "@/components/ChatPanel";
import AgentPanel from "@/components/AgentPanel";
import CharacterPanel from "@/components/CharacterPanel";

export default function Home() {
  const [mode, setMode] = useState<"chat" | "agent" | "character">("chat");
  const [sessionId] = useState(() => crypto.randomUUID());
  return <main className="studio-shell"><header className="studio-header"><div className="brand"><div className="brand-mark">DS</div><div><h1>DeepSeek <span>Agent Studio</span></h1><p>Build, chat, and explore in one focused workspace</p></div></div><ModeSwitcher mode={mode} setMode={setMode} /></header><section className="studio-content">{mode === "chat" && <ChatPanel />}{mode === "agent" && <AgentPanel sessionId={sessionId} />}{mode === "character" && <CharacterPanel />}</section></main>;
}

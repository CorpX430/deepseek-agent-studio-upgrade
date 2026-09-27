"use client";
import { useState } from "react";
import ModeSwitcher from "@/components/ModeSwitcher";
import ChatPanel from "@/components/ChatPanel";
import AgentPanel from "@/components/AgentPanel";
import CharacterPanel from "@/components/CharacterPanel";
import Web3Panel from "@/components/Web3Panel";

export default function Home() {
  const [mode, setMode] = useState<"chat" | "agent" | "character" | "web3">("chat");
  const [sessionId] = useState(() => crypto.randomUUID());
  return <main className="studio-shell"><header className="studio-header"><div className="brand"><div className="brand-mark">DS</div><div><h1>DeepSeek <span>Agent Studio</span></h1><p>DeepSeek models · secure agent cloud · non-custodial EVM workspace</p></div></div><div className="auth-actions"><span className="auth-badge">Supabase workspace</span></div><ModeSwitcher mode={mode} setMode={setMode} /></header><section className="studio-content">{mode === "chat" && <ChatPanel />}{mode === "agent" && <AgentPanel sessionId={sessionId} />}{mode === "character" && <CharacterPanel sessionId={sessionId} />}{mode === "web3" && <Web3Panel />}</section></main>;
}

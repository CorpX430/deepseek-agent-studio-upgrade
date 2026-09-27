"use client";
import { useState } from "react";
import ModeSwitcher from "@/components/ModeSwitcher";
import ChatPanel from "@/components/ChatPanel";
import AgentPanel from "@/components/AgentPanel";
import CharacterPanel from "@/components/CharacterPanel";
import Web3Panel from "@/components/Web3Panel";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";

export default function Home() {
  const [mode, setMode] = useState<"chat" | "agent" | "character" | "web3">("chat");
  const { isSignedIn } = useAuth();
  const [sessionId] = useState(() => crypto.randomUUID());
  return <main className="studio-shell"><header className="studio-header"><div className="brand"><div className="brand-mark">DS</div><div><h1>DeepSeek <span>Agent Studio</span></h1><p>DeepSeek models · secure agent cloud · non-custodial EVM workspace</p></div></div><div className="auth-actions">{isSignedIn ? <UserButton /> : <><SignInButton mode="modal"><button className="auth-button">Sign in</button></SignInButton><SignUpButton mode="modal"><button className="auth-button auth-button-primary">Create account</button></SignUpButton></>}</div><ModeSwitcher mode={mode} setMode={setMode} /></header><section className="studio-content">{mode === "chat" && <ChatPanel />}{mode === "agent" && <AgentPanel sessionId={sessionId} />}{mode === "character" && <CharacterPanel sessionId={sessionId} />}{mode === "web3" && <Web3Panel />}</section></main>;
}

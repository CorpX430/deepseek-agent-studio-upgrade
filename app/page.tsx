"use client";

import { useState } from "react";
import ModeSwitcher from "@/components/ModeSwitcher";
import ChatPanel from "@/components/ChatPanel";
import AgentPanel from "@/components/AgentPanel";
import CharacterPanel from "@/components/CharacterPanel";
import Web3Panel from "@/components/Web3Panel";
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";

export default function Home() {
  const [mode, setMode] = useState<"chat" | "agent" | "character" | "web3">("chat");
  const [sessionId] = useState(() => crypto.randomUUID());

  return (
    <main className="studio-shell">
      <header className="studio-header">
        <div className="brand">
          <div className="brand-mark">DS</div>
          <div>
            <h1>
              DeepSeek <span>Agent Studio</span>
            </h1>
            <p>DeepSeek / OpenRouter studio with character profiles and wallet tooling.</p>
          </div>
        </div>

        <ModeSwitcher mode={mode} setMode={setMode} />

        <div className="auth-actions">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="auth-button">Sign in</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="auth-button">Sign up</button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </header>

      <div className="studio-content">
        {mode === "chat" && <ChatPanel />}
        {mode === "agent" && <AgentPanel sessionId={sessionId} />}
        {mode === "character" && <CharacterPanel />}
        {mode === "web3" && <Web3Panel />}
      </div>

      <div className="status-bar">
        <span>Provider: DeepSeek + OpenRouter</span>
        <span>Cloud sync: Supabase-ready</span>
        <span>Mode: {mode}</span>
      </div>
    </main>
  );
}

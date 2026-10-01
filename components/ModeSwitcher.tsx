"use client";

import { MessageSquare, Terminal, UserRound, Wallet } from "lucide-react";
import { clsx } from "clsx";

const modes = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "agent", label: "Terminal", icon: Terminal },
  { id: "character", label: "Character", icon: UserRound },
  { id: "web3", label: "Web3", icon: Wallet },
] as const;

export default function ModeSwitcher({ mode, setMode }: { mode: string; setMode: (mode: "chat" | "agent" | "character" | "web3") => void }) {
  return <nav className="mode-switcher" aria-label="Studio mode">{modes.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setMode(id)} className={clsx("mode-button", mode === id && "mode-button-active")} aria-current={mode === id ? "page" : undefined}><Icon size={16} />{label}</button>)}</nav>;
}

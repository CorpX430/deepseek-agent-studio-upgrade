"use client";

import { MessageSquare, Terminal, UserRound, Wallet } from "lucide-react";
import { clsx } from "clsx";

type Mode = "chat" | "agent" | "character" | "web3";

const modes: { id: Mode; label: string; icon: typeof MessageSquare }[] = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "agent", label: "Agent", icon: Terminal },
  { id: "character", label: "Character", icon: UserRound },
  { id: "web3", label: "Wallet", icon: Wallet },
];

export default function ModeSwitcher({ mode, setMode }: { mode: Mode; setMode: (mode: Mode) => void }) {
  return (
    <nav className="mode-switcher" aria-label="Studio mode">
      {modes.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          className={clsx("mode-button", mode === id && "active")}
          onClick={() => setMode(id)}
        >
          <Icon size={15} />
          {label}
        </button>
      ))}
    </nav>
  );
}

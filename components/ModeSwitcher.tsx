"use client";
import { MessageSquare, Terminal, UserRound } from "lucide-react";
import { clsx } from "clsx";
const modes = [{ id: "chat", label: "Chat", icon: MessageSquare }, { id: "agent", label: "Agent", icon: Terminal }, { id: "character", label: "Character", icon: UserRound }] as const;
export default function ModeSwitcher({ mode, setMode }: { mode: string; setMode: (mode: "chat" | "agent" | "character") => void }) { return <nav className="mode-switcher" aria-label="Studio mode">{modes.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setMode(id)} className={clsx("mode-button", mode === id && "mode-button-active")} aria-current={mode === id ? "page" : undefined}><Icon size={16} />{label}</button>)}</nav>; }

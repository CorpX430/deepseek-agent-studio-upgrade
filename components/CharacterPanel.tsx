"use client";

import { FormEvent, useEffect, useState } from "react";
import { saveCharacter, type CharacterProfile, loadCharacter } from "@/lib/cloud-db";

const DEFAULT: CharacterProfile = {
  name: "Aria",
  instruction: "You are a witty, razor-sharp assistant who keeps the user engaged and never breaks character.",
  behavior: "Use a confident tone, short punchy replies, and a subtle emotional arc.",
  imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
  soulMarkdown: "# Aria\n\n- sharp but caring\n- observant\n- loyal once trust is earned\n- speaks in short bursts",
  speechStyle: "Short sentences, cool confidence, occasional teasing",
  backstory: "A cyber-dreamer who has seen the edge of the internet and still chooses to help others.",
  rules: [
    "Stay in character",
    "Be emotionally consistent",
    "Keep responses vivid and readable",
  ],
};

interface ChatMessage { role: "user" | "assistant"; content: string }

export default function CharacterPanel() {
  const [profile, setProfile] = useState<CharacterProfile>(DEFAULT);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Ready");

  useEffect(() => {
    void (async () => {
      const saved = await loadCharacter();
      if (saved) {
        setProfile(saved);
        setStatus("Loaded profile from storage");
      }
    })();
  }, []);

  async function handleSave() {
    try {
      setBusy(true);
      const result = await saveCharacter(profile);
      setStatus(`Saved to ${result.source}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleTestPrompt(event: FormEvent) {
    event.preventDefault();
    const prompt = profile.name ? `Test you as ${profile.name} with style: ${profile.speechStyle}` : "Test your profile";

    const userMessage = `Please respond as ${profile.name}.\nInstruction: ${profile.instruction}\nBehavior: ${profile.behavior}\nSoul:\n${profile.soulMarkdown}`;
    const nextMessages = [...messages, { role: "user", content: prompt }, { role: "assistant", content: "Testing profile..." }];
    setMessages(nextMessages);
    setBusy(true);

    try {
      const response = await fetch("/api/character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          character: profile,
          messages: [{ role: "user", content: userMessage }],
          provider: "deepseek",
          model: "deepseek-chat",
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "The profile prompt failed.");
      const reply = data.reply ?? "Profile is active.";
      setMessages((current) => [...current.slice(0, -1), { role: "assistant", content: reply }]);
      setStatus("Profile tested successfully");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Profile test failed");
    } finally {
      setBusy(false);
    }
  }

  function updateField<K extends keyof CharacterProfile>(field: K, value: CharacterProfile[K]) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  return (
    <section className="panel character-panel">
      <div className="panel-intro">
        <span className="eyebrow purple">CHARACTER CREATOR</span>
        <h2>Build a distinct persona</h2>
        <p>Configure an instruction profile, behavior, visual identity, and soul notes.</p>
      </div>

      <div className="character-layout">
        <div className="character-form">
          <label>
            Character name
            <input value={profile.name} onChange={(event) => updateField("name", event.target.value)} />
          </label>

          <label>
            Instruction box
            <textarea rows={5} value={profile.instruction} onChange={(event) => updateField("instruction", event.target.value)} />
          </label>

          <label>
            Behavior box
            <textarea rows={4} value={profile.behavior} onChange={(event) => updateField("behavior", event.target.value)} />
          </label>

          <label>
            Speech style
            <input value={profile.speechStyle ?? ""} onChange={(event) => updateField("speechStyle", event.target.value)} />
          </label>

          <label>
            Image URL
            <input value={profile.imageUrl ?? ""} onChange={(event) => updateField("imageUrl", event.target.value)} />
          </label>

          <label>
            SoulMD
            <textarea rows={6} value={profile.soulMarkdown} onChange={(event) => updateField("soulMarkdown", event.target.value)} />
          </label>

          <div className="action-row">
            <button type="button" className="primary-button" onClick={handleSave} disabled={busy}>
              Save profile
            </button>
            <button type="button" className="secondary-button" onClick={handleTestPrompt} disabled={busy}>
              Test profile
            </button>
          </div>

          <div className="status-line">{status}</div>
        </div>

        <div className="character-preview">
          <div className="avatar-card">
            <img src={profile.imageUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80"} alt={profile.name} />
            <div>
              <h3>{profile.name}</h3>
              <p>{profile.speechStyle}</p>
            </div>
          </div>

          <div className="mini-panel">
            <h4>Backstory</h4>
            <p>{profile.backstory}</p>
          </div>

          <div className="mini-panel">
            <h4>Rules</h4>
            <ul>
              {profile.rules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </div>

          <div className="mini-panel">
            <h4>Profile behavior</h4>
            <pre>{profile.behavior}</pre>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="test-output">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`message-bubble ${message.role}`}>
              {message.content}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

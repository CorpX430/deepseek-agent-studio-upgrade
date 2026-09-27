import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type PersistedMessage = { role: "user" | "assistant" | "system"; content: string; reasoning?: string };
export type CharacterProfile = { name: string; personality: string; speech_style: string; backstory: string; rules: string[] };

let client: SupabaseClient | null = null;
export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for persistence.");
  client ??= createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  return client;
}

export async function ensureSession(sessionId: string, ownerId: string, mode: "chat" | "agent" | "character" | "web3", characterId?: string) {
  const db = getSupabaseAdmin();
  const { error } = await db.from("sessions").upsert({ id: sessionId, owner_id: ownerId, mode, character_id: characterId ?? null, updated_at: new Date().toISOString() }, { onConflict: "id" });
  if (error) throw error;
}

export async function replaceSessionMessages(sessionId: string, ownerId: string, messages: PersistedMessage[]) {
  const db = getSupabaseAdmin();
  const { error: removeError } = await db.from("messages").delete().eq("session_id", sessionId).eq("owner_id", ownerId);
  if (removeError) throw removeError;
  if (!messages.length) return;
  const { error } = await db.from("messages").insert(messages.map((message) => ({ session_id: sessionId, owner_id: ownerId, role: message.role, content: message.content, reasoning: message.reasoning ?? null })));
  if (error) throw error;
}

export async function readSessionMessages(sessionId: string, ownerId: string) {
  const db = getSupabaseAdmin();
  const { data, error } = await db.from("messages").select("role,content,reasoning,created_at").eq("session_id", sessionId).eq("owner_id", ownerId).order("created_at", { ascending: true }).limit(200);
  if (error) throw error;
  return data ?? [];
}

export async function upsertCharacter(ownerId: string, profile: CharacterProfile, source = "upload") {
  const db = getSupabaseAdmin();
  const slug = profile.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "character";
  const { data, error } = await db.from("characters").upsert({ owner_id: ownerId, slug, ...profile, source }, { onConflict: "owner_id,slug" }).select("id,name,personality,speech_style,backstory,rules").single();
  if (error) throw error;
  return data;
}

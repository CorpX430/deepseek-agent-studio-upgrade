import { createClient } from "@supabase/supabase-js";

export type CharacterProfile = {
  name: string;
  instruction: string;
  behavior: string;
  imageUrl?: string;
  soulMarkdown: string;
  speechStyle?: string;
  backstory?: string;
  rules: string[];
};

export async function saveCharacter(profile: CharacterProfile) {
  if (typeof window !== "undefined") {
    localStorage.setItem("deepseek-agent-studio-character", JSON.stringify(profile));
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return { source: "local-storage", profile };
  }

  const client = createClient(url, key);
  const { data, error } = await client
    .from("characters")
    .upsert({ id: "default-character", ...profile, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw error;
  return { source: "supabase", profile: data };
}

export async function loadCharacter(): Promise<CharacterProfile | null> {
  if (typeof window !== "undefined") {
    const saved = window.localStorage.getItem("deepseek-agent-studio-character");
    if (saved) {
      try {
        return JSON.parse(saved) as CharacterProfile;
      } catch {
        return null;
      }
    }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const client = createClient(url, key);
  const { data, error } = await client.from("characters").select("*").eq("id", "default-character").single();
  if (error || !data) return null;
  return data as CharacterProfile;
}

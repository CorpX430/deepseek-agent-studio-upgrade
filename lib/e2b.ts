import { Sandbox } from "e2b";

const sandboxes = new Map<string, Sandbox>();

export async function getSandbox(sessionId: string) {
  if (!process.env.E2B_API_KEY) throw new Error("E2B_API_KEY is not configured.");
  const existing = sandboxes.get(sessionId);
  if (existing) return existing;
  const sandbox = await Sandbox.create({ apiKey: process.env.E2B_API_KEY, timeoutMs: 10 * 60 * 1000 });
  sandboxes.set(sessionId, sandbox);
  return sandbox;
}

export async function killSandbox(sessionId: string) {
  const sandbox = sandboxes.get(sessionId);
  if (!sandbox) return;
  await sandbox.kill();
  sandboxes.delete(sessionId);
}

import { z } from "zod";
import { getSandbox } from "./e2b";

export const agentTools = [
  { type: "function" as const, function: { name: "run_terminal_command", description: "Run a shell command inside the isolated sandbox.", parameters: { type: "object", properties: { command: { type: "string" }, cwd: { type: "string" } }, required: ["command"] } } },
  { type: "function" as const, function: { name: "write_file", description: "Write complete content to a sandbox file.", parameters: { type: "object", properties: { path: { type: "string" }, content: { type: "string" } }, required: ["path", "content"] } } },
  { type: "function" as const, function: { name: "read_file", description: "Read a sandbox file.", parameters: { type: "object", properties: { path: { type: "string" } }, required: ["path"] } } },
  { type: "function" as const, function: { name: "list_files", description: "List a sandbox directory.", parameters: { type: "object", properties: { path: { type: "string" } } } } },
];

const commandArgs = z.object({ command: z.string().min(1).max(10000), cwd: z.string().max(500).optional() });
const writeArgs = z.object({ path: z.string().min(1).max(1000), content: z.string().max(500000) });
const pathArgs = z.object({ path: z.string().min(1).max(1000) });

export async function executeTool(sessionId: string, name: string, rawArgs: string) {
  const sandbox = await getSandbox(sessionId);
  const parsed = JSON.parse(rawArgs) as unknown;
  if (name === "run_terminal_command") {
    const args = commandArgs.parse(parsed);
    const result = await sandbox.commands.run(args.command, { cwd: args.cwd });
    return JSON.stringify({ stdout: result.stdout, stderr: result.stderr, exitCode: result.exitCode });
  }
  if (name === "write_file") {
    const args = writeArgs.parse(parsed);
    await sandbox.files.write(args.path, args.content);
    return JSON.stringify({ ok: true, path: args.path });
  }
  if (name === "read_file") {
    const args = pathArgs.parse(parsed);
    return JSON.stringify({ content: await sandbox.files.read(args.path) });
  }
  if (name === "list_files") {
    const args = z.object({ path: z.string().optional() }).parse(parsed);
    const path = args.path || "/home/user";
    const entries = await sandbox.files.list(path);
    return JSON.stringify({ path, entries: entries.map((entry: any) => ({ name: entry.name, isDir: entry.isDir ?? entry.type === "dir" })) });
  }
  return JSON.stringify({ error: `Unknown tool: ${name}` });
}

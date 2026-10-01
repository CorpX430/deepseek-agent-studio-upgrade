import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { access } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const text = (path) => readFile(new URL(path, root), "utf8");
const exists = (path) => access(new URL(path, root));

test("repository includes the documented production structure", async () => {
  await Promise.all([
    exists("src"),
    exists("public"),
    exists("config"),
    exists("tests"),
    exists("docs"),
    exists("render.yaml"),
    exists("services/deepseekClient.js"),
    exists("components/ThemeToggle.tsx"),
    exists(".githooks/pre-commit"),
    exists("scripts/deploy.sh"),
    exists(".manus/commands/deploy.md"),
  ]);
});

test("home screen exposes theme and streaming chat behavior", async () => {
  const page = await text("app/page.tsx");
  const chat = await text("components/ChatPanel.tsx");
  const theme = await text("components/ThemeToggle.tsx");
  assert.match(page, /ThemeToggle/);
  assert.match(chat, /streamDeepSeek/);
  assert.match(theme, /localStorage/);
});

test("DeepSeek integration uses current model identifiers and never hardcodes a key", async () => {
  const source = await text("lib/deepseek.ts");
  assert.match(source, /deepseek-flash/);
  assert.match(source, /DEEPSEEK_API_KEY/);
  assert.doesNotMatch(source, /sk-[A-Za-z0-9]{20,}/);
});

test("environment template does not contain a credential", async () => {
  const env = await text(".env.example");
  assert.match(env, /DEEPSEEK_API_KEY=/);
  assert.doesNotMatch(env, /DEEPSEEK_API_KEY=.+/);
});

test("BNB integration verifies chain 56 before wallet setup", async () => {
  const route = await text("app/api/web3/route.ts");
  const panel = await text("components/Web3Panel.tsx");
  assert.match(route, /numericChainId !== 56/);
  assert.match(route, /credential-free HTTPS/);
  assert.match(panel, /wallet_addEthereumChain/);
  assert.match(panel, /verifyRpc/);
  assert.match(panel, /eth_sendTransaction/);
});

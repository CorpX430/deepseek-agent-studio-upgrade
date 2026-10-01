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
    exists(".github/workflows/ci.yml"),
    exists("services/deepseekClient.js"),
  ]);
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

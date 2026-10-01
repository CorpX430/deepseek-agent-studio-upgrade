# Architecture

DeepSeek Agent Studio is a mobile-first Next.js App Router application.

```text
Browser UI
  ├── /api/chat       → DeepSeek streaming chat
  ├── /api/agent      → DeepSeek tool-calling loop + sandbox tools
  ├── /api/character  → persona chat + optional persistence
  └── /api/web3       → read-only BNB Smart Chain RPC lookup

Server-only integrations
  ├── lib/deepseek.ts
  ├── lib/tools.ts
  └── lib/persistence.ts
```

## Model mapping

The official DeepSeek API currently recommends `deepseek-flash`, which maps to **DeepSeek-V4.1-Flash** and supports streaming, thinking, tool calls, and vision. The optional `deepseek-v4-pro` identifier is retained for the Pro mode. See the [official models and pricing documentation](https://api-docs.deepseek.com/quick_start/pricing).

Thinking-mode reasoning arrives as `reasoning_content` in streaming deltas and is surfaced in the UI as a collapsible trace. API keys remain server-side.

## Security boundaries

- API routes validate and cap message payloads.
- RPC lookups require HTTPS and a valid EVM address.
- Tool execution is constrained by the existing `lib/tools.ts` allowlist.
- No wallet signing or transaction submission occurs in this application.

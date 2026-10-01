# DeepSeek Agent Studio

A mobile-first, single-workspace web app for DeepSeek chat, tool-using agents, character conversations, and read-only BNB Smart Chain inspection.

> Everything you need to ship — in one focused development tool.

## Features

- Streaming DeepSeek chat with a collapsible thinking trace.
- Flash and V4 Pro model selector with text/code/Markdown file attachments up to 120 KB.
- Agent mode with an allowlisted tool loop and visible tool events.
- DeepSeek Terminal mode backed by isolated E2B sandboxes.
- Character mode backed by the included Aria profile.
- Read-only BNB Smart Chain balance lookup; no wallet signing or transaction submission.
- Dark, responsive UI optimized for touch devices.
- Persistent dark/light mode toggle with accessible focus states.
- Render free-plan auto-deploy from `main`, plus reusable local validation commands.

## Quick start

```bash
pnpm install
cp .env.example .env.local
# Add DEEPSEEK_API_KEY to .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

| Command              | Purpose                                   |
| -------------------- | ----------------------------------------- |
| `pnpm dev`           | Start local development                   |
| `pnpm check`         | Run TypeScript and smoke tests            |
| `pnpm build`         | Create the production build               |
| `pnpm start`         | Serve the production build                |
| `pnpm format`        | Format supported files with Prettier      |
| `pnpm deploy`        | Check, build, diff-check, and push `main` |
| `pnpm env:setup`     | Create `.env.local` from the template     |
| `pnpm hooks:install` | Enable the pre-commit test hook           |

## Structure

- `app/` — Next.js pages and API routes
- `components/` — mobile-first UI components
- `lib/` — server-only DeepSeek, persistence, and tool integrations
- `services/` — browser-safe API wrappers
- `config/` — configuration documentation, never secrets
- `tests/` — deterministic repository and integration smoke tests
- `docs/` — setup and architecture documentation
- `.manus/commands/` — reusable `/deploy`, `/test`, `/format`, and `/env-setup` workflows
- `skills/deepseek-terminal/` — reusable terminal-agent operating rules
- `.githooks/` — local pre-commit validation

See [docs/SETUP.md](docs/SETUP.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), and [AGENTS.md](AGENTS.md).

## DeepSeek API notes

The app uses the official OpenAI-compatible endpoint at `https://api.deepseek.com`. The current Flash identifier is `deepseek-flash`, which maps to DeepSeek-V4.1-Flash. The API key stays on the server; it is never prefixed with `NEXT_PUBLIC_` or committed to Git.

References:

- [DeepSeek Models & Pricing](https://api-docs.deepseek.com/quick_start/pricing)
- [Chat Completions API](https://api-docs.deepseek.com/api/create-chat-completion/)
- [Thinking Mode](https://api-docs.deepseek.com/guides/thinking_mode/)

## Deployment

Render is the recommended default and is configured in `render.yaml`. The free service auto-deploys `main`. Set `DEEPSEEK_API_KEY` in the host's encrypted environment settings before using chat, terminal, or character routes.

## License

No license has been selected yet. Add one before accepting external contributions.

# AGENTS.md

## Project rules

- Use pnpm for dependency installation and scripts.
- Keep secrets in `.env.local`; never commit API keys, service-role keys, or tokens.
- Keep DeepSeek calls server-side under `app/api/**`; browser code may call only local routes.
- Preserve streaming responses as SSE and validate all untrusted JSON with a schema or a narrow parser.
- Keep the UI mobile-first: interactive controls must remain usable at 320px wide and meet a 44px minimum touch target.
- Do not add content filters to model output. Do add transport, input-size, and error handling safeguards.

## Directory conventions

- `app/`: routes, layouts, and API handlers.
- `components/`: presentational and client-side interaction components.
- `lib/`: server-only integrations and shared utilities.
- `services/`: browser-safe API clients.
- `config/`: deployment and environment documentation only; never store secrets.
- `tests/`: deterministic smoke and integration tests that do not require live credentials.
- `docs/`: setup, architecture, and operational guidance.

## Verification

Before opening a PR, run:

```bash
pnpm check
pnpm build
```

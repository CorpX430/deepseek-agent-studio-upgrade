# Setup guide

## Requirements

- Node.js 20+
- pnpm 11+
- A DeepSeek API key

## Local development

```bash
pnpm install
cp .env.example .env.local
# edit .env.local and set DEEPSEEK_API_KEY
pnpm dev
```

Open `http://localhost:3000`. The key is read only by the Next.js server and is never exposed to the browser bundle.

## Validation

```bash
pnpm check       # TypeScript plus deterministic smoke tests
pnpm build       # Create the production build without requiring a live API key
pnpm start       # Serve the production build
pnpm hooks:install # Enable the pre-commit check hook
```

See [WORKFLOW.md](WORKFLOW.md) for the `/deploy`, `/test`, `/format`, and `/env-setup` conventions.

## Deployment

The recommended hosting target is **Render** using the included `render.yaml`, or any Node-compatible host that supports Next.js. Set `DEEPSEEK_API_KEY` as a secret environment variable in the host dashboard. Do not put secrets in `NEXT_PUBLIC_*` variables.

## Optional integrations

Supabase, E2B, JSONBin, PostHog, Cloudflare, and Anchor Browser are optional. Leave their variables empty unless the corresponding feature is enabled.

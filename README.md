# DeepSeek Agent Studio Upgrade

This project is a Next.js app for conversation, character design, agent tooling, and wallet experiments.

## Features

- DeepSeek chat with configurable provider selection
- OpenRouter support for alternative LLM routing
- character creator with instruction box, behavior box, image URL, and SoulMD
- cloud persistence via Supabase (free tier)
- Web3 read-only wallet inspection and transaction signing helper
- ready for free hosting on Vercel or Railway

## Setup

1. Install dependencies:

```bash
npm install
# or
pnpm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Configure your keys:

- `DEEPSEEK_API_KEY` for DeepSeek models
- `OPENROUTER_API_KEY` for OpenRouter routing
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for the free cloud database
- `WALLET_PRIVATE_KEY` only if you want server-side signing helpers

4. Run locally:

```bash
npm run dev
```

## Supabase cloud database

Create a free project at https://supabase.com and create a table named `characters` with the following columns:

```sql
create table public.characters (
  id text primary key,
  name text,
  instruction text,
  behavior text,
  image_url text,
  soul_markdown text,
  speech_style text,
  backstory text,
  rules jsonb,
  updated_at timestamptz default now()
);
```

The app automatically falls back to browser localStorage if no Supabase config is present.

## Free deployment

Recommended: deploy to Vercel.

1. Push to GitHub
2. Import the repo into Vercel
3. Add the same environment variables in Project Settings > Environment Variables
4. Use a custom domain or free subdomain from Vercel
5. Deploy

## Notes

- For the transaction signing flow, use a burner wallet and testnet RPC endpoints only.
- OpenRouter allows you to route requests through many models, including a configurable uncensored or less-filtered model profile if your account provider allows it.

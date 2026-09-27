# Production runbook

## 1. Supabase

1. Create a Supabase project and set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Render.
2. Apply `supabase/migrations/202609270001_initial_studio.sql` in the Supabase SQL editor or your migration runner.
3. The app uses Supabase as its persistence backend and anonymous, cryptographically random workspace session IDs. The browser never receives the service-role key. For multi-device identity, Supabase Auth can be added later without changing the data model.
4. The schema replaces volatile in-memory conversation state with `sessions`, `messages`, `characters`, and `sandboxes`.

## 2. Render

The included `render.yaml` builds and runs the Next.js app with automatic deploys from `main`. Create a Render Blueprint from the repository, enter the `sync: false` values, and keep secrets in Render's encrypted environment settings.

## 3. Connectors

| Service | Production role |
| --- | --- |
| GitHub | Repository source, commits, CI / Render auto-deploy |
| Supabase API | Auth-adjacent persistence and database migrations |
| JSONBin.io | Optional lightweight character JSON backup / sharing |
| Cloudflare API | DNS, Workers, edge functions, and RPC infrastructure |
| Anchor Browser | Headless browser tasks exposed to future agent tools |
| PostHog | Product analytics and feature flags |
| Firecrawl | Crawling and context ingestion for future agent tools |
| Cloudflare Worker Bindings | KV, D1, R2, and Durable Objects for edge workloads |
| Render | Application hosting and deployment |
| Prisma Postgres / CockroachDB Cloud | Alternative managed database targets; not required when Supabase is primary |

Keep connector credentials in the connected-app secret store or Render environment variables; never commit them.

## 4. BNB mainnet transaction flow

The Web3 panel targets BNB Smart Chain by default (`chainId 56`, native asset `BNB`) using `https://bsc-dataseed.binance.org`. It switches or adds the BNB network in the user's injected wallet, constructs a transaction, calls `eth_sendTransaction`, and lets the wallet display the exact recipient, value, calldata, gas, and network for user approval. The server does not hold private keys, and the agent cannot approve or broadcast without the user's wallet confirmation.

Cloudflare does not provide a universal public BNB RPC endpoint. If you create an authenticated Cloudflare Web3 Gateway or Worker proxy for BSC, set its HTTPS URL as `NEXT_PUBLIC_BNB_RPC_URL` in Render. Do not put a Cloudflare token in the browser bundle; keep gateway authentication at the Worker/proxy layer. The endpoint must return BNB Smart Chain chain ID `56`.

## 5. Verification checklist

- Apply the migration before testing signed-in history.
- Configure DeepSeek, E2B, and Supabase secrets in Render. The current deployment intentionally does not require Clerk credentials.
- Connect a test wallet on a test network before mainnet use.
- Confirm a character thread reloads after a refresh while signed in.
- Confirm a rejected wallet prompt produces no broadcast.
- Review Render logs after the first deploy and keep PostHog disabled until its consent / privacy policy is in place.

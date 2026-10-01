# Configuration

This directory intentionally contains documentation only. Runtime values belong in `.env.local` for development or in encrypted environment settings on the deployment host.

Start from the root template:

```bash
cp .env.example .env.local
```

Required for chat, character, and agent routes: `DEEPSEEK_API_KEY`.

# BNB RPC Worker

This directory contains the Cloudflare Worker used as an optional BNB Smart Chain JSON-RPC proxy.

## Deploy from this repository

```bash
cd cloudflare
npx wrangler deploy
```

The deployment requires a Cloudflare API token with **Account > Workers Scripts > Edit** for account `ed1f87ad630ff1ccc0885bff0861483a`.

After deployment, set the resulting `workers.dev` URL in Render as:

```text
NEXT_PUBLIC_BNB_RPC_URL=https://deepseek-bnb-rpc.<subdomain>.workers.dev
```

The Worker intentionally allows only read and gas-estimation methods. Wallet signing remains in the user's injected wallet through `eth_sendTransaction`; no private key is accepted by this repository or Worker.

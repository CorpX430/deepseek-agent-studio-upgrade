# BNB and Neon deployment notes

## BNB RPC

The default endpoint is `https://bsc-dataseed.binance.org`. It was verified against the live JSON-RPC method `eth_chainId` and returned `0x38`, decimal chain ID `56` (BNB Smart Chain).

The app now verifies the endpoint server-side before using it for balance reads or `wallet_addEthereumChain`. Only credential-free HTTPS RPC URLs are accepted. The wallet still presents the final network and transaction approval UI to the user.

Set `NEXT_PUBLIC_BNB_RPC_URL` in Render only to a verified HTTPS BNB RPC endpoint.

## Neon

The Neon connector is enabled, but the connected Neon organization is Vercel-managed and currently has no projects. Creating a project through this connector is blocked by the organization policy. Once a user-owned Neon organization/project is connected, set its encrypted `DATABASE_URL` in the deployment environment before wiring persistence to it.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
const ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const inputSchema = z.object({
  rpcUrl: z.string().url().refine((value) => {
    const parsed = new URL(value);
    return parsed.protocol === "https:" && !parsed.username && !parsed.password;
  }, "RPC URL must be a credential-free HTTPS URL"),
  address: z.string().regex(ADDRESS, "Valid EVM address required").optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { rpcUrl, address } = inputSchema.parse(await request.json());
    const rpc = async (method: string, params: string[]) => {
      const response = await fetch(rpcUrl, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }), cache: "no-store", signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error(`RPC returned HTTP ${response.status}.`);
      const payload = (await response.json()) as { error?: { message?: string }; result?: string };
      if (payload.error) throw new Error(payload.error.message ?? "RPC error");
      if (typeof payload.result !== "string") throw new Error("RPC returned an invalid result.");
      return payload.result;
    };
    const chainId = await rpc("eth_chainId", []);
    const numericChainId = Number.parseInt(chainId, 16);
    if (numericChainId !== 56) return NextResponse.json({ error: `This endpoint is chain ${numericChainId}; use a BNB Smart Chain RPC (chain ID 56).` }, { status: 400 });
    if (!address) return NextResponse.json({ chainId: numericChainId, chainName: "BNB Smart Chain", rpcUrl, verified: true });
    const balance = await rpc("eth_getBalance", [address, "latest"]);
    const wei = BigInt(balance);
    const whole = wei / BigInt("1000000000000000000");
    const fraction = (wei % BigInt("1000000000000000000")).toString().padStart(18, "0").slice(0, 6);
    return NextResponse.json({ chainId: numericChainId, chainName: "BNB Smart Chain", rpcUrl, verified: true, balanceNative: `${whole}.${fraction}` });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request" }, { status: 400 });
  }
}

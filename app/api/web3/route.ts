import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
const inputSchema = z.object({ rpcUrl: z.string().url().refine((value) => value.startsWith("https://"), "HTTPS RPC required"), address: z.string().regex(/^0x[a-fA-F0-9]{40}$/) });

export async function POST(request: NextRequest) {
  try {
    const { rpcUrl, address } = inputSchema.parse(await request.json());
    const rpc = async (method: string, params: string[]) => {
      const response = await fetch(rpcUrl, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }), cache: "no-store" });
      const payload = await response.json();
      if (payload.error) throw new Error(payload.error.message ?? "RPC error");
      return payload.result as string;
    };
    const [chainId, balance] = await Promise.all([rpc("eth_chainId", []), rpc("eth_getBalance", [address, "latest"])]);
    const wei = BigInt(balance);
    const whole = wei / BigInt("1000000000000000000");
    const fraction = (wei % BigInt("1000000000000000000")).toString().padStart(18, "0").slice(0, 6);
    return NextResponse.json({ chainId: Number.parseInt(chainId, 16), balanceEth: `${whole}.${fraction}` });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request" }, { status: 400 }); }
}

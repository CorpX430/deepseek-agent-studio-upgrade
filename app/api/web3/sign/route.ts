import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { privateKeyToAccount, createWalletClient, http } from "viem";

const inputSchema = z.object({
  rpcUrl: z.string().url().refine((value) => value.startsWith("https://"), "HTTPS RPC required"),
  to: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  value: z.string().regex(/^\d+$/),
  data: z.string().regex(/^0x[a-fA-F0-9]*$/).default("0x"),
  privateKey: z.string().regex(/^0x[a-fA-F0-9]{64}$/).optional(),
});

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = inputSchema.parse(await request.json());
    const privateKey = body.privateKey ?? process.env.WALLET_PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json({ error: "Set WALLET_PRIVATE_KEY in env or include privateKey in the request." }, { status: 400 });
    }

    const account = privateKeyToAccount(privateKey as `0x${string}`);
    const wallet = createWalletClient({
      account,
      transport: http(body.rpcUrl),
    });

    const hash = await wallet.sendTransaction({
      account,
      to: body.to as `0x${string}`,
      value: BigInt(body.value),
      data: body.data as `0x${string}`,
    });

    return NextResponse.json({ hash });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request" }, { status: 400 });
  }
}

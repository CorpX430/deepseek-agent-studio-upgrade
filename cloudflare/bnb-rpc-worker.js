const UPSTREAM = "https://bsc-dataseed.binance.org";
const ALLOWED_METHODS = new Set([
  "eth_chainId",
  "eth_blockNumber",
  "eth_getBalance",
  "eth_getTransactionCount",
  "eth_gasPrice",
  "eth_estimateGas",
  "eth_call",
  "eth_getCode",
  "eth_getBlockByNumber",
  "eth_getTransactionByHash",
  "eth_getTransactionReceipt",
]);
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "no-store",
};

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") return new Response("POST JSON-RPC only", { status: 405, headers: cors });
    let body;
    try { body = await request.json(); } catch { return json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Invalid JSON" } }, 400); }
    const calls = Array.isArray(body) ? body : [body];
    if (calls.length > 20) return json({ jsonrpc: "2.0", id: null, error: { code: -32600, message: "Batch too large" } }, 400);
    for (const call of calls) {
      if (!call || typeof call.method !== "string" || !ALLOWED_METHODS.has(call.method)) {
        return json({ jsonrpc: "2.0", id: call?.id ?? null, error: { code: -32601, message: "RPC method is not allowed by this proxy" } }, 403);
      }
    }
    const upstream = await fetch(UPSTREAM, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    return new Response(upstream.body, { status: upstream.status, headers: { ...cors, "Content-Type": "application/json" } });
  },
};

function json(value, status = 200) { return new Response(JSON.stringify(value), { status, headers: { ...cors, "Content-Type": "application/json" } }); }

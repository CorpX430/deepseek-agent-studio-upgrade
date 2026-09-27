"use client";

import { useState } from "react";

export default function Web3Panel() {
  const [rpcUrl, setRpcUrl] = useState("https://cloudflare-eth.com");
  const [address, setAddress] = useState("");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);

  async function inspect() {
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      setResult("Enter a valid EVM address.");
      return;
    }
    setBusy(true);
    setResult("");
    try {
      const response = await fetch("/api/web3", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rpcUrl, address }) });
      const data = await response.json();
      setResult(data.error ?? `Chain ID: ${data.chainId}\nBalance: ${data.balanceEth} ETH`);
    } catch {
      setResult("Unable to reach the read-only EVM inspector.");
    } finally { setBusy(false); }
  }

  return <section className="panel"><div className="panel-intro"><span className="eyebrow green">READ-ONLY EVM LAB</span><h2>Web3 workspace</h2><p>Inspect public chain data safely. Signing and transactions stay disabled until explicitly configured.</p></div><div className="scroll-area"><div className="web3-card"><label>JSON-RPC endpoint<input value={rpcUrl} onChange={(event) => setRpcUrl(event.target.value)} /></label><label>Wallet address<input inputMode="text" placeholder="0x..." value={address} onChange={(event) => setAddress(event.target.value)} /></label><button className="composer-button green-button" onClick={inspect} disabled={busy}>{busy ? "Inspecting..." : "Inspect wallet"}</button>{result && <pre className="web3-result">{result}</pre>}</div></div></section>;
}


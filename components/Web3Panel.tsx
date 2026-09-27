"use client";

import { useState } from "react";

export default function Web3Panel() {
  const [rpcUrl, setRpcUrl] = useState("https://cloudflare-eth.com");
  const [address, setAddress] = useState("");
  const [to, setTo] = useState("");
  const [value, setValue] = useState("0");
  const [data, setData] = useState("0x");
  const [privateKey, setPrivateKey] = useState("");
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
    } finally {
      setBusy(false);
    }
  }

  async function signTransaction() {
    if (!/^0x[a-fA-F0-9]{40}$/.test(to)) {
      setResult("Enter a valid recipient address.");
      return;
    }

    setBusy(true);
    setResult("");

    try {
      const response = await fetch("/api/web3/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rpcUrl, to, value, data, privateKey }),
      });
      const payload = await response.json();
      setResult(payload.error ?? `Signed transaction hash:\n${payload.hash}`);
    } catch {
      setResult("Unable to sign the transaction request.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel">
      <div className="panel-intro">
        <span className="eyebrow green">READ-ONLY + SIGNING LAB</span>
        <h2>Web3 workspace</h2>
        <p>Inspect public chain data and submit a raw transaction for signing.</p>
      </div>

      <div className="web3-grid">
        <div className="mini-panel">
          <h3>Balances</h3>
          <label>
            RPC URL
            <input value={rpcUrl} onChange={(event) => setRpcUrl(event.target.value)} />
          </label>
          <label>
            Wallet address
            <input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="0x..." />
          </label>
          <button type="button" className="primary-button" onClick={inspect} disabled={busy}>
            Inspect wallet
          </button>
        </div>

        <div className="mini-panel">
          <h3>Sign transaction</h3>
          <label>
            To
            <input value={to} onChange={(event) => setTo(event.target.value)} placeholder="0x..." />
          </label>
          <label>
            Value (wei)
            <input value={value} onChange={(event) => setValue(event.target.value)} />
          </label>
          <label>
            Data (hex)
            <input value={data} onChange={(event) => setData(event.target.value)} />
          </label>
          <label>
            Private key (burner wallet only)
            <input type="password" value={privateKey} onChange={(event) => setPrivateKey(event.target.value)} placeholder="0x..." />
          </label>
          <button type="button" className="secondary-button" onClick={signTransaction} disabled={busy}>
            Sign transaction
          </button>
        </div>
      </div>

      {result && <pre className="result-box">{result}</pre>}
    </section>
  );
}

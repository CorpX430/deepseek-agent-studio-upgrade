"use client";

import { useState } from "react";

type EthereumProvider = { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> };
declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

const ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const HEX_DATA = /^0x(?:[a-fA-F0-9]{2})*$/;
const BNB_CHAIN_ID = "0x38";
const DEFAULT_BNB_RPC = process.env.NEXT_PUBLIC_BNB_RPC_URL || "https://bsc-dataseed.binance.org";

function toWei(value: string) {
  if (!/^\d+(\.\d{0,18})?$/.test(value) || Number(value) < 0) throw new Error("Enter a valid BNB amount with up to 18 decimals.");
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole || "0") * BigInt("1000000000000000000") + BigInt((fraction + "000000000000000000").slice(0, 18));
}

function validateRpcUrl(value: string) {
  const parsed = new URL(value.trim());
  if (parsed.protocol !== "https:" || parsed.username || parsed.password) throw new Error("RPC URL must be a credential-free HTTPS URL.");
  return parsed.toString();
}

async function verifyRpc(rpcUrl: string, address?: string) {
  const response = await fetch("/api/web3", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rpcUrl: validateRpcUrl(rpcUrl), ...(address ? { address } : {}) }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "The RPC endpoint did not respond as BNB Smart Chain.");
  return payload as { chainId: number; chainName: string; balanceNative?: string; rpcUrl: string };
}

export default function Web3Panel() {
  const [rpcUrl, setRpcUrl] = useState(DEFAULT_BNB_RPC);
  const [address, setAddress] = useState("");
  const [to, setTo] = useState("");
  const [value, setValue] = useState("0");
  const [data, setData] = useState("");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);
  const [connected, setConnected] = useState(false);
  const [rpcVerified, setRpcVerified] = useState(false);

  async function ensureBnbNetwork() {
    if (!window.ethereum) throw new Error("Install or unlock a browser wallet such as MetaMask to continue.");
    const verified = await verifyRpc(rpcUrl);
    setRpcUrl(verified.rpcUrl);
    try {
      await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: BNB_CHAIN_ID }] });
    } catch (error) {
      const code = (error as { code?: number }).code;
      if (code !== 4902) throw error;
      await window.ethereum.request({ method: "wallet_addEthereumChain", params: [{ chainId: BNB_CHAIN_ID, chainName: "BNB Smart Chain", nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 }, rpcUrls: [verified.rpcUrl], blockExplorerUrls: ["https://bscscan.com"] }] });
    }
    setRpcVerified(true);
    return verified.rpcUrl;
  }

  async function connect() {
    if (!window.ethereum) {
      setResult("Install or unlock a browser wallet such as MetaMask to continue.");
      return;
    }
    setBusy(true);
    setResult("Verifying the BNB RPC and requesting wallet access…");
    try {
      const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
      const account = accounts[0] ?? "";
      if (!ADDRESS.test(account)) throw new Error("The wallet did not return a valid EVM account.");
      setAddress(account);
      await ensureBnbNetwork();
      setConnected(true);
      setResult(`Connected ${account} on BNB Smart Chain. RPC verified.`);
    } catch (error) {
      setConnected(false);
      setResult(`Wallet connection rejected: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setBusy(false);
    }
  }

  async function inspect() {
    if (!ADDRESS.test(address)) {
      setResult("Enter or connect a valid EVM wallet address first.");
      return;
    }
    setBusy(true);
    setResult("Verifying RPC and reading the BNB balance…");
    try {
      const payload = await verifyRpc(rpcUrl, address);
      setRpcUrl(payload.rpcUrl);
      setRpcVerified(true);
      setResult(`RPC verified: ${payload.chainName} (chain ${payload.chainId})\nBalance: ${payload.balanceNative} BNB`);
    } catch (error) {
      setRpcVerified(false);
      setResult(`BNB RPC check failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setBusy(false);
    }
  }

  async function sendTransaction() {
    if (!window.ethereum) {
      setResult("A browser wallet is required for signing.");
      return;
    }
    if (!ADDRESS.test(address) || !ADDRESS.test(to)) {
      setResult("Enter valid sender and recipient addresses.");
      return;
    }
    if (data.trim() && !HEX_DATA.test(data.trim())) {
      setResult("Calldata must be an even-length hexadecimal value beginning with 0x.");
      return;
    }
    setBusy(true);
    setResult("Verifying the RPC and preparing the wallet review…");
    try {
      await ensureBnbNetwork();
      const hash = await window.ethereum.request({ method: "eth_sendTransaction", params: [{ from: address, to, value: `0x${toWei(value).toString(16)}`, ...(data.trim() ? { data: data.trim() } : {}) }] });
      setResult(`BNB transaction broadcast successfully.\nTransaction hash: ${String(hash)}\n\nThe wallet approved and signed this transaction; the app never receives your private key.`);
    } catch (error) {
      setResult(`Transaction not sent: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setBusy(false);
    }
  }

  return <section className="panel"><div className="panel-intro"><span className="eyebrow green">NON-CUSTODIAL BNB MAINNET WORKSPACE</span><h2>BNB transaction workspace</h2><p>Verify the RPC, connect an injected wallet on BNB Smart Chain, inspect the account, then review and approve each transaction in your wallet.</p></div><div className="scroll-area"><div className="web3-card"><div className="wallet-status"><span className={connected ? "status-dot" : "status-dot status-dot-muted"} />{connected ? `Connected · ${address.slice(0, 6)}…${address.slice(-4)}` : "Wallet not connected"}<button className="ghost-button" type="button" onClick={connect} disabled={busy}>{busy ? "Checking…" : connected ? "Reconnect BNB" : "Connect BNB wallet"}</button></div><label>BNB Smart Chain RPC endpoint<input value={rpcUrl} onChange={(event) => { setRpcUrl(event.target.value); setRpcVerified(false); }} inputMode="url" autoComplete="off" /></label><small className="security-note">{rpcVerified ? "RPC verified on BNB Smart Chain (chain ID 56)." : "The endpoint is verified before it is used for wallet network setup."}</small><label>Wallet address<input inputMode="text" placeholder="0x..." value={address} onChange={(event) => setAddress(event.target.value)} /></label><button className="composer-button green-button" type="button" onClick={inspect} disabled={busy}>{busy ? "Inspecting…" : "Verify RPC & inspect wallet"}</button><div className="transaction-box"><div><span className="eyebrow green">BNB TRANSACTION BUILDER</span><h3>Prepare a BNB transfer</h3></div><label>Recipient<input inputMode="text" placeholder="0x..." value={to} onChange={(event) => setTo(event.target.value)} /></label><label>BNB amount<input inputMode="decimal" value={value} onChange={(event) => setValue(event.target.value)} /></label><label>Optional calldata<input placeholder="0x" value={data} onChange={(event) => setData(event.target.value)} /></label><button className="composer-button green-button" type="button" onClick={sendTransaction} disabled={busy || !connected}>Review & sign BNB transaction</button><small className="security-note">The agent may prepare values, but it cannot bypass this user approval step or access signing keys.</small></div>{result && <pre className="web3-result" role="status">{result}</pre>}</div></div></section>;
}

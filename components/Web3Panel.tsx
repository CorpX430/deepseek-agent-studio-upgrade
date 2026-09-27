"use client";
import { useState } from "react";

type EthereumProvider = { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> };
declare global { interface Window { ethereum?: EthereumProvider } }
const ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const BNB_CHAIN_ID = "0x38";
const BNB_RPC = process.env.NEXT_PUBLIC_BNB_RPC_URL || "https://bsc-dataseed.binance.org";

function toWei(value: string) {
  if (!/^\d+(\.\d{0,18})?$/.test(value)) throw new Error("Enter a valid BNB amount with up to 18 decimals.");
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole || "0") * BigInt("1000000000000000000") + BigInt((fraction + "000000000000000000").slice(0, 18));
}

export default function Web3Panel() {
  const [rpcUrl, setRpcUrl] = useState(BNB_RPC); const [address, setAddress] = useState(""); const [to, setTo] = useState(""); const [value, setValue] = useState("0"); const [data, setData] = useState(""); const [result, setResult] = useState(""); const [busy, setBusy] = useState(false); const [connected, setConnected] = useState(false);
  async function ensureBnbNetwork() {
    if (!window.ethereum) throw new Error("Install or unlock a browser wallet such as MetaMask to continue.");
    try { await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: BNB_CHAIN_ID }] }); }
    catch (error) {
      const code = (error as { code?: number }).code;
      if (code !== 4902) throw error;
      await window.ethereum.request({ method: "wallet_addEthereumChain", params: [{ chainId: BNB_CHAIN_ID, chainName: "BNB Smart Chain", nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 }, rpcUrls: [rpcUrl], blockExplorerUrls: ["https://bscscan.com"] }] });
    }
  }
  async function connect() { try { await ensureBnbNetwork(); const accounts = await window.ethereum!.request({ method: "eth_requestAccounts" }) as string[]; setAddress(accounts[0] ?? ""); setConnected(Boolean(accounts[0])); setResult(accounts[0] ? `Connected ${accounts[0]} on BNB Smart Chain.` : "No wallet account was returned."); } catch (error) { setResult(`Wallet connection rejected: ${String(error)}`); } }
  async function inspect() { if (!ADDRESS.test(address)) { setResult("Connect a valid EVM wallet address first."); return; } setBusy(true); setResult(""); try { const response = await fetch("/api/web3", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rpcUrl, address }) }); const responseData = await response.json(); setResult(responseData.error ?? `Chain: ${responseData.chainName}\nBalance: ${responseData.balanceNative} BNB`); } catch { setResult("Unable to reach the BNB Smart Chain inspector."); } finally { setBusy(false); } }
  async function sendTransaction() { if (!window.ethereum) { setResult("A browser wallet is required for signing."); return; } if (!ADDRESS.test(address) || !ADDRESS.test(to)) { setResult("Enter valid sender and recipient addresses."); return; } setBusy(true); setResult("Review the BNB transaction in your wallet…"); try { await ensureBnbNetwork(); const hash = await window.ethereum.request({ method: "eth_sendTransaction", params: [{ from: address, to, value: `0x${toWei(value).toString(16)}`, ...(data.trim() ? { data: data.trim() } : {}) }] }); setResult(`BNB transaction broadcast successfully.\nTransaction hash: ${String(hash)}\n\nThe wallet approved and signed this transaction; the app never receives your private key.`); } catch (error) { setResult(`Transaction not sent: ${String(error)}`); } finally { setBusy(false); } }
  return <section className="panel"><div className="panel-intro"><span className="eyebrow green">NON-CUSTODIAL BNB MAINNET WORKSPACE</span><h2>BNB transaction workspace</h2><p>Connect an injected wallet on BNB Smart Chain, inspect the account, then review and approve each BNB transaction in your wallet. Private keys never leave the wallet.</p></div><div className="scroll-area"><div className="web3-card"><div className="wallet-status"><span className={connected ? "status-dot" : "status-dot status-dot-muted"} />{connected ? `Connected · ${address.slice(0, 6)}…${address.slice(-4)}` : "Wallet not connected"}<button className="ghost-button" onClick={connect}>{connected ? "Reconnect BNB" : "Connect BNB wallet"}</button></div><label>BNB Smart Chain RPC endpoint<input value={rpcUrl} onChange={(event) => setRpcUrl(event.target.value)} /></label><small className="security-note">Default RPC: BNB public dataseed. For a Cloudflare Web3 Gateway, set <code>NEXT_PUBLIC_BNB_RPC_URL</code> in Render to your authenticated gateway URL.</small><label>Wallet address<input inputMode="text" placeholder="0x..." value={address} onChange={(event) => setAddress(event.target.value)} /></label><button className="composer-button green-button" onClick={inspect} disabled={busy}>{busy ? "Inspecting..." : "Inspect BNB wallet"}</button><div className="transaction-box"><div><span className="eyebrow green">BNB TRANSACTION BUILDER</span><h3>Prepare a BNB transfer</h3></div><label>Recipient<input inputMode="text" placeholder="0x..." value={to} onChange={(event) => setTo(event.target.value)} /></label><label>BNB amount<input inputMode="decimal" value={value} onChange={(event) => setValue(event.target.value)} /></label><label>Optional calldata<input placeholder="0x" value={data} onChange={(event) => setData(event.target.value)} /></label><button className="composer-button green-button" onClick={sendTransaction} disabled={busy || !connected}>Review & sign BNB transaction</button><small className="security-note">The agent may prepare values, but it cannot bypass this user approval step or access signing keys.</small></div>{result && <pre className="web3-result">{result}</pre>}</div></div></section>;
}

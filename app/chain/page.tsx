"use client";

import { useState } from "react";
import { polygonscanLink, truncateAddr, formatNairaDisplay, formatUSDCDisplay } from "@/lib/web3";
import Link from "next/link";
import { WalletButton } from "@/components/web3/WalletButton";

const RECENT_REGISTRATIONS = [
  { tokenId: "3", willowId: "WIL-003", location: "GRA Phase 2, Port Harcourt", owner: "0xOwner123abc", time: "2 mins ago" },
  { tokenId: "2", willowId: "WIL-002", location: "Maitama, Abuja FCT",         owner: "0xOwner456def", time: "18 mins ago" },
  { tokenId: "1", willowId: "WIL-001", location: "Bourdillon Road, Ikoyi",     owner: "0xOwner789ghi", time: "1 hour ago" },
];

const RECENT_TRANSFERS = [
  { tokenId: "1", from: "0xSeller1", to: "0xBuyer1", price: 50_000_000_000n, time: "3 hours ago" },
];

const STATS = [
  { label: "Properties On-Chain", value: "47"        },
  { label: "Total Value Locked",  value: "$2.4M USDC" },
  { label: "Active Leases",       value: "23"         },
  { label: "USDC Transacted",     value: "$890K"      },
];

export default function ChainExplorerPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<null | "loading" | "found" | "not-found">(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchResult("loading");
    try {
      const res = await fetch(`/api/blockchain/property/${searchQuery.trim()}`);
      setSearchResult(res.ok ? "found" : "not-found");
    } catch {
      setSearchResult("not-found");
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-willow-400 font-bold text-lg">Willow</Link>
          <span className="text-white/30">/</span>
          <span className="text-polygon-light">On-Chain Registry</span>
        </div>
        <WalletButton />
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-r from-polygon-purple/20 to-willow-900/20 border-b border-white/10 px-6 py-10 text-center space-y-4">
        <div className="inline-block bg-polygon-purple/30 border border-polygon-purple/50 px-4 py-1 rounded-full text-sm">
          Powered by Polygon PoS
        </div>
        <h1 className="text-4xl font-bold">Willow On-Chain Registry</h1>
        <p className="text-white/60 max-w-xl mx-auto">
          All properties verified on Polygon. Trustless source of truth — verify any property&apos;s
          ownership, history, and documents without relying on Willow&apos;s servers.
        </p>

        {/* Search */}
        <form onSubmit={handleSearch} className="max-w-lg mx-auto flex gap-2">
          <input
            type="text"
            placeholder="Search by Willow ID (WIL-001) or NFT Token ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-polygon-purple"
          />
          <button type="submit"
            className="bg-polygon-purple hover:bg-polygon-light px-6 py-3 rounded-xl font-semibold transition-colors">
            Search
          </button>
        </form>
        {searchResult === "loading" && <p className="text-white/50 text-sm">Querying blockchain...</p>}
        {searchResult === "not-found" && <p className="text-red-400 text-sm">Property not found on-chain.</p>}
        {searchResult === "found" && (
          <p className="text-willow-400 text-sm">
            Property found! <Link href={`/api/blockchain/property/${searchQuery}`} className="underline">View on-chain data →</Link>
          </p>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-willow-400">{s.value}</div>
              <div className="text-white/50 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Registrations */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">Recent Registrations</h2>
              <span className="flex items-center gap-1 text-willow-400 text-xs">
                <span className="w-2 h-2 rounded-full bg-willow-400 animate-pulse" />
                Live
              </span>
            </div>
            {RECENT_REGISTRATIONS.map((reg) => (
              <div key={reg.tokenId} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0">
                <div className="space-y-0.5">
                  <div className="font-medium text-sm">{reg.willowId} — NFT #{reg.tokenId}</div>
                  <div className="text-white/50 text-xs">📍 {reg.location}</div>
                  <div className="text-white/40 text-xs font-mono">{truncateAddr(reg.owner)}</div>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-xs text-white/40">{reg.time}</div>
                  <a href={polygonscanLink("token", process.env.NEXT_PUBLIC_PROPERTY_REGISTRY_ADDRESS || "0x0")}
                    target="_blank" rel="noopener noreferrer"
                    className="text-polygon-light text-xs hover:underline">↗</a>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Transfers */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-lg">Recent Ownership Transfers</h2>
            {RECENT_TRANSFERS.length > 0 ? RECENT_TRANSFERS.map((t) => (
              <div key={t.tokenId} className="border-b border-white/5 pb-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">NFT #{t.tokenId}</div>
                  <div className="text-white/40 text-xs">{t.time}</div>
                </div>
                <div className="text-xs text-white/60 space-y-1">
                  <div>From: <span className="font-mono">{truncateAddr(t.from)}</span></div>
                  <div>To: <span className="font-mono text-willow-400">{truncateAddr(t.to)}</span></div>
                  <div>Sale Price: <span className="text-green-400">{formatNairaDisplay(t.price)}</span></div>
                </div>
              </div>
            )) : (
              <p className="text-white/40 text-sm">No transfers yet.</p>
            )}
          </div>
        </div>

        {/* Network info */}
        <div className="bg-polygon-purple/10 border border-polygon-purple/30 rounded-2xl p-6 flex flex-wrap gap-6 items-center justify-between">
          <div className="space-y-1">
            <div className="text-polygon-light font-bold">Network: Polygon {process.env.NEXT_PUBLIC_CHAIN_ID === "137" ? "Mainnet" : "Mumbai Testnet"}</div>
            <div className="text-white/50 text-sm">ChainID: {process.env.NEXT_PUBLIC_CHAIN_ID || "80001"} · 2s block finality · ~$0.001 gas</div>
          </div>
          <div className="flex gap-3">
            <a href={polygonscanLink("address", process.env.NEXT_PUBLIC_PROPERTY_REGISTRY_ADDRESS || "0x0")}
              target="_blank" rel="noopener noreferrer"
              className="bg-polygon-purple/30 hover:bg-polygon-purple/50 text-polygon-light px-4 py-2 rounded-xl text-sm transition-colors">
              Property NFT Contract ↗
            </a>
            <a href={polygonscanLink("address", process.env.NEXT_PUBLIC_BOOKING_ESCROW_ADDRESS || "0x0")}
              target="_blank" rel="noopener noreferrer"
              className="bg-polygon-purple/30 hover:bg-polygon-purple/50 text-polygon-light px-4 py-2 rounded-xl text-sm transition-colors">
              Escrow Contract ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

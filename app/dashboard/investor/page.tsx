"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { WalletButton } from "@/components/web3/WalletButton";
import { WalletGate } from "@/components/web3/WalletGate";
import { formatUSDCDisplay, formatNairaDisplay, polygonscanLink, truncateAddr } from "@/lib/web3";
import Link from "next/link";

const MOCK_HOLDINGS = [
  { property: "Panorama Heights Penthouse", symbol: "PHT", shares: 120_000n, totalShares: 1_000_000n,
    yieldOwed: 45_000_000n, contractAddr: "0xFractional1", usdcValue: 24_000_000n },
  { property: "Maitama Executive Suite",   symbol: "MET", shares: 250_000n, totalShares: 1_000_000n,
    yieldOwed: 82_500_000n, contractAddr: "0xFractional2", usdcValue: 50_000_000n },
];

const MOCK_POOLS = [
  { name: "Willow Lagos Growth Pool", raised: 350_000_000_000n, target: 500_000_000_000n,
    myTokens: 5_000_000_000n, status: "OPEN", addr: "0xPool1" },
];

export default function InvestorDashboard() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<"holdings" | "pools">("holdings");

  const totalYield = MOCK_HOLDINGS.reduce((s, h) => s + h.yieldOwed, 0n);
  const totalValue = MOCK_HOLDINGS.reduce((s, h) => s + h.usdcValue, 0n);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-willow-400 font-bold text-lg">Willow</Link>
          <span className="text-white/30">/</span>
          <span className="text-white/70">Investor Dashboard</span>
        </div>
        <WalletButton />
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Portfolio Value (USDC)", value: formatUSDCDisplay(totalValue), icon: "💎" },
            { label: "Claimable Yield",        value: formatUSDCDisplay(totalYield), icon: "💸" },
            { label: "Properties Held",        value: String(MOCK_HOLDINGS.length), icon: "🏠" },
            { label: "Pool Investments",        value: String(MOCK_POOLS.length),    icon: "🏦" },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-white/50 text-sm">{s.label}</div>
            </div>
          ))}
        </div>

        {totalYield > 0n && (
          <div className="bg-willow-900/50 border border-willow-700 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="font-bold text-willow-400">Claimable Yield Available</div>
              <div className="text-2xl font-bold">{formatUSDCDisplay(totalYield)} USDC</div>
            </div>
            <WalletGate reason="Connect wallet to claim USDC yield from your property shares.">
              <button className="bg-willow-600 hover:bg-willow-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                Claim All Yield →
              </button>
            </WalletGate>
          </div>
        )}

        <div className="flex gap-2 border-b border-white/10">
          {[
            { key: "holdings", label: "🪙 Fractional Portfolio" },
            { key: "pools",    label: "🏦 Investment Pools" },
          ].map((tab) => (
            <button key={tab.key}
              onClick={() => setActiveTab(tab.key as "holdings" | "pools")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key ? "border-willow-400 text-willow-400" : "border-transparent text-white/50 hover:text-white"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "holdings" && (
          <div className="space-y-4">
            {MOCK_HOLDINGS.map((h) => {
              const pct = Number(h.shares * 10000n / h.totalShares) / 100;
              return (
                <div key={h.contractAddr} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">{h.property}</h3>
                      <div className="text-white/50 text-sm font-mono">{h.symbol}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-willow-400 font-bold">{pct.toFixed(2)}% ownership</div>
                      <div className="text-white/50 text-xs">{h.shares.toLocaleString()} / {h.totalShares.toLocaleString()} shares</div>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl h-2 overflow-hidden">
                    <div className="bg-willow-500 h-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-sm text-white/60">Current Value</div>
                      <div className="font-bold text-green-400">{formatUSDCDisplay(h.usdcValue)}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-white/60">Claimable Yield</div>
                      <div className="font-bold text-yellow-400">{formatUSDCDisplay(h.yieldOwed)}</div>
                    </div>
                    <div className="flex gap-2">
                      <a href={polygonscanLink("address", h.contractAddr)} target="_blank" rel="noopener noreferrer"
                        className="bg-polygon-purple/20 text-polygon-light px-3 py-1 rounded-lg text-xs hover:bg-polygon-purple/30 transition-colors">
                        Polygonscan ↗
                      </a>
                      <WalletGate reason="Connect wallet to claim USDC yield.">
                        <button className="bg-willow-700 hover:bg-willow-600 text-white px-3 py-1 rounded-lg text-xs transition-colors">
                          Claim Yield
                        </button>
                      </WalletGate>
                    </div>
                  </div>
                </div>
              );
            })}
            <Link href="/invest/pools"
              className="block text-center bg-polygon-purple/20 hover:bg-polygon-purple/30 border border-polygon-purple/40 text-polygon-light py-4 rounded-2xl transition-colors">
              Browse Investment Pools →
            </Link>
          </div>
        )}

        {activeTab === "pools" && (
          <div className="space-y-4">
            {MOCK_POOLS.map((pool) => {
              const pct = Number(pool.raised * 100n / pool.target);
              return (
                <div key={pool.addr} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold">{pool.name}</h3>
                    <span className="bg-green-900/30 text-green-400 px-3 py-1 rounded-full text-sm">{pool.status}</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-white/60 mb-1">
                      <span>{formatUSDCDisplay(pool.raised)} raised</span>
                      <span>Target: {formatUSDCDisplay(pool.target)}</span>
                    </div>
                    <div className="bg-white/10 rounded-full h-2">
                      <div className="bg-willow-500 h-full rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                    <div className="text-right text-xs text-white/40 mt-1">{pct}%</div>
                  </div>
                  {pool.myTokens > 0n && (
                    <div className="bg-willow-900/30 rounded-xl p-3 text-sm">
                      My investment: <span className="text-willow-400 font-bold">{formatUSDCDisplay(pool.myTokens)}</span>
                    </div>
                  )}
                  <Link href="/invest/pools"
                    className="block text-center bg-willow-700 hover:bg-willow-600 text-white py-2 rounded-xl text-sm transition-colors">
                    View Pool Details →
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

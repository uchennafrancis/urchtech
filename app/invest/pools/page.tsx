"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { WalletButton } from "@/components/web3/WalletButton";
import { WalletGate } from "@/components/web3/WalletGate";
import { formatUSDCDisplay, polygonscanLink } from "@/lib/web3";
import Link from "next/link";

const MOCK_POOLS = [
  {
    addr:        "0xPool001",
    name:        "Willow Lagos Growth Pool",
    description: "Diversified fund targeting high-yield residential properties across Lagos Island and Mainland.",
    raised:      350_000_000_000n,
    target:      500_000_000_000n,
    investors:   42n,
    minInvest:   100_000_000n,
    projYield:   "12-18% APY",
    status:      "OPEN",
    properties:  ["Panorama Heights", "Victoria Crown Tower"],
  },
  {
    addr:        "0xPool002",
    name:        "Abuja Prime Portfolio",
    description: "Premium commercial and residential properties in Maitama and Asokoro districts.",
    raised:      180_000_000_000n,
    target:      300_000_000_000n,
    investors:   28n,
    minInvest:   250_000_000n,
    projYield:   "10-15% APY",
    status:      "OPEN",
    properties:  ["Maitama Executive Suite", "Asokoro Heights"],
  },
];

export default function InvestmentPoolsPage() {
  const { isConnected } = useAccount();
  const [selectedPool, setSelectedPool] = useState<string | null>(null);
  const [amount, setAmount]             = useState("");

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-willow-400 font-bold text-lg">Willow</Link>
          <span className="text-white/30">/</span>
          <span className="text-white/70">Investment Pools</span>
        </div>
        <WalletButton />
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Investment Pools</h1>
          <p className="text-white/60">Pool your USDC with other investors and earn proportional yield from curated African real estate portfolios.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {MOCK_POOLS.map((pool) => {
            const pct = Number(pool.raised * 100n / pool.target);
            return (
              <div key={pool.addr}
                className={`bg-white/5 border rounded-2xl p-6 space-y-4 transition-all cursor-pointer ${
                  selectedPool === pool.addr ? "border-willow-500 bg-willow-900/20" : "border-white/10 hover:border-white/20"
                }`}
                onClick={() => setSelectedPool(pool.addr === selectedPool ? null : pool.addr)}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{pool.name}</h3>
                    <p className="text-white/60 text-sm mt-1">{pool.description}</p>
                  </div>
                  <span className="bg-green-900/30 text-green-400 border border-green-800 px-2 py-1 rounded-full text-xs flex-shrink-0">
                    {pool.status}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-sm text-white/60 mb-2">
                    <span>{formatUSDCDisplay(pool.raised)} raised</span>
                    <span>Target: {formatUSDCDisplay(pool.target)}</span>
                  </div>
                  <div className="bg-white/10 rounded-full h-3 overflow-hidden">
                    <div className="bg-gradient-to-r from-willow-600 to-willow-400 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-white/40 mt-1">
                    <span>{pct}% funded</span>
                    <span>{pool.investors.toString()} investors</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  {[
                    { label: "Min. Investment", value: formatUSDCDisplay(pool.minInvest) },
                    { label: "Proj. Yield",     value: pool.projYield },
                    { label: "Properties",      value: String(pool.properties.length) },
                  ].map((s) => (
                    <div key={s.label} className="bg-white/5 rounded-xl p-2">
                      <div className="font-bold text-willow-400">{s.value}</div>
                      <div className="text-white/50 text-xs">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1">
                  {pool.properties.map((prop) => (
                    <span key={prop} className="bg-white/10 px-2 py-1 rounded text-xs text-white/70">{prop}</span>
                  ))}
                </div>

                <a href={polygonscanLink("address", pool.addr)} target="_blank" rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-polygon-light text-xs hover:underline">
                  View Pool Contract ↗
                </a>

                {selectedPool === pool.addr && (
                  <WalletGate reason="Connect your wallet to invest in this pool with USDC.">
                    <div className="space-y-3 border-t border-white/10 pt-4" onClick={(e) => e.stopPropagation()}>
                      <label className="block text-sm text-white/70">Investment Amount (USDC)</label>
                      <input
                        type="number"
                        placeholder={`Min. ${formatUSDCDisplay(pool.minInvest)}`}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-willow-500"
                      />
                      <button className="w-full bg-willow-600 hover:bg-willow-500 text-white py-3 rounded-xl font-semibold transition-colors">
                        Approve USDC & Invest →
                      </button>
                    </div>
                  </WalletGate>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

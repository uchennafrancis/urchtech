"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { WalletButton } from "@/components/web3/WalletButton";
import { formatNairaDisplay, formatUSDCDisplay, polygonscanLink, truncateAddr } from "@/lib/web3";
import Link from "next/link";

const MOCK_PROJECTS = [
  {
    id: "proj-1", name: "Skyline Residences Phase 1", location: "Lekki Phase 1, Lagos",
    units: 24, unitsSold: 18, unitsOnChain: 12,
    totalValueNaira: 2_400_000_000_000n, usdcReceivedOnChain: 800_000_000_000n,
    nftTokenId: "5", fractionalAddr: "0xFractionalSkyline",
  },
];

const MOCK_SALES = [
  { unit: "Unit 4A", buyer: "0xBuyerABC123def456", priceNaira: 85_000_000_000n, txHash: "0xTx001", date: "2024-03-15" },
  { unit: "Unit 7B", buyer: "0xBuyerXYZ789uvw012", priceNaira: 92_000_000_000n, txHash: "0xTx002", date: "2024-04-01" },
];

export default function DeveloperDashboard() {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<"projects" | "sales" | "tokenise">("projects");

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-willow-400 font-bold text-lg">Willow</Link>
          <span className="text-white/30">/</span>
          <span className="text-white/70">Developer Dashboard</span>
        </div>
        <WalletButton />
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Projects",        value: "1",   icon: "🏗️" },
            { label: "Units Sold",             value: "18",  icon: "✅" },
            { label: "On-Chain Transactions",  value: "12",  icon: "🔗" },
            { label: "USDC Received On-Chain", value: "$800K", icon: "💰" },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-white/50 text-sm">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 border-b border-white/10">
          {[
            { key: "projects",  label: "My Projects" },
            { key: "sales",     label: "On-Chain Sales" },
            { key: "tokenise",  label: "🪙 Tokenise Project" },
          ].map((tab) => (
            <button key={tab.key}
              onClick={() => setActiveTab(tab.key as "projects" | "sales" | "tokenise")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key ? "border-willow-400 text-willow-400" : "border-transparent text-white/50 hover:text-white"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "projects" && (
          <div className="space-y-6">
            {MOCK_PROJECTS.map((p) => (
              <div key={p.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{p.name}</h3>
                    <p className="text-white/60 text-sm mt-1">📍 {p.location}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="bg-polygon-purple/30 text-polygon-light px-2 py-1 rounded text-xs font-mono">NFT #{p.nftTokenId}</span>
                    <a href={polygonscanLink("address", p.fractionalAddr)} target="_blank" rel="noopener noreferrer"
                      className="bg-polygon-purple/20 text-polygon-light px-2 py-1 rounded text-xs hover:bg-polygon-purple/30">
                      Tokens ↗
                    </a>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold">{p.unitsSold}/{p.units}</div>
                    <div className="text-white/50 text-sm">Units Sold</div>
                    <div className="bg-white/10 rounded-full h-2 mt-2">
                      <div className="bg-willow-500 h-full rounded-full" style={{ width: `${(p.unitsSold / p.units) * 100}%` }} />
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold">{formatNairaDisplay(p.totalValueNaira)}</div>
                    <div className="text-white/50 text-sm">Total Project Value</div>
                  </div>
                  <div className="bg-green-900/20 border border-green-800 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-green-400">{formatUSDCDisplay(p.usdcReceivedOnChain)}</div>
                    <div className="text-green-600 text-sm">USDC On-Chain Revenue</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "sales" && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Confirmed On-Chain Sales</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-white/50 border-b border-white/10">
                    <th className="text-left py-3 px-4">Unit</th>
                    <th className="text-left py-3 px-4">Buyer Wallet</th>
                    <th className="text-left py-3 px-4">Price</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Tx</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_SALES.map((s) => (
                    <tr key={s.txHash} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4 font-medium">{s.unit}</td>
                      <td className="py-3 px-4 font-mono text-white/60">{truncateAddr(s.buyer)}</td>
                      <td className="py-3 px-4 text-willow-400">{formatNairaDisplay(s.priceNaira)}</td>
                      <td className="py-3 px-4 text-white/60">{s.date}</td>
                      <td className="py-3 px-4">
                        <a href={polygonscanLink("tx", s.txHash)} target="_blank" rel="noopener noreferrer"
                          className="text-polygon-light hover:underline text-xs">{truncateAddr(s.txHash)} ↗</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "tokenise" && (
          <div className="max-w-lg space-y-6">
            <div>
              <h3 className="text-xl font-bold">Tokenise a Project</h3>
              <p className="text-white/60 text-sm mt-1">
                Create fractional ERC-20 tokens for your project, enabling crowd-investment before completion.
              </p>
            </div>
            {!isConnected ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center space-y-3">
                <p className="text-white/60">Connect your wallet to tokenise a project</p>
                <WalletButton />
              </div>
            ) : (
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                {[
                  { label: "Property NFT Token ID", id: "tokenId",    type: "number", placeholder: "1" },
                  { label: "Total Shares",          id: "shares",     type: "number", placeholder: "1000000" },
                  { label: "Token Name",            id: "tokenName",  type: "text",   placeholder: "Skyline Residences Token" },
                  { label: "Token Symbol",          id: "tokenSym",   type: "text",   placeholder: "SRT" },
                ].map((f) => (
                  <div key={f.id} className="space-y-1">
                    <label className="text-sm text-white/70">{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder}
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-willow-500" />
                  </div>
                ))}
                <button type="submit"
                  className="w-full bg-polygon-purple hover:bg-polygon-light text-white py-3 rounded-xl font-semibold transition-colors">
                  Deploy Fractional Token Contract
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

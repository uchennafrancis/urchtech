"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { WalletButton } from "@/components/web3/WalletButton";
import { polygonscanLink, truncateAddr, formatNairaDisplay, formatUSDCDisplay } from "@/lib/web3";
import Link from "next/link";

const MOCK_PROPERTIES = [
  { id: "1", title: "Panorama Heights Penthouse", location: "Ikoyi, Lagos", nftTokenId: "1",
    valuationNaira: 50_000_000_000n, uosScore: 87, isVerified: true,
    leaseAddr: "0xLeaseContract1", monthlyRentUSDC: 50_000_000n, leaseStatus: "ACTIVE" },
  { id: "2", title: "Maitama Executive Suite", location: "Abuja FCT", nftTokenId: "2",
    valuationNaira: 35_000_000_000n, uosScore: 72, isVerified: true,
    leaseAddr: null, monthlyRentUSDC: 0n, leaseStatus: "VACANT" },
];

const LEASE_STATUS_MAP: Record<string, string> = { ACTIVE: "0", PENDING: "1", EXPIRED: "2", TERMINATED: "3", VACANT: "" };

export default function LandlordDashboard() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<"properties" | "blockchain">("properties");

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top bar */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-willow-400 font-bold text-lg">Willow</Link>
          <span className="text-white/30">/</span>
          <span className="text-white/70">Landlord Dashboard</span>
        </div>
        <WalletButton />
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Properties Owned",   value: "2",      icon: "🏠" },
            { label: "NFTs Minted",        value: "2",      icon: "🔗" },
            { label: "Active Leases",      value: "1",      icon: "📄" },
            { label: "Monthly USDC Income",value: "$500",   icon: "💰" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-white/50 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10">
          {[
            { key: "properties", label: "My Properties" },
            { key: "blockchain", label: "🔗 Blockchain Hub" },
          ].map((tab) => (
            <button key={tab.key}
              onClick={() => setActiveTab(tab.key as "properties" | "blockchain")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-willow-400 text-willow-400"
                  : "border-transparent text-white/50 hover:text-white"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Properties Tab */}
        {activeTab === "properties" && (
          <div className="space-y-4">
            {MOCK_PROPERTIES.map((p) => (
              <div key={p.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-48 h-32 bg-willow-800/50 rounded-xl flex items-center justify-center text-4xl flex-shrink-0">
                  🏠
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold">{p.title}</h3>
                    {p.isVerified && (
                      <span className="bg-willow-600/30 text-willow-400 border border-willow-600 px-2 py-0.5 rounded-full text-xs">
                        ✓ Urchmond Verified
                      </span>
                    )}
                    <span className="bg-polygon-purple/30 text-polygon-light border border-polygon-purple/50 px-2 py-0.5 rounded-full text-xs font-mono">
                      NFT #{p.nftTokenId}
                    </span>
                  </div>
                  <p className="text-white/60 text-sm">📍 {p.location}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span>Valuation: <span className="text-willow-400 font-semibold">{formatNairaDisplay(p.valuationNaira)}</span></span>
                    <span>UOS Score: <span className="font-semibold">{p.uosScore}/100</span></span>
                    {p.monthlyRentUSDC > 0n && (
                      <span>Rent: <span className="text-green-400 font-semibold">{formatUSDCDisplay(p.monthlyRentUSDC)}/mo</span></span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a href={polygonscanLink("token", process.env.NEXT_PUBLIC_PROPERTY_REGISTRY_ADDRESS || "0x0")}
                      target="_blank" rel="noopener noreferrer"
                      className="bg-polygon-purple/20 hover:bg-polygon-purple/30 text-polygon-light px-3 py-1 rounded-lg text-xs transition-colors">
                      View on Polygonscan ↗
                    </a>
                    {p.leaseAddr && (
                      <Link href={`/lease/${p.leaseAddr}`}
                        className="bg-willow-700/30 hover:bg-willow-700/50 text-willow-400 px-3 py-1 rounded-lg text-xs transition-colors">
                        View Lease →
                      </Link>
                    )}
                    <span className={`px-3 py-1 rounded-lg text-xs ${
                      p.leaseStatus === "ACTIVE" ? "bg-green-900/30 text-green-400" : "bg-yellow-900/30 text-yellow-400"
                    }`}>
                      {p.leaseStatus}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {isConnected && (
              <button className="w-full border-2 border-dashed border-willow-700 hover:border-willow-500 rounded-2xl p-6 text-willow-500 hover:text-willow-400 transition-colors text-center">
                + Mint New Property NFT
              </button>
            )}
          </div>
        )}

        {/* Blockchain Hub Tab */}
        {activeTab === "blockchain" && (
          <div className="space-y-6">
            {!isConnected ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center space-y-3">
                <div className="text-4xl">🔗</div>
                <p className="text-white/60">Connect your wallet to access blockchain features</p>
                <WalletButton />
              </div>
            ) : (
              <>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                  <h3 className="font-bold text-willow-400">Connected Wallet</h3>
                  <div className="font-mono text-sm text-white/70">{address}</div>
                  <a href={polygonscanLink("address", address || "")} target="_blank" rel="noopener noreferrer"
                    className="text-polygon-light text-sm hover:underline">
                    View on Polygonscan ↗
                  </a>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                    <h3 className="font-bold">On-Chain Properties</h3>
                    {MOCK_PROPERTIES.map((p) => (
                      <div key={p.id} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                        <div>
                          <div className="font-medium text-sm">{p.title}</div>
                          <div className="text-white/50 text-xs font-mono">NFT #{p.nftTokenId}</div>
                        </div>
                        <a href={polygonscanLink("token", process.env.NEXT_PUBLIC_PROPERTY_REGISTRY_ADDRESS || "0x0")}
                          target="_blank" rel="noopener noreferrer"
                          className="text-polygon-light text-xs hover:underline">↗</a>
                      </div>
                    ))}
                    <button className="w-full bg-willow-700 hover:bg-willow-600 text-white py-2 rounded-xl text-sm transition-colors">
                      Mint New Property
                    </button>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                    <h3 className="font-bold">Active Leases</h3>
                    <div className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                      <div>
                        <div className="font-medium text-sm">Panorama Heights — Lease</div>
                        <div className="text-white/50 text-xs font-mono">{truncateAddr("0xLeaseContract1example")}</div>
                      </div>
                      <span className="bg-green-900/30 text-green-400 px-2 py-0.5 rounded text-xs">ACTIVE</span>
                    </div>
                    <button className="w-full bg-polygon-purple/30 hover:bg-polygon-purple/50 text-polygon-light py-2 rounded-xl text-sm transition-colors">
                      Deploy New Lease
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

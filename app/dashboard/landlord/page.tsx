"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { WalletButton } from "@/components/web3/WalletButton";
import { polygonscanLink, truncateAddr, formatNairaDisplay, formatUSDCDisplay } from "@/lib/web3";
import Link from "next/link";

interface Lease {
  id: string;
  status: string;
  contractAddress: string | null;
  monthlyRentUSDC: string;
  durationMonths: number;
  tenant: { name: string; email: string } | null;
}

interface Property {
  id: string;
  title: string;
  location: string;
  nftTokenId: string | null;
  currentValue: string | null;
  price: string;
  uosScore: number | null;
  fractionalAddr: string | null;
  leases: Lease[];
}

export default function LandlordDashboard() {
  const { data: session, status } = useSession();
  const { address, isConnected } = useAccount();
  const router = useRouter();

  const [activeTab, setActiveTab]     = useState<"properties" | "blockchain">("properties");
  const [properties, setProperties]   = useState<Property[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/properties")
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(setProperties)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, [status]);

  const totalNFTs       = properties.filter(p => p.nftTokenId).length;
  const activeLeases    = properties.flatMap(p => p.leases).filter(l => l.status === "ACTIVE");
  const monthlyIncome   = activeLeases.reduce((s, l) => s + BigInt(l.monthlyRentUSDC ?? 0), 0n);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#060C07] flex items-center justify-center">
        <div className="text-[#C9A84C] font-playfair text-xl animate-pulse">Loading dashboard…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060C07] text-[#EDE9E1]">
      <header className="border-b border-[rgba(201,168,76,0.12)] px-6 py-4 flex items-center justify-between bg-[#0C1410]">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-playfair text-[#C9A84C] font-bold text-lg tracking-widest">WILLOW</Link>
          <span className="text-[#7A9175]">/</span>
          <span className="text-[#7A9175] text-sm">Landlord Dashboard</span>
        </div>
        <WalletButton />
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Greeting */}
        <div>
          <h1 className="font-playfair text-3xl text-[#EDE9E1]">
            Welcome back, {session?.user?.name?.split(" ")[0] ?? "Landlord"}
          </h1>
          <p className="text-[#7A9175] text-sm mt-1">Here's your portfolio at a glance.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Properties",      value: String(properties.length), icon: "🏠" },
            { label: "NFTs Minted",     value: String(totalNFTs),         icon: "🔗" },
            { label: "Active Leases",   value: String(activeLeases.length), icon: "📄" },
            { label: "Monthly Income",  value: formatUSDCDisplay(monthlyIncome), icon: "💰" },
          ].map(s => (
            <div key={s.label} className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-5">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="font-playfair text-3xl text-[#C9A84C] font-bold">{s.value}</div>
              <div className="text-[#7A9175] text-xs mt-1 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[rgba(201,168,76,0.12)]">
          {[
            { key: "properties", label: "My Properties" },
            { key: "blockchain", label: "🔗 Blockchain Hub" },
          ].map(tab => (
            <button key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-[#C9A84C] text-[#C9A84C]"
                  : "border-transparent text-[#7A9175] hover:text-[#EDE9E1]"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Properties Tab */}
        {activeTab === "properties" && (
          <div className="space-y-4">
            {error && (
              <div className="bg-[rgba(224,82,82,0.1)] border border-[rgba(224,82,82,0.3)] rounded-xl p-4 text-[#E05252] text-sm">
                Failed to load properties: {error}
              </div>
            )}

            {!loading && !error && properties.length === 0 && (
              <div className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-12 text-center space-y-3">
                <div className="text-4xl">🏠</div>
                <p className="text-[#7A9175]">No properties yet. Add your first property to get started.</p>
                <Link href="/market" className="inline-block bg-[#C9A84C] text-[#060C07] px-6 py-2 rounded-lg font-bold text-sm">
                  Browse Market
                </Link>
              </div>
            )}

            {properties.map(p => {
              const activeL = p.leases.find(l => l.status === "ACTIVE");
              const pendingL = p.leases.find(l => l.status === "PENDING");
              const currentLease = activeL ?? pendingL;

              return (
                <div key={p.id} className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] hover:border-[rgba(201,168,76,0.25)] rounded-xl p-6 flex flex-col md:flex-row gap-6 transition-all">
                  <div className="w-full md:w-40 h-28 bg-[#0C1410] rounded-xl flex items-center justify-center text-4xl flex-shrink-0">🏠</div>
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-playfair text-lg text-[#EDE9E1]">{p.title}</h3>
                      {p.nftTokenId && (
                        <span className="bg-[rgba(130,71,229,0.15)] text-[#a970ff] border border-[rgba(130,71,229,0.3)] px-2 py-0.5 rounded-full text-xs font-mono">
                          NFT #{p.nftTokenId}
                        </span>
                      )}
                    </div>
                    <p className="text-[#7A9175] text-sm">📍 {p.location}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      {p.currentValue && (
                        <span>Value: <span className="text-[#C9A84C] font-semibold">{formatNairaDisplay(BigInt(p.currentValue))}</span></span>
                      )}
                      {p.uosScore != null && (
                        <span>UOS: <span className="font-semibold">{p.uosScore}/100</span></span>
                      )}
                      {currentLease && (
                        <span>Rent: <span className="text-[#3DBA78] font-semibold">{formatUSDCDisplay(BigInt(currentLease.monthlyRentUSDC))}/mo</span></span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentLease?.contractAddress && (
                        <Link href={`/lease/${currentLease.contractAddress}`}
                          className="bg-[rgba(201,168,76,0.1)] hover:bg-[rgba(201,168,76,0.2)] text-[#C9A84C] px-3 py-1 rounded-lg text-xs transition-colors">
                          View Lease →
                        </Link>
                      )}
                      <span className={`px-3 py-1 rounded-lg text-xs ${
                        activeL    ? "bg-[rgba(61,186,120,0.1)] text-[#3DBA78]"  :
                        pendingL   ? "bg-[rgba(251,191,36,0.1)] text-[#fbbf24]" :
                                     "bg-[rgba(122,145,117,0.1)] text-[#7A9175]"
                      }`}>
                        {activeL ? "ACTIVE LEASE" : pendingL ? "LEASE PENDING" : "VACANT"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {isConnected && (
              <button className="w-full border-2 border-dashed border-[rgba(201,168,76,0.2)] hover:border-[rgba(201,168,76,0.4)] rounded-xl p-6 text-[#7A9175] hover:text-[#C9A84C] transition-colors text-center text-sm">
                + Mint New Property NFT
              </button>
            )}
          </div>
        )}

        {/* Blockchain Hub Tab */}
        {activeTab === "blockchain" && (
          <div className="space-y-6">
            {!isConnected ? (
              <div className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-10 text-center space-y-4">
                <div className="text-4xl">🔗</div>
                <p className="text-[#7A9175]">Connect your wallet to access blockchain features</p>
                <WalletButton />
              </div>
            ) : (
              <>
                <div className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-5 space-y-2">
                  <div className="text-[#7A9175] text-xs uppercase tracking-wider">Connected Wallet</div>
                  <div className="font-mono text-[#EDE9E1] text-sm">{address}</div>
                  <a href={polygonscanLink("address", address ?? "")} target="_blank" rel="noopener noreferrer"
                    className="text-[#a970ff] text-xs hover:underline">View on Polygonscan ↗</a>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-5 space-y-3">
                    <h3 className="text-[#EDE9E1] font-medium">On-Chain Properties</h3>
                    {properties.filter(p => p.nftTokenId).length === 0 ? (
                      <p className="text-[#7A9175] text-sm">No NFTs minted yet.</p>
                    ) : (
                      properties.filter(p => p.nftTokenId).map(p => (
                        <div key={p.id} className="flex items-center justify-between bg-[#0C1410] rounded-lg p-3">
                          <div>
                            <div className="text-sm text-[#EDE9E1] font-medium">{p.title}</div>
                            <div className="text-[#7A9175] text-xs font-mono">NFT #{p.nftTokenId}</div>
                          </div>
                          <a href={polygonscanLink("token", process.env.NEXT_PUBLIC_PROPERTY_REGISTRY_ADDRESS ?? "0x0")}
                            target="_blank" rel="noopener noreferrer"
                            className="text-[#a970ff] text-xs hover:underline">↗</a>
                        </div>
                      ))
                    )}
                    <button className="w-full bg-[rgba(201,168,76,0.1)] hover:bg-[rgba(201,168,76,0.2)] text-[#C9A84C] py-2 rounded-lg text-sm transition-colors">
                      Mint New Property
                    </button>
                  </div>

                  <div className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-5 space-y-3">
                    <h3 className="text-[#EDE9E1] font-medium">Active Leases</h3>
                    {activeLeases.length === 0 ? (
                      <p className="text-[#7A9175] text-sm">No active on-chain leases.</p>
                    ) : (
                      activeLeases.map(l => (
                        <div key={l.id} className="flex items-center justify-between bg-[#0C1410] rounded-lg p-3">
                          <div>
                            <div className="text-sm text-[#EDE9E1]">{l.tenant?.name ?? "Tenant"}</div>
                            <div className="text-[#7A9175] text-xs font-mono">{truncateAddr(l.contractAddress ?? "0x0000")}</div>
                          </div>
                          <span className="bg-[rgba(61,186,120,0.1)] text-[#3DBA78] text-xs px-2 py-0.5 rounded">ACTIVE</span>
                        </div>
                      ))
                    )}
                    <button className="w-full bg-[rgba(130,71,229,0.15)] hover:bg-[rgba(130,71,229,0.25)] text-[#a970ff] py-2 rounded-lg text-sm transition-colors">
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

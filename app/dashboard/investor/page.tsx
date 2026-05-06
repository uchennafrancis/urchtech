"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { WalletButton } from "@/components/web3/WalletButton";
import { WalletGate } from "@/components/web3/WalletGate";
import { formatUSDCDisplay, polygonscanLink, truncateAddr } from "@/lib/web3";
import Link from "next/link";

interface Investment {
  id: string;
  poolAddress: string | null;
  propertyId: string | null;
  usdcAmount: string | null;
  poolTokens: string | null;
  txHash: string | null;
  createdAt: string;
}

export default function InvestorDashboard() {
  const { data: session, status } = useSession();
  const { isConnected }           = useAccount();
  const router = useRouter();

  const [activeTab, setActiveTab]     = useState<"holdings" | "pools">("holdings");
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/investments")
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(setInvestments)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, [status]);

  const poolInvestments = investments.filter(i => i.poolAddress);
  const directHoldings  = investments.filter(i => i.propertyId && !i.poolAddress);
  const totalDeployed   = investments.reduce((s, i) => s + BigInt(i.usdcAmount ?? 0), 0n);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#060C07] flex items-center justify-center">
        <div className="text-[#C9A84C] font-playfair text-xl animate-pulse">Loading portfolio…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060C07] text-[#EDE9E1]">
      <header className="border-b border-[rgba(201,168,76,0.12)] px-6 py-4 flex items-center justify-between bg-[#0C1410]">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-playfair text-[#C9A84C] font-bold text-lg tracking-widest">WILLOW</Link>
          <span className="text-[#7A9175]">/</span>
          <span className="text-[#7A9175] text-sm">Investor Dashboard</span>
        </div>
        <WalletButton />
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="font-playfair text-3xl text-[#EDE9E1]">
            Welcome back, {session?.user?.name?.split(" ")[0] ?? "Investor"}
          </h1>
          <p className="text-[#7A9175] text-sm mt-1">Your on-chain investment portfolio.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Deployed",   value: formatUSDCDisplay(totalDeployed),   icon: "💎" },
            { label: "Direct Holdings",  value: String(directHoldings.length),      icon: "🏠" },
            { label: "Pool Investments", value: String(poolInvestments.length),     icon: "🏦" },
            { label: "Transactions",     value: String(investments.length),         icon: "🔗" },
          ].map(s => (
            <div key={s.label} className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-5">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="font-playfair text-3xl text-[#C9A84C] font-bold">{s.value}</div>
              <div className="text-[#7A9175] text-xs mt-1 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-1 border-b border-[rgba(201,168,76,0.12)]">
          {[
            { key: "holdings", label: "Direct Holdings" },
            { key: "pools",    label: "Investment Pools" },
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

        {error && (
          <div className="bg-[rgba(224,82,82,0.1)] border border-[rgba(224,82,82,0.3)] rounded-xl p-4 text-[#E05252] text-sm">
            Failed to load investments: {error}
          </div>
        )}

        {activeTab === "holdings" && (
          <WalletGate message="Connect your wallet to view fractional holdings and claim yield">
            <div className="space-y-4">
              {directHoldings.length === 0 ? (
                <div className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-12 text-center space-y-3">
                  <div className="text-4xl">📈</div>
                  <p className="text-[#7A9175]">No direct property investments yet.</p>
                  <Link href="/market" className="inline-block bg-[#C9A84C] text-[#060C07] px-6 py-2 rounded-lg font-bold text-sm">Browse Properties</Link>
                </div>
              ) : (
                directHoldings.map(inv => (
                  <div key={inv.id} className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="text-[#EDE9E1] font-medium">Property Investment</div>
                        <div className="text-[#7A9175] text-xs">ID: {inv.propertyId}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-playfair text-2xl text-[#C9A84C] font-bold">{formatUSDCDisplay(BigInt(inv.usdcAmount ?? 0))}</div>
                        <div className="text-[#7A9175] text-xs">invested</div>
                      </div>
                    </div>
                    {inv.txHash && (
                      <a href={polygonscanLink("tx", inv.txHash)} target="_blank" rel="noopener noreferrer"
                        className="text-[#a970ff] text-xs hover:underline">
                        Tx: {truncateAddr(inv.txHash)} ↗
                      </a>
                    )}
                    <button className="w-full bg-[rgba(61,186,120,0.1)] hover:bg-[rgba(61,186,120,0.2)] text-[#3DBA78] py-2 rounded-lg text-sm transition-colors">
                      Claim Yield
                    </button>
                  </div>
                ))
              )}
            </div>
          </WalletGate>
        )}

        {activeTab === "pools" && (
          <div className="space-y-4">
            {poolInvestments.length === 0 ? (
              <div className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-12 text-center space-y-3">
                <div className="text-4xl">🏦</div>
                <p className="text-[#7A9175]">No pool investments yet.</p>
                <Link href="/invest/pools" className="inline-block bg-[#C9A84C] text-[#060C07] px-6 py-2 rounded-lg font-bold text-sm">Browse Pools</Link>
              </div>
            ) : (
              poolInvestments.map(inv => (
                <div key={inv.id} className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[#EDE9E1] font-medium">Investment Pool</div>
                      <div className="text-[#7A9175] text-xs font-mono">{truncateAddr(inv.poolAddress ?? "0x0000")}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-playfair text-2xl text-[#C9A84C] font-bold">{formatUSDCDisplay(BigInt(inv.usdcAmount ?? 0))}</div>
                      <div className="text-[#7A9175] text-xs">invested</div>
                    </div>
                  </div>
                  {inv.poolTokens && <div className="text-[#7A9175] text-sm">Pool tokens: <span className="text-[#EDE9E1]">{inv.poolTokens}</span></div>}
                  <a href={polygonscanLink("address", inv.poolAddress ?? "")} target="_blank" rel="noopener noreferrer"
                    className="text-[#a970ff] text-xs hover:underline">View pool on Polygonscan ↗</a>
                </div>
              ))
            )}
            {isConnected && (
              <Link href="/invest/pools"
                className="block w-full border-2 border-dashed border-[rgba(201,168,76,0.2)] hover:border-[rgba(201,168,76,0.4)] rounded-xl p-5 text-[#7A9175] hover:text-[#C9A84C] transition-colors text-center text-sm">
                + Invest in a New Pool
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

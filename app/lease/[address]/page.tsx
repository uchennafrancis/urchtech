"use client";

import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { WalletButton } from "@/components/web3/WalletButton";
import { WalletGate } from "@/components/web3/WalletGate";
import { useLeaseData } from "@/lib/web3";
import { polygonscanLink, truncateAddr, formatUSDCDisplay } from "@/lib/web3";
import Link from "next/link";

const STATUS_LABELS = ["PENDING", "ACTIVE", "EXPIRED", "TERMINATED"];
const STATUS_COLORS = [
  "bg-yellow-900/30 text-yellow-400",
  "bg-green-900/30 text-green-400",
  "bg-gray-700 text-gray-400",
  "bg-red-900/30 text-red-400",
];

export default function LeasePage() {
  const params      = useParams();
  const leaseAddr   = params.address as `0x${string}`;
  const { address, isConnected } = useAccount();

  const { status, nextDue, isOverdue, paymentsCompleted } = useLeaseData(leaseAddr);

  const statusNum   = Number(status.data ?? 0);
  const nextDueDate = nextDue.data ? new Date(Number(nextDue.data) * 1000).toLocaleDateString() : "—";
  const overdue     = isOverdue.data ?? false;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-willow-400 font-bold text-lg">Willow</Link>
          <span className="text-white/30">/</span>
          <span className="text-white/70">On-Chain Lease</span>
        </div>
        <WalletButton />
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Contract info header */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Lease Agreement</h1>
            <span className={`px-3 py-1 rounded-full text-sm ${STATUS_COLORS[statusNum] || STATUS_COLORS[0]}`}>
              {STATUS_LABELS[statusNum] || "UNKNOWN"}
            </span>
          </div>
          <div className="font-mono text-sm text-white/60 break-all">{leaseAddr}</div>
          <a href={polygonscanLink("address", leaseAddr)} target="_blank" rel="noopener noreferrer"
            className="text-polygon-light text-sm hover:underline">
            View Contract on Polygonscan ↗
          </a>
        </div>

        {/* Overdue banner */}
        {overdue && (
          <div className="bg-red-900/30 border border-red-700 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <div className="font-bold text-red-400">Rent Overdue</div>
              <div className="text-sm text-red-300/70">Payment was due on {nextDueDate}. Please pay immediately to avoid penalties.</div>
            </div>
          </div>
        )}

        {/* Lease details */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="font-bold text-lg">Lease Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              { label: "Status",            value: STATUS_LABELS[statusNum] || "—" },
              { label: "Payments Made",     value: String(paymentsCompleted.data ?? "—") },
              { label: "Next Payment Due",  value: nextDueDate },
              { label: "Contract Address",  value: truncateAddr(leaseAddr) },
            ].map((row) => (
              <div key={row.label} className="space-y-1">
                <div className="text-white/50">{row.label}</div>
                <div className="font-medium">{row.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <h2 className="font-bold text-lg">Actions</h2>
          <WalletGate reason="Connect your wallet to interact with this lease contract.">
            <div className="grid grid-cols-2 gap-3">
              <button
                disabled={statusNum !== 1}
                className="bg-willow-700 hover:bg-willow-600 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-colors"
              >
                💳 Pay Rent
              </button>
              <button
                disabled={statusNum !== 0}
                className="bg-polygon-purple/30 hover:bg-polygon-purple/50 disabled:opacity-40 disabled:cursor-not-allowed text-polygon-light py-3 rounded-xl font-semibold transition-colors"
              >
                ✍️ Activate Lease
              </button>
              <button
                disabled={statusNum !== 2 && statusNum !== 3}
                className="bg-green-900/30 hover:bg-green-900/50 disabled:opacity-40 disabled:cursor-not-allowed text-green-400 py-3 rounded-xl font-semibold transition-colors"
              >
                🔓 Release Deposit
              </button>
              <button
                disabled={statusNum !== 1 && statusNum !== 0}
                className="bg-red-900/30 hover:bg-red-900/50 disabled:opacity-40 disabled:cursor-not-allowed text-red-400 py-3 rounded-xl font-semibold transition-colors"
              >
                ✕ Terminate Lease
              </button>
            </div>
          </WalletGate>
        </div>

        {/* Payment history placeholder */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
          <h2 className="font-bold">Payment History (On-Chain Events)</h2>
          <p className="text-white/40 text-sm">
            Payment events are fetched directly from the Polygon blockchain.
            Connect wallet and view the contract on Polygonscan for full history.
          </p>
          <a href={polygonscanLink("address", leaseAddr)} target="_blank" rel="noopener noreferrer"
            className="inline-block bg-polygon-purple/20 hover:bg-polygon-purple/30 text-polygon-light px-4 py-2 rounded-xl text-sm transition-colors">
            View Events on Polygonscan ↗
          </a>
        </div>
      </div>
    </div>
  );
}

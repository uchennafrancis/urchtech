"use client";

import { useAccount } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { ReactNode } from "react";

interface WalletGateProps {
  children: ReactNode;
  reason?: string;
}

export function WalletGate({ children, reason }: WalletGateProps) {
  const { isConnected } = useAccount();
  const { open }        = useWeb3Modal();

  if (isConnected) return <>{children}</>;

  return (
    <div className="border-2 border-dashed border-polygon-purple/40 rounded-2xl p-8 text-center space-y-4 bg-polygon-purple/5">
      <div className="text-5xl">🔗</div>
      <h3 className="text-xl font-bold text-white">Wallet Required</h3>
      <p className="text-white/60 max-w-sm mx-auto text-sm">
        {reason || "Connect your wallet to access this blockchain feature. MetaMask, WalletConnect, and Coinbase Wallet are supported."}
      </p>
      <button
        onClick={() => open()}
        className="bg-polygon-purple hover:bg-polygon-light text-white px-6 py-3 rounded-xl font-semibold transition-colors"
      >
        Connect Wallet
      </button>
    </div>
  );
}

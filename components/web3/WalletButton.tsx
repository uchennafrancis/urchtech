"use client";

import { useAccount, useBalance, useDisconnect, useSwitchChain } from "wagmi";
import { polygonMumbai, polygon } from "wagmi/chains";
import { useWeb3Modal } from "@web3modal/wagmi/react";

const TARGET_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 80001);

export function WalletButton() {
  const { address, isConnected, chain }  = useAccount();
  const { data: balance }                = useBalance({ address });
  const { disconnect }                   = useDisconnect();
  const { switchChain }                  = useSwitchChain();
  const { open }                         = useWeb3Modal();

  const targetChain = TARGET_CHAIN_ID === 137 ? polygon : polygonMumbai;
  const isWrongNetwork = isConnected && chain?.id !== TARGET_CHAIN_ID;

  if (!isConnected) {
    return (
      <button
        onClick={() => open()}
        className="bg-polygon-purple hover:bg-polygon-light text-white px-4 py-2 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2"
      >
        <span>🔗</span> Connect Wallet
      </button>
    );
  }

  if (isWrongNetwork) {
    return (
      <button
        onClick={() => switchChain({ chainId: TARGET_CHAIN_ID })}
        className="bg-amber-500 hover:bg-amber-400 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-colors animate-pulse"
      >
        ⚠️ Switch to {targetChain.name}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="bg-willow-800 border border-willow-600 rounded-xl px-3 py-2 text-sm flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-willow-400 animate-pulse" />
        <span className="font-mono text-willow-200">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <span className="text-white/50">|</span>
        <span className="text-white/70 text-xs">
          {Number(balance?.formatted || 0).toFixed(4)} MATIC
        </span>
        <span className="bg-polygon-purple/30 text-polygon-light px-2 py-0.5 rounded text-xs">
          {chain?.name}
        </span>
      </div>
      <button
        onClick={() => disconnect()}
        className="text-white/50 hover:text-white text-xs px-2 py-2"
      >
        Disconnect
      </button>
    </div>
  );
}

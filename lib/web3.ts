"use client";

import { useReadContract, useWriteContract, useAccount } from "wagmi";
import { PROPERTY_NFT_ABI, LEASE_ABI, FRACTIONAL_ABI, ESCROW_ABI, POOL_ABI } from "./contracts";

const REGISTRY_ADDR    = process.env.NEXT_PUBLIC_PROPERTY_REGISTRY_ADDRESS as `0x${string}`;
const LEASE_FAC_ADDR   = process.env.NEXT_PUBLIC_LEASE_FACTORY_ADDRESS     as `0x${string}`;
const ESCROW_ADDR      = process.env.NEXT_PUBLIC_BOOKING_ESCROW_ADDRESS    as `0x${string}`;
const POOL_ADDR        = process.env.NEXT_PUBLIC_INVESTMENT_POOL_ADDRESS   as `0x${string}`;

// Hook: read on-chain property data by tokenId
export function usePropertyData(tokenId: bigint | undefined) {
  return useReadContract({
    address:      REGISTRY_ADDR,
    abi:          PROPERTY_NFT_ABI,
    functionName: "getPropertyData",
    args:         tokenId ? [tokenId] : undefined,
    query:        { enabled: !!tokenId },
  });
}

// Hook: read lease contract state
export function useLeaseData(leaseAddress: `0x${string}` | undefined) {
  const status       = useReadContract({ address: leaseAddress, abi: LEASE_ABI, functionName: "status",         query: { enabled: !!leaseAddress } });
  const nextDue      = useReadContract({ address: leaseAddress, abi: LEASE_ABI, functionName: "nextPaymentDue", query: { enabled: !!leaseAddress } });
  const isOverdue    = useReadContract({ address: leaseAddress, abi: LEASE_ABI, functionName: "isRentOverdue",  query: { enabled: !!leaseAddress } });
  const paymentsComp = useReadContract({ address: leaseAddress, abi: LEASE_ABI, functionName: "paymentsCompleted", query: { enabled: !!leaseAddress } });
  return { status, nextDue, isOverdue, paymentsCompleted: paymentsComp };
}

// Hook: write — pay rent on a lease
export function usePayRent(leaseAddress: `0x${string}` | undefined) {
  return useWriteContract();
}

// Hook: read fractional holdings
export function useFractionalHoldings(fractionalAddress: `0x${string}` | undefined, userAddress: `0x${string}` | undefined) {
  return useReadContract({
    address:      fractionalAddress,
    abi:          FRACTIONAL_ABI,
    functionName: "getShareHolder",
    args:         userAddress ? [userAddress] : undefined,
    query:        { enabled: !!fractionalAddress && !!userAddress },
  });
}

// Hook: read pool investment balance
export function usePoolBalance(poolAddress: `0x${string}` | undefined, userAddress: `0x${string}` | undefined) {
  return useReadContract({
    address:      poolAddress || POOL_ADDR,
    abi:          POOL_ABI,
    functionName: "balanceOf",
    args:         userAddress ? [userAddress] : undefined,
    query:        { enabled: !!userAddress },
  });
}

// Formatters
export function formatNairaDisplay(kobo: bigint): string {
  const naira = Number(kobo) / 100;
  if (naira >= 1_000_000_000) return `₦${(naira / 1_000_000_000).toFixed(2)}B`;
  if (naira >= 1_000_000)     return `₦${(naira / 1_000_000).toFixed(2)}M`;
  if (naira >= 1_000)         return `₦${(naira / 1_000).toFixed(1)}K`;
  return `₦${naira.toLocaleString()}`;
}

export function formatUSDCDisplay(units: bigint): string {
  return `$${(Number(units) / 1_000_000).toFixed(2)}`;
}

export function truncateAddr(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function polygonscanLink(type: "tx" | "address" | "token", value: string): string {
  const base = process.env.NEXT_PUBLIC_CHAIN_ID === "137"
    ? "https://polygonscan.com"
    : "https://mumbai.polygonscan.com";
  return `${base}/${type}/${value}`;
}

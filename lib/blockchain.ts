import { ethers } from "ethers";
import deployments from "../deployments.json";

// Server-side provider using deployer wallet
function getProvider() {
  return new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL!);
}

function getDeployerWallet() {
  return new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY!, getProvider());
}

function getABI(name: string) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const artifact = require(`../artifacts/contracts/${name}.sol/${name}.json`);
  return artifact.abi;
}

export function getPropertyNFTContract(signer?: ethers.Signer) {
  const addr = (deployments as { contracts: Record<string, string> }).contracts.WillowPropertyNFT;
  return new ethers.Contract(addr, getABI("WillowPropertyNFT"), signer || getDeployerWallet());
}

export function getLeaseFactoryContract(signer?: ethers.Signer) {
  const addr = (deployments as { contracts: Record<string, string> }).contracts.LeaseFactory;
  return new ethers.Contract(addr, getABI("LeaseFactory"), signer || getDeployerWallet());
}

export function getShortletEscrowContract(signer?: ethers.Signer) {
  const addr = (deployments as { contracts: Record<string, string> }).contracts.ShortletEscrow;
  return new ethers.Contract(addr, getABI("ShortletEscrow"), signer || getDeployerWallet());
}

export function getFractionalFactoryContract(signer?: ethers.Signer) {
  const addr = (deployments as { contracts: Record<string, string> }).contracts.WillowFractionalFactory;
  return new ethers.Contract(addr, getABI("WillowFractionalFactory"), signer || getDeployerWallet());
}

export function getUOSRegistryContract(signer?: ethers.Signer) {
  const addr = (deployments as { contracts: Record<string, string> }).contracts.UOSRegistry;
  return new ethers.Contract(addr, getABI("UOSRegistry"), signer || getDeployerWallet());
}

export function getTitleRegistryContract(signer?: ethers.Signer) {
  const addr = (deployments as { contracts: Record<string, string> }).contracts.WillowTitleRegistry;
  return new ethers.Contract(addr, getABI("WillowTitleRegistry"), signer || getDeployerWallet());
}

export function getInvestmentPoolContract(address: string, signer?: ethers.Signer) {
  return new ethers.Contract(address, getABI("WillowInvestmentPool"), signer || getDeployerWallet());
}

export function getFractionalContract(address: string, signer?: ethers.Signer) {
  return new ethers.Contract(address, getABI("WillowFractional"), signer || getDeployerWallet());
}

export function formatNaira(kobo: bigint): string {
  const naira = Number(kobo) / 100;
  return `₦${naira.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

export function formatUSDC(units: bigint): string {
  const usdc = Number(units) / 1_000_000;
  return `$${usdc.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export const POLYGONSCAN_BASE =
  process.env.NEXT_PUBLIC_CHAIN_ID === "137"
    ? "https://polygonscan.com"
    : "https://mumbai.polygonscan.com";

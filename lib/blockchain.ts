import { ethers } from "ethers";
import deployments from "../deployments.json";

// Server-side provider using deployer wallet
function getProvider() {
  return new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL!);
}

function getDeployerWallet() {
  return new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY!, getProvider());
}

// ── Inline minimal ABIs (no Hardhat artifact dependency) ─────────────────────

const PROPERTY_NFT_ABI = [
  { name: "tokenCounter",   type: "function", stateMutability: "view",
    inputs: [], outputs: [{ type: "uint256" }] },
  { name: "ownerOf",        type: "function", stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ type: "address" }] },
  { name: "getPropertyData", type: "function", stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ type: "tuple", components: [
      { name: "willowPropertyId", type: "string" },
      { name: "metadataURI",      type: "string" },
      { name: "location",         type: "string" },
      { name: "valuationNaira",   type: "uint256" },
      { name: "uosScore",         type: "uint256" },
      { name: "isVerified",       type: "bool" },
      { name: "registeredAt",     type: "uint256" },
    ]}] },
  { name: "mintProperty",   type: "function", stateMutability: "nonpayable",
    inputs: [
      { name: "to",                type: "address" },
      { name: "willowPropertyId", type: "string" },
      { name: "metadataURI",      type: "string" },
      { name: "location",         type: "string" },
      { name: "valuationNaira",   type: "uint256" },
      { name: "uosScore",         type: "uint256" },
    ], outputs: [{ type: "uint256" }] },
  { name: "PropertyMinted", type: "event",
    inputs: [
      { name: "tokenId",          type: "uint256", indexed: true },
      { name: "owner",            type: "address", indexed: true },
      { name: "willowPropertyId", type: "string" },
    ] },
] as const;

const LEASE_FACTORY_ABI = [
  { name: "deployLease", type: "function", stateMutability: "nonpayable",
    inputs: [
      { name: "landlord",       type: "address" },
      { name: "tenant",         type: "address" },
      { name: "nftTokenId",     type: "uint256" },
      { name: "monthlyRent",    type: "uint256" },
      { name: "deposit",        type: "uint256" },
      { name: "durationMonths", type: "uint256" },
    ], outputs: [{ type: "address" }] },
  { name: "getLeasesForLandlord", type: "function", stateMutability: "view",
    inputs: [{ name: "landlord", type: "address" }], outputs: [{ type: "address[]" }] },
  { name: "getLeasesForTenant", type: "function", stateMutability: "view",
    inputs: [{ name: "tenant", type: "address" }], outputs: [{ type: "address[]" }] },
  { name: "LeaseDeployed", type: "event",
    inputs: [
      { name: "contractAddress", type: "address", indexed: true },
      { name: "landlord",        type: "address", indexed: true },
      { name: "tenant",          type: "address", indexed: true },
    ] },
] as const;

const LEASE_ABI = [
  { name: "status",            type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { name: "nextPaymentDue",    type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { name: "isRentOverdue",     type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
  { name: "paymentsCompleted", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { name: "totalExpected",     type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { name: "monthlyRentUSDC",   type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { name: "activateLease",     type: "function", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { name: "payRent",           type: "function", stateMutability: "nonpayable", inputs: [], outputs: [] },
] as const;

const SHORTLET_ESCROW_ABI = [
  { name: "createBooking", type: "function", stateMutability: "nonpayable",
    inputs: [
      { name: "bookingId",   type: "uint256" },
      { name: "guest",       type: "address" },
      { name: "amount",      type: "uint256" },
      { name: "checkin",     type: "uint256" },
      { name: "checkout",    type: "uint256" },
    ], outputs: [] },
  { name: "confirmBooking", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "bookingId", type: "uint256" }], outputs: [] },
  { name: "getBooking", type: "function", stateMutability: "view",
    inputs: [{ name: "bookingId", type: "uint256" }],
    outputs: [{ type: "tuple", components: [
      { name: "guest",    type: "address" },
      { name: "amount",   type: "uint256" },
      { name: "checkin",  type: "uint256" },
      { name: "checkout", type: "uint256" },
      { name: "status",   type: "uint8" },
    ]}] },
] as const;

const FRACTIONAL_FACTORY_ABI = [
  { name: "createFractionalProperty", type: "function", stateMutability: "nonpayable",
    inputs: [
      { name: "nftTokenId",       type: "uint256" },
      { name: "totalShares",      type: "uint256" },
      { name: "tokenName",        type: "string" },
      { name: "tokenSymbol",      type: "string" },
      { name: "founderAddresses", type: "address[]" },
      { name: "allocations",      type: "uint256[]" },
    ], outputs: [{ type: "address" }] },
  { name: "getAllFractionalContracts", type: "function", stateMutability: "view",
    inputs: [], outputs: [{ type: "address[]" }] },
  { name: "FractionalDeployed", type: "event",
    inputs: [
      { name: "nftTokenId",   type: "uint256", indexed: true },
      { name: "fractionalAddr", type: "address", indexed: true },
    ] },
] as const;

const FRACTIONAL_ABI = [
  { name: "totalSupply",  type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { name: "balanceOf",    type: "function", stateMutability: "view",
    inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
  { name: "claimableYield", type: "function", stateMutability: "view",
    inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
  { name: "claimYield",   type: "function", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { name: "depositYield", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }], outputs: [] },
] as const;

const UOS_REGISTRY_ABI = [
  { name: "recordImprovement", type: "function", stateMutability: "nonpayable",
    inputs: [
      { name: "propertyId", type: "string" },
      { name: "ipfsHash",   type: "string" },
      { name: "cost",       type: "uint256" },
      { name: "impact",     type: "uint256" },
    ], outputs: [] },
  { name: "getImprovements", type: "function", stateMutability: "view",
    inputs: [{ name: "propertyId", type: "string" }],
    outputs: [{ type: "tuple[]", components: [
      { name: "ipfsHash",  type: "string" },
      { name: "cost",      type: "uint256" },
      { name: "impact",    type: "uint256" },
      { name: "timestamp", type: "uint256" },
    ]}] },
] as const;

const TITLE_REGISTRY_ABI = [
  { name: "registerTitle", type: "function", stateMutability: "nonpayable",
    inputs: [
      { name: "propertyId", type: "string" },
      { name: "owner",      type: "address" },
      { name: "metadataURI", type: "string" },
    ], outputs: [] },
  { name: "transferTitle", type: "function", stateMutability: "nonpayable",
    inputs: [
      { name: "propertyId", type: "string" },
      { name: "newOwner",   type: "address" },
    ], outputs: [] },
  { name: "getTitle", type: "function", stateMutability: "view",
    inputs: [{ name: "propertyId", type: "string" }],
    outputs: [{ type: "tuple", components: [
      { name: "owner",       type: "address" },
      { name: "metadataURI", type: "string" },
      { name: "registeredAt", type: "uint256" },
    ]}] },
] as const;

const INVESTMENT_POOL_ABI = [
  { name: "balanceOf",         type: "function", stateMutability: "view",
    inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
  { name: "totalRaisedUSDC",   type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { name: "targetRaiseUSDC",   type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { name: "investorCount",     type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { name: "minInvestmentUSDC", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { name: "status",            type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { name: "invest",  type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "usdcAmount", type: "uint256" }], outputs: [] },
  { name: "redeem", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "poolTokens", type: "uint256" }], outputs: [] },
] as const;

// ── Contract factories ────────────────────────────────────────────────────────

type Deployments = { contracts: Record<string, string> };

export function getPropertyNFTContract(signer?: ethers.Signer) {
  const addr = (deployments as Deployments).contracts.WillowPropertyNFT;
  return new ethers.Contract(addr, PROPERTY_NFT_ABI, signer || getDeployerWallet());
}

export function getLeaseFactoryContract(signer?: ethers.Signer) {
  const addr = (deployments as Deployments).contracts.LeaseFactory;
  return new ethers.Contract(addr, LEASE_FACTORY_ABI, signer || getDeployerWallet());
}

export function getLeaseContract(address: string, signer?: ethers.Signer) {
  return new ethers.Contract(address, LEASE_ABI, signer || getDeployerWallet());
}

export function getShortletEscrowContract(signer?: ethers.Signer) {
  const addr = (deployments as Deployments).contracts.ShortletEscrow;
  return new ethers.Contract(addr, SHORTLET_ESCROW_ABI, signer || getDeployerWallet());
}

export function getFractionalFactoryContract(signer?: ethers.Signer) {
  const addr = (deployments as Deployments).contracts.WillowFractionalFactory;
  return new ethers.Contract(addr, FRACTIONAL_FACTORY_ABI, signer || getDeployerWallet());
}

export function getFractionalContract(address: string, signer?: ethers.Signer) {
  return new ethers.Contract(address, FRACTIONAL_ABI, signer || getDeployerWallet());
}

export function getUOSRegistryContract(signer?: ethers.Signer) {
  const addr = (deployments as Deployments).contracts.UOSRegistry;
  return new ethers.Contract(addr, UOS_REGISTRY_ABI, signer || getDeployerWallet());
}

export function getTitleRegistryContract(signer?: ethers.Signer) {
  const addr = (deployments as Deployments).contracts.WillowTitleRegistry;
  return new ethers.Contract(addr, TITLE_REGISTRY_ABI, signer || getDeployerWallet());
}

export function getInvestmentPoolContract(address: string, signer?: ethers.Signer) {
  return new ethers.Contract(address, INVESTMENT_POOL_ABI, signer || getDeployerWallet());
}

// ── Formatters ────────────────────────────────────────────────────────────────

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

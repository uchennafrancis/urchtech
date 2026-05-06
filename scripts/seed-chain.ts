import { ethers } from "hardhat";
import * as fs from "fs";

const SAMPLE_PROPERTIES = [
  { willowId: "WIL-001", metadataURI: "ipfs://QmSeed001/metadata.json", location: "Bourdillon Road, Ikoyi, Lagos",        valuation: 500_000_000_000n },
  { willowId: "WIL-002", metadataURI: "ipfs://QmSeed002/metadata.json", location: "Maitama, Abuja FCT",                   valuation: 350_000_000_000n },
  { willowId: "WIL-003", metadataURI: "ipfs://QmSeed003/metadata.json", location: "GRA Phase 2, Port Harcourt, Rivers",   valuation: 180_000_000_000n },
];

async function main() {
  const [deployer, landlord1, landlord2, tenant1] = await ethers.getSigners();
  const data      = JSON.parse(fs.readFileSync("deployments.json", "utf-8"));
  const c         = data.contracts;

  const propertyNFT   = await ethers.getContractAt("WillowPropertyNFT",  c.WillowPropertyNFT);
  const leaseFactory  = await ethers.getContractAt("LeaseFactory",        c.LeaseFactory);
  const titleRegistry = await ethers.getContractAt("WillowTitleRegistry", c.WillowTitleRegistry);

  console.log("Minting sample property NFTs...");
  const owners   = [landlord1.address, landlord1.address, landlord2.address];
  const tokenIds: bigint[] = [];

  for (let i = 0; i < SAMPLE_PROPERTIES.length; i++) {
    const p       = SAMPLE_PROPERTIES[i];
    const receipt = await (await propertyNFT.mintProperty(owners[i], p.willowId, p.metadataURI, p.location, p.valuation)).wait();
    const event   = receipt?.logs.find((l: { fragment?: { name: string } }) => l.fragment?.name === "PropertyRegistered");
    const tokenId = event ? (event as { args: bigint[] }).args[0] : BigInt(i + 1);
    tokenIds.push(tokenId);
    console.log(`  Minted ${p.willowId} → tokenId ${tokenId}`);

    await (await titleRegistry.registerTitle(tokenId, `COO-${2020 + i}-LG-${1000 + i}`, owners[i], p.valuation, [])).wait();
    console.log(`  Title registered for tokenId ${tokenId}`);
  }

  console.log("\nDeploying sample lease (WIL-001, 12 months, $500/mo)...");
  const USDC_ADDRESS = process.env.USDC_ADDRESS || "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
  const lr  = await (await leaseFactory.deployLease(
    landlord1.address, tenant1.address, tokenIds[0],
    ethers.parseUnits("500",  6),
    ethers.parseUnits("1000", 6),
    12
  )).wait();
  const le  = lr?.logs.find((l: { fragment?: { name: string } }) => l.fragment?.name === "LeaseDeployed");
  const la  = le ? (le as { args: string[] }).args[0] : "unknown";
  console.log(`  Lease deployed at: ${la}`);

  console.log("\nSeed complete.");
}

main().catch((err) => { console.error(err); process.exitCode = 1; });

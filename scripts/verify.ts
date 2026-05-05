import { run } from "hardhat";
import * as fs from "fs";

async function main() {
  const data      = JSON.parse(fs.readFileSync("deployments.json", "utf-8"));
  const { contracts } = data;
  const USDC        = process.env.USDC_ADDRESS    || "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
  const PLATFORM    = process.env.PLATFORM_WALLET || process.env.DEPLOYER_ADDRESS!;
  const DEPLOYER    = process.env.DEPLOYER_ADDRESS!;

  const verifications = [
    { address: contracts.WillowPropertyNFT,       constructorArguments: [DEPLOYER] },
    { address: contracts.WillowFractionalFactory, constructorArguments: [contracts.WillowPropertyNFT, USDC, DEPLOYER] },
    { address: contracts.LeaseFactory,            constructorArguments: [USDC, DEPLOYER] },
    { address: contracts.ShortletEscrow,          constructorArguments: [USDC, PLATFORM, DEPLOYER] },
    {
      address: contracts.WillowInvestmentPool,
      constructorArguments: ["Willow Lagos Growth Pool", "500000000000", "100000000", USDC, DEPLOYER],
    },
    { address: contracts.UOSRegistry,        constructorArguments: [contracts.WillowPropertyNFT, DEPLOYER] },
    { address: contracts.WillowTitleRegistry, constructorArguments: [DEPLOYER] },
    { address: contracts.WillowStablecoin,    constructorArguments: [DEPLOYER] },
  ];

  for (const v of verifications) {
    console.log(`\nVerifying ${v.address}...`);
    try {
      await run("verify:verify", v);
      console.log("  Verified.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(msg.includes("Already Verified") ? "  Already verified." : `  Error: ${msg}`);
    }
  }
}

main().catch((err) => { console.error(err); process.exitCode = 1; });

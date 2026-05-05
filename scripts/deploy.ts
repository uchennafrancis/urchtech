import { ethers } from "hardhat";
import * as fs from "fs";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const [deployer] = await ethers.getSigners();
  const network    = await ethers.provider.getNetwork();
  console.log(`\nDeploying on ${network.name} (chainId: ${network.chainId})`);
  console.log("Deployer:", deployer.address);

  const USDC_ADDRESS    = process.env.USDC_ADDRESS    || "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
  const PLATFORM_WALLET = process.env.PLATFORM_WALLET || deployer.address;
  const deployments: Record<string, string> = {};

  // 1. WillowPropertyNFT
  console.log("\n[1/8] WillowPropertyNFT...");
  const PropertyNFT = await ethers.getContractFactory("WillowPropertyNFT");
  const propertyNFT = await PropertyNFT.deploy(deployer.address);
  await propertyNFT.waitForDeployment();
  deployments.WillowPropertyNFT = await propertyNFT.getAddress();
  console.log("  ->", deployments.WillowPropertyNFT);

  // 2. WillowFractionalFactory
  console.log("\n[2/8] WillowFractionalFactory...");
  const FractionalFactory = await ethers.getContractFactory("WillowFractionalFactory");
  const fractionalFactory = await FractionalFactory.deploy(
    deployments.WillowPropertyNFT, USDC_ADDRESS, deployer.address
  );
  await fractionalFactory.waitForDeployment();
  deployments.WillowFractionalFactory = await fractionalFactory.getAddress();
  console.log("  ->", deployments.WillowFractionalFactory);

  // 3. LeaseFactory
  console.log("\n[3/8] LeaseFactory...");
  const LeaseFactory = await ethers.getContractFactory("LeaseFactory");
  const leaseFactory = await LeaseFactory.deploy(USDC_ADDRESS, deployer.address);
  await leaseFactory.waitForDeployment();
  deployments.LeaseFactory = await leaseFactory.getAddress();
  console.log("  ->", deployments.LeaseFactory);

  // 4. ShortletEscrow
  console.log("\n[4/8] ShortletEscrow...");
  const ShortletEscrow = await ethers.getContractFactory("ShortletEscrow");
  const shortletEscrow = await ShortletEscrow.deploy(USDC_ADDRESS, PLATFORM_WALLET, deployer.address);
  await shortletEscrow.waitForDeployment();
  deployments.ShortletEscrow = await shortletEscrow.getAddress();
  console.log("  ->", deployments.ShortletEscrow);

  // 5. WillowInvestmentPool
  console.log("\n[5/8] WillowInvestmentPool...");
  const InvestmentPool = await ethers.getContractFactory("WillowInvestmentPool");
  const investmentPool = await InvestmentPool.deploy(
    "Willow Lagos Growth Pool",
    ethers.parseUnits("500000", 6),
    ethers.parseUnits("100", 6),
    USDC_ADDRESS,
    deployer.address
  );
  await investmentPool.waitForDeployment();
  deployments.WillowInvestmentPool = await investmentPool.getAddress();
  console.log("  ->", deployments.WillowInvestmentPool);

  // 6. UOSRegistry
  console.log("\n[6/8] UOSRegistry...");
  const UOSRegistry = await ethers.getContractFactory("UOSRegistry");
  const uosRegistry = await UOSRegistry.deploy(deployments.WillowPropertyNFT, deployer.address);
  await uosRegistry.waitForDeployment();
  deployments.UOSRegistry = await uosRegistry.getAddress();
  console.log("  ->", deployments.UOSRegistry);

  // 7. WillowTitleRegistry
  console.log("\n[7/8] WillowTitleRegistry...");
  const TitleRegistry = await ethers.getContractFactory("WillowTitleRegistry");
  const titleRegistry = await TitleRegistry.deploy(deployer.address);
  await titleRegistry.waitForDeployment();
  deployments.WillowTitleRegistry = await titleRegistry.getAddress();
  console.log("  ->", deployments.WillowTitleRegistry);

  // 8. WillowStablecoin
  console.log("\n[8/8] WillowStablecoin...");
  const Stablecoin = await ethers.getContractFactory("WillowStablecoin");
  const stablecoin = await Stablecoin.deploy(deployer.address);
  await stablecoin.waitForDeployment();
  deployments.WillowStablecoin = await stablecoin.getAddress();
  console.log("  ->", deployments.WillowStablecoin);

  // Grant AI_ORACLE_ROLE to UOSRegistry
  console.log("\nGranting AI_ORACLE_ROLE to UOSRegistry...");
  const AI_ORACLE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("AI_ORACLE_ROLE"));
  await (await propertyNFT.grantRole(AI_ORACLE_ROLE, deployments.UOSRegistry)).wait();

  const output = {
    network: network.name,
    chainId: Number(network.chainId),
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    contracts: deployments,
  };
  fs.writeFileSync("deployments.json", JSON.stringify(output, null, 2));
  console.log("\nSaved: deployments.json");

  console.log("\n=== Copy into .env.local ===");
  console.log(`NEXT_PUBLIC_PROPERTY_REGISTRY_ADDRESS=${deployments.WillowPropertyNFT}`);
  console.log(`NEXT_PUBLIC_FRACTIONAL_FACTORY_ADDRESS=${deployments.WillowFractionalFactory}`);
  console.log(`NEXT_PUBLIC_LEASE_FACTORY_ADDRESS=${deployments.LeaseFactory}`);
  console.log(`NEXT_PUBLIC_BOOKING_ESCROW_ADDRESS=${deployments.ShortletEscrow}`);
  console.log(`NEXT_PUBLIC_INVESTMENT_POOL_ADDRESS=${deployments.WillowInvestmentPool}`);
  console.log(`NEXT_PUBLIC_UOS_REGISTRY_ADDRESS=${deployments.UOSRegistry}`);
  console.log(`NEXT_PUBLIC_TITLE_REGISTRY_ADDRESS=${deployments.WillowTitleRegistry}`);
}

main().catch((err) => { console.error(err); process.exitCode = 1; });

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("UOSRegistry", () => {
  let admin:     HardhatEthersSigner;
  let inspector: HardhatEthersSigner;
  let other:     HardhatEthersSigner;

  let propertyNFT: Awaited<ReturnType<typeof ethers.getContractAt>>;
  let registry:    Awaited<ReturnType<typeof ethers.getContractAt>>;
  let nftAddr:     string;
  let regAddr:     string;

  const INSPECTOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("URCHMOND_INSPECTOR_ROLE"));
  const AI_ORACLE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("AI_ORACLE_ROLE"));

  beforeEach(async () => {
    [admin, inspector, other] = await ethers.getSigners();

    const NFT = await ethers.getContractFactory("WillowPropertyNFT");
    const nft = await NFT.deploy(admin.address);
    await nft.waitForDeployment();
    nftAddr     = await nft.getAddress();
    propertyNFT = await ethers.getContractAt("WillowPropertyNFT", nftAddr);

    const Registry = await ethers.getContractFactory("UOSRegistry");
    const r        = await Registry.deploy(nftAddr, admin.address);
    await r.waitForDeployment();
    regAddr  = await r.getAddress();
    registry = await ethers.getContractAt("UOSRegistry", regAddr);

    await (propertyNFT as any).grantRole(AI_ORACLE_ROLE, regAddr);
    await (registry as any).grantRole(INSPECTOR_ROLE, inspector.address);
    await (propertyNFT as any).mintProperty(admin.address, "WIL-001", "ipfs://meta", "Lagos", 500_000_000n);
  });

  it("records improvement and updates NFT UOS score", async () => {
    await (registry as any).connect(inspector).recordImprovement(
      1n, "Smart Home", 5_000_000n, 15_000_000n, 60n, 75n, "ipfs://evidence"
    );
    const history = await (registry as any).getImprovementHistory(1n);
    expect(history.length).to.equal(1);
    expect(history[0].improvementType).to.equal("Smart Home");
    const nftData = await (propertyNFT as any).getPropertyData(1n);
    expect(nftData.uosScore).to.equal(75n);
  });

  it("accumulates total value added", async () => {
    await (registry as any).connect(inspector).recordImprovement(1n, "Solar", 3_000_000n, 8_000_000n, 60n, 70n, "ipfs://ev2");
    expect(await (registry as any).getTotalValueAdded(1n)).to.equal(8_000_000n);
  });

  it("reverts for non-inspector", async () => {
    await expect(
      (registry as any).connect(other).recordImprovement(1n, "Solar", 1000n, 2000n, 60n, 65n, "ipfs://bad")
    ).to.be.reverted;
  });
});

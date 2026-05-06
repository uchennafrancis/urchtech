import { expect } from "chai";
import { ethers } from "hardhat";
import { WillowPropertyNFT } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("WillowPropertyNFT", () => {
  let nft:      WillowPropertyNFT;
  let admin:    HardhatEthersSigner;
  let owner:    HardhatEthersSigner;
  let aiOracle: HardhatEthersSigner;
  let other:    HardhatEthersSigner;

  const AI_ORACLE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("AI_ORACLE_ROLE"));

  beforeEach(async () => {
    [admin, owner, aiOracle, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("WillowPropertyNFT");
    nft = (await Factory.deploy(admin.address)) as WillowPropertyNFT;
    await nft.waitForDeployment();
    await nft.grantRole(AI_ORACLE_ROLE, aiOracle.address);
  });

  describe("mintProperty", () => {
    it("mints with correct on-chain data", async () => {
      await nft.mintProperty(owner.address, "WIL-001", "ipfs://meta", "Ikoyi, Lagos", 500_000_000n);
      expect(await nft.ownerOf(1)).to.equal(owner.address);
      const d = await nft.getPropertyData(1);
      expect(d.willowPropertyId).to.equal("WIL-001");
      expect(d.location).to.equal("Ikoyi, Lagos");
      expect(d.isVerified).to.be.false;
    });

    it("emits PropertyRegistered", async () => {
      await expect(nft.mintProperty(owner.address, "WIL-001", "ipfs://meta", "Lagos", 1000n))
        .to.emit(nft, "PropertyRegistered")
        .withArgs(1n, "WIL-001", owner.address);
    });

    it("increments tokenCounter", async () => {
      await nft.mintProperty(owner.address, "WIL-001", "ipfs://a", "Lagos", 1000n);
      await nft.mintProperty(owner.address, "WIL-002", "ipfs://b", "Abuja", 2000n);
      expect(await nft.tokenCounter()).to.equal(2n);
    });

    it("reverts for non-admin", async () => {
      await expect(
        nft.connect(other).mintProperty(owner.address, "WIL-001", "ipfs://meta", "Lagos", 1000n)
      ).to.be.reverted;
    });

    it("reverts when paused", async () => {
      await nft.pause();
      await expect(nft.mintProperty(owner.address, "WIL-001", "ipfs://meta", "Lagos", 1000n)).to.be.reverted;
    });
  });

  describe("updateValuation", () => {
    beforeEach(async () => {
      await nft.mintProperty(owner.address, "WIL-001", "ipfs://meta", "Lagos", 1000n);
    });

    it("updates valuation and UOS score", async () => {
      await nft.connect(aiOracle).updateValuation(1, 2000n, 85n);
      const d = await nft.getPropertyData(1);
      expect(d.valuationNaira).to.equal(2000n);
      expect(d.uosScore).to.equal(85n);
    });

    it("emits ValuationUpdated", async () => {
      await expect(nft.connect(aiOracle).updateValuation(1, 2000n, 85n))
        .to.emit(nft, "ValuationUpdated")
        .withArgs(1n, 1000n, 2000n);
    });

    it("reverts for non-oracle", async () => {
      await expect(nft.connect(other).updateValuation(1, 2000n, 85n)).to.be.reverted;
    });
  });

  describe("transferOwnership", () => {
    beforeEach(async () => {
      await nft.mintProperty(owner.address, "WIL-001", "ipfs://meta", "Lagos", 1000n);
    });

    it("transfers NFT and updates propertyOwner", async () => {
      await nft.connect(owner).transferOwnership(1, other.address, 5000n);
      expect(await nft.ownerOf(1)).to.equal(other.address);
      expect(await nft.propertyOwner(1)).to.equal(other.address);
    });

    it("emits OwnershipTransferred", async () => {
      await expect(nft.connect(owner).transferOwnership(1, other.address, 5000n))
        .to.emit(nft, "OwnershipTransferred")
        .withArgs(1n, owner.address, other.address, 5000n);
    });
  });

  describe("setVerified", () => {
    it("marks property as verified", async () => {
      await nft.mintProperty(owner.address, "WIL-001", "ipfs://meta", "Lagos", 1000n);
      await nft.setVerified(1, true);
      expect((await nft.getPropertyData(1)).isVerified).to.be.true;
    });
  });
});

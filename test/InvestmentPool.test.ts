import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("WillowInvestmentPool", () => {
  let admin:     HardhatEthersSigner;
  let investor1: HardhatEthersSigner;
  let investor2: HardhatEthersSigner;

  let usdc:     Awaited<ReturnType<typeof ethers.getContractAt>>;
  let pool:     Awaited<ReturnType<typeof ethers.getContractAt>>;
  let usdcAddr: string;
  let poolAddr: string;

  const MIN    = ethers.parseUnits("100",    6);
  const TARGET = ethers.parseUnits("500000", 6);

  beforeEach(async () => {
    [admin, investor1, investor2] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("ERC20Mock");
    const token = await Token.deploy("USD Coin", "USDC");
    await token.waitForDeployment();
    usdcAddr = await token.getAddress();
    usdc     = await ethers.getContractAt("ERC20Mock", usdcAddr);
    for (const inv of [investor1, investor2]) {
      await (usdc as any).mint(inv.address, ethers.parseUnits("10000", 6));
    }

    const Pool = await ethers.getContractFactory("WillowInvestmentPool");
    const p    = await Pool.deploy("Willow Lagos Growth Pool", TARGET, MIN, usdcAddr, admin.address);
    await p.waitForDeployment();
    poolAddr = await p.getAddress();
    pool     = await ethers.getContractAt("WillowInvestmentPool", poolAddr);
  });

  it("mints pool tokens 1:1 with USDC invested", async () => {
    const amt = ethers.parseUnits("1000", 6);
    await (usdc as any).connect(investor1).approve(poolAddr, amt);
    await (pool as any).connect(investor1).invest(amt);
    expect(await (pool as any).balanceOf(investor1.address)).to.equal(amt);
  });

  it("rejects investment below minimum", async () => {
    const small = ethers.parseUnits("50", 6);
    await (usdc as any).connect(investor1).approve(poolAddr, small);
    await expect((pool as any).connect(investor1).invest(small)).to.be.reverted;
  });

  it("counts unique investors correctly", async () => {
    const amt = ethers.parseUnits("1000", 6);
    for (const inv of [investor1, investor2]) {
      await (usdc as any).connect(inv).approve(poolAddr, amt);
      await (pool as any).connect(inv).invest(amt);
    }
    expect(await (pool as any).investorCount()).to.equal(2n);
  });

  it("rejects invest when pool closed", async () => {
    await (pool as any).closeRound();
    const amt = ethers.parseUnits("1000", 6);
    await (usdc as any).connect(investor1).approve(poolAddr, amt);
    await expect((pool as any).connect(investor1).invest(amt)).to.be.reverted;
  });
});

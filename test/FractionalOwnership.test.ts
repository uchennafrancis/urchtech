import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("WillowFractional", () => {
  let admin:       HardhatEthersSigner;
  let investor1:   HardhatEthersSigner;
  let investor2:   HardhatEthersSigner;
  let distributor: HardhatEthersSigner;

  let usdc:       Awaited<ReturnType<typeof ethers.getContractAt>>;
  let fractional: Awaited<ReturnType<typeof ethers.getContractAt>>;
  let usdcAddr:   string;
  let fracAddr:   string;

  const TOTAL_SHARES = 1_000_000n;
  const YIELD_ROLE   = ethers.keccak256(ethers.toUtf8Bytes("YIELD_DISTRIBUTOR_ROLE"));

  beforeEach(async () => {
    [admin, investor1, investor2, distributor] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("ERC20Mock");
    const token = await Token.deploy("USD Coin", "USDC");
    await token.waitForDeployment();
    usdcAddr = await token.getAddress();
    usdc     = await ethers.getContractAt("ERC20Mock", usdcAddr);
    await (usdc as any).mint(distributor.address, ethers.parseUnits("100000", 6));

    const Fractional = await ethers.getContractFactory("WillowFractional");
    const f = await Fractional.deploy(
      ethers.ZeroAddress, 1n, TOTAL_SHARES,
      "Panorama Heights Token", "PHT",
      usdcAddr,
      [investor1.address, investor2.address],
      [600_000n, 400_000n]
    );
    await f.waitForDeployment();
    fracAddr   = await f.getAddress();
    fractional = await ethers.getContractAt("WillowFractional", fracAddr);
    await (fractional as any).grantRole(YIELD_ROLE, distributor.address);
  });

  it("allocates shares 60/40 to founders", async () => {
    expect(await (fractional as any).balanceOf(investor1.address)).to.equal(600_000n);
    expect(await (fractional as any).balanceOf(investor2.address)).to.equal(400_000n);
  });

  it("distributes and claims yield proportionally", async () => {
    const YIELD = ethers.parseUnits("1000", 6);
    await (usdc as any).connect(distributor).approve(fracAddr, YIELD);
    await (fractional as any).connect(distributor).distributeYield(YIELD);
    await (fractional as any).connect(investor1).claimYield();
    const bal = await (usdc as any).balanceOf(investor1.address);
    expect(bal).to.be.closeTo(YIELD * 60n / 100n, ethers.parseUnits("1", 3));
  });

  it("getShareHolder returns correct percentage (basis points)", async () => {
    const [, pct] = await (fractional as any).getShareHolder(investor1.address);
    expect(pct).to.equal(6000n); // 60.00%
  });
});

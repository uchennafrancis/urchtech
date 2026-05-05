import { expect } from "chai";
import { ethers } from "hardhat";
import { time }   from "@nomicfoundation/hardhat-network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("LeaseAgreement", () => {
  let admin:    HardhatEthersSigner;
  let landlord: HardhatEthersSigner;
  let tenant:   HardhatEthersSigner;
  let other:    HardhatEthersSigner;

  let usdcAddr:  string;
  let leaseAddr: string;
  let usdc:      Awaited<ReturnType<typeof ethers.getContractAt>>;
  let lease:     Awaited<ReturnType<typeof ethers.getContractAt>>;

  const RENT    = ethers.parseUnits("500",  6);
  const DEPOSIT = ethers.parseUnits("1000", 6);

  beforeEach(async () => {
    [admin, landlord, tenant, other] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("ERC20Mock");
    const token = await Token.deploy("USD Coin", "USDC");
    await token.waitForDeployment();
    usdcAddr = await token.getAddress();
    usdc     = await ethers.getContractAt("ERC20Mock", usdcAddr);
    await (usdc as any).mint(tenant.address, ethers.parseUnits("100000", 6));

    const Factory = await ethers.getContractFactory("LeaseFactory");
    const factory = await Factory.deploy(usdcAddr, admin.address);
    await factory.waitForDeployment();

    const tx      = await factory.deployLease(landlord.address, tenant.address, 1n, RENT, DEPOSIT, 12n);
    const receipt = await tx.wait();
    const event   = receipt?.logs.find((l: any) => l.fragment?.name === "LeaseDeployed");
    leaseAddr     = (event as any).args[0];
    lease         = await ethers.getContractAt("LeaseAgreement", leaseAddr);
  });

  it("activates with deposit", async () => {
    await (usdc as any).connect(tenant).approve(leaseAddr, DEPOSIT);
    await (lease as any).connect(tenant).activateLease();
    expect(await (lease as any).isActive()).to.be.true;
    expect(await (lease as any).status()).to.equal(1n);
  });

  it("pays rent directly to landlord", async () => {
    await (usdc as any).connect(tenant).approve(leaseAddr, DEPOSIT);
    await (lease as any).connect(tenant).activateLease();
    await (usdc as any).connect(tenant).approve(leaseAddr, RENT);
    const before = await (usdc as any).balanceOf(landlord.address);
    await (lease as any).connect(tenant).payRent();
    const after = await (usdc as any).balanceOf(landlord.address);
    expect(after - before).to.equal(RENT);
  });

  it("flags overdue after 31 days", async () => {
    await (usdc as any).connect(tenant).approve(leaseAddr, DEPOSIT);
    await (lease as any).connect(tenant).activateLease();
    await time.increase(31 * 24 * 3600);
    expect(await (lease as any).isRentOverdue()).to.be.true;
  });

  it("terminates lease", async () => {
    await (usdc as any).connect(tenant).approve(leaseAddr, DEPOSIT);
    await (lease as any).connect(tenant).activateLease();
    await (lease as any).connect(landlord).terminateLease("Non-payment");
    expect(await (lease as any).status()).to.equal(3n);
  });
});

import { expect } from "chai";
import { ethers } from "hardhat";
import { time }   from "@nomicfoundation/hardhat-network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("ShortletEscrow", () => {
  let admin:    HardhatEthersSigner;
  let host:     HardhatEthersSigner;
  let guest:    HardhatEthersSigner;
  let platform: HardhatEthersSigner;

  let usdc:    Awaited<ReturnType<typeof ethers.getContractAt>>;
  let escrow:  Awaited<ReturnType<typeof ethers.getContractAt>>;
  let usdcAddr: string;
  let escrowAddr: string;

  const TOTAL = ethers.parseUnits("1000", 6);
  const FEE   = (TOTAL * 500n) / 10000n;

  beforeEach(async () => {
    [admin, host, guest, platform] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("ERC20Mock");
    const token = await Token.deploy("USD Coin", "USDC");
    await token.waitForDeployment();
    usdcAddr = await token.getAddress();
    usdc     = await ethers.getContractAt("ERC20Mock", usdcAddr);
    await (usdc as any).mint(guest.address, ethers.parseUnits("100000", 6));

    const Escrow = await ethers.getContractFactory("ShortletEscrow");
    const e      = await Escrow.deploy(usdcAddr, platform.address, admin.address);
    await e.waitForDeployment();
    escrowAddr = await e.getAddress();
    escrow     = await ethers.getContractAt("ShortletEscrow", escrowAddr);
  });

  async function book() {
    const now      = BigInt(await time.latest());
    const checkin  = now + 259200n; // 3 days
    const checkout = checkin + 172800n; // +2 days
    await (usdc as any).connect(guest).approve(escrowAddr, TOTAL);
    const tx      = await (escrow as any).connect(guest).createBooking(host.address, 1n, TOTAL, checkin, checkout, "WIL-BK001");
    const receipt = await tx.wait();
    const event   = receipt?.logs.find((l: any) => l.fragment?.name === "BookingCreated");
    return (event as any).args[0] as string;
  }

  it("holds funds in escrow after booking", async () => {
    await book();
    expect(await (usdc as any).balanceOf(escrowAddr)).to.equal(TOTAL);
  });

  it("releases (total - fee) to host on checkin", async () => {
    const id = await book();
    const b  = await (escrow as any).bookings(id);
    await time.increaseTo(b.checkinTime);
    const before = await (usdc as any).balanceOf(host.address);
    await (escrow as any).connect(host).confirmCheckin(id);
    const after  = await (usdc as any).balanceOf(host.address);
    expect(after - before).to.equal(TOTAL - FEE);
  });

  it("refunds 100% if cancelled >48hrs before checkin", async () => {
    const id     = await book();
    const before = await (usdc as any).balanceOf(guest.address);
    await (escrow as any).connect(guest).requestRefund(id);
    const after  = await (usdc as any).balanceOf(guest.address);
    expect(after - before).to.equal(TOTAL);
  });
});

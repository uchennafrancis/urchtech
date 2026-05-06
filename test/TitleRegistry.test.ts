import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("WillowTitleRegistry", () => {
  let admin:  HardhatEthersSigner;
  let owner:  HardhatEthersSigner;
  let buyer:  HardhatEthersSigner;
  let lender: HardhatEthersSigner;
  let registry: Awaited<ReturnType<typeof ethers.getContractAt>>;

  beforeEach(async () => {
    [admin, owner, buyer, lender] = await ethers.getSigners();
    const Registry = await ethers.getContractFactory("WillowTitleRegistry");
    const r        = await Registry.deploy(admin.address);
    await r.waitForDeployment();
    registry = await ethers.getContractAt("WillowTitleRegistry", await r.getAddress());
  });

  it("registers a title on-chain", async () => {
    await (registry as any).registerTitle(1n, "COO-2023-LG-001", owner.address, 500000n, []);
    const t = await (registry as any).getTitle(1n);
    expect(t.currentOwner).to.equal(owner.address);
    expect(t.titleNumber).to.equal("COO-2023-LG-001");
  });

  it("transfers title to new owner", async () => {
    await (registry as any).registerTitle(1n, "COO-2023-LG-001", owner.address, 500000n, []);
    await (registry as any).connect(owner).transferTitle(1n, buyer.address, 600000n, []);
    expect(await (registry as any).verifyOwnership(1n, buyer.address)).to.be.true;
  });

  it("blocks transfer with active encumbrance", async () => {
    await (registry as any).registerTitle(1n, "COO-2023-LG-001", owner.address, 500000n, []);
    await (registry as any).registerEncumbrance(1n, lender.address, 200000n, BigInt(Math.floor(Date.now() / 1000) + 86400));
    await expect((registry as any).connect(owner).transferTitle(1n, buyer.address, 600000n, [])).to.be.reverted;
  });

  it("allows transfer after encumbrance discharged", async () => {
    await (registry as any).registerTitle(1n, "COO-2023-LG-001", owner.address, 500000n, []);
    await (registry as any).registerEncumbrance(1n, lender.address, 200000n, BigInt(Math.floor(Date.now() / 1000) + 86400));
    await (registry as any).connect(lender).dischargeEncumbrance(1n);
    await expect((registry as any).connect(owner).transferTitle(1n, buyer.address, 600000n, [])).to.not.be.reverted;
  });

  it("records full transfer history", async () => {
    await (registry as any).registerTitle(1n, "COO-2023-LG-001", owner.address, 500000n, []);
    await (registry as any).connect(owner).transferTitle(1n, buyer.address, 600000n, []);
    const history = await (registry as any).getTitleHistory(1n);
    expect(history.length).to.equal(1);
    expect(history[0].from).to.equal(owner.address);
    expect(history[0].to).to.equal(buyer.address);
  });
});

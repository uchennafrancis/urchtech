import { NextRequest, NextResponse } from "next/server";
import { getLeaseFactoryContract } from "@/lib/blockchain";
import { prisma } from "@/lib/prisma";
import { ethers } from "ethers";

export async function POST(req: NextRequest) {
  try {
    const {
      landlordAddress, tenantAddress, nftTokenId,
      monthlyRentUSDC, depositUSDC, durationMonths,
      leaseId,
    } = await req.json();

    const factory = getLeaseFactoryContract();
    const tx      = await factory.deployLease(
      landlordAddress,
      tenantAddress,
      BigInt(nftTokenId),
      ethers.parseUnits(String(monthlyRentUSDC), 6),
      ethers.parseUnits(String(depositUSDC),     6),
      BigInt(durationMonths)
    );
    const receipt = await tx.wait();

    const event       = receipt?.logs?.find((l: { fragment?: { name: string } }) => l?.fragment?.name === "LeaseDeployed");
    const contractAddr = event ? (event as { args: string[] }).args[0] : null;

    if (contractAddr && leaseId) {
      await prisma.lease.update({
        where: { id: leaseId },
        data:  { contractAddress: contractAddr, deployTxHash: receipt?.hash, status: "PENDING" },
      });
    }

    return NextResponse.json({ contractAddress: contractAddr, txHash: receipt?.hash });
  } catch (err) {
    console.error("[create-lease]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

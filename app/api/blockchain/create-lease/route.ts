import { NextRequest, NextResponse } from "next/server";
import { getLeaseFactoryContract } from "@/lib/blockchain";
import { prisma } from "@/lib/prisma";
import { ethers } from "ethers";
import { requireAuth } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  const { error, userId } = await requireAuth("LANDLORD");
  if (error) return error;

  try {
    const {
      landlordAddress, tenantAddress, nftTokenId,
      monthlyRentUSDC, depositUSDC, durationMonths,
      leaseId,
    } = await req.json();

    if (!landlordAddress || !tenantAddress || !nftTokenId || !monthlyRentUSDC || !depositUSDC || !durationMonths) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify the lease belongs to the authenticated user
    if (leaseId) {
      const lease = await prisma.lease.findFirst({ where: { id: leaseId, landlordId: userId } });
      if (!lease) return NextResponse.json({ error: "Lease not found or not owned by you" }, { status: 403 });
    }

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

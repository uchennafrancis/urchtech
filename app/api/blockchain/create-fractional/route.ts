import { NextRequest, NextResponse } from "next/server";
import { getFractionalFactoryContract } from "@/lib/blockchain";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  const { error, userId } = await requireAuth("LANDLORD");
  if (error) return error;

  try {
    const {
      nftTokenId, totalShares, tokenName, tokenSymbol,
      founderAddresses, allocations, propertyId,
    } = await req.json();

    if (!nftTokenId || !totalShares || !tokenName || !tokenSymbol) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (propertyId) {
      const property = await prisma.property.findFirst({ where: { id: propertyId, ownerId: userId } });
      if (!property) return NextResponse.json({ error: "Property not found or not owned by you" }, { status: 403 });
    }

    const factory = getFractionalFactoryContract();
    const tx      = await factory.createFractionalProperty(
      BigInt(nftTokenId),
      BigInt(totalShares),
      tokenName,
      tokenSymbol,
      founderAddresses,
      allocations.map(BigInt)
    );
    const receipt  = await tx.wait();
    const event    = receipt?.logs?.find((l: { fragment?: { name: string } }) => l?.fragment?.name === "FractionalDeployed");
    const fracAddr = event ? (event as { args: string[] }).args[1] : null;

    if (fracAddr && propertyId) {
      await prisma.property.update({ where: { id: propertyId }, data: { fractionalAddr: fracAddr } });
    }

    return NextResponse.json({ fractionalAddress: fracAddr, txHash: receipt?.hash });
  } catch (err) {
    console.error("[create-fractional]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

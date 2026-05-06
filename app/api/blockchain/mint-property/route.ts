import { NextRequest, NextResponse } from "next/server";
import { getPropertyNFTContract } from "@/lib/blockchain";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  const { error, userId } = await requireAuth("LANDLORD");
  if (error) return error;

  try {
    const { willowPropertyId, metadataURI, ownerAddress, valuation, location } = await req.json();

    if (!willowPropertyId || !metadataURI || !ownerAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify the property belongs to the authenticated user
    const property = await prisma.property.findFirst({ where: { id: willowPropertyId, ownerId: userId } });
    if (!property) return NextResponse.json({ error: "Property not found or not owned by you" }, { status: 403 });

    const contract = getPropertyNFTContract();
    const tx       = await contract.mintProperty(
      ownerAddress,
      willowPropertyId,
      metadataURI,
      location || "",
      BigInt(valuation || 0)
    );
    const receipt = await tx.wait();

    // Parse tokenId from event
    const event   = receipt?.logs?.find((l: { fragment?: { name: string } }) => l?.fragment?.name === "PropertyRegistered");
    const tokenId = event ? String((event as { args: [bigint] }).args[0]) : null;

    // Update PostgreSQL
    if (tokenId) {
      await prisma.property.updateMany({
        where:  { willowPropertyId },
        data:   { nftTokenId: tokenId, txHash: receipt?.hash, metadataURI, ownerWallet: ownerAddress },
      });
    }

    return NextResponse.json({
      tokenId,
      txHash:       receipt?.hash,
      blockNumber:  receipt?.blockNumber,
      status:       "minted",
    });
  } catch (err) {
    console.error("[mint-property]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

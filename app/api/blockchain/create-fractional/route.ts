import { NextRequest, NextResponse } from "next/server";
import { getFractionalFactoryContract } from "@/lib/blockchain";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const {
      nftTokenId, totalShares, tokenName, tokenSymbol,
      founderAddresses, allocations, propertyId,
    } = await req.json();

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

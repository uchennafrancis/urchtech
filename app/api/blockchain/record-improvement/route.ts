import { NextRequest, NextResponse } from "next/server";
import { getUOSRegistryContract } from "@/lib/blockchain";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  const { error, userId } = await requireAuth("LANDLORD");
  if (error) return error;

  try {
    const {
      nftTokenId, improvType, cost, valueImpact,
      uosBefore, uosAfter, evidenceIPFS, propertyId,
    } = await req.json();

    const registry = getUOSRegistryContract();
    const tx       = await registry.recordImprovement(
      BigInt(nftTokenId),
      improvType,
      BigInt(cost),
      BigInt(valueImpact),
      BigInt(uosBefore),
      BigInt(uosAfter),
      evidenceIPFS || ""
    );
    const receipt = await tx.wait();

    if (propertyId) {
      await prisma.improvement.updateMany({
        where: { propertyId },
        data:  { txHash: receipt?.hash },
      });
    }

    return NextResponse.json({ txHash: receipt?.hash, status: "recorded" });
  } catch (err) {
    console.error("[record-improvement]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getPropertyNFTContract, getTitleRegistryContract, getUOSRegistryContract, POLYGONSCAN_BASE } from "@/lib/blockchain";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { tokenId: string } }) {
  try {
    const tokenId = BigInt(params.tokenId);

    const nft      = getPropertyNFTContract();
    const title    = getTitleRegistryContract();
    const uos      = getUOSRegistryContract();

    const [propertyData, titleData, improvements] = await Promise.all([
      nft.getPropertyData(tokenId),
      title.getTitle(tokenId).catch(() => null),
      uos.getImprovementHistory(tokenId).catch(() => []),
    ]);

    const dbProperty = await prisma.property.findFirst({
      where: { nftTokenId: String(tokenId) },
    });

    return NextResponse.json({
      tokenId:         String(tokenId),
      onChain:         {
        willowPropertyId: propertyData.willowPropertyId,
        metadataURI:      propertyData.metadataURI,
        location:         propertyData.location,
        valuationNaira:   String(propertyData.valuationNaira),
        uosScore:         String(propertyData.uosScore),
        isVerified:       propertyData.isVerified,
        registeredAt:     String(propertyData.registeredAt),
      },
      title:           titleData ? {
        titleNumber:    titleData.titleNumber,
        currentOwner:   titleData.currentOwner,
        hasEncumbrance: titleData.hasEncumbrance,
        encumbrancer:   titleData.encumbrancer,
      } : null,
      improvements:    improvements.map((imp: {
        improvementType: string; costNaira: bigint;
        valueImpactNaira: bigint; uosScoreAfter: bigint; evidenceIPFS: string; certifiedBy: string;
      }) => ({
        type:        imp.improvementType,
        cost:        String(imp.costNaira),
        valueImpact: String(imp.valueImpactNaira),
        uosAfter:    String(imp.uosScoreAfter),
        evidence:    imp.evidenceIPFS,
        certifiedBy: imp.certifiedBy,
      })),
      database:        dbProperty,
      polygonscanLink: `${POLYGONSCAN_BASE}/token/${process.env.NEXT_PUBLIC_PROPERTY_REGISTRY_ADDRESS}?a=${tokenId}`,
    });
  } catch (err) {
    console.error("[property/tokenId]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

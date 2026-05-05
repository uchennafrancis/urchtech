import { NextRequest, NextResponse } from "next/server";
import { getPropertyNFTContract, getTitleRegistryContract } from "@/lib/blockchain";

export async function POST(req: NextRequest) {
  try {
    const { nftTokenId, newOwnerAddress, salePrice, documentIPFSHashes } = await req.json();

    const nft      = getPropertyNFTContract();
    const registry = getTitleRegistryContract();

    // Transfer NFT ownership on-chain
    const tx1     = await nft.transferOwnership(BigInt(nftTokenId), newOwnerAddress, BigInt(salePrice || 0));
    const receipt1 = await tx1.wait();

    // Transfer title record
    const tx2      = await registry.transferTitle(
      BigInt(nftTokenId),
      newOwnerAddress,
      BigInt(salePrice || 0),
      documentIPFSHashes || []
    );
    const receipt2 = await tx2.wait();

    return NextResponse.json({
      nftTxHash:   receipt1?.hash,
      titleTxHash: receipt2?.hash,
      status:      "transferred",
    });
  } catch (err) {
    console.error("[transfer-title]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

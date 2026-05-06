import { NextRequest, NextResponse } from "next/server";
import { getPropertyNFTContract, getFractionalFactoryContract, getLeaseFactoryContract } from "@/lib/blockchain";
import { requireAuth } from "@/lib/api-auth";

export async function GET(_req: NextRequest, { params }: { params: { address: string } }) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const address = params.address;

    const nft             = getPropertyNFTContract();
    const fractionalFact  = getFractionalFactoryContract();
    const leaseFact       = getLeaseFactoryContract();

    const tokenCounter = await nft.tokenCounter();
    const ownedNFTs: { tokenId: string; data: unknown }[] = [];

    for (let i = 1n; i <= tokenCounter; i++) {
      try {
        const owner = await nft.ownerOf(i);
        if (owner.toLowerCase() === address.toLowerCase()) {
          const data = await nft.getPropertyData(i);
          ownedNFTs.push({ tokenId: String(i), data });
        }
      } catch { /* token may not exist */ }
    }

    const allFractionals = await fractionalFact.getAllFractionalContracts();
    const landlordLeases = await leaseFact.getLeasesForLandlord(address);
    const tenantLeases   = await leaseFact.getLeasesForTenant(address);

    return NextResponse.json({
      address,
      ownedPropertyNFTs:   ownedNFTs,
      fractionalContracts: allFractionals,
      landlordLeases,
      tenantLeases,
    });
  } catch (err) {
    console.error("[wallet/address]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

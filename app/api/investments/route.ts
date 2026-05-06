import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { error, userId } = await requireAuth();
  if (error) return error;

  const investments = await prisma.investment.findMany({
    where:   { investorId: userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(investments);
}

export async function POST(req: Request) {
  const { error, userId } = await requireAuth("INVESTOR");
  if (error) return error;

  const body = await req.json();
  const { poolAddress, propertyId, usdcAmount } = body;

  if (!usdcAmount || (!poolAddress && !propertyId)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const investment = await prisma.investment.create({
    data: {
      investorId:  userId,
      poolAddress: poolAddress ?? null,
      propertyId:  propertyId ?? null,
      usdcAmount:  BigInt(usdcAmount),
    },
  });

  return NextResponse.json(investment, { status: 201 });
}

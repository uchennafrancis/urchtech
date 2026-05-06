import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { error, userId, role } = await requireAuth();
  if (error) return error;

  const where = role === "LANDLORD" || role === "ADMIN"
    ? { landlordId: userId }
    : { tenantId:   userId };

  const leases = await prisma.lease.findMany({
    where,
    include: {
      property: { select: { id: true, title: true, location: true, nftTokenId: true } },
      tenant:   { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(leases);
}

export async function POST(req: Request) {
  const { error, userId } = await requireAuth("LANDLORD");
  if (error) return error;

  const body = await req.json();
  const { propertyId, tenantId, monthlyRentUSDC, depositUSDC, durationMonths } = body;

  if (!propertyId || !monthlyRentUSDC || !depositUSDC || !durationMonths) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify caller owns the property
  const property = await prisma.property.findFirst({ where: { id: propertyId, ownerId: userId } });
  if (!property) return NextResponse.json({ error: "Property not found or not owned by you" }, { status: 403 });

  const lease = await prisma.lease.create({
    data: {
      propertyId,
      landlordId:     userId,
      tenantId:       tenantId ?? null,
      monthlyRentUSDC: BigInt(monthlyRentUSDC),
      depositUSDC:    BigInt(depositUSDC),
      durationMonths: Number(durationMonths),
      status:         "PENDING",
    },
  });

  return NextResponse.json(lease, { status: 201 });
}

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { error, userId } = await requireAuth();
  if (error) return error;

  const properties = await prisma.property.findMany({
    where: { ownerId: userId },
    include: {
      tenants:  { where: { status: "ACTIVE" }, take: 1 },
      leases:   { orderBy: { createdAt: "desc" }, take: 1 },
      payments: { where: { status: "PENDING" }, take: 5 },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(properties);
}

export async function POST(req: Request) {
  const { error, userId } = await requireAuth("LANDLORD");
  if (error) return error;

  const body = await req.json();
  const { title, location, city, state, propertyType, bedrooms, bathrooms, sqm, price, listingType } = body;

  if (!title || !location || !city || !state || !propertyType || price === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const property = await prisma.property.create({
    data: {
      ownerId: userId,
      title,
      location,
      city,
      state,
      propertyType,
      bedrooms:    bedrooms    ? Number(bedrooms)    : undefined,
      bathrooms:   bathrooms   ? Number(bathrooms)   : undefined,
      sqm:         sqm         ? Number(sqm)         : undefined,
      price:       BigInt(price),
      listingType: listingType ?? "BUY",
    },
  });

  return NextResponse.json(property, { status: 201 });
}

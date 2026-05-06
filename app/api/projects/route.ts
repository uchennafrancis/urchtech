import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { error, userId } = await requireAuth();
  if (error) return error;

  const company = await prisma.company.findUnique({ where: { ownerId: userId } });
  if (!company) return NextResponse.json([]);

  const projects = await prisma.project.findMany({
    where:   { companyId: company.id },
    include: { units: { orderBy: { unitNumber: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const { error, userId } = await requireAuth("DEVELOPER");
  if (error) return error;

  const body = await req.json();
  const { name, location, totalUnits, priceFrom, priceTo } = body;

  if (!name || !location || !totalUnits || priceFrom === undefined || priceTo === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  let company = await prisma.company.findUnique({ where: { ownerId: userId } });
  if (!company) {
    company = await prisma.company.create({
      data: { ownerId: userId, name: body.companyName || name, type: "DEVELOPER", city: body.city || location },
    });
  }

  const project = await prisma.project.create({
    data: {
      companyId:      company.id,
      name,
      location,
      totalUnits:     Number(totalUnits),
      availableUnits: Number(totalUnits),
      priceFrom:      BigInt(priceFrom),
      priceTo:        BigInt(priceTo),
      status:         body.status ?? "PLANNING",
    },
  });

  return NextResponse.json(project, { status: 201 });
}

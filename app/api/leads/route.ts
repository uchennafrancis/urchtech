import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const { error, userId, role } = await requireAuth();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: Record<string, unknown> = role === "ADMIN"
      ? (status ? { status } : {})
      : { agentId: userId, ...(status ? { status } : {}) };

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: 100,
    });
    return NextResponse.json(leads);
  } catch (err) {
    console.error("[leads GET]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { error, userId } = await requireAuth();
  if (error) return error;

  try {
    const { name, email, phone, message, propertyId, source } = await req.json();
    if (!name || !email) {
      return NextResponse.json({ error: "Name and email required" }, { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: { name, email, phone, message, propertyId, source, agentId: userId, status: "NEW" },
    });
    return NextResponse.json(lead, { status: 201 });
  } catch (err) {
    console.error("[leads POST]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: "id and status required" }, { status: 400 });
    }
    const lead = await prisma.lead.update({ where: { id }, data: { status } });
    return NextResponse.json(lead);
  } catch (err) {
    console.error("[leads PATCH]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

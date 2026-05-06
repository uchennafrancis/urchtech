import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function GET() {
  const { error } = await requireAuth("ADMIN");
  if (error) return error;

  try {
    const [
      totalUsers,
      usersByRole,
      totalProperties,
      totalLeases,
      totalInvestments,
      totalLeads,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({ by: ["role"], _count: { id: true } }),
      prisma.property.count(),
      prisma.lease.count(),
      prisma.investment.count(),
      prisma.lead.count(),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
    ]);

    const roleCounts = Object.fromEntries(
      usersByRole.map(r => [r.role, r._count.id])
    );

    return NextResponse.json({
      totalUsers,
      roleCounts,
      totalProperties,
      totalLeases,
      totalInvestments,
      totalLeads,
      recentUsers,
    });
  } catch (err) {
    console.error("[admin/stats]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

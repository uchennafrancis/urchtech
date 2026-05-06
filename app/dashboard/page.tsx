"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const ROLE_ROUTES: Record<string, string> = {
  LANDLORD:  "/dashboard/landlord",
  INVESTOR:  "/dashboard/investor",
  DEVELOPER: "/dashboard/developer",
  BUYER:     "/dashboard/buyer",
  AGENT:     "/dashboard/agent",
  ADMIN:     "/dashboard/admin",
};

export default function DashboardRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") {
      const role = (session?.user as { role?: string })?.role ?? "BUYER";
      router.push(ROLE_ROUTES[role] ?? "/dashboard/buyer");
    }
  }, [status, session, router]);

  return (
    <div className="min-h-screen bg-[#060C07] flex items-center justify-center">
      <div className="text-[#C9A84C] font-playfair text-xl animate-pulse">Redirecting…</div>
    </div>
  );
}

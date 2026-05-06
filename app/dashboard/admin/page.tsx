"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { WalletButton } from "@/components/web3/WalletButton";
import Link from "next/link";

interface AdminStats {
  totalUsers:       number;
  roleCounts:       Record<string, number>;
  totalProperties:  number;
  totalLeases:      number;
  totalInvestments: number;
  totalLeads:       number;
  recentUsers:      { id: string; name: string | null; email: string; role: string; createdAt: string }[];
}

const ROLE_COLORS: Record<string, string> = {
  BUYER:     "text-[#3DBA78] bg-[rgba(61,186,120,0.1)]",
  LANDLORD:  "text-[#C9A84C] bg-[rgba(201,168,76,0.1)]",
  INVESTOR:  "text-[#a970ff] bg-[rgba(130,71,229,0.12)]",
  AGENT:     "text-[#fbbf24] bg-[rgba(251,191,36,0.1)]",
  DEVELOPER: "text-[#60a5fa] bg-[rgba(96,165,250,0.1)]",
  ADMIN:     "text-[#E05252] bg-[rgba(224,82,82,0.1)]",
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"overview" | "users" | "activity">("overview");
  const [stats, setStats]   = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  const role = (session?.user as { role?: string })?.role;

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && role && role !== "ADMIN") router.push("/dashboard");
  }, [status, role, router]);

  useEffect(() => {
    if (status !== "authenticated" || role !== "ADMIN") return;
    fetch("/api/admin/stats")
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(setStats)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, [status, role]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#060C07] flex items-center justify-center">
        <div className="text-[#C9A84C] font-playfair text-xl animate-pulse">Loading admin…</div>
      </div>
    );
  }

  const kpis = [
    { label: "Total Users",       value: String(stats?.totalUsers ?? 0),       icon: "👥" },
    { label: "Properties",        value: String(stats?.totalProperties ?? 0),   icon: "🏠" },
    { label: "Active Leases",     value: String(stats?.totalLeases ?? 0),       icon: "📄" },
    { label: "Investments",       value: String(stats?.totalInvestments ?? 0),  icon: "💎" },
  ];

  const roleBreakdown = [
    { role: "BUYER",     label: "Buyers" },
    { role: "LANDLORD",  label: "Landlords" },
    { role: "INVESTOR",  label: "Investors" },
    { role: "AGENT",     label: "Agents" },
    { role: "DEVELOPER", label: "Developers" },
    { role: "ADMIN",     label: "Admins" },
  ];

  const totalUsers = stats?.totalUsers ?? 0;

  return (
    <div className="min-h-screen bg-[#060C07] text-[#EDE9E1]">
      <header className="border-b border-[rgba(201,168,76,0.12)] px-6 py-4 flex items-center justify-between bg-[#0C1410]">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-playfair text-[#C9A84C] font-bold text-lg tracking-widest">WILLOW</Link>
          <span className="text-[#7A9175]">/</span>
          <span className="text-[#7A9175] text-sm">Admin Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-[rgba(224,82,82,0.1)] text-[#E05252] border border-[rgba(224,82,82,0.3)] text-xs px-2.5 py-1 rounded-full font-medium">
            ADMIN
          </span>
          <WalletButton />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="font-playfair text-3xl text-[#EDE9E1]">Platform Overview</h1>
          <p className="text-[#7A9175] text-sm mt-1">Willow — Africa&apos;s Real Estate Intelligence OS</p>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map(k => (
            <div key={k.label} className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-5">
              <div className="text-2xl mb-2">{k.icon}</div>
              <div className="font-playfair text-3xl text-[#C9A84C] font-bold">{k.value}</div>
              <div className="text-[#7A9175] text-xs mt-1 uppercase tracking-wider">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[rgba(201,168,76,0.12)]">
          {([
            { key: "overview",  label: "Platform Overview" },
            { key: "users",     label: "Users" },
            { key: "activity",  label: "Recent Activity" },
          ] as const).map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-[#C9A84C] text-[#C9A84C]"
                  : "border-transparent text-[#7A9175] hover:text-[#EDE9E1]"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-[rgba(224,82,82,0.1)] border border-[rgba(224,82,82,0.3)] rounded-xl p-4 text-[#E05252] text-sm">
            {error}
          </div>
        )}

        {/* Overview tab */}
        {activeTab === "overview" && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* User breakdown */}
            <div className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-5 space-y-4">
              <h3 className="font-playfair text-lg text-[#EDE9E1]">Users by Role</h3>
              {roleBreakdown.map(r => {
                const count = stats?.roleCounts?.[r.role] ?? 0;
                const pct   = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
                return (
                  <div key={r.role} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${ROLE_COLORS[r.role] ?? "text-[#7A9175]"}`}>
                        {r.label}
                      </span>
                      <span className="text-[#EDE9E1] font-medium">{count}</span>
                    </div>
                    <div className="bg-[rgba(255,255,255,0.04)] rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-[#C9A84C] transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Platform metrics */}
            <div className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-5 space-y-3">
              <h3 className="font-playfair text-lg text-[#EDE9E1]">Platform Metrics</h3>
              {[
                { label: "Total Leads",         value: String(stats?.totalLeads ?? 0),       icon: "📥" },
                { label: "Active Leases",        value: String(stats?.totalLeases ?? 0),      icon: "📋" },
                { label: "Investments Recorded", value: String(stats?.totalInvestments ?? 0), icon: "💼" },
                { label: "Properties Listed",    value: String(stats?.totalProperties ?? 0),  icon: "🏘️" },
              ].map(m => (
                <div key={m.label} className="flex items-center justify-between py-2.5 border-b border-[rgba(201,168,76,0.06)] last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{m.icon}</span>
                    <span className="text-[#7A9175] text-sm">{m.label}</span>
                  </div>
                  <span className="font-playfair text-xl text-[#C9A84C] font-bold">{m.value}</span>
                </div>
              ))}
            </div>

            {/* Quick links */}
            <div className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-5 space-y-3 md:col-span-2">
              <h3 className="font-playfair text-lg text-[#EDE9E1]">Admin Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Browse Market",     href: "/market",       icon: "🏠" },
                  { label: "Chain Explorer",    href: "/chain",        icon: "🔗" },
                  { label: "Neighbourhood Map", href: "/neighbourhood", icon: "📍" },
                  { label: "Run AI Valuation",  href: "/valuation",    icon: "🤖" },
                ].map(a => (
                  <Link key={a.label} href={a.href}
                    className="bg-[#0C1410] hover:bg-[rgba(201,168,76,0.06)] border border-[rgba(201,168,76,0.12)] hover:border-[rgba(201,168,76,0.3)] rounded-xl p-4 text-center transition-all group">
                    <div className="text-2xl mb-2">{a.icon}</div>
                    <div className="text-[#7A9175] group-hover:text-[#C9A84C] text-xs transition-colors">{a.label}</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users tab */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {roleBreakdown.map(r => (
                <div key={r.role} className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-4 text-center">
                  <div className="font-playfair text-2xl text-[#C9A84C] font-bold">
                    {stats?.roleCounts?.[r.role] ?? 0}
                  </div>
                  <div className={`text-xs mt-1 px-1.5 py-0.5 rounded inline-block ${ROLE_COLORS[r.role] ?? "text-[#7A9175]"}`}>
                    {r.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-[rgba(201,168,76,0.08)]">
                <h3 className="text-[#EDE9E1] font-medium">Recent Registrations</h3>
              </div>
              {(stats?.recentUsers?.length ?? 0) === 0 ? (
                <p className="p-8 text-[#7A9175] text-sm text-center">No users found.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="border-b border-[rgba(201,168,76,0.08)]">
                    <tr>
                      {["Name", "Email", "Role", "Joined"].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-[#7A9175] text-xs uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(201,168,76,0.04)]">
                    {(stats?.recentUsers ?? []).map(u => (
                      <tr key={u.id} className="hover:bg-[rgba(201,168,76,0.02)] transition-colors">
                        <td className="px-5 py-3 text-[#EDE9E1] font-medium">{u.name ?? "—"}</td>
                        <td className="px-5 py-3 text-[#7A9175]">{u.email}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${ROLE_COLORS[u.role] ?? "text-[#7A9175]"}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-[#7A9175] text-xs">
                          {new Date(u.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Activity tab */}
        {activeTab === "activity" && (
          <div className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-5 space-y-3">
            <h3 className="font-playfair text-lg text-[#EDE9E1]">Platform Activity Feed</h3>
            <div className="space-y-3">
              {[
                { icon: "🏠", text: "New property listed in Lekki Phase 1",          time: "2 min ago",  color: "text-[#3DBA78]" },
                { icon: "📄", text: "Lease contract deployed — Ikoyi, Block A",       time: "14 min ago", color: "text-[#a970ff]" },
                { icon: "💎", text: "Investment of $5,000 USDC recorded",             time: "31 min ago", color: "text-[#C9A84C]" },
                { icon: "🔗", text: "Property NFT minted — Token #042",               time: "1 hr ago",   color: "text-[#a970ff]" },
                { icon: "👤", text: "New user registered — Investor role",            time: "2 hr ago",   color: "text-[#EDE9E1]" },
                { icon: "🏗️", text: "Fractional contract deployed — Skyline Ph1",    time: "3 hr ago",   color: "text-[#C9A84C]" },
                { icon: "📥", text: "New lead captured — 3BR Banana Island enquiry", time: "4 hr ago",   color: "text-[#fbbf24]" },
                { icon: "✅", text: "Unit sold — Skyline Phase 1, Unit B-04",        time: "5 hr ago",   color: "text-[#3DBA78]" },
              ].map((a, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5 border-b border-[rgba(201,168,76,0.06)] last:border-0">
                  <span className="text-lg flex-shrink-0">{a.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm ${a.color}`}>{a.text}</div>
                    <div className="text-[#7A9175] text-xs mt-0.5">{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { WalletButton } from "@/components/web3/WalletButton";
import { formatNairaDisplay, truncateAddr } from "@/lib/web3";
import Link from "next/link";

interface Unit {
  id: string;
  unitNumber: string;
  type: string;
  bedrooms: number;
  sqm: number;
  price: string;
  status: string;
  buyerId: string | null;
}

interface Project {
  id: string;
  name: string;
  location: string;
  totalUnits: number;
  soldUnits: number;
  availableUnits: number;
  reservedUnits: number;
  constructionPct: number;
  status: string;
  priceFrom: string;
  priceTo: string;
  units: Unit[];
}

export default function DeveloperDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"projects" | "units" | "tokenise">("projects");
  const [projects, setProjects]   = useState<Project[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/projects")
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(setProjects)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, [status]);

  const allUnits     = projects.flatMap(p => p.units);
  const soldUnits    = allUnits.filter(u => u.status === "SOLD");
  const totalRevenue = soldUnits.reduce((s, u) => s + BigInt(u.price), 0n);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#060C07] flex items-center justify-center">
        <div className="text-[#C9A84C] font-playfair text-xl animate-pulse">Loading projects…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060C07] text-[#EDE9E1]">
      <header className="border-b border-[rgba(201,168,76,0.12)] px-6 py-4 flex items-center justify-between bg-[#0C1410]">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-playfair text-[#C9A84C] font-bold text-lg tracking-widest">WILLOW</Link>
          <span className="text-[#7A9175]">/</span>
          <span className="text-[#7A9175] text-sm">Developer Dashboard</span>
        </div>
        <WalletButton />
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="font-playfair text-3xl text-[#EDE9E1]">
            Welcome back, {session?.user?.name?.split(" ")[0] ?? "Developer"}
          </h1>
          <p className="text-[#7A9175] text-sm mt-1">Your development projects and sales pipeline.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Projects",     value: String(projects.length),  icon: "🏗️" },
            { label: "Total Units",  value: String(allUnits.length),  icon: "🏢" },
            { label: "Units Sold",   value: String(soldUnits.length), icon: "✅" },
            { label: "Revenue",      value: formatNairaDisplay(totalRevenue), icon: "💰" },
          ].map(s => (
            <div key={s.label} className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-5">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="font-playfair text-3xl text-[#C9A84C] font-bold">{s.value}</div>
              <div className="text-[#7A9175] text-xs mt-1 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-1 border-b border-[rgba(201,168,76,0.12)]">
          {[
            { key: "projects",  label: "Projects" },
            { key: "units",     label: "Unit Matrix" },
            { key: "tokenise",  label: "🔗 Tokenise" },
          ].map(tab => (
            <button key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
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
            Failed to load projects: {error}
          </div>
        )}

        {activeTab === "projects" && (
          <div className="space-y-5">
            {projects.length === 0 ? (
              <div className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-12 text-center space-y-3">
                <div className="text-4xl">🏗️</div>
                <p className="text-[#7A9175]">No projects yet. Create your first development project.</p>
              </div>
            ) : (
              projects.map(p => {
                const soldPct = p.totalUnits > 0 ? Math.round((p.soldUnits / p.totalUnits) * 100) : 0;
                return (
                  <div key={p.id} className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-6 space-y-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-playfair text-xl text-[#EDE9E1]">{p.name}</h3>
                        <p className="text-[#7A9175] text-sm">📍 {p.location}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${
                        p.status === "SALES"        ? "bg-[rgba(201,168,76,0.15)] text-[#C9A84C]" :
                        p.status === "CONSTRUCTION" ? "bg-[rgba(130,71,229,0.15)] text-[#a970ff]" :
                        p.status === "COMPLETE"     ? "bg-[rgba(61,186,120,0.12)] text-[#3DBA78]" :
                                                      "bg-[rgba(122,145,117,0.1)] text-[#7A9175]"
                      }`}>{p.status}</span>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { label: "Total",     value: p.totalUnits },
                        { label: "Sold",      value: p.soldUnits },
                        { label: "Available", value: p.availableUnits },
                        { label: "Reserved",  value: p.reservedUnits },
                      ].map(s => (
                        <div key={s.label} className="bg-[#0C1410] rounded-lg p-3 text-center">
                          <div className="font-playfair text-xl text-[#C9A84C] font-bold">{s.value}</div>
                          <div className="text-[#7A9175] text-xs">{s.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-[#7A9175]">
                        <span>Sales Progress</span><span>{soldPct}%</span>
                      </div>
                      <div className="bg-[rgba(255,255,255,0.06)] rounded-full h-2">
                        <div className="h-2 rounded-full bg-[#C9A84C]" style={{ width: `${soldPct}%` }} />
                      </div>
                    </div>

                    {p.constructionPct > 0 && p.constructionPct < 100 && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-[#7A9175]">
                          <span>Construction</span><span>{p.constructionPct}%</span>
                        </div>
                        <div className="bg-[rgba(255,255,255,0.06)] rounded-full h-2">
                          <div className="h-2 rounded-full bg-[#a970ff]" style={{ width: `${p.constructionPct}%` }} />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between text-sm">
                      <span className="text-[#7A9175]">Price range</span>
                      <span className="text-[#EDE9E1]">
                        {formatNairaDisplay(BigInt(p.priceFrom))} – {formatNairaDisplay(BigInt(p.priceTo))}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === "units" && (
          <div>
            {allUnits.length === 0 ? (
              <div className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-10 text-center text-[#7A9175]">
                No units found. Add units to your projects.
              </div>
            ) : (
              <div className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="border-b border-[rgba(201,168,76,0.12)]">
                    <tr>
                      {["Unit", "Type", "Beds", "Sqm", "Price", "Status"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-[#7A9175] text-xs uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(201,168,76,0.06)]">
                    {allUnits.map(u => (
                      <tr key={u.id} className="hover:bg-[rgba(201,168,76,0.03)] transition-colors">
                        <td className="px-4 py-3 font-mono text-[#EDE9E1]">{u.unitNumber}</td>
                        <td className="px-4 py-3 text-[#7A9175]">{u.type}</td>
                        <td className="px-4 py-3 text-[#7A9175]">{u.bedrooms}</td>
                        <td className="px-4 py-3 text-[#7A9175]">{u.sqm}</td>
                        <td className="px-4 py-3 text-[#C9A84C] font-medium">{formatNairaDisplay(BigInt(u.price))}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            u.status === "SOLD"     ? "bg-[rgba(61,186,120,0.12)] text-[#3DBA78]" :
                            u.status === "RESERVED" ? "bg-[rgba(251,191,36,0.1)] text-[#fbbf24]" :
                                                      "bg-[rgba(122,145,117,0.1)] text-[#7A9175]"
                          }`}>{u.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "tokenise" && (
          <div className="space-y-4">
            <div className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-6 space-y-5">
              <div>
                <h3 className="font-playfair text-xl text-[#EDE9E1]">Tokenise a Project</h3>
                <p className="text-[#7A9175] text-sm mt-1">Deploy fractional ERC-20 tokens for a project to enable on-chain investment.</p>
              </div>
              {projects.length === 0 ? (
                <p className="text-[#7A9175] text-sm">Create a project first before tokenising.</p>
              ) : (
                <form className="space-y-4" onSubmit={e => e.preventDefault()}>
                  <div className="space-y-1.5">
                    <label className="text-[#7A9175] text-sm">Select Project</label>
                    <select className="w-full bg-[#0C1410] border border-[rgba(201,168,76,0.15)] rounded-lg px-4 py-3 text-[#EDE9E1] text-sm focus:outline-none focus:border-[#C9A84C]">
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[#7A9175] text-sm">Token Name</label>
                      <input placeholder="e.g. Skyline Phase 1" className="w-full bg-[#0C1410] border border-[rgba(201,168,76,0.15)] rounded-lg px-4 py-3 text-[#EDE9E1] placeholder-[#7A9175] text-sm focus:outline-none focus:border-[#C9A84C]" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[#7A9175] text-sm">Symbol</label>
                      <input placeholder="e.g. SKY1" className="w-full bg-[#0C1410] border border-[rgba(201,168,76,0.15)] rounded-lg px-4 py-3 text-[#EDE9E1] placeholder-[#7A9175] text-sm focus:outline-none focus:border-[#C9A84C]" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[#7A9175] text-sm">Total Shares</label>
                    <input type="number" placeholder="1000000" className="w-full bg-[#0C1410] border border-[rgba(201,168,76,0.15)] rounded-lg px-4 py-3 text-[#EDE9E1] placeholder-[#7A9175] text-sm focus:outline-none focus:border-[#C9A84C]" />
                  </div>
                  <button type="submit" className="w-full bg-[#C9A84C] hover:bg-[#d4b560] text-[#060C07] py-3 rounded-xl font-bold transition-colors">
                    Deploy Fractional Contract
                  </button>
                </form>
              )}
            </div>

            {soldUnits.length > 0 && (
              <div className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-5 space-y-3">
                <h3 className="text-[#EDE9E1] font-medium">On-Chain Sales</h3>
                <div className="space-y-2">
                  {soldUnits.slice(0, 10).map(u => (
                    <div key={u.id} className="flex items-center justify-between py-2 border-b border-[rgba(201,168,76,0.06)] last:border-0">
                      <div>
                        <div className="text-[#EDE9E1] text-sm">Unit {u.unitNumber}</div>
                        {u.buyerId && <div className="text-[#7A9175] text-xs font-mono">{truncateAddr(u.buyerId)}</div>}
                      </div>
                      <span className="text-[#C9A84C] font-medium text-sm">{formatNairaDisplay(BigInt(u.price))}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

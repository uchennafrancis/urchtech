"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { WalletButton } from "@/components/web3/WalletButton";
import { formatNairaDisplay } from "@/lib/web3";
import Link from "next/link";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  status: string;
}

interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  bedrooms: number | null;
  sqm: number | null;
  listingStatus: string;
  propertyType: string;
}

type AgentTab = "pipeline" | "listings" | "commission";

const LEAD_GROUPS: { label: string; statuses: string[] }[] = [
  { label: "New & Warm", statuses: ["NEW", "WARM"] },
  { label: "Active",     statuses: ["HOT", "VIEWING_BOOKED", "VIEWING_DONE"] },
  { label: "Closing",    statuses: ["OFFER_MADE", "RESERVED", "CONTRACT_SIGNED"] },
  { label: "Completed",  statuses: ["COMPLETED", "CLOSED"] },
];

const COMMISSION_DEALS = [
  { property: "3BR Lekki Ph1",  client: "Mr. Adebayo",   value: "₦145M",  commission: "₦7.25M",  date: "Apr 2026" },
  { property: "4BR Ikoyi",      client: "Mrs. Okonkwo",  value: "₦280M",  commission: "₦14M",    date: "Apr 2026" },
  { property: "2BR VI",         client: "Dr. Eze",       value: "₦95M",   commission: "₦4.75M",  date: "Mar 2026" },
  { property: "5BR Banana Isl", client: "Chief Lawal",   value: "₦650M",  commission: "₦32.5M",  date: "Mar 2026" },
  { property: "3BR Ajah",       client: "Ms. Ibrahim",   value: "₦78M",   commission: "₦3.9M",   date: "Feb 2026" },
];

function leadStatusBadgeClass(status: string): string {
  switch (status) {
    case "HOT":              return "bg-[rgba(201,168,76,0.15)] text-[#C9A84C] border border-[rgba(201,168,76,0.3)]";
    case "NEW":              return "bg-[rgba(130,71,229,0.12)] text-[#a970ff] border border-[rgba(130,71,229,0.3)]";
    case "WARM":             return "bg-[rgba(251,191,36,0.1)] text-[#fbbf24] border border-[rgba(251,191,36,0.3)]";
    case "VIEWING_BOOKED":
    case "VIEWING_DONE":     return "bg-[rgba(251,191,36,0.1)] text-[#fbbf24] border border-[rgba(251,191,36,0.3)]";
    case "OFFER_MADE":
    case "RESERVED":         return "bg-[rgba(201,168,76,0.15)] text-[#C9A84C] border border-[rgba(201,168,76,0.3)]";
    case "CONTRACT_SIGNED":
    case "COMPLETED":
    case "CLOSED":           return "bg-[rgba(61,186,120,0.12)] text-[#3DBA78] border border-[rgba(61,186,120,0.3)]";
    default:                 return "bg-[rgba(122,145,117,0.1)] text-[#7A9175] border border-[rgba(122,145,117,0.2)]";
  }
}

function listingStatusBadgeClass(status: string): string {
  switch (status) {
    case "ACTIVE":    return "bg-[rgba(61,186,120,0.12)] text-[#3DBA78] border border-[rgba(61,186,120,0.3)]";
    case "SOLD":      return "bg-[rgba(224,82,82,0.12)] text-[#E05252] border border-[rgba(224,82,82,0.3)]";
    case "RESERVED":  return "bg-[rgba(251,191,36,0.1)] text-[#fbbf24] border border-[rgba(251,191,36,0.3)]";
    default:          return "bg-[rgba(122,145,117,0.1)] text-[#7A9175] border border-[rgba(122,145,117,0.2)]";
  }
}

export default function AgentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab]   = useState<AgentTab>("pipeline");
  const [leads, setLeads]           = useState<Lead[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchLeads = fetch("/api/leads")
      .then(r => {
        if (!r.ok) return [];
        return r.json();
      })
      .catch(() => [])
      .then((data: Lead[]) => setLeads(data));

    const fetchProps = fetch("/api/properties")
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then((data: Property[]) => setProperties(data))
      .catch(() => setProperties([]));

    Promise.all([fetchLeads, fetchProps]).finally(() => setLoading(false));
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#060C07] flex items-center justify-center">
        <div className="text-[#C9A84C] font-playfair text-xl animate-pulse">Loading dashboard…</div>
      </div>
    );
  }

  // Stats derived from data
  const activeLeadsCount = leads.filter(l =>
    ["HOT", "VIEWING_BOOKED", "VIEWING_DONE", "OFFER_MADE", "RESERVED"].includes(l.status)
  ).length;
  const dealsClosedThisMonth = 2; // hardcoded (Apr 2026 deals = 2)
  const commissionThisMonth  = "₦2,450,000";

  const listingsToShow = properties.slice(0, 8);

  return (
    <div className="min-h-screen bg-[#060C07] text-[#EDE9E1]">
      {/* Header */}
      <header className="border-b border-[rgba(201,168,76,0.12)] px-6 py-4 flex items-center justify-between bg-[#0C1410]">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-playfair text-[#C9A84C] font-bold text-lg tracking-widest">WILLOW</Link>
          <span className="text-[#7A9175]">/</span>
          <span className="text-[#7A9175] text-sm">Agent Dashboard</span>
        </div>
        <WalletButton />
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Greeting */}
        <div>
          <h1 className="font-playfair text-3xl text-[#EDE9E1]">
            Welcome back, {session?.user?.name?.split(" ")[0] ?? "Agent"}
          </h1>
          <p className="text-[#7A9175] text-sm mt-1">Your pipeline and commission at a glance.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Leads",         value: String(activeLeadsCount),    icon: "👤" },
            { label: "Properties Listed",    value: String(properties.length),   icon: "🏠" },
            { label: "Deals Closed (Month)", value: String(dealsClosedThisMonth), icon: "🤝" },
            { label: "Commission Earned",    value: commissionThisMonth,          icon: "💰" },
          ].map(s => (
            <div key={s.label} className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-5">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="font-playfair text-2xl text-[#C9A84C] font-bold leading-tight">{s.value}</div>
              <div className="text-[#7A9175] text-xs mt-1 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[rgba(201,168,76,0.12)]">
          {([
            { key: "pipeline",   label: "Lead Pipeline" },
            { key: "listings",   label: "My Listings" },
            { key: "commission", label: "Commission" },
          ] as { key: AgentTab; label: string }[]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-[#C9A84C] text-[#C9A84C]"
                  : "border-transparent text-[#7A9175] hover:text-[#EDE9E1]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB: Lead Pipeline */}
        {activeTab === "pipeline" && (
          <div className="space-y-6">
            {leads.length === 0 ? (
              <div className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-12 text-center space-y-3">
                <div className="text-4xl">👤</div>
                <p className="text-[#7A9175]">No leads yet. Share your listing links to start capturing enquiries.</p>
              </div>
            ) : (
              LEAD_GROUPS.map(group => {
                const groupLeads = leads.filter(l => group.statuses.includes(l.status));
                if (groupLeads.length === 0) return null;
                return (
                  <div key={group.label} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-[#EDE9E1] font-medium text-sm uppercase tracking-wider">{group.label}</h3>
                      <span className="bg-[rgba(122,145,117,0.15)] text-[#7A9175] px-2 py-0.5 rounded-full text-xs">
                        {groupLeads.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {groupLeads.map(lead => (
                        <div
                          key={lead.id}
                          className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] hover:border-[rgba(201,168,76,0.22)] rounded-xl p-4 flex flex-wrap items-start gap-4 transition-all"
                        >
                          <div className="w-9 h-9 rounded-full bg-[rgba(201,168,76,0.1)] flex items-center justify-center text-[#C9A84C] font-playfair font-bold flex-shrink-0">
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[#EDE9E1] font-medium text-sm">{lead.name}</span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${leadStatusBadgeClass(lead.status)}`}>
                                {lead.status.replace(/_/g, " ")}
                              </span>
                            </div>
                            <div className="text-[#7A9175] text-xs truncate max-w-xs">{lead.email}</div>
                            {lead.phone && <div className="text-[#7A9175] text-xs">{lead.phone}</div>}
                            {lead.message && (
                              <div className="text-[#7A9175] text-xs mt-1 italic">
                                "{lead.message.slice(0, 50)}{lead.message.length > 50 ? "…" : ""}"
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB: My Listings */}
        {activeTab === "listings" && (
          <div className="space-y-4">
            {listingsToShow.length === 0 ? (
              <div className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-12 text-center space-y-3">
                <div className="text-4xl">🏠</div>
                <p className="text-[#7A9175]">No listings found.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {listingsToShow.map(p => {
                  const priceDisplay = (() => {
                    try { return formatNairaDisplay(BigInt(p.price)); } catch { return p.price; }
                  })();
                  return (
                    <div
                      key={p.id}
                      className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] hover:border-[rgba(201,168,76,0.25)] rounded-xl p-5 flex gap-4 transition-all"
                    >
                      <div className="w-16 h-16 bg-[#0C1410] rounded-lg flex items-center justify-center text-3xl flex-shrink-0">🏠</div>
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-playfair text-[#EDE9E1] font-semibold text-sm leading-tight">{p.title}</h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${listingStatusBadgeClass(p.listingStatus)}`}>
                            {p.listingStatus}
                          </span>
                        </div>
                        <p className="text-[#7A9175] text-xs truncate">📍 {p.location}</p>
                        <div className="text-[#C9A84C] font-semibold text-sm">{priceDisplay}</div>
                        <div className="text-[#7A9175] text-xs space-x-2">
                          {p.bedrooms != null && <span>{p.bedrooms} beds</span>}
                          {p.sqm != null && <span>{p.sqm} sqm</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-2">
              <Link
                href="/market"
                className="inline-block bg-[rgba(201,168,76,0.1)] hover:bg-[rgba(201,168,76,0.2)] text-[#C9A84C] px-6 py-2 rounded-lg text-sm transition-colors"
              >
                + Add New Listing
              </Link>
            </div>
          </div>
        )}

        {/* TAB: Commission */}
        {activeTab === "commission" && (
          <div className="space-y-6">
            {/* Commission Summary Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { period: "This Month",   amount: "₦2,450,000",  deals: 3  },
                { period: "This Quarter", amount: "₦8,120,000",  deals: 9  },
                { period: "This Year",    amount: "₦24,600,000", deals: 27 },
              ].map(c => (
                <div key={c.period} className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-5">
                  <div className="text-[#7A9175] text-xs uppercase tracking-wider mb-2">{c.period}</div>
                  <div className="font-playfair text-2xl text-[#C9A84C] font-bold">{c.amount}</div>
                  <div className="text-[#7A9175] text-xs mt-1">from {c.deals} deals</div>
                </div>
              ))}
            </div>

            {/* Deals Table */}
            <div className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[rgba(201,168,76,0.08)]">
                <h3 className="font-playfair text-[#EDE9E1] font-semibold">Recent Deals</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[rgba(201,168,76,0.08)]">
                      {["Property", "Client", "Value", "Commission (5%)", "Date"].map(h => (
                        <th key={h} className="text-left text-[#7A9175] text-xs uppercase tracking-wider px-6 py-3 font-medium">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMMISSION_DEALS.map((deal, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-[rgba(201,168,76,0.05)] hover:bg-[rgba(201,168,76,0.03)] transition-colors"
                      >
                        <td className="px-6 py-4 text-[#EDE9E1] font-medium">{deal.property}</td>
                        <td className="px-6 py-4 text-[#7A9175]">{deal.client}</td>
                        <td className="px-6 py-4 text-[#EDE9E1]">{deal.value}</td>
                        <td className="px-6 py-4 text-[#3DBA78] font-semibold">{deal.commission}</td>
                        <td className="px-6 py-4 text-[#7A9175]">{deal.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

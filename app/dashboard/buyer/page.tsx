"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { WalletButton } from "@/components/web3/WalletButton";
import { formatNairaDisplay } from "@/lib/web3";
import Link from "next/link";

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

type BuyerTab = "saved" | "journey" | "market";

const JOURNEY_STAGES = [
  { label: "Property Search",   desc: "Browsing and shortlisting properties that match your criteria." },
  { label: "Offer Made",        desc: "Submitting a formal offer and negotiating purchase terms." },
  { label: "Due Diligence",     desc: "Legal checks, surveys, and title verification in progress." },
  { label: "Contracts Signed",  desc: "Sale agreement executed and deposit funds confirmed." },
  { label: "Completion",        desc: "Final payment transferred, keys handed over. You own it!" },
];

const NEIGHBOURHOODS = [
  { name: "Lekki Phase 1",   change: "+8.4%",  listings: 47 },
  { name: "Ikoyi",           change: "+12.1%", listings: 23 },
  { name: "Victoria Island", change: "+5.2%",  listings: 31 },
  { name: "Banana Island",   change: "+15.8%", listings: 8  },
];

function statusBadgeClass(status: string): string {
  switch (status) {
    case "ACTIVE":    return "bg-[rgba(61,186,120,0.12)] text-[#3DBA78] border border-[rgba(61,186,120,0.3)]";
    case "SOLD":      return "bg-[rgba(224,82,82,0.12)] text-[#E05252] border border-[rgba(224,82,82,0.3)]";
    case "RESERVED":  return "bg-[rgba(251,191,36,0.1)] text-[#fbbf24] border border-[rgba(251,191,36,0.3)]";
    default:          return "bg-[rgba(122,145,117,0.1)] text-[#7A9175] border border-[rgba(122,145,117,0.2)]";
  }
}

export default function BuyerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab]   = useState<BuyerTab>("saved");
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/properties")
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then((data: Property[]) => setProperties(data))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#060C07] flex items-center justify-center">
        <div className="text-[#C9A84C] font-playfair text-xl animate-pulse">Loading dashboard…</div>
      </div>
    );
  }

  // "Saved" = first 6 properties under 500M (500_000_000_00 in kobo = 500M naira * 100)
  const savedProperties = properties
    .filter(p => {
      try { return BigInt(p.price) < BigInt("50000000000"); } catch { return true; }
    })
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-[#060C07] text-[#EDE9E1]">
      {/* Header */}
      <header className="border-b border-[rgba(201,168,76,0.12)] px-6 py-4 flex items-center justify-between bg-[#0C1410]">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-playfair text-[#C9A84C] font-bold text-lg tracking-widest">WILLOW</Link>
          <span className="text-[#7A9175]">/</span>
          <span className="text-[#7A9175] text-sm">Buyer Dashboard</span>
        </div>
        <WalletButton />
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Greeting */}
        <div>
          <h1 className="font-playfair text-3xl text-[#EDE9E1]">
            Welcome back, {session?.user?.name?.split(" ")[0] ?? "Buyer"}
          </h1>
          <p className="text-[#7A9175] text-sm mt-1">Your property search journey at a glance.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Saved Properties", value: String(savedProperties.length), icon: "🏠" },
            { label: "Searches Active",  value: "2",                            icon: "🔍" },
            { label: "Documents Ready",  value: "1",                            icon: "📄" },
            { label: "Finance Ready",    value: "Not Started",                  icon: "💳" },
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
            { key: "saved",   label: "Saved Properties" },
            { key: "journey", label: "Purchase Journey" },
            { key: "market",  label: "Market Watch" },
          ] as { key: BuyerTab; label: string }[]).map(tab => (
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

        {/* TAB: Saved Properties */}
        {activeTab === "saved" && (
          <div className="space-y-4">
            {savedProperties.length === 0 ? (
              <div className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-12 text-center space-y-3">
                <div className="text-4xl">🏠</div>
                <p className="text-[#7A9175]">You haven't saved any properties yet.</p>
                <Link
                  href="/market"
                  className="inline-block bg-[#C9A84C] text-[#060C07] px-6 py-2 rounded-lg font-bold text-sm"
                >
                  Browse Market
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedProperties.map(p => {
                  const priceDisplay = (() => {
                    try { return formatNairaDisplay(BigInt(p.price)); } catch { return p.price; }
                  })();
                  return (
                    <div
                      key={p.id}
                      className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] hover:border-[rgba(201,168,76,0.25)] rounded-xl p-5 space-y-3 transition-all"
                    >
                      <div className="w-full h-32 bg-[#0C1410] rounded-lg flex items-center justify-center text-4xl">🏠</div>
                      <div className="space-y-1">
                        <h3 className="font-playfair text-[#EDE9E1] font-semibold leading-tight">{p.title}</h3>
                        <p className="text-[#7A9175] text-xs">📍 {p.location}</p>
                      </div>
                      <div className="text-[#C9A84C] font-semibold text-lg">{priceDisplay}</div>
                      <div className="flex items-center justify-between">
                        <div className="text-[#7A9175] text-xs space-x-3">
                          {p.bedrooms != null && <span>{p.bedrooms} beds</span>}
                          {p.sqm != null && <span>{p.sqm} sqm</span>}
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${statusBadgeClass(p.listingStatus)}`}>
                          {p.listingStatus}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {savedProperties.length > 0 && (
              <div className="text-center pt-2">
                <Link
                  href="/market"
                  className="inline-block bg-[rgba(201,168,76,0.1)] hover:bg-[rgba(201,168,76,0.2)] text-[#C9A84C] px-6 py-2 rounded-lg text-sm transition-colors"
                >
                  Browse More Properties →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* TAB: Purchase Journey */}
        {activeTab === "journey" && (
          <div className="space-y-6">
            {/* Active Journey Card */}
            <div className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-6 space-y-3">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-playfair text-[#EDE9E1] text-lg font-semibold">Your Active Journey</h3>
                  <p className="text-[#7A9175] text-sm mt-0.5">3BR Apartment, Lekki Phase 1</p>
                </div>
                <div className="text-[#C9A84C] font-semibold text-xl">₦145M</div>
              </div>
              <Link
                href="/market"
                className="inline-block bg-[#C9A84C] text-[#060C07] px-5 py-2 rounded-lg font-bold text-sm"
              >
                Book a Viewing
              </Link>
            </div>

            {/* Progress Tracker */}
            <div className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-6">
              <h3 className="font-playfair text-[#EDE9E1] text-base font-semibold mb-5">Purchase Progress</h3>
              <div className="space-y-0">
                {JOURNEY_STAGES.map((stage, idx) => {
                  const isActive = idx === 0;
                  const isPast   = false;
                  return (
                    <div key={stage.label} className="flex gap-4">
                      {/* Timeline spine */}
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                          isActive
                            ? "bg-[#C9A84C] text-[#060C07]"
                            : isPast
                            ? "bg-[rgba(61,186,120,0.2)] text-[#3DBA78]"
                            : "bg-[rgba(122,145,117,0.1)] text-[#7A9175] border border-[rgba(122,145,117,0.2)]"
                        }`}>
                          {isPast ? "✓" : idx + 1}
                        </div>
                        {idx < JOURNEY_STAGES.length - 1 && (
                          <div className={`w-0.5 h-12 mt-1 ${isPast ? "bg-[rgba(61,186,120,0.3)]" : "bg-[rgba(122,145,117,0.15)]"}`} />
                        )}
                      </div>
                      {/* Content */}
                      <div className={`pb-10 ${idx === JOURNEY_STAGES.length - 1 ? "pb-0" : ""}`}>
                        <div className={`font-medium text-sm ${isActive ? "text-[#C9A84C]" : isPast ? "text-[#3DBA78]" : "text-[#7A9175]"}`}>
                          {stage.label}
                          {isActive && <span className="ml-2 text-xs bg-[rgba(201,168,76,0.15)] text-[#C9A84C] px-2 py-0.5 rounded-full">Current</span>}
                        </div>
                        <div className="text-[#7A9175] text-xs mt-0.5">{stage.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB: Market Watch */}
        {activeTab === "market" && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              {NEIGHBOURHOODS.map(n => (
                <div
                  key={n.name}
                  className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] hover:border-[rgba(201,168,76,0.22)] rounded-xl p-6 space-y-3 transition-all"
                >
                  <h3 className="font-playfair text-[#EDE9E1] text-base font-semibold">{n.name}</h3>
                  <div className="flex items-center gap-6">
                    <div>
                      <div className="text-[#C9A84C] text-2xl font-bold">{n.change}</div>
                      <div className="text-[#7A9175] text-xs uppercase tracking-wider mt-0.5">6-Month Change</div>
                    </div>
                    <div>
                      <div className="text-[#7A9175] text-xl font-semibold">{n.listings}</div>
                      <div className="text-[#7A9175] text-xs uppercase tracking-wider mt-0.5">New Listings</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Valuation CTA */}
            <div className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-8 text-center space-y-3">
              <div className="text-3xl">🤖</div>
              <h3 className="font-playfair text-[#EDE9E1] text-lg">Get an AI Property Valuation</h3>
              <p className="text-[#7A9175] text-sm max-w-sm mx-auto">
                Our AI analyses recent sales, neighbourhood trends, and property features to give you an instant market valuation.
              </p>
              <Link
                href="/valuation"
                className="inline-block bg-[#C9A84C] text-[#060C07] px-6 py-2.5 rounded-lg font-bold text-sm"
              >
                Get AI Valuation →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

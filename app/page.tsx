import Link from "next/link";
import { PublicNav } from "@/components/layout/PublicNav";

const STATS = [
  { value: "4,247", label: "Active Listings" },
  { value: "₦840B", label: "Value Tracked" },
  { value: "18.4%", label: "Avg ROI" },
  { value: "12",    label: "Markets" },
];

const TRENDING = [
  { id: "1", title: "Panorama Heights Penthouse",   location: "Ikoyi, Lagos",    price: "₦480M",  roi: "8.75%", beds: 4, type: "PENTHOUSE",  emoji: "🏙️" },
  { id: "2", title: "Victoria Crown Luxury Apt",    location: "Victoria Island", price: "₦280M",  roi: "9.43%", beds: 3, type: "APARTMENT",  emoji: "🏢" },
  { id: "3", title: "Maitama Executive Villa",       location: "Abuja",           price: "₦650M",  roi: "8.86%", beds: 5, type: "VILLA",      emoji: "🏛️" },
  { id: "4", title: "Oniru Waterfront Townhouse",   location: "VI Extension",    price: "₦750M",  roi: "14.2%", beds: 4, type: "TOWNHOUSE",  emoji: "🌊" },
];

const HOTSPOTS = [
  { name: "Lekki Phase 1", city: "Lagos", growth: "+16.7%", yield: "10.4% yield", tier: "HOT",     color: "#E05252" },
  { name: "Maitama",       city: "Abuja", growth: "+9.5%",  yield: "8.8% yield",  tier: "PREMIUM", color: "#C9A84C" },
  { name: "GRA Phase 2",   city: "PH",    growth: "+7.8%",  yield: "11.2% yield", tier: "RISING",  color: "#3DBA78" },
];

const MODULES = [
  { icon: "🏠", title: "Landlord Hub",      desc: "Manage properties, tenants & rent collection",    href: "/login", color: "#C9A84C" },
  { icon: "📈", title: "Investor Suite",    desc: "Portfolio analytics, ROI tracking & AI signals",  href: "/login", color: "#3DBA78" },
  { icon: "🏗️", title: "Developer Centre",  desc: "Project management, unit matrix & sales pipeline",href: "/login", color: "#8247E5" },
  { icon: "🏘️", title: "Marketplace",      desc: "Browse 4,247 verified listings across 12 markets",href: "/market",color: "#C9A84C" },
  { icon: "🤖", title: "AI Valuation",      desc: "Claude-powered property valuation in seconds",    href: "/valuation", color: "#3DBA78" },
  { icon: "🗺️", title: "Neighbourhood IQ", desc: "Market intelligence by location & demand signals", href: "/neighbourhood", color: "#E05252" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#060C07]">
      <PublicNav />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-16 text-center space-y-6">
        <div className="inline-block bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.2)] px-4 py-1 rounded-full text-[#C9A84C] text-sm">
          Africa's #1 Real Estate Intelligence Platform
        </div>
        <h1 className="font-playfair text-5xl md:text-7xl text-[#EDE9E1] leading-tight">
          Find. Invest. <em className="text-[#C9A84C] not-italic">Grow.</em>
          <br />Real Estate Reimagined.
        </h1>
        <p className="text-[#7A9175] text-xl max-w-2xl mx-auto">
          Willow is the operating system for African real estate — intelligent, trustless, and built for serious property professionals.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          {["Buy", "Rent", "Shortlet", "Invest"].map(tab => (
            <Link key={tab} href={tab === "Invest" ? "/dashboard/investor" : "/market"}
              className="px-6 py-3 rounded-xl border border-[rgba(201,168,76,0.2)] text-[#EDE9E1] hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all text-sm font-medium">
              {tab}
            </Link>
          ))}
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-[rgba(201,168,76,0.1)] bg-[#0C1410]">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <div className="font-playfair text-4xl text-[#C9A84C] font-bold">{s.value}</div>
              <div className="text-[#7A9175] text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="max-w-7xl mx-auto px-6 py-16 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-playfair text-3xl text-[#EDE9E1]">Trending Properties</h2>
          <Link href="/market" className="text-[#C9A84C] text-sm hover:underline">View all →</Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {TRENDING.map(p => (
            <Link key={p.id} href={`/market/${p.id}`}
              className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] hover:border-[rgba(201,168,76,0.3)] rounded-xl overflow-hidden transition-all group">
              <div className="h-44 bg-[#0C1410] flex items-center justify-center text-6xl group-hover:scale-105 transition-transform">
                {p.emoji}
              </div>
              <div className="p-4 space-y-2">
                <div className="flex gap-2">
                  <span className="bg-[rgba(201,168,76,0.1)] text-[#C9A84C] text-[10px] px-2 py-0.5 rounded">{p.type}</span>
                  <span className="bg-[rgba(61,186,120,0.1)] text-[#3DBA78] text-[10px] px-2 py-0.5 rounded">ROI {p.roi}</span>
                </div>
                <h3 className="text-[#EDE9E1] font-medium text-sm leading-snug">{p.title}</h3>
                <p className="text-[#7A9175] text-xs">📍 {p.location}</p>
                <div className="flex items-center justify-between">
                  <span className="font-playfair text-[#C9A84C] font-bold">{p.price}</span>
                  <span className="text-[#7A9175] text-xs">{p.beds} beds</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Hotspots */}
      <section className="max-w-7xl mx-auto px-6 pb-16 space-y-6">
        <h2 className="font-playfair text-3xl text-[#EDE9E1]">Investment Hotspots</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {HOTSPOTS.map(h => (
            <Link key={h.name} href="/neighbourhood"
              className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] hover:border-[rgba(201,168,76,0.3)] rounded-xl p-6 transition-all group space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-playfair text-xl text-[#EDE9E1]">{h.name}</h3>
                <span className="text-xs px-2 py-1 rounded font-bold" style={{ background: `${h.color}22`, color: h.color }}>{h.tier}</span>
              </div>
              <div className="text-[#7A9175] text-sm">{h.city}</div>
              <div className="flex items-center justify-between">
                <span className="font-playfair text-2xl font-bold" style={{ color: h.color }}>{h.growth}</span>
                <span className="text-[#7A9175] text-sm">{h.yield}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Platform modules */}
      <section className="bg-[#0C1410] border-t border-[rgba(201,168,76,0.1)]">
        <div className="max-w-7xl mx-auto px-6 py-16 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="font-playfair text-3xl text-[#EDE9E1]">One Platform. Every Role.</h2>
            <p className="text-[#7A9175]">Purpose-built tools for every real estate professional in Africa</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {MODULES.map(m => (
              <Link key={m.title} href={m.href}
                className="bg-[#111A12] border border-[rgba(201,168,76,0.1)] hover:border-[rgba(201,168,76,0.25)] rounded-xl p-6 transition-all group space-y-3">
                <div className="text-3xl">{m.icon}</div>
                <h3 className="font-playfair text-lg text-[#EDE9E1] group-hover:text-[#C9A84C] transition-colors">{m.title}</h3>
                <p className="text-[#7A9175] text-sm">{m.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(201,168,76,0.1)] py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-playfair text-[#C9A84C] text-xl tracking-widest">WILLOW</div>
            <div className="text-[#7A9175] text-xs">by Urchmond Management & Investment Company</div>
          </div>
          <div className="text-[#7A9175] text-sm">© 2025 Urchmond. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

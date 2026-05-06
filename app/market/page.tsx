import Link from "next/link";
import { PublicNav } from "@/components/layout/PublicNav";
import { Badge } from "@/components/ui/Badge";

const LISTINGS = [
  { id: "1",  title: "Panorama Heights Penthouse",      location: "Ikoyi, Lagos",           price: "₦480M",  roi: "8.75%", beds: 4, baths: 4, sqm: 420, type: "PENTHOUSE",  status: "AVAILABLE", emoji: "🏙️" },
  { id: "2",  title: "Victoria Crown Luxury Apartment",  location: "Victoria Island, Lagos",  price: "₦280M",  roi: "9.43%", beds: 3, baths: 3, sqm: 210, type: "APARTMENT",  status: "AVAILABLE", emoji: "🏢" },
  { id: "3",  title: "Maitama Executive Villa",           location: "Maitama, Abuja",          price: "₦650M",  roi: "8.86%", beds: 5, baths: 6, sqm: 680, type: "VILLA",      status: "AVAILABLE", emoji: "🏛️" },
  { id: "4",  title: "Oniru Waterfront Townhouse",        location: "VI Extension, Lagos",     price: "₦750M",  roi: "14.2%", beds: 4, baths: 4, sqm: 350, type: "TOWNHOUSE",  status: "RESERVED",  emoji: "🌊" },
  { id: "5",  title: "Asokoro Gardens Detached",          location: "Asokoro, Abuja",          price: "₦520M",  roi: "7.9%",  beds: 5, baths: 5, sqm: 580, type: "DETACHED",   status: "AVAILABLE", emoji: "🌿" },
  { id: "6",  title: "Lekki Phase 1 Semi-Detached",       location: "Lekki Phase 1, Lagos",    price: "₦195M",  roi: "11.2%", beds: 3, baths: 3, sqm: 220, type: "SEMI-D",     status: "AVAILABLE", emoji: "🏠" },
  { id: "7",  title: "GRA Phase 2 Duplex",                location: "GRA Phase 2, Port Harcourt",price: "₦180M", roi: "12.1%", beds: 4, baths: 4, sqm: 310, type: "DUPLEX",     status: "AVAILABLE", emoji: "🏡" },
  { id: "8",  title: "Chevron Alternative Drive Studio",  location: "Chevron, Lagos",          price: "₦45M",   roi: "13.8%", beds: 1, baths: 1, sqm: 62,  type: "STUDIO",     status: "AVAILABLE", emoji: "🏗️" },
];

const TYPES = ["All", "PENTHOUSE", "APARTMENT", "VILLA", "TOWNHOUSE", "DETACHED", "SEMI-D", "DUPLEX", "STUDIO"];

export default function MarketPage() {
  return (
    <div className="min-h-screen bg-[#060C07]">
      <PublicNav />

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="font-playfair text-4xl text-[#EDE9E1]">Property Marketplace</h1>
          <p className="text-[#7A9175]">4,247 verified listings across Nigeria's prime markets</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {TYPES.map(t => (
            <button key={t}
              className="px-4 py-1.5 rounded-lg border border-[rgba(201,168,76,0.2)] text-[#7A9175] hover:text-[#C9A84C] hover:border-[#C9A84C] text-sm transition-all">
              {t}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {LISTINGS.map(p => (
            <Link key={p.id} href={`/market/${p.id}`}
              className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] hover:border-[rgba(201,168,76,0.35)] rounded-xl overflow-hidden transition-all group">
              <div className="h-48 bg-[#0C1410] flex items-center justify-center text-7xl group-hover:scale-105 transition-transform">
                {p.emoji}
              </div>
              <div className="p-4 space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  <span className="bg-[rgba(201,168,76,0.1)] text-[#C9A84C] text-[10px] px-2 py-0.5 rounded">{p.type}</span>
                  <Badge variant={p.status === "AVAILABLE" ? "green" : "amber"}>{p.status}</Badge>
                </div>
                <h3 className="text-[#EDE9E1] font-medium text-sm leading-snug line-clamp-2">{p.title}</h3>
                <p className="text-[#7A9175] text-xs">📍 {p.location}</p>
                <div className="grid grid-cols-3 gap-1 text-center">
                  <div className="bg-[#0C1410] rounded p-1">
                    <div className="text-[#EDE9E1] text-xs font-medium">{p.beds}</div>
                    <div className="text-[#7A9175] text-[9px]">beds</div>
                  </div>
                  <div className="bg-[#0C1410] rounded p-1">
                    <div className="text-[#EDE9E1] text-xs font-medium">{p.baths}</div>
                    <div className="text-[#7A9175] text-[9px]">baths</div>
                  </div>
                  <div className="bg-[#0C1410] rounded p-1">
                    <div className="text-[#EDE9E1] text-xs font-medium">{p.sqm}</div>
                    <div className="text-[#7A9175] text-[9px]">sqm</div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-[rgba(201,168,76,0.08)]">
                  <span className="font-playfair text-[#C9A84C] font-bold">{p.price}</span>
                  <span className="text-[#3DBA78] text-xs font-medium">ROI {p.roi}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <button className="bg-[#C9A84C] hover:bg-[#d4b560] text-[#060C07] px-8 py-3 rounded-xl font-bold transition-colors">
            Load More Listings
          </button>
        </div>
      </div>
    </div>
  );
}

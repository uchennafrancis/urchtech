import Link from "next/link";
import { PublicNav } from "@/components/layout/PublicNav";

const SHORTLETS = [
  { id: "s1", title: "Luxury Penthouse Suite",        location: "Ikoyi, Lagos",           price: "₦180K/night", rating: 4.9, reviews: 47,  beds: 3, amenities: ["Pool", "Gym", "Concierge", "Sea View"], emoji: "🏙️" },
  { id: "s2", title: "Victoria Island Serviced Apt",   location: "VI, Lagos",              price: "₦85K/night",  rating: 4.7, reviews: 112, beds: 2, amenities: ["WiFi", "Netflix", "Kitchen", "Parking"],  emoji: "🏢" },
  { id: "s3", title: "Maitama Premium Residence",       location: "Maitama, Abuja",         price: "₦120K/night", rating: 4.8, reviews: 63,  beds: 4, amenities: ["Pool", "Garden", "Chef", "Driver"],    emoji: "🏛️" },
  { id: "s4", title: "Chevron Cozy Studio",             location: "Chevron Drive, Lagos",   price: "₦35K/night",  rating: 4.6, reviews: 198, beds: 1, amenities: ["WiFi", "AC", "Kitchen", "Security"],  emoji: "🏠" },
  { id: "s5", title: "Banana Island Waterfront Villa",  location: "Banana Island, Lagos",   price: "₦450K/night", rating: 5.0, reviews: 22,  beds: 5, amenities: ["Beach", "Boat Dock", "Chef", "Spa"],   emoji: "🌊" },
  { id: "s6", title: "Wuse 2 Executive Apartment",      location: "Wuse 2, Abuja",          price: "₦55K/night",  rating: 4.5, reviews: 87,  beds: 2, amenities: ["WiFi", "Gym", "24hr Security"],        emoji: "🏡" },
];

export default function ShortletPage() {
  return (
    <div className="min-h-screen bg-[#060C07]">
      <PublicNav />

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        <div className="space-y-2">
          <h1 className="font-playfair text-4xl text-[#EDE9E1]">Shortlet Apartments</h1>
          <p className="text-[#7A9175]">Premium short-stay accommodation with on-chain booking & escrow</p>
        </div>

        {/* Search bar */}
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search by location, property type..."
            className="flex-1 bg-[#111A12] border border-[rgba(201,168,76,0.2)] rounded-xl px-4 py-3 text-[#EDE9E1] placeholder-[#7A9175] text-sm focus:outline-none focus:border-[#C9A84C] transition-colors"
          />
          <button className="bg-[#C9A84C] hover:bg-[#d4b560] text-[#060C07] px-6 py-3 rounded-xl font-bold transition-colors">Search</button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SHORTLETS.map(s => (
            <div key={s.id} className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] hover:border-[rgba(201,168,76,0.3)] rounded-xl overflow-hidden transition-all">
              <div className="h-52 bg-[#0C1410] flex items-center justify-center text-8xl">{s.emoji}</div>
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="text-[#EDE9E1] font-medium leading-snug">{s.title}</h3>
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <span className="text-[#C9A84C] text-sm">★</span>
                    <span className="text-[#EDE9E1] text-sm font-medium">{s.rating}</span>
                    <span className="text-[#7A9175] text-xs">({s.reviews})</span>
                  </div>
                </div>
                <p className="text-[#7A9175] text-sm">📍 {s.location} · {s.beds} bed{s.beds > 1 ? "s" : ""}</p>
                <div className="flex flex-wrap gap-1.5">
                  {s.amenities.map(a => (
                    <span key={a} className="bg-[rgba(201,168,76,0.08)] text-[#7A9175] text-[10px] px-2 py-0.5 rounded">{a}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[rgba(201,168,76,0.08)]">
                  <div>
                    <span className="font-playfair text-[#C9A84C] font-bold">{s.price}</span>
                  </div>
                  <Link href="/login"
                    className="bg-[#C9A84C] hover:bg-[#d4b560] text-[#060C07] px-4 py-1.5 rounded-lg text-sm font-bold transition-colors">
                    Book Now
                  </Link>
                </div>
                <p className="text-[#7A9175] text-[10px]">🔒 Secured by on-chain escrow · Instant confirmation</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

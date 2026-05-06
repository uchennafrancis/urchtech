import Link from "next/link";
import { PublicNav } from "@/components/layout/PublicNav";

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-[#060C07]">
      <PublicNav />
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        <Link href="/market" className="text-[#7A9175] hover:text-[#C9A84C] text-sm transition-colors">← Back to Market</Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            <div className="h-72 bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl flex items-center justify-center text-9xl">
              🏙️
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="bg-[rgba(201,168,76,0.1)] text-[#C9A84C] text-xs px-2 py-0.5 rounded">PENTHOUSE</span>
                <span className="bg-[rgba(61,186,120,0.1)] text-[#3DBA78] text-xs px-2 py-0.5 rounded">AVAILABLE</span>
                <span className="bg-[rgba(130,71,229,0.1)] text-[#a970ff] text-xs px-2 py-0.5 rounded">NFT TOKENISED</span>
              </div>
              <h1 className="font-playfair text-3xl text-[#EDE9E1]">Panorama Heights Penthouse</h1>
              <p className="text-[#7A9175]">📍 Ikoyi, Lagos, Nigeria</p>
            </div>

            <div className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-6 space-y-4">
              <h2 className="font-playfair text-xl text-[#EDE9E1]">Property Details</h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Bedrooms", value: "4" },
                  { label: "Bathrooms", value: "4" },
                  { label: "Size", value: "420 sqm" },
                  { label: "Floor", value: "32nd" },
                  { label: "Year Built", value: "2023" },
                  { label: "Parking", value: "2 spaces" },
                ].map(d => (
                  <div key={d.label} className="bg-[#0C1410] rounded-lg p-3 text-center">
                    <div className="text-[#EDE9E1] font-medium">{d.value}</div>
                    <div className="text-[#7A9175] text-xs">{d.label}</div>
                  </div>
                ))}
              </div>
              <p className="text-[#7A9175] text-sm leading-relaxed">
                Spectacular panoramic views of Lagos lagoon from this ultra-luxury penthouse. Features include Italian marble finishes,
                smart home automation, private pool terrace, and 24/7 concierge service. Freehold title, NFT-tokenised on Polygon.
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-[#111A12] border border-[rgba(201,168,76,0.2)] rounded-xl p-6 space-y-4">
              <div className="font-playfair text-4xl text-[#C9A84C] font-bold">₦480M</div>
              <div className="space-y-2">
                {[
                  { label: "Annual ROI",     value: "8.75%" },
                  { label: "Rental Yield",   value: "₦3.5M/mo" },
                  { label: "Capital Growth", value: "+16.2% YoY" },
                  { label: "NFT Token ID",   value: "#1001" },
                ].map(r => (
                  <div key={r.label} className="flex justify-between text-sm">
                    <span className="text-[#7A9175]">{r.label}</span>
                    <span className="text-[#EDE9E1] font-medium">{r.value}</span>
                  </div>
                ))}
              </div>
              <Link href="/login"
                className="block w-full bg-[#C9A84C] hover:bg-[#d4b560] text-[#060C07] py-3 rounded-xl font-bold text-center transition-colors">
                Request Viewing
              </Link>
              <Link href="/login"
                className="block w-full border border-[rgba(201,168,76,0.3)] text-[#C9A84C] hover:bg-[rgba(201,168,76,0.05)] py-3 rounded-xl font-medium text-center transition-colors">
                Buy Fractional Share
              </Link>
            </div>

            <div className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-4 space-y-2">
              <h3 className="text-[#EDE9E1] text-sm font-medium">On-Chain Verification</h3>
              <div className="text-[#7A9175] text-xs space-y-1">
                <div>Contract: <span className="text-[#a970ff] font-mono">0x4a2b...f91c</span></div>
                <div>Token ID: <span className="text-[#C9A84C]">#1001</span></div>
                <div>Network: <span className="text-[#8247E5]">Polygon</span></div>
              </div>
              <Link href="/chain" className="text-[#C9A84C] text-xs hover:underline">View on Willow Explorer →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

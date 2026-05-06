import { PublicNav } from "@/components/layout/PublicNav";
import { ProgressBar } from "@/components/ui/ProgressBar";

const AREAS = [
  {
    name: "Lekki Phase 1",     city: "Lagos",           tier: "HOT",     tierColor: "#E05252",
    growth: "+16.7%",  pricePerSqm: "₦850K",   avgPrice: "₦245M",  rentalYield: "10.4%",
    demand: 92, supply: 38, infrastructure: 85, security: 78,
    tags: ["Gated", "Beach Access", "Commercial Hub", "Expat Friendly"],
    insight: "Highest demand-supply gap in Lagos. Strong capital appreciation driven by Lekki Free Zone proximity.",
  },
  {
    name: "Victoria Island",   city: "Lagos",           tier: "PREMIUM", tierColor: "#C9A84C",
    growth: "+12.3%",  pricePerSqm: "₦1.2M",   avgPrice: "₦380M",  rentalYield: "8.9%",
    demand: 85, supply: 45, infrastructure: 95, security: 90,
    tags: ["CBD", "International", "Waterfront", "Embassy Zone"],
    insight: "Nigeria's financial capital. Sustained demand from corporates and high-net-worth individuals.",
  },
  {
    name: "Maitama",           city: "Abuja",           tier: "PREMIUM", tierColor: "#C9A84C",
    growth: "+9.5%",   pricePerSqm: "₦920K",   avgPrice: "₦320M",  rentalYield: "8.8%",
    demand: 78, supply: 52, infrastructure: 92, security: 95,
    tags: ["Diplomatic", "Government", "Luxury", "Quiet"],
    insight: "Abuja's most prestigious address. Diplomatic missions and senior government officials drive premium rents.",
  },
  {
    name: "Ikoyi",             city: "Lagos",           tier: "PREMIUM", tierColor: "#C9A84C",
    growth: "+11.1%",  pricePerSqm: "₦1.05M",  avgPrice: "₦490M",  rentalYield: "7.2%",
    demand: 80, supply: 30, infrastructure: 90, security: 88,
    tags: ["Ultra-Luxury", "Low Density", "Lagoon Views", "Old Money"],
    insight: "Nigeria's most exclusive residential address. Very limited supply ensures sustained capital appreciation.",
  },
  {
    name: "GRA Phase 2",       city: "Port Harcourt",  tier: "RISING",  tierColor: "#3DBA78",
    growth: "+7.8%",   pricePerSqm: "₦380K",   avgPrice: "₦155M",  rentalYield: "11.2%",
    demand: 70, supply: 55, infrastructure: 72, security: 75,
    tags: ["Oil & Gas", "Expat", "Serviced", "Commercial"],
    insight: "Port Harcourt's strongest residential zone. Oil sector expats drive above-average rental demand.",
  },
  {
    name: "Asokoro",           city: "Abuja",           tier: "PREMIUM", tierColor: "#C9A84C",
    growth: "+8.4%",   pricePerSqm: "₦750K",   avgPrice: "₦280M",  rentalYield: "9.1%",
    demand: 72, supply: 48, infrastructure: 88, security: 92,
    tags: ["Government", "Senior Officials", "Quiet", "Freehold"],
    insight: "Home to Nigeria's presidency and top government officials. Extremely stable demand with limited new supply.",
  },
];

const TIER_COLORS: Record<string, string> = {
  HOT: "#E05252", PREMIUM: "#C9A84C", RISING: "#3DBA78", EMERGING: "#a970ff",
};

export default function NeighbourhoodPage() {
  return (
    <div className="min-h-screen bg-[#060C07]">
      <PublicNav />

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        <div className="space-y-2">
          <h1 className="font-playfair text-4xl text-[#EDE9E1]">Neighbourhood Intelligence</h1>
          <p className="text-[#7A9175]">AI-powered market intelligence across Nigeria's prime residential locations</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {AREAS.map(area => (
            <div key={area.name} className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-6 space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-playfair text-2xl text-[#EDE9E1]">{area.name}</h2>
                  <p className="text-[#7A9175] text-sm">{area.city}</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-lg font-bold"
                  style={{ background: `${area.tierColor}22`, color: area.tierColor }}>
                  {area.tier}
                </span>
              </div>

              {/* Key metrics */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Growth",    value: area.growth,      color: "#3DBA78" },
                  { label: "₦/sqm",    value: area.pricePerSqm, color: "#C9A84C" },
                  { label: "Avg Price", value: area.avgPrice,    color: "#EDE9E1" },
                  { label: "Yield",     value: area.rentalYield, color: "#3DBA78" },
                ].map(m => (
                  <div key={m.label} className="bg-[#0C1410] rounded-lg p-2.5 text-center">
                    <div className="text-sm font-bold" style={{ color: m.color }}>{m.value}</div>
                    <div className="text-[#7A9175] text-[9px] uppercase tracking-wider mt-0.5">{m.label}</div>
                  </div>
                ))}
              </div>

              {/* Score bars */}
              <div className="space-y-2.5">
                <ProgressBar value={area.demand}         label="Demand"         showPct color="gold"  />
                <ProgressBar value={area.supply}         label="Supply"         showPct color="red"   />
                <ProgressBar value={area.infrastructure} label="Infrastructure" showPct color="green" />
                <ProgressBar value={area.security}       label="Security"       showPct color="green" />
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {area.tags.map(t => (
                  <span key={t} className="bg-[rgba(201,168,76,0.08)] text-[#7A9175] text-[10px] px-2 py-0.5 rounded">{t}</span>
                ))}
              </div>

              {/* Insight */}
              <p className="text-[#7A9175] text-sm leading-relaxed border-t border-[rgba(201,168,76,0.08)] pt-3">
                💡 {area.insight}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

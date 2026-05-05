import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-willow-900 via-willow-800 to-polygon-purple flex flex-col items-center justify-center p-8 text-white">
      <div className="max-w-4xl text-center space-y-8">
        <div className="space-y-4">
          <span className="inline-block bg-polygon-purple/30 border border-polygon-purple px-4 py-1 rounded-full text-sm font-mono">
            Powered by Polygon PoS · Trustless · On-Chain
          </span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Willow PropTech
          </h1>
          <p className="text-xl md:text-2xl text-willow-200 max-w-2xl mx-auto">
            Africa&apos;s first on-chain real estate operating system. Every property tokenised.
            Every payment trustless. Every title immutable.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 text-left">
          {[
            { icon: "🏠", title: "Landlord Dashboard",  href: "/dashboard/landlord",  desc: "Manage properties, leases & on-chain rent" },
            { icon: "💰", title: "Investor Dashboard",  href: "/dashboard/investor",  desc: "Fractional ownership & yield claiming" },
            { icon: "🏗️", title: "Developer Dashboard", href: "/dashboard/developer", desc: "Tokenise projects & track on-chain sales" },
          ].map((card) => (
            <Link key={card.href} href={card.href}
              className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl p-6 transition-all group">
              <div className="text-4xl mb-3">{card.icon}</div>
              <h3 className="font-bold text-lg group-hover:text-willow-300 transition-colors">{card.title}</h3>
              <p className="text-sm text-white/70 mt-1">{card.desc}</p>
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/chain"
            className="bg-polygon-purple hover:bg-polygon-light px-6 py-3 rounded-xl font-semibold transition-colors">
            🔗 Explore On-Chain Registry
          </Link>
          <Link href="/invest/pools"
            className="bg-willow-600 hover:bg-willow-500 px-6 py-3 rounded-xl font-semibold transition-colors">
            🪙 Investment Pools
          </Link>
        </div>
      </div>
    </main>
  );
}

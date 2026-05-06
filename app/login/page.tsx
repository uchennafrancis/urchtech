"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const DEMOS = [
  { email: "landlord@willow.ng",  role: "Landlord",  icon: "🏠", desc: "Properties, leases & NFT hub",    redirect: "/dashboard/landlord" },
  { email: "investor@willow.ng",  role: "Investor",  icon: "💎", desc: "Portfolio, pools & yield",        redirect: "/dashboard/investor" },
  { email: "developer@willow.ng", role: "Developer", icon: "🏗️", desc: "Projects, units & tokenisation", redirect: "/dashboard/developer" },
  { email: "agent@willow.ng",     role: "Agent",     icon: "🤝", desc: "Lead pipeline & commission",      redirect: "/dashboard/agent"     },
  { email: "buyer@willow.ng",     role: "Buyer",     icon: "🔑", desc: "Search, purchase & watchlist",    redirect: "/dashboard/buyer"     },
  { email: "admin@willow.ng",     role: "Admin",     icon: "⚙️", desc: "Platform management & analytics", redirect: "/dashboard/admin"     },
];

const DEMO_REDIRECT: Record<string, string> = Object.fromEntries(
  DEMOS.map(d => [d.email, d.redirect])
);

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) { setError("Invalid email or password"); setLoading(false); return; }
    router.push(DEMO_REDIRECT[email] ?? "/dashboard");
  }

  async function quickLogin(d: typeof DEMOS[0]) {
    setLoading(true);
    const res = await signIn("credentials", { email: d.email, password: "demo", redirect: false });
    if (res?.error) { setError("Demo account not seeded yet — run seed script"); setLoading(false); return; }
    router.push(d.redirect);
  }

  return (
    <div className="min-h-screen bg-[#060C07] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="font-playfair text-4xl text-[#C9A84C] tracking-wider">WILLOW</Link>
          <p className="text-[#7A9175] text-sm">by Urchmond Management &amp; Investment Company</p>
          <p className="text-[#EDE9E1] text-lg mt-4">Welcome back</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#0C1410] border border-[rgba(201,168,76,0.15)] rounded-xl p-6 space-y-4">
          {error && (
            <div className="bg-[rgba(224,82,82,0.1)] border border-[rgba(224,82,82,0.3)] text-[#E05252] text-sm rounded-lg px-4 py-2">
              {error}
            </div>
          )}
          <div className="space-y-1">
            <label className="text-[#7A9175] text-xs uppercase tracking-wider">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="you@willow.ng"
              className="w-full bg-[#111A12] border border-[rgba(201,168,76,0.15)] rounded-lg px-4 py-3 text-[#EDE9E1] placeholder-[#7A9175] focus:outline-none focus:border-[#C9A84C] transition-colors" />
          </div>
          <div className="space-y-1">
            <label className="text-[#7A9175] text-xs uppercase tracking-wider">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="••••••••"
              className="w-full bg-[#111A12] border border-[rgba(201,168,76,0.15)] rounded-lg px-4 py-3 text-[#EDE9E1] placeholder-[#7A9175] focus:outline-none focus:border-[#C9A84C] transition-colors" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-[#C9A84C] hover:bg-[#d4b560] disabled:opacity-50 text-[#060C07] font-bold py-3 rounded-lg transition-colors">
            {loading ? "Signing in…" : "Sign In"}
          </button>
          <p className="text-center text-[#7A9175] text-sm">
            No account?{" "}
            <Link href="/register" className="text-[#C9A84C] hover:underline">Create one</Link>
          </p>
        </form>

        <div className="space-y-2">
          <p className="text-[#7A9175] text-xs text-center uppercase tracking-wider">Quick demo access</p>
          <div className="grid grid-cols-2 gap-2">
            {DEMOS.map(d => (
              <button key={d.email} onClick={() => quickLogin(d)} disabled={loading}
                className="bg-[#111A12] hover:bg-[#0C1410] border border-[rgba(201,168,76,0.12)] hover:border-[rgba(201,168,76,0.3)] rounded-xl px-3 py-3 text-left transition-all group disabled:opacity-50">
                <div className="text-lg mb-1">{d.icon}</div>
                <div className="text-[#EDE9E1] font-medium text-xs group-hover:text-[#C9A84C] transition-colors">{d.role}</div>
                <div className="text-[#7A9175] text-xs leading-tight mt-0.5">{d.desc}</div>
              </button>
            ))}
          </div>
          <p className="text-[#7A9175] text-xs text-center">All demo accounts · password: <span className="text-[#C9A84C]">demo</span></p>
        </div>
      </div>
    </div>
  );
}

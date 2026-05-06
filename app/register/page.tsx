"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ROLES = [
  { value: "BUYER",     label: "Buyer",     desc: "Browse and purchase properties" },
  { value: "LANDLORD",  label: "Landlord",  desc: "List properties and manage rentals" },
  { value: "INVESTOR",  label: "Investor",  desc: "Portfolio investment and yield" },
  { value: "AGENT",     label: "Agent",     desc: "Represent buyers and sellers" },
  { value: "DEVELOPER", label: "Developer", desc: "Off-plan projects and sales" },
];

const ROLE_ROUTES: Record<string, string> = {
  BUYER:     "/dashboard/buyer",
  LANDLORD:  "/dashboard/landlord",
  INVESTOR:  "/dashboard/investor",
  AGENT:     "/dashboard/agent",
  DEVELOPER: "/dashboard/developer",
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm]     = useState({ name: "", email: "", password: "", role: "BUYER" });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/auth/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); setLoading(false); return; }

      await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      router.push(ROLE_ROUTES[form.role] ?? "/dashboard/buyer");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#060C07] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="font-playfair text-4xl text-[#C9A84C] tracking-wider">WILLOW</Link>
          <p className="text-[#7A9175] text-sm">Africa&apos;s Real Estate Intelligence OS</p>
          <p className="text-[#EDE9E1] text-lg mt-3">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#0C1410] border border-[rgba(201,168,76,0.15)] rounded-xl p-6 space-y-4">
          {error && (
            <div className="bg-[rgba(224,82,82,0.1)] border border-[rgba(224,82,82,0.3)] text-[#E05252] text-sm rounded-lg px-4 py-2">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[#7A9175] text-xs uppercase tracking-wider">Full Name</label>
            <input type="text" value={form.name} onChange={set("name")} required
              placeholder="Emeka Okonkwo"
              className="w-full bg-[#111A12] border border-[rgba(201,168,76,0.15)] rounded-lg px-4 py-3 text-[#EDE9E1] placeholder-[#7A9175] focus:outline-none focus:border-[#C9A84C] transition-colors" />
          </div>

          <div className="space-y-1">
            <label className="text-[#7A9175] text-xs uppercase tracking-wider">Email</label>
            <input type="email" value={form.email} onChange={set("email")} required
              placeholder="emeka@willow.ng"
              className="w-full bg-[#111A12] border border-[rgba(201,168,76,0.15)] rounded-lg px-4 py-3 text-[#EDE9E1] placeholder-[#7A9175] focus:outline-none focus:border-[#C9A84C] transition-colors" />
          </div>

          <div className="space-y-1">
            <label className="text-[#7A9175] text-xs uppercase tracking-wider">Password</label>
            <input type="password" value={form.password} onChange={set("password")} required
              placeholder="At least 8 characters"
              className="w-full bg-[#111A12] border border-[rgba(201,168,76,0.15)] rounded-lg px-4 py-3 text-[#EDE9E1] placeholder-[#7A9175] focus:outline-none focus:border-[#C9A84C] transition-colors" />
          </div>

          <div className="space-y-2">
            <label className="text-[#7A9175] text-xs uppercase tracking-wider">I am a…</label>
            <div className="grid grid-cols-1 gap-2">
              {ROLES.map(r => (
                <label key={r.value}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all ${
                    form.role === r.value
                      ? "border-[#C9A84C] bg-[rgba(201,168,76,0.06)]"
                      : "border-[rgba(201,168,76,0.12)] bg-[#111A12] hover:border-[rgba(201,168,76,0.3)]"
                  }`}>
                  <input type="radio" name="role" value={r.value} checked={form.role === r.value}
                    onChange={set("role")} className="sr-only" />
                  <div className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${
                    form.role === r.value ? "border-[#C9A84C] bg-[#C9A84C]" : "border-[#7A9175]"
                  }`} />
                  <div>
                    <div className={`text-sm font-medium ${form.role === r.value ? "text-[#C9A84C]" : "text-[#EDE9E1]"}`}>
                      {r.label}
                    </div>
                    <div className="text-[#7A9175] text-xs">{r.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-[#C9A84C] hover:bg-[#d4b560] disabled:opacity-50 text-[#060C07] font-bold py-3 rounded-lg transition-colors mt-2">
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="text-center text-[#7A9175] text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-[#C9A84C] hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

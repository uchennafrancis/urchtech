"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { WalletButton } from "@/components/web3/WalletButton";
import { polygonscanLink } from "@/lib/web3";
import Link from "next/link";

const ROLE_LABELS: Record<string, string> = {
  BUYER: "Buyer", LANDLORD: "Landlord", INVESTOR: "Investor",
  AGENT: "Agent", DEVELOPER: "Developer", ADMIN: "Admin",
};
const ROLE_ROUTES: Record<string, string> = {
  BUYER: "/dashboard/buyer", LANDLORD: "/dashboard/landlord",
  INVESTOR: "/dashboard/investor", AGENT: "/dashboard/agent",
  DEVELOPER: "/dashboard/developer", ADMIN: "/dashboard/admin",
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { address, isConnected }  = useAccount();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications">("profile");
  const [saved, setSaved]   = useState(false);
  const [form, setForm]     = useState({ name: "", phone: "" });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session?.user?.name) setForm(f => ({ ...f, name: session.user!.name ?? "" }));
  }, [status, session, router]);

  const user  = session?.user as { name?: string; email?: string; role?: string } | undefined;
  const role  = user?.role ?? "BUYER";

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#060C07] flex items-center justify-center">
        <div className="text-[#C9A84C] font-playfair text-xl animate-pulse">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060C07] text-[#EDE9E1]">
      <header className="border-b border-[rgba(201,168,76,0.12)] px-6 py-4 flex items-center justify-between bg-[#0C1410]">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-playfair text-[#C9A84C] font-bold text-lg tracking-widest">WILLOW</Link>
          <span className="text-[#7A9175]">/</span>
          <Link href={ROLE_ROUTES[role]} className="text-[#7A9175] text-sm hover:text-[#EDE9E1] transition-colors">
            {ROLE_LABELS[role]} Dashboard
          </Link>
          <span className="text-[#7A9175]">/</span>
          <span className="text-[#7A9175] text-sm">Profile</span>
        </div>
        <WalletButton />
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* Avatar row */}
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-[rgba(201,168,76,0.15)] border border-[rgba(201,168,76,0.3)] flex items-center justify-center font-playfair text-2xl text-[#C9A84C] font-bold">
            {user?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <h1 className="font-playfair text-2xl text-[#EDE9E1]">{user?.name ?? "Your Account"}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-[rgba(201,168,76,0.12)] text-[#C9A84C] text-xs px-2 py-0.5 rounded-full">
                {ROLE_LABELS[role]}
              </span>
              <span className="text-[#7A9175] text-sm">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[rgba(201,168,76,0.12)]">
          {(["profile", "security", "notifications"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 capitalize transition-colors ${
                activeTab === tab
                  ? "border-[#C9A84C] text-[#C9A84C]"
                  : "border-transparent text-[#7A9175] hover:text-[#EDE9E1]"
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "profile" && (
          <div className="space-y-5">
            <div className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-6 space-y-5">
              <h3 className="font-playfair text-lg text-[#EDE9E1]">Personal Information</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[#7A9175] text-xs uppercase tracking-wider">Full Name</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full bg-[#0C1410] border border-[rgba(201,168,76,0.15)] rounded-lg px-4 py-3 text-[#EDE9E1] focus:outline-none focus:border-[#C9A84C] transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[#7A9175] text-xs uppercase tracking-wider">Email</label>
                  <input value={user?.email ?? ""} readOnly
                    className="w-full bg-[#0C1410] border border-[rgba(201,168,76,0.08)] rounded-lg px-4 py-3 text-[#7A9175] cursor-not-allowed" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[#7A9175] text-xs uppercase tracking-wider">Phone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+234 800 000 0000"
                    className="w-full bg-[#0C1410] border border-[rgba(201,168,76,0.15)] rounded-lg px-4 py-3 text-[#EDE9E1] placeholder-[#7A9175] focus:outline-none focus:border-[#C9A84C] transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[#7A9175] text-xs uppercase tracking-wider">Account Type</label>
                  <div className="w-full bg-[#0C1410] border border-[rgba(201,168,76,0.08)] rounded-lg px-4 py-3 text-[#C9A84C] font-medium">
                    {ROLE_LABELS[role]}
                  </div>
                </div>
              </div>

              {saved && (
                <div className="text-[#3DBA78] text-sm flex items-center gap-2">
                  <span>✓</span> Profile updated successfully
                </div>
              )}

              <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }}
                className="bg-[#C9A84C] hover:bg-[#d4b560] text-[#060C07] px-6 py-2.5 rounded-lg font-bold text-sm transition-colors">
                Save Changes
              </button>
            </div>

            <div className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-6 space-y-4">
              <h3 className="font-playfair text-lg text-[#EDE9E1]">Wallet</h3>
              {isConnected ? (
                <div className="space-y-3">
                  <div className="bg-[#0C1410] rounded-lg p-4 space-y-1">
                    <div className="text-[#7A9175] text-xs uppercase tracking-wider">Connected Address</div>
                    <div className="font-mono text-[#EDE9E1] text-sm break-all">{address}</div>
                  </div>
                  <a href={polygonscanLink("address", address ?? "")} target="_blank" rel="noopener noreferrer"
                    className="text-[#a970ff] text-xs hover:underline">View on Polygonscan ↗</a>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-[#7A9175] text-sm">Connect a wallet to enable on-chain features: property NFTs, lease contracts, and fractional tokens.</p>
                  <WalletButton />
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-6 space-y-5">
            <h3 className="font-playfair text-lg text-[#EDE9E1]">Security Settings</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[#7A9175] text-xs uppercase tracking-wider">Current Password</label>
                <input type="password" placeholder="••••••••"
                  className="w-full bg-[#0C1410] border border-[rgba(201,168,76,0.15)] rounded-lg px-4 py-3 text-[#EDE9E1] placeholder-[#7A9175] focus:outline-none focus:border-[#C9A84C] transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[#7A9175] text-xs uppercase tracking-wider">New Password</label>
                <input type="password" placeholder="At least 8 characters"
                  className="w-full bg-[#0C1410] border border-[rgba(201,168,76,0.15)] rounded-lg px-4 py-3 text-[#EDE9E1] placeholder-[#7A9175] focus:outline-none focus:border-[#C9A84C] transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[#7A9175] text-xs uppercase tracking-wider">Confirm New Password</label>
                <input type="password" placeholder="••••••••"
                  className="w-full bg-[#0C1410] border border-[rgba(201,168,76,0.15)] rounded-lg px-4 py-3 text-[#EDE9E1] placeholder-[#7A9175] focus:outline-none focus:border-[#C9A84C] transition-colors" />
              </div>
              <button className="bg-[#C9A84C] hover:bg-[#d4b560] text-[#060C07] px-6 py-2.5 rounded-lg font-bold text-sm transition-colors">
                Update Password
              </button>
            </div>

            <div className="pt-4 border-t border-[rgba(201,168,76,0.08)]">
              <h4 className="text-[#EDE9E1] font-medium mb-3">Danger Zone</h4>
              <button onClick={() => signOut({ callbackUrl: "/" })}
                className="bg-[rgba(224,82,82,0.1)] hover:bg-[rgba(224,82,82,0.2)] text-[#E05252] border border-[rgba(224,82,82,0.3)] px-6 py-2.5 rounded-lg text-sm transition-colors">
                Sign Out of All Devices
              </button>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-6 space-y-5">
            <h3 className="font-playfair text-lg text-[#EDE9E1]">Notification Preferences</h3>
            <div className="space-y-4">
              {[
                { label: "Price alerts for saved properties",      defaultOn: true },
                { label: "New listings in watched neighbourhoods", defaultOn: true },
                { label: "Lease payment reminders",                defaultOn: true },
                { label: "Investment yield payouts",               defaultOn: true },
                { label: "Platform news and updates",              defaultOn: false },
                { label: "Marketing communications",               defaultOn: false },
              ].map(n => (
                <div key={n.label} className="flex items-center justify-between py-2 border-b border-[rgba(201,168,76,0.06)] last:border-0">
                  <span className="text-[#EDE9E1] text-sm">{n.label}</span>
                  <div className={`relative w-10 h-6 rounded-full cursor-pointer transition-colors ${n.defaultOn ? "bg-[#C9A84C]" : "bg-[rgba(122,145,117,0.3)]"}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${n.defaultOn ? "translate-x-5" : "translate-x-1"}`} />
                  </div>
                </div>
              ))}
            </div>
            <button className="bg-[#C9A84C] hover:bg-[#d4b560] text-[#060C07] px-6 py-2.5 rounded-lg font-bold text-sm transition-colors">
              Save Preferences
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

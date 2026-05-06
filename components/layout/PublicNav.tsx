"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";

const NAV_LINKS = [
  { label: "Market",         href: "/market" },
  { label: "Shortlet",       href: "/shortlet" },
  { label: "Neighbourhoods", href: "/neighbourhood" },
  { label: "AI Valuation",   href: "/valuation" },
];

export function PublicNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const dashHref = () => {
    const role = (session?.user as {role?:string})?.role;
    if (role === "LANDLORD")  return "/dashboard/landlord";
    if (role === "INVESTOR")  return "/dashboard/investor";
    if (role === "DEVELOPER") return "/dashboard/developer";
    return "/login";
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-[rgba(6,12,7,0.85)] border-b border-[rgba(201,168,76,0.12)]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-playfair text-2xl text-[#C9A84C] tracking-widest font-bold">WILLOW</Link>

        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href}
              className={`text-sm transition-colors ${pathname === l.href ? "text-[#C9A84C]" : "text-[#7A9175] hover:text-[#EDE9E1]"}`}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {session ? (
            <Link href={dashHref()} className="bg-[#C9A84C] hover:bg-[#d4b560] text-[#060C07] px-4 py-2 rounded-lg text-sm font-bold transition-colors">
              Dashboard →
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-[#7A9175] hover:text-[#EDE9E1] text-sm transition-colors">Login</Link>
              <Link href="/login" className="bg-[#C9A84C] hover:bg-[#d4b560] text-[#060C07] px-4 py-2 rounded-lg text-sm font-bold transition-colors">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

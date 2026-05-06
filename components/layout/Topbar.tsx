"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

interface TopbarProps {
  breadcrumbs: { label: string; href?: string }[];
}

export function Topbar({ breadcrumbs }: TopbarProps) {
  const { data: session } = useSession();

  return (
    <header className="h-14 bg-[#0C1410] border-b border-[rgba(201,168,76,0.12)] flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((bc, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-[#7A9175]">/</span>}
            {bc.href ? (
              <Link href={bc.href} className="text-[#7A9175] hover:text-[#EDE9E1] transition-colors">{bc.label}</Link>
            ) : (
              <span className="text-[#EDE9E1]">{bc.label}</span>
            )}
          </span>
        ))}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <button className="relative text-[#7A9175] hover:text-[#EDE9E1] transition-colors p-1">
          <span className="text-lg">🔔</span>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#E05252] rounded-full" />
        </button>
        <div className="flex items-center gap-2 bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-lg px-3 py-1.5">
          <div className="w-6 h-6 rounded-full bg-[rgba(201,168,76,0.15)] flex items-center justify-center text-[#C9A84C] text-xs font-bold">
            {session?.user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <span className="text-[#EDE9E1] text-sm">{session?.user?.name}</span>
        </div>
        <Link href="/" className="text-[#7A9175] hover:text-[#C9A84C] text-xs transition-colors">Public Site</Link>
      </div>
    </header>
  );
}

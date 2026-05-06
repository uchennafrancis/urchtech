"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";

export interface NavItem { icon: string; label: string; href: string; }
interface FooterStat { label: string; value: string; }

interface SidebarProps {
  navItems: NavItem[];
  footerStats?: FooterStat[];
}

export function Sidebar({ navItems, footerStats }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  const role = (session?.user as {role?:string})?.role || "USER";

  return (
    <aside className={`fixed left-0 top-0 h-full bg-[#0C1410] border-r border-[rgba(201,168,76,0.12)] flex flex-col z-50 transition-all duration-300 ${collapsed ? "w-16" : "w-60"}`}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-[rgba(201,168,76,0.1)]">
        {!collapsed && (
          <div>
            <div className="font-playfair text-xl text-[#C9A84C] font-bold tracking-widest">WILLOW</div>
            <div className="text-[#7A9175] text-[9px] uppercase tracking-widest">by Urchmond</div>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="text-[#7A9175] hover:text-[#C9A84C] transition-colors ml-auto p-1">
          <span className="text-sm">{collapsed ? "▶" : "◀"}</span>
        </button>
      </div>

      {/* User info */}
      {!collapsed && session?.user && (
        <div className="px-4 py-3 border-b border-[rgba(201,168,76,0.08)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[rgba(201,168,76,0.15)] flex items-center justify-center text-[#C9A84C] text-sm font-bold flex-shrink-0">
              {session.user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <div className="text-[#EDE9E1] text-sm font-medium truncate">{session.user.name}</div>
              <div className="text-[#C9A84C] text-[9px] uppercase tracking-widest">{role}</div>
            </div>
          </div>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 py-3 overflow-y-auto space-y-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard/landlord" && item.href !== "/dashboard/investor" && item.href !== "/dashboard/developer" && pathname.startsWith(item.href));
          const exactActive = pathname === item.href;
          const isActive = exactActive || (!exactActive && active && item.href.split("/").length > 3);
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg transition-all ${
                isActive
                  ? "bg-[rgba(201,168,76,0.08)] text-[#C9A84C] border-l-2 border-[#C9A84C] rounded-l-none -ml-0 pl-3"
                  : "text-[#7A9175] hover:text-[#EDE9E1] hover:bg-[rgba(255,255,255,0.03)]"
              }`}>
              <span className="text-base flex-shrink-0 w-5 text-center">{item.icon}</span>
              {!collapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer stats */}
      {!collapsed && footerStats && footerStats.length > 0 && (
        <div className="px-4 py-3 border-t border-[rgba(201,168,76,0.1)] space-y-2">
          {footerStats.map((s) => (
            <div key={s.label}>
              <div className="text-[#7A9175] text-[9px] uppercase tracking-widest">{s.label}</div>
              <div className="font-playfair text-[#C9A84C] text-lg font-bold leading-tight">{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Logout */}
      <button onClick={() => signOut({ callbackUrl: "/login" })}
        className="flex items-center gap-3 m-2 px-3 py-2.5 rounded-lg text-[#7A9175] hover:text-[#E05252] hover:bg-[rgba(224,82,82,0.06)] transition-all">
        <span className="text-base w-5 text-center">🚪</span>
        {!collapsed && <span className="text-sm">Logout</span>}
      </button>
    </aside>
  );
}

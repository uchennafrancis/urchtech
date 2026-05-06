"use client";

import { ReactNode } from "react";
import { Sidebar, NavItem } from "./Sidebar";
import { Topbar } from "./Topbar";

interface DashboardLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  breadcrumbs: { label: string; href?: string }[];
  footerStats?: { label: string; value: string }[];
}

export function DashboardLayout({ children, navItems, breadcrumbs, footerStats }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#060C07]">
      <Sidebar navItems={navItems} footerStats={footerStats} />
      <div className="ml-60 transition-all duration-300">
        <Topbar breadcrumbs={breadcrumbs} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

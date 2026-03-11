"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard, MessageSquare, ClipboardList,
  User, Zap, Mic, Menu, X, Briefcase,
} from "lucide-react";

const NAV = [
  { href: "/candidate/dashboard",      label: "Dashboard",    short: "Home",     icon: LayoutDashboard },
  { href: "/candidate/mock-interview", label: "Practice",     short: "Practice", icon: MessageSquare  },
  { href: "/candidate/hr-interview",   label: "Technical",    short: "Technical",icon: Mic            },
  { href: "/candidate/assessments",    label: "Assessments",  short: "Tests",    icon: ClipboardList  },
  { href: "/candidate/jobs",           label: "Job Board",    short: "Jobs",     icon: Briefcase      },
  { href: "/candidate/profile",        label: "My Profile",   short: "Profile",  icon: User           },
];

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || (href !== "/candidate/dashboard" && pathname.startsWith(href));

  const activeItem = NAV.find(n => isActive(n.href));

  return (
    <div className="flex flex-col h-screen bg-slate-950">

      {/* ══ Top Navigation Bar ══════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3 px-4 h-14 max-w-screen-2xl mx-auto">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center shadow-md shadow-violet-900/50">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-sm hidden sm:block">AITestCraft</span>
          </Link>

          {/* Candidate badge */}
          <span className="text-[10px] text-violet-400 font-semibold bg-violet-500/10 border border-violet-500/20 rounded-full px-2 py-0.5 flex-shrink-0">
            Candidate
          </span>

          {/* Divider */}
          <div className="hidden md:block w-px h-5 bg-slate-700 mx-1" />

          {/* ── Desktop + Tablet nav ── */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1">
            {NAV.map(({ href, label, short, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link key={href} href={href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    active
                      ? "bg-violet-600/20 text-violet-300"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {/* Full label on lg+, short label on md */}
                  <span className="hidden lg:inline">{label}</span>
                  <span className="lg:hidden">{short}</span>
                </Link>
              );
            })}
          </nav>

          {/* Spacer for mobile */}
          <div className="flex-1 md:hidden" />

          {/* ── Mobile: active page label ── */}
          <span className="md:hidden text-white text-sm font-semibold truncate max-w-[140px]">
            {activeItem?.label ?? "Menu"}
          </span>

          <div className="flex-1 md:hidden" />

          {/* User button */}
          <div className="flex-shrink-0">
            <UserButton afterSignOutUrl="/" />
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="md:hidden flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* ── Mobile dropdown menu ── */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900/98 backdrop-blur px-4 py-3">
            <div className="grid grid-cols-3 gap-2">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link key={href} href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl text-center transition-all ${
                      active
                        ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                        : "text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent"
                    }`}>
                    <Icon className="w-5 h-5" />
                    <span className="text-[11px] font-medium leading-tight">{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* ══ Main content ═════════════════════════════════════════════════ */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

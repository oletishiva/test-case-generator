"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  MessageSquare,
  ClipboardList,
  User,
  Zap,
  Mic,
  Menu,
  X,
  Briefcase,
} from "lucide-react";

const NAV = [
  { href: "/candidate/dashboard",     label: "Dashboard",          icon: LayoutDashboard },
  { href: "/candidate/mock-interview", label: "Practice Assessment", icon: MessageSquare },
  { href: "/candidate/hr-interview",  label: "Technical Interview", icon: Mic },
  { href: "/candidate/assessments",   label: "Assessments",        icon: ClipboardList },
  { href: "/candidate/jobs",          label: "Job Board",          icon: Briefcase },
  { href: "/candidate/profile",       label: "My Profile",         icon: User },
];

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const NavLinks = ({ onClickLink }: { onClickLink?: () => void }) => (
    <>
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/candidate/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            onClick={onClickLink}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              active
                ? "bg-violet-600/20 text-violet-300 font-medium"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="flex h-screen bg-slate-950">

      {/* ── Desktop sidebar (hidden on mobile) ── */}
      <aside className="hidden md:flex w-60 flex-shrink-0 border-r border-slate-800 flex-col">
        <div className="p-5 border-b border-slate-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-sm">AITestCraft</span>
          </Link>
          <div className="mt-3 text-xs text-violet-400 font-medium bg-violet-500/10 rounded-full px-2 py-0.5 inline-block">
            Candidate
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <NavLinks />
        </nav>
        <div className="p-4 border-t border-slate-800 flex items-center gap-3">
          <UserButton afterSignOutUrl="/" />
          <span className="text-slate-400 text-xs">Account</span>
        </div>
      </aside>

      {/* ── Mobile drawer overlay ── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── Mobile slide-in drawer ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transform transition-transform duration-200 md:hidden ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" onClick={() => setDrawerOpen(false)}>
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-sm">AITestCraft</span>
          </Link>
          <button onClick={() => setDrawerOpen(false)} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-3 py-2">
          <span className="text-xs text-violet-400 font-medium bg-violet-500/10 rounded-full px-2 py-0.5 inline-block">
            Candidate
          </span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <NavLinks onClickLink={() => setDrawerOpen(false)} />
        </nav>
        <div className="p-4 border-t border-slate-800 flex items-center gap-3">
          <UserButton afterSignOutUrl="/" />
          <span className="text-slate-400 text-xs">Account</span>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900 flex-shrink-0">
          <button onClick={() => setDrawerOpen(true)} className="text-slate-400 hover:text-white p-1">
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-bold text-sm">AITestCraft</span>
          </Link>
          <UserButton afterSignOutUrl="/" />
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

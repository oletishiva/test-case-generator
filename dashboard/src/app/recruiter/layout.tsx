"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { LayoutDashboard, ClipboardList, Briefcase, Zap } from "lucide-react";

const NAV = [
  { href: "/recruiter/dashboard",   label: "Dashboard",   icon: LayoutDashboard },
  { href: "/recruiter/assessments", label: "Assessments", icon: ClipboardList },
  { href: "/recruiter/jobs",        label: "Jobs",        icon: Briefcase },
];

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex h-screen bg-slate-950">
      <aside className="w-60 flex-shrink-0 border-r border-slate-800 flex flex-col">
        <div className="p-5 border-b border-slate-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-sm">AITestCraft</span>
          </Link>
          <div className="mt-3 text-xs text-blue-400 font-medium bg-blue-500/10 rounded-full px-2 py-0.5 inline-block">
            Recruiter
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/recruiter/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active ? "bg-blue-600/20 text-blue-300 font-medium" : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800 flex items-center gap-3">
          <UserButton afterSignOutUrl="/" />
          <span className="text-slate-400 text-xs">Account</span>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

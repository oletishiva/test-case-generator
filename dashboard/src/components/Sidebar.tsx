"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, TestTube, Settings, Zap, BookOpen } from "lucide-react";

const navItems = [
  { href: "/dashboard",  label: "Dashboard",  icon: LayoutDashboard },
  { href: "/test-cases", label: "Test Cases",  icon: TestTube },
  { href: "/library",    label: "Library",     icon: BookOpen },
  { href: "/settings",   label: "Settings",    icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold text-gray-900">AITestCraft</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3">
        <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          Menu
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-violet-50 text-violet-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? "text-violet-600" : ""}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer hint */}
      <div className="border-t p-4">
        <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
          <p className="font-medium">Powered by Gemini AI</p>
          <p className="mt-0.5 opacity-70">gemini-1.5-flash</p>
        </div>
      </div>
    </aside>
  );
}

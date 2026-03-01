"use client";

import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/test-cases": "Test Cases",
  "/settings": "Settings",
};

export function TopBar() {
  const pathname = usePathname();
  const title = titles[pathname] ?? "AITestCraft";

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
      <UserButton />
    </header>
  );
}

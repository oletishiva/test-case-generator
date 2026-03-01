"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { FileText, Zap, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { TestTypeBadge } from "@/lib/test-output";

type TestCase = {
  id: string;
  title: string;
  framework: string;
  test_type: string;
  created_at: string;
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

export default function DashboardPage() {
  const { user } = useUser();
  const [total, setTotal] = useState(0);
  const [thisWeek, setThisWeek] = useState(0);
  const [recent, setRecent] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function load() {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Real total count (not capped by limit)
      const { count: totalCount } = await supabase()
        .from("test_cases")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id);

      // This week's count
      const { count: weekCount } = await supabase()
        .from("test_cases")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .gte("created_at", weekAgo);

      // Recent 5 for activity list
      const { data } = await supabase()
        .from("test_cases")
        .select("id, title, framework, test_type, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(5);

      setTotal(totalCount ?? 0);
      setThisWeek(weekCount ?? 0);
      setRecent(data ?? []);
      setLoading(false);
    }

    load();
  }, [user]);

  const stats = [
    { label: "Total Test Cases",    value: loading ? "…" : String(total),    icon: FileText, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Generated This Week", value: loading ? "…" : String(thisWeek), icon: Zap,      color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Saved to Library",    value: loading ? "…" : String(total),    icon: Clock,    color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Welcome back. Here&apos;s what&apos;s happening.</p>
        </div>
        <Link href="/test-cases">
          <Button className="bg-violet-600 hover:bg-violet-700 gap-2">
            <Zap className="h-4 w-4" /> Generate Test Cases
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick start */}
      <Card className="border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50">
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <h2 className="font-semibold text-gray-900">Generate your first test cases</h2>
            <p className="mt-1 text-sm text-gray-500">
              Paste a user story or feature description and get production-ready tests in seconds.
            </p>
          </div>
          <Link href="/test-cases">
            <Button className="shrink-0 gap-2 bg-violet-600 hover:bg-violet-700">
              Start generating <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recent activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <CardTitle className="text-base font-semibold">Recent generations</CardTitle>
          <Link href="/library" className="text-xs text-violet-600 hover:underline font-medium">
            View all →
          </Link>
        </CardHeader>
        <CardContent className="divide-y p-0">
          {loading && (
            <div className="px-6 py-8 text-center text-sm text-gray-400">Loading…</div>
          )}
          {!loading && recent.length === 0 && (
            <div className="px-6 py-8 text-center text-sm text-gray-400">
              No test cases yet.{" "}
              <Link href="/test-cases" className="text-violet-600 hover:underline">Generate your first one →</Link>
            </div>
          )}
          {recent.map((tc) => {
            const type = (tc.test_type ?? tc.framework ?? "").toLowerCase();
            return (
              <Link
                key={tc.id}
                href="/library"
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-violet-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                    <FileText className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{tc.title || "Untitled"}</p>
                    <p className="text-xs text-gray-400">{timeAgo(tc.created_at)}</p>
                  </div>
                </div>
                <TestTypeBadge type={type || tc.framework || "?"} />
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

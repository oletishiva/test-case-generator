"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  MessageSquare, ClipboardList, User, ArrowRight,
  Trophy, Clock, CheckCircle2, AlertCircle,
} from "lucide-react";

type Stats = {
  mockInterviewsCompleted: number;
  mockInterviewsTotal: number;
  assessmentsPending: number;
  assessmentsCompleted: number;
  avgScore: number | null;
};

export default function CandidateDashboardPage() {
  const { user } = useUser();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/candidate/stats")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const name = user?.firstName ?? "there";

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Welcome back, {name} 👋</h1>
        <p className="text-slate-400 mt-1 text-sm">Track your interview prep progress and pending assessments.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Mock Interviews",
            value: loading ? "…" : stats?.mockInterviewsCompleted ?? 0,
            sub: "completed",
            icon: MessageSquare,
            color: "text-violet-400",
            bg: "bg-violet-500/10",
          },
          {
            label: "Avg Score",
            value: loading ? "…" : stats?.avgScore != null ? `${Math.round(stats.avgScore)}%` : "—",
            sub: "across all interviews",
            icon: Trophy,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
          },
          {
            label: "Assessments",
            value: loading ? "…" : stats?.assessmentsPending ?? 0,
            sub: "pending",
            icon: AlertCircle,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
          },
          {
            label: "Completed",
            value: loading ? "…" : stats?.assessmentsCompleted ?? 0,
            sub: "assessments done",
            icon: CheckCircle2,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
          },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label} · {s.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          {
            href: "/candidate/mock-interview",
            icon: MessageSquare,
            title: "Start Mock Interview",
            desc: "Pick a topic and get AI-generated questions with instant feedback.",
            color: "border-violet-500/30 hover:border-violet-500",
            iconBg: "bg-violet-500/20",
            iconColor: "text-violet-400",
          },
          {
            href: "/candidate/assessments",
            icon: ClipboardList,
            title: "View Assessments",
            desc: "Complete company assessments you've been invited to.",
            color: "border-blue-500/30 hover:border-blue-500",
            iconBg: "bg-blue-500/20",
            iconColor: "text-blue-400",
          },
          {
            href: "/candidate/profile",
            icon: User,
            title: "Update Profile",
            desc: "Add skills, experience, and links to improve your visibility.",
            color: "border-emerald-500/30 hover:border-emerald-500",
            iconBg: "bg-emerald-500/20",
            iconColor: "text-emerald-400",
          },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className={`group bg-slate-900 border rounded-xl p-5 transition-all ${a.color}`}
          >
            <div className={`w-10 h-10 rounded-lg ${a.iconBg} flex items-center justify-center mb-3`}>
              <a.icon className={`w-5 h-5 ${a.iconColor}`} />
            </div>
            <div className="text-white font-semibold text-sm mb-1">{a.title}</div>
            <div className="text-slate-500 text-xs leading-relaxed">{a.desc}</div>
            <div className={`mt-3 flex items-center gap-1 text-xs font-medium ${a.iconColor}`}>
              Go <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {/* Tools reminder */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 flex items-start gap-4">
        <Clock className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
        <div>
          <div className="text-white text-sm font-medium mb-1">Prepare with AITestCraft tools</div>
          <p className="text-slate-500 text-xs leading-relaxed">
            Use the{" "}
            <Link href="/tools/interview-prep" className="text-violet-400 hover:underline">Interview Prep</Link>
            {" "}question bank and{" "}
            <Link href="/tools/code-converter" className="text-violet-400 hover:underline">Code Converter</Link>
            {" "}to sharpen your Playwright skills before interviews.
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { ClipboardList, Users, Trophy, Briefcase, ArrowRight, Plus } from "lucide-react";

type Stats = {
  assessmentsCount: number;
  candidatesInvited: number;
  candidatesCompleted: number;
  avgScore: number | null;
  jobsCount: number;
};

export default function RecruiterDashboardPage() {
  const { user } = useUser();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/recruiter/stats").then((r) => r.json()).then(setStats).catch(() => {});
  }, []);

  const name = user?.firstName ?? "there";
  const s = stats;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Welcome back, {name} 👋</h1>
        <p className="text-slate-400 text-sm mt-1">Manage assessments, track candidates, and post jobs.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Assessments", value: s?.assessmentsCount ?? "…", sub: "created", icon: ClipboardList, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Candidates", value: s?.candidatesInvited ?? "…", sub: "invited", icon: Users, color: "text-violet-400", bg: "bg-violet-500/10" },
          { label: "Avg Score", value: s?.avgScore != null ? `${Math.round(s.avgScore)}%` : "—", sub: "across all", icon: Trophy, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Jobs Posted", value: s?.jobsCount ?? "…", sub: "active & draft", icon: Briefcase, color: "text-emerald-400", bg: "bg-emerald-500/10" },
        ].map((st) => (
          <div key={st.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className={`w-9 h-9 rounded-lg ${st.bg} flex items-center justify-center mb-3`}>
              <st.icon className={`w-5 h-5 ${st.color}`} />
            </div>
            <div className="text-2xl font-bold text-white">{st.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{st.label} · {st.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            href: "/recruiter/assessments/create",
            icon: Plus,
            title: "Create Assessment",
            desc: "AI generates QA questions for your role. Invite candidates by email.",
            color: "border-blue-500/30 hover:border-blue-500",
            iconBg: "bg-blue-500/20", iconColor: "text-blue-400",
          },
          {
            href: "/recruiter/assessments",
            icon: ClipboardList,
            title: "View Assessments",
            desc: "See all assessments, results, and pending candidates.",
            color: "border-violet-500/30 hover:border-violet-500",
            iconBg: "bg-violet-500/20", iconColor: "text-violet-400",
          },
          {
            href: "/recruiter/jobs",
            icon: Briefcase,
            title: "Post a Job",
            desc: "Create a job posting and link it to an assessment.",
            color: "border-emerald-500/30 hover:border-emerald-500",
            iconBg: "bg-emerald-500/20", iconColor: "text-emerald-400",
          },
        ].map((a) => (
          <Link key={a.href} href={a.href} className={`group bg-slate-900 border rounded-xl p-5 transition-all ${a.color}`}>
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
    </div>
  );
}

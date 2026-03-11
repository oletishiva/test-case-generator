"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  MessageSquare, ClipboardList, Trophy, CheckCircle2, AlertCircle,
  Mic, FileText, BookOpen, Code2, Database, MapPin, Lock,
  ArrowRight, Crown, Sparkles, Zap, TrendingUp, Briefcase,
} from "lucide-react";

type Stats = {
  mockInterviewsCompleted: number;
  assessmentsPending: number;
  assessmentsCompleted: number;
  hrInterviewsCompleted: number;
  avgScore: number | null;
};

type Feature = {
  href: string;
  icon: React.ElementType;
  title: string;
  desc: string;
  freeLabel: string;
  proLabel: string;
  isPro: boolean;
  gradient: string;       // card bg gradient
  border: string;         // border + hover border
  glow: string;           // corner glow color
  iconGradient: string;   // icon bg gradient
  iconColor: string;
  textGradient: string;   // title gradient
  badge: string;          // free badge color
};

const INTERVIEW_FEATURES: Feature[] = [
  {
    href: "/candidate/mock-interview",
    icon: MessageSquare,
    title: "Practice Assessment",
    desc: "AI Q&A sessions by topic and difficulty. Get instant scored feedback on every answer.",
    freeLabel: "1 free session",
    proLabel: "Unlimited sessions",
    isPro: false,
    gradient: "from-violet-500/15 via-purple-500/5 to-slate-900",
    border: "border-violet-500/25 hover:border-violet-400/60",
    glow: "bg-violet-500/15",
    iconGradient: "from-violet-500/40 to-purple-600/30",
    iconColor: "text-violet-300",
    textGradient: "from-violet-300 to-purple-300",
    badge: "bg-violet-500/15 text-violet-300 border-violet-500/25",
  },
  {
    href: "/candidate/hr-interview",
    icon: Mic,
    title: "Technical Interview",
    desc: "Live AI voice interview — resume-powered, conversational, up to 20 questions in 15 min.",
    freeLabel: "1 free session",
    proLabel: "Unlimited sessions",
    isPro: false,
    gradient: "from-indigo-500/15 via-blue-500/5 to-slate-900",
    border: "border-indigo-500/25 hover:border-indigo-400/60",
    glow: "bg-indigo-500/15",
    iconGradient: "from-indigo-500/40 to-blue-600/30",
    iconColor: "text-indigo-300",
    textGradient: "from-indigo-300 to-blue-300",
    badge: "bg-indigo-500/15 text-indigo-300 border-indigo-500/25",
  },
  {
    href: "/candidate/assessments",
    icon: ClipboardList,
    title: "Company Assessments",
    desc: "Formal assessments sent by recruiters. Complete them to advance in job applications.",
    freeLabel: "Always free",
    proLabel: "Priority AI feedback",
    isPro: false,
    gradient: "from-sky-500/15 via-blue-500/5 to-slate-900",
    border: "border-sky-500/25 hover:border-sky-400/60",
    glow: "bg-sky-500/15",
    iconGradient: "from-sky-500/40 to-blue-600/30",
    iconColor: "text-sky-300",
    textGradient: "from-sky-300 to-blue-300",
    badge: "bg-sky-500/15 text-sky-300 border-sky-500/25",
  },
];

const TOOL_FEATURES: Feature[] = [
  {
    href: "/test-cases",
    icon: FileText,
    title: "Test Case Generator",
    desc: "Generate manual, BDD, Playwright & API test cases from any feature description instantly.",
    freeLabel: "10 generations/day",
    proLabel: "Unlimited generations",
    isPro: false,
    gradient: "from-fuchsia-500/15 via-pink-500/5 to-slate-900",
    border: "border-fuchsia-500/25 hover:border-fuchsia-400/60",
    glow: "bg-fuchsia-500/15",
    iconGradient: "from-fuchsia-500/40 to-pink-600/30",
    iconColor: "text-fuchsia-300",
    textGradient: "from-fuchsia-300 to-pink-300",
    badge: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/25",
  },
  {
    href: "/tools/locators",
    icon: MapPin,
    title: "Locator Generator",
    desc: "Auto-generate robust selectors for Playwright, Selenium, Cypress & more frameworks.",
    freeLabel: "20 locators/day",
    proLabel: "Unlimited locators",
    isPro: false,
    gradient: "from-cyan-500/15 via-teal-500/5 to-slate-900",
    border: "border-cyan-500/25 hover:border-cyan-400/60",
    glow: "bg-cyan-500/15",
    iconGradient: "from-cyan-500/40 to-teal-600/30",
    iconColor: "text-cyan-300",
    textGradient: "from-cyan-300 to-teal-300",
    badge: "bg-cyan-500/15 text-cyan-300 border-cyan-500/25",
  },
  {
    href: "/tools/test-data",
    icon: Database,
    title: "Test Data Generator",
    desc: "Realistic test data sets — names, emails, addresses, and fully custom schemas.",
    freeLabel: "50 records/day",
    proLabel: "Unlimited records",
    isPro: false,
    gradient: "from-emerald-500/15 via-green-500/5 to-slate-900",
    border: "border-emerald-500/25 hover:border-emerald-400/60",
    glow: "bg-emerald-500/15",
    iconGradient: "from-emerald-500/40 to-green-600/30",
    iconColor: "text-emerald-300",
    textGradient: "from-emerald-300 to-green-300",
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  },
  {
    href: "/tools/interview-prep",
    icon: BookOpen,
    title: "Interview Prep Bank",
    desc: "500+ curated QA interview questions across all frameworks, difficulty levels, and topics.",
    freeLabel: "Browse (no download)",
    proLabel: "Download full bank",
    isPro: false,
    gradient: "from-amber-500/15 via-orange-500/5 to-slate-900",
    border: "border-amber-500/25 hover:border-amber-400/60",
    glow: "bg-amber-500/15",
    iconGradient: "from-amber-500/40 to-orange-600/30",
    iconColor: "text-amber-300",
    textGradient: "from-amber-300 to-orange-300",
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/25",
  },
  {
    href: "/tools/code-converter",
    icon: Code2,
    title: "Code Converter",
    desc: "Convert test scripts between Selenium, Cypress, Playwright, Robot Framework & 6 more.",
    freeLabel: "5 conversions/day",
    proLabel: "Unlimited conversions",
    isPro: false,
    gradient: "from-lime-500/15 via-green-500/5 to-slate-900",
    border: "border-lime-500/25 hover:border-lime-400/60",
    glow: "bg-lime-500/15",
    iconGradient: "from-lime-500/40 to-green-600/30",
    iconColor: "text-lime-300",
    textGradient: "from-lime-300 to-green-300",
    badge: "bg-lime-500/15 text-lime-300 border-lime-500/25",
  },
  {
    href: "/candidate/resume",
    icon: FileText,
    title: "Resume Builder",
    desc: "AI-crafted QA resume tailored to your skills, experience level, and target roles.",
    freeLabel: "Free with watermark",
    proLabel: "Clean PDF, no watermark",
    isPro: true,
    gradient: "from-rose-500/15 via-pink-500/5 to-slate-900",
    border: "border-rose-500/25 hover:border-rose-400/60",
    glow: "bg-rose-500/15",
    iconGradient: "from-rose-500/40 to-pink-600/30",
    iconColor: "text-rose-300",
    textGradient: "from-rose-300 to-pink-300",
    badge: "bg-rose-500/15 text-rose-300 border-rose-500/25",
  },
];

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
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">

      {/* ── Hero header ──────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-900/50 via-slate-900 to-indigo-900/40 border border-violet-500/20 p-6 sm:p-8 mb-8">
        {/* Background glows */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs font-medium">Free Plan Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                {name}
              </span>
            </h1>
            <p className="text-slate-400 text-sm">Your QA career hub — practice, prepare, and get hired.</p>
          </div>

          <button className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40">
            <Crown className="w-4 h-4" />
            Upgrade to Pro
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Stats row ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">
        {[
          {
            label: "Practice Sessions",
            value: loading ? "—" : stats?.mockInterviewsCompleted ?? 0,
            sub: "completed",
            icon: MessageSquare,
            gradient: "from-violet-600/20 to-purple-600/10",
            border: "border-violet-500/20",
            iconBg: "bg-violet-500/20",
            iconColor: "text-violet-400",
            numColor: "text-violet-300",
          },
          {
            label: "Tech Interviews",
            value: loading ? "—" : stats?.hrInterviewsCompleted ?? 0,
            sub: "completed",
            icon: Mic,
            gradient: "from-indigo-600/20 to-blue-600/10",
            border: "border-indigo-500/20",
            iconBg: "bg-indigo-500/20",
            iconColor: "text-indigo-400",
            numColor: "text-indigo-300",
          },
          {
            label: "Avg Score",
            value: loading ? "—" : stats?.avgScore != null ? `${Math.round(stats.avgScore)}%` : "—",
            sub: "across sessions",
            icon: Trophy,
            gradient: "from-amber-600/20 to-orange-600/10",
            border: "border-amber-500/20",
            iconBg: "bg-amber-500/20",
            iconColor: "text-amber-400",
            numColor: "text-amber-300",
          },
          {
            label: "Assessments",
            value: loading ? "—" : stats?.assessmentsPending ?? 0,
            sub: "pending",
            icon: AlertCircle,
            gradient: "from-blue-600/20 to-sky-600/10",
            border: "border-blue-500/20",
            iconBg: "bg-blue-500/20",
            iconColor: "text-blue-400",
            numColor: "text-blue-300",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`relative overflow-hidden bg-gradient-to-br ${s.gradient} border ${s.border} rounded-2xl p-4`}
          >
            <div className={`w-8 h-8 rounded-xl ${s.iconBg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-4 h-4 ${s.iconColor}`} />
            </div>
            <div className={`text-3xl font-black ${s.numColor} mb-0.5`}>{s.value}</div>
            <div className="text-xs text-slate-500 leading-tight">{s.label}</div>
            <div className="text-xs text-slate-600">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Interview & Practice section ─────────────────────── */}
      <SectionHeader icon={Mic} label="Interview & Practice" color="text-indigo-400" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {INTERVIEW_FEATURES.map((f) => <FeatureCard key={f.href} f={f} />)}
      </div>

      {/* ── QA Tools section ─────────────────────────────────── */}
      <SectionHeader icon={Zap} label="QA Tools" color="text-violet-400" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {TOOL_FEATURES.map((f) => <FeatureCard key={f.href} f={f} />)}
      </div>

      {/* ── Job Board (coming soon) ───────────────────────────── */}
      <SectionHeader icon={Briefcase} label="Job Board" color="text-emerald-400" />
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-900/20 via-slate-900 to-teal-900/10 p-6 mb-10">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-wrap items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white font-bold text-sm">QA Job Board</span>
              <span className="text-xs bg-amber-500/15 text-amber-400 border border-amber-500/20 rounded-full px-2 py-0.5 font-medium">Coming Soon</span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              Browse live QA automation jobs from LinkedIn, Indeed & Glassdoor — aggregated in one place, filtered for your skill set.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400">3,600+ open roles</span>
          </div>
        </div>
      </div>

      {/* ── Pro upgrade banner ───────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-900/40 via-slate-900 to-indigo-900/30 p-6 sm:p-8">
        <div className="absolute -top-10 -left-10 w-52 h-52 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-52 h-52 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/40 to-indigo-500/30 border border-violet-500/20 flex items-center justify-center">
                <Crown className="w-5 h-5 text-violet-300" />
              </div>
              <div>
                <div className="text-white font-black text-lg">Upgrade to Pro</div>
                <div className="text-slate-400 text-xs">Remove all limits · $9/month</div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                "Unlimited test case, locator & test data generations",
                "Unlimited practice assessments & technical interviews",
                "Full interview prep question bank download",
                "Resume builder with clean PDF (no watermark)",
                "Priority AI response speed",
                "Early access to new features",
              ].map((p) => (
                <div key={p} className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-violet-400 flex-shrink-0 mt-0.5" />
                  {p}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-3 flex-shrink-0">
            <button className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105">
              <Sparkles className="w-4 h-4" /> Unlock Pro
              <ArrowRight className="w-4 h-4" />
            </button>
            <span className="text-slate-600 text-xs">Cancel anytime · No commitment</span>
          </div>
        </div>
      </div>

    </div>
  );
}

function SectionHeader({ icon: Icon, label, color }: { icon: React.ElementType; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className={`w-4 h-4 ${color}`} />
      <h2 className="text-sm font-bold text-white uppercase tracking-widest">{label}</h2>
      <div className="flex-1 h-px bg-slate-800" />
    </div>
  );
}

function FeatureCard({ f }: { f: Feature }) {
  const inner = (
    <div
      className={`group relative overflow-hidden h-full bg-gradient-to-br ${f.gradient} border ${f.border} rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer`}
    >
      {/* Corner glow */}
      <div className={`absolute -top-8 -right-8 w-32 h-32 ${f.glow} rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none`} />

      {/* Pro badge */}
      {f.isPro && (
        <div className="absolute top-3 right-3 flex items-center gap-1 text-xs bg-gradient-to-r from-violet-500/20 to-indigo-500/20 text-violet-300 border border-violet-500/30 rounded-full px-2 py-0.5 font-semibold">
          <Crown className="w-2.5 h-2.5" /> Pro
        </div>
      )}

      {/* Icon */}
      <div className={`relative w-11 h-11 rounded-xl bg-gradient-to-br ${f.iconGradient} border border-white/5 flex items-center justify-center mb-4 flex-shrink-0`}>
        <f.icon className={`w-5 h-5 ${f.iconColor}`} />
      </div>

      {/* Title */}
      <h3 className={`font-bold text-sm mb-1.5 bg-gradient-to-r ${f.textGradient} bg-clip-text text-transparent`}>
        {f.title}
      </h3>

      {/* Description */}
      <p className="text-slate-500 text-xs leading-relaxed mb-5">{f.desc}</p>

      {/* Free / Pro labels */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs text-slate-400">Free: {f.freeLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
          <span className={`text-xs font-medium ${f.isPro ? "text-violet-400" : "text-slate-500"}`}>
            Pro: {f.proLabel}
          </span>
        </div>
      </div>

      {/* CTA */}
      <div className={`flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r ${f.textGradient} bg-clip-text text-transparent group-hover:gap-2.5 transition-all`}>
        {f.isPro ? (
          <span className="flex items-center gap-1.5 text-violet-400">
            <Crown className="w-3.5 h-3.5" /> Upgrade to unlock
          </span>
        ) : (
          <>
            Open tool
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </div>
    </div>
  );

  if (f.isPro) return <div className="h-full">{inner}</div>;
  return <Link href={f.href} className="h-full block">{inner}</Link>;
}

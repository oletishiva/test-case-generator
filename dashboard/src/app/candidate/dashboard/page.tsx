"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  MessageSquare, ClipboardList, Trophy, CheckCircle2, AlertCircle,
  Mic, FileText, BookOpen, Code2, Database, MapPin, Lock,
  Sparkles, Zap, ArrowRight, Crown,
} from "lucide-react";

type Stats = {
  mockInterviewsCompleted: number;
  assessmentsPending: number;
  assessmentsCompleted: number;
  hrInterviewsCompleted: number;
  avgScore: number | null;
};

// ── Feature card types ──────────────────────────────────────────────
type FeatureCard = {
  href: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  desc: string;
  freeLabel: string;
  proLabel: string;
  isPro: boolean;
  accentBorder: string;
};

const FEATURES: FeatureCard[] = [
  {
    href: "/tools/test-cases",
    icon: FileText,
    iconColor: "text-violet-400",
    iconBg: "bg-violet-500/15",
    title: "Test Case Generator",
    desc: "Generate manual, BDD, Playwright & API test cases from any feature description.",
    freeLabel: "10 generations/day",
    proLabel: "Unlimited generations",
    isPro: false,
    accentBorder: "hover:border-violet-500/50",
  },
  {
    href: "/tools/locators",
    icon: MapPin,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/15",
    title: "Locator Generator",
    desc: "Auto-generate robust selectors for Playwright, Selenium, Cypress & more.",
    freeLabel: "20 locators/day",
    proLabel: "Unlimited locators",
    isPro: false,
    accentBorder: "hover:border-blue-500/50",
  },
  {
    href: "/tools/test-data",
    icon: Database,
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/15",
    title: "Test Data Generator",
    desc: "Generate realistic test data sets — names, emails, addresses, custom schemas.",
    freeLabel: "50 records/day",
    proLabel: "Unlimited records",
    isPro: false,
    accentBorder: "hover:border-cyan-500/50",
  },
  {
    href: "/tools/interview-prep",
    icon: BookOpen,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/15",
    title: "Interview Prep Bank",
    desc: "500+ QA interview questions across frameworks, difficulty levels, and topics.",
    freeLabel: "Browse questions (no download)",
    proLabel: "Download full question bank",
    isPro: false,
    accentBorder: "hover:border-amber-500/50",
  },
  {
    href: "/tools/code-converter",
    icon: Code2,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/15",
    title: "Code Converter",
    desc: "Convert test scripts between Selenium, Cypress, Playwright, Robot Framework & more.",
    freeLabel: "5 conversions/day",
    proLabel: "Unlimited conversions",
    isPro: false,
    accentBorder: "hover:border-emerald-500/50",
  },
  {
    href: "/candidate/mock-interview",
    icon: MessageSquare,
    iconColor: "text-violet-400",
    iconBg: "bg-violet-500/15",
    title: "Practice Assessment",
    desc: "AI-generated Q&A sessions by topic and difficulty. Get instant scored feedback.",
    freeLabel: "1 session (free forever)",
    proLabel: "Unlimited sessions",
    isPro: false,
    accentBorder: "hover:border-violet-500/50",
  },
  {
    href: "/candidate/hr-interview",
    icon: Mic,
    iconColor: "text-indigo-400",
    iconBg: "bg-indigo-500/15",
    title: "Technical Interview",
    desc: "AI voice interview — conversational, resume-powered, up to 20 questions in 15 min.",
    freeLabel: "1 session (free forever)",
    proLabel: "Unlimited sessions",
    isPro: false,
    accentBorder: "hover:border-indigo-500/50",
  },
  {
    href: "/candidate/assessments",
    icon: ClipboardList,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/15",
    title: "Company Assessments",
    desc: "Formal assessments sent by recruiters. Complete them to advance in job applications.",
    freeLabel: "Always free",
    proLabel: "Priority scoring & feedback",
    isPro: false,
    accentBorder: "hover:border-blue-500/50",
  },
  {
    href: "/candidate/resume",
    icon: FileText,
    iconColor: "text-rose-400",
    iconBg: "bg-rose-500/15",
    title: "Resume Builder",
    desc: "AI-assisted QA resume tailored to your skills, experience, and target roles.",
    freeLabel: "Free with watermark",
    proLabel: "Clean PDF, no watermark",
    isPro: true,
    accentBorder: "hover:border-rose-500/50",
  },
];

const PRO_PERKS = [
  "Unlimited test case, locator & test data generations",
  "Unlimited practice assessments & technical interviews",
  "Full interview prep question bank download",
  "Resume builder with clean PDF (no watermark)",
  "Priority AI response speed",
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

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back, {name}</h1>
          <p className="text-slate-400 mt-1 text-sm">Your QA career hub — practice, prepare, and get hired.</p>
        </div>
        {/* Free plan badge */}
        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5">
          <Zap className="w-4 h-4 text-slate-400" />
          <span className="text-slate-300 text-sm font-medium">Free Plan</span>
          <span className="text-slate-600 text-sm">·</span>
          <button className="flex items-center gap-1 text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors">
            <Crown className="w-3.5 h-3.5" /> Upgrade
          </button>
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        {[
          {
            label: "Practice Sessions",
            value: loading ? "…" : stats?.mockInterviewsCompleted ?? 0,
            sub: "completed",
            icon: MessageSquare,
            color: "text-violet-400",
            bg: "bg-violet-500/10",
          },
          {
            label: "Technical Interviews",
            value: loading ? "…" : stats?.hrInterviewsCompleted ?? 0,
            sub: "completed",
            icon: Mic,
            color: "text-indigo-400",
            bg: "bg-indigo-500/10",
          },
          {
            label: "Avg Score",
            value: loading ? "…" : stats?.avgScore != null ? `${Math.round(stats.avgScore)}%` : "—",
            sub: "across sessions",
            icon: Trophy,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
          },
          {
            label: "Assessments",
            value: loading ? "…" : (stats?.assessmentsPending ?? 0),
            sub: "pending",
            icon: AlertCircle,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
          },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5 leading-tight">{s.label} · {s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Feature cards ──────────────────────────────────── */}
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-violet-400" />
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">All Features</h2>
      </div>
      <p className="text-slate-500 text-xs mb-6">Free limits reset daily · Pro unlocks everything</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {FEATURES.map((f) => (
          <FeatureCard key={f.href} feature={f} />
        ))}
      </div>

      {/* ── Pro upgrade banner ─────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-900/30 via-slate-900 to-indigo-900/20 p-6 sm:p-8">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 to-indigo-600/5 pointer-events-none" />

        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                <Crown className="w-4 h-4 text-violet-400" />
              </div>
              <span className="text-white font-bold">Upgrade to Pro</span>
              <span className="text-xs bg-violet-500/20 text-violet-400 border border-violet-500/30 rounded-full px-2 py-0.5 font-medium">$9/mo</span>
            </div>
            <p className="text-slate-400 text-sm mb-4 leading-relaxed">
              Remove all limits and unlock your full interview preparation potential.
            </p>
            <ul className="space-y-1.5">
              {PRO_PERKS.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-violet-400 flex-shrink-0 mt-0.5" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-3 flex-shrink-0">
            <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
              <Crown className="w-4 h-4" /> Upgrade Now
              <ArrowRight className="w-4 h-4" />
            </button>
            <span className="text-slate-600 text-xs">No credit card required to try</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ feature: f }: { feature: FeatureCard }) {
  const card = (
    <div className={`group relative bg-slate-900 border border-slate-800 rounded-xl p-5 transition-all duration-200 h-full flex flex-col ${f.accentBorder} ${f.isPro ? "opacity-90" : ""}`}>

      {/* Pro badge */}
      {f.isPro && (
        <div className="absolute top-3 right-3 flex items-center gap-1 text-xs bg-violet-500/15 text-violet-400 border border-violet-500/25 rounded-full px-2 py-0.5 font-medium">
          <Crown className="w-3 h-3" /> Pro
        </div>
      )}

      {/* Icon + title */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg ${f.iconBg} flex items-center justify-center flex-shrink-0`}>
          <f.icon className={`w-4 h-4 ${f.iconColor}`} />
        </div>
        <div className="min-w-0 pt-0.5">
          <div className="text-white font-semibold text-sm leading-tight">{f.title}</div>
        </div>
      </div>

      {/* Description */}
      <p className="text-slate-500 text-xs leading-relaxed mb-4 flex-1">{f.desc}</p>

      {/* Free / Pro labels */}
      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-2 text-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span className="text-slate-300">{f.freeLabel}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Lock className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
          <span className="text-violet-400 font-medium">{f.proLabel}</span>
        </div>
      </div>

      {/* CTA */}
      <div className={`flex items-center gap-1 text-xs font-medium ${f.iconColor} group-hover:gap-2 transition-all`}>
        {f.isPro ? (
          <span className="flex items-center gap-1 text-violet-400">
            <Crown className="w-3.5 h-3.5" /> Upgrade to access
          </span>
        ) : (
          <>Open <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" /></>
        )}
      </div>
    </div>
  );

  if (f.isPro) {
    return (
      <button className="text-left h-full w-full" title="Upgrade to Pro to access this feature">
        {card}
      </button>
    );
  }

  return (
    <Link href={f.href} className="h-full">
      {card}
    </Link>
  );
}

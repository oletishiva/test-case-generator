"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, TestTube, Sparkles, ChevronDown, Play,
  CheckCircle2, GitBranch, BarChart3, Users, CloudLightning,
  Settings2, Target, Database, FileText, RefreshCw, GraduationCap,
  Building2, User, Menu, X, ChevronRight, Rocket, Star,
  BookOpen, Lock, Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* ─── Nav tools list ──────────────────────────────────────── */
const NAV_TOOLS = [
  { label: "AI Test Generator", desc: "Generate tests from plain English", icon: Sparkles, href: "/dashboard" },
  { label: "Locator Capture", desc: "Auto-generate robust selectors", icon: Target, href: "/tools/locators" },
  { label: "Test Data Generator", desc: "Create schema-aware test data", icon: Database, href: "/tools/test-data" },
  { label: "Resume Builder", desc: "ATS-optimised QA resumes", icon: FileText, href: "/resume-builder" },
  { label: "Code Converter", desc: "Translate across 50+ frameworks", icon: RefreshCw, href: "/dashboard" },
  { label: "Interview Prep", desc: "500+ QA interview questions", icon: GraduationCap, href: "/tools/interview-prep" },
];

/* ─── Hero content per audience ──────────────────────────── */
const HERO = {
  teams: {
    badge: "For Engineering Teams",
    line1: "AI-powered test automation",
    line2: "at enterprise scale",
    sub: "Generate production-ready Playwright, Cypress & Selenium suites in seconds. Integrate with CI/CD. Ship faster with confidence.",
    cta: "Start free for teams",
    ctaHref: "/sign-up",
    secondary: "Book a demo",
    pills: ["CI/CD Integration", "Team Workspaces", "Coverage Analytics", "SSO / SAML"],
  },
  candidates: {
    badge: "For QA Candidates",
    line1: "Land your dream",
    line2: "QA engineering role",
    sub: "Build an ATS-ready resume, practice 500+ interview questions, convert code across frameworks and generate test data — all free.",
    cta: "Start for free",
    ctaHref: "/sign-up",
    secondary: "Explore tools",
    pills: ["Resume Builder", "Interview Prep", "Code Converter", "Test Data Gen"],
  },
};

/* ─── Tool cards ─────────────────────────────────────────── */
const TOOLS = [
  {
    icon: Sparkles,
    name: "AI Test Generator",
    desc: "Describe a feature in plain English. Get Playwright, Cypress, Jest or BDD tests with edge cases in under 30 seconds.",
    href: "/dashboard",
    audience: "Everyone",
    audienceCls: "bg-violet-100 text-violet-700",
    color: "#7c3aed",
    light: "#f5f3ff",
    border: "#ede9fe",
    tag: "Most Popular",
  },
  {
    icon: Target,
    name: "Smart Locator Capture",
    desc: "Auto-generate robust XPath, CSS and data-testid selectors powered by AI. Selectors that survive UI changes.",
    href: "/tools/locators",
    audience: "Teams & Candidates",
    audienceCls: "bg-blue-100 text-blue-700",
    color: "#2563eb",
    light: "#eff6ff",
    border: "#dbeafe",
    tag: null,
  },
  {
    icon: Database,
    name: "Test Data Generator",
    desc: "Create realistic, schema-aware test data for any scenario. Export as CSV, JSON or SQL instantly.",
    href: "/tools/test-data",
    audience: "Everyone",
    audienceCls: "bg-teal-100 text-teal-700",
    color: "#0d9488",
    light: "#f0fdfa",
    border: "#ccfbf1",
    tag: null,
  },
  {
    icon: FileText,
    name: "QA Resume Builder",
    desc: "ATS-optimised resumes for QA engineers. AI-powered bullet points, 8 premium templates, instant PDF export.",
    href: "/resume-builder",
    audience: "Candidates",
    audienceCls: "bg-rose-100 text-rose-700",
    color: "#e11d48",
    light: "#fff1f2",
    border: "#fecdd3",
    tag: "New",
  },
  {
    icon: RefreshCw,
    name: "Code Converter",
    desc: "Translate test code across 50+ frameworks instantly. Selenium → Playwright. Java → Python. TestNG → Cypress.",
    href: "/dashboard",
    audience: "Candidates",
    audienceCls: "bg-orange-100 text-orange-700",
    color: "#ea580c",
    light: "#fff7ed",
    border: "#fed7aa",
    tag: null,
  },
  {
    icon: GraduationCap,
    name: "Interview Prep",
    desc: "500+ QA interview questions with model answers. Covers manual testing, automation, BDD, CI/CD and more.",
    href: "/tools/interview-prep",
    audience: "Candidates",
    audienceCls: "bg-amber-100 text-amber-700",
    color: "#d97706",
    light: "#fffbeb",
    border: "#fde68a",
    tag: null,
  },
];

/* ─── B2B features ───────────────────────────────────────── */
const B2B_FEATURES = [
  { icon: GitBranch, title: "CI/CD Integration", desc: "Connect to GitHub Actions, Jenkins, CircleCI. Trigger test generation on every PR automatically." },
  { icon: Users, title: "Team Workspaces", desc: "Share test libraries, collaborate on suites and manage permissions across your QA team." },
  { icon: BarChart3, title: "Coverage Analytics", desc: "Track test coverage per feature. Identify gaps before they reach production." },
  { icon: Lock, title: "SSO / SAML", desc: "Enterprise-grade auth with Okta, Azure AD and Google Workspace integration." },
  { icon: CloudLightning, title: "Bulk Generation", desc: "Generate 100+ test cases in one run. Perfect for large regression packs." },
  { icon: Settings2, title: "Custom Frameworks", desc: "Support for proprietary frameworks and custom coding standards tailored to your stack." },
];

/* ─── B2C features ───────────────────────────────────────── */
const B2C_FEATURES = [
  { icon: FileText, title: "ATS-Ready Resumes", desc: "8 premium templates designed to pass ATS screening and impress hiring managers." },
  { icon: GraduationCap, title: "Interview Question Bank", desc: "500+ real interview questions from top companies with detailed model answers." },
  { icon: RefreshCw, title: "50+ Framework Converter", desc: "Switch between any testing framework in seconds. Boost your market versatility." },
  { icon: Sparkles, title: "AI Test Practice", desc: "Generate tests for practice scenarios to build your portfolio and sharpen skills." },
  { icon: Database, title: "Test Data for Interviews", desc: "Generate realistic test data on the spot during live coding rounds." },
  { icon: BookOpen, title: "QA Blog & Guides", desc: "In-depth guides on automation, BDD, API testing and career growth from QA experts." },
];

/* ─── Stats ──────────────────────────────────────────────── */
const STATS = [
  { n: "50k+", l: "Test cases generated" },
  { n: "8", l: "Resume templates" },
  { n: "50+", l: "Frameworks supported" },
  { n: "< 30s", l: "Average generation time" },
];

/* ─── Testimonials ───────────────────────────────────────── */
const TESTIMONIALS = [
  {
    quote: "We went from writing tests manually over 2 days to generating a full regression suite in under an hour. Game-changer for our CI pipeline.",
    author: "Senior QA Engineer",
    company: "SaaS startup, Series B",
    avatar: "S",
  },
  {
    quote: "I landed my SDET role within 3 weeks. The resume builder and interview prep were exactly what I needed. Questions were spot-on for what I was asked.",
    author: "SDET",
    company: "Joined a FinTech company",
    avatar: "A",
  },
  {
    quote: "The locator generator alone saved us hours every sprint. No more fragile selectors breaking after a UI update.",
    author: "Automation Lead",
    company: "E-commerce platform",
    avatar: "R",
  },
];

/* ─── Footer columns ─────────────────────────────────────── */
const FOOTER_COLS = [
  {
    heading: "Tools",
    links: [
      { label: "AI Test Generator", href: "/dashboard" },
      { label: "Locator Capture", href: "/tools/locators" },
      { label: "Test Data Generator", href: "/tools/test-data" },
      { label: "Resume Builder", href: "/resume-builder" },
      { label: "Code Converter", href: "/dashboard" },
    ],
  },
  {
    heading: "For Teams",
    links: [
      { label: "CI/CD Integration", href: "#" },
      { label: "Team Workspaces", href: "#" },
      { label: "Coverage Analytics", href: "#" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    heading: "For Candidates",
    links: [
      { label: "Resume Builder", href: "/resume-builder" },
      { label: "Interview Prep", href: "/tools/interview-prep" },
      { label: "Code Converter", href: "/dashboard" },
      { label: "Blog & Guides", href: "/blog" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Docs", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
];

/* ─── Dropdown: Tools ────────────────────────────────────── */
function ToolsDropdown() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors py-1">
        Tools <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
          {NAV_TOOLS.map((t) => (
            <Link
              key={t.label}
              href={t.href}
              className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-gray-50 transition-colors"
            >
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-50">
                <t.icon className="h-3.5 w-3.5 text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{t.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Dropdown: Solutions ────────────────────────────────── */
function SolutionsDropdown() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors py-1">
        Solutions <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-60 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
          {[
            { label: "For Engineering Teams", desc: "CI/CD, team workspaces, analytics", icon: Building2, href: "/sign-up" },
            { label: "For QA Candidates", desc: "Resume, interview prep, career tools", icon: User, href: "/sign-up" },
          ].map(({ label, desc, icon: Icon, href }) => (
            <Link
              key={label}
              href={href}
              className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-gray-50 transition-colors"
            >
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                <Icon className="h-3.5 w-3.5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function MarketingPage() {
  const [audience, setAudience] = useState<"teams" | "candidates">("teams");
  const [mobileOpen, setMobileOpen] = useState(false);
  const hero = HERO[audience];

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">

      {/* ── Top banner ── */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-center text-xs font-medium text-white">
        🚀 New: Resume Builder + Smart Locator Capture now live —{" "}
        <Link href="/sign-up" className="underline underline-offset-2 hover:opacity-80">Try free →</Link>
      </div>

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
              <TestTube className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900">AITestCraft</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-7 lg:flex">
            <ToolsDropdown />
            <SolutionsDropdown />
            <Link href="/blog" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Blog</Link>
            <Link href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link>
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-2">
            <Link href="/sign-in" className="hidden text-sm text-gray-500 hover:text-gray-900 transition-colors sm:block">
              Login
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-sm px-4">
                Get Started Free
              </Button>
            </Link>
            <button
              className="ml-1 flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t bg-white lg:hidden"
            >
              <div className="px-4 py-3 space-y-0.5">
                <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Tools</p>
                {NAV_TOOLS.map((t) => (
                  <Link
                    key={t.label}
                    href={t.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setMobileOpen(false)}
                  >
                    <t.icon className="h-4 w-4 text-gray-400 shrink-0" />
                    {t.label}
                  </Link>
                ))}
                <div className="border-t pt-2 mt-2 space-y-0.5">
                  <Link href="/blog" className="block rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>Blog</Link>
                  <Link href="#pricing" className="block rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>Pricing</Link>
                  <Link href="/sign-in" className="block rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>Login</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#0a0f1e] px-4 pt-16 pb-24 sm:px-6 sm:pt-20 sm:pb-32">
        {/* Grid pattern */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        {/* Glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-violet-600/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">

          {/* Audience toggle */}
          <div className="mb-8 inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-sm">
            {(["teams", "candidates"] as const).map((a) => (
              <button
                key={a}
                onClick={() => setAudience(a)}
                className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
                  audience === a
                    ? "bg-violet-600 text-white shadow-lg"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {a === "teams"
                  ? <Building2 className="h-3.5 w-3.5" />
                  : <User className="h-3.5 w-3.5" />}
                {a === "teams" ? "For Teams" : "For Candidates"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={audience}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28 }}
            >
              {/* Badge */}
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
                <span className="text-xs font-medium text-violet-300">{hero.badge}</span>
              </div>

              {/* Headline */}
              <h1 className="mb-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[60px]">
                {hero.line1}<br />
                <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                  {hero.line2}
                </span>
              </h1>

              {/* Sub */}
              <p className="mx-auto mb-8 max-w-2xl text-base text-gray-400 sm:text-lg leading-relaxed">
                {hero.sub}
              </p>

              {/* CTAs */}
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href={hero.ctaHref}>
                  <Button size="lg" className="w-full gap-2 bg-violet-600 px-8 text-sm font-semibold hover:bg-violet-700 shadow-lg shadow-violet-900/50 sm:w-auto">
                    {hero.cta} <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full gap-2 border-white/10 bg-white/5 px-8 text-sm text-white hover:bg-white/10 sm:w-auto"
                >
                  <Play className="h-4 w-4" /> {hero.secondary}
                </Button>
              </div>

              {/* Feature pills */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                {hero.pills.map((p) => (
                  <span
                    key={p}
                    className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-400"
                  >
                    <CheckCircle2 className="h-3 w-3 text-violet-400 shrink-0" /> {p}
                  </span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div className="border-b bg-slate-50 px-4 py-7 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {STATS.map(({ n, l }) => (
              <div key={l} className="text-center">
                <p className="text-2xl font-extrabold text-gray-900 sm:text-3xl">{n}</p>
                <p className="mt-1 text-xs text-gray-500">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tools grid ── */}
      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <Badge className="mb-4 border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-50">
              Platform
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Everything for QA excellence
            </h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto text-sm sm:text-base">
              Six AI-powered tools covering the full spectrum — from test generation to career advancement.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((tool) => (
              <Link key={tool.name} href={tool.href} className="group block">
                <div className="relative flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-md hover:-translate-y-1">
                  {tool.tag && (
                    <span className="absolute right-4 top-4 rounded-full bg-violet-600 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                      {tool.tag}
                    </span>
                  )}
                  <div
                    className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ background: tool.light, border: `1px solid ${tool.border}` }}
                  >
                    <tool.icon className="h-5 w-5" style={{ color: tool.color }} />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-gray-900">{tool.name}</h3>
                  <p className="mb-4 flex-1 text-sm text-gray-500 leading-relaxed">{tool.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${tool.audienceCls}`}>
                      {tool.audience}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-medium text-violet-600 opacity-0 transition-opacity group-hover:opacity-100">
                      Launch <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── B2B section ── */}
      <section className="border-y bg-[#0a0f1e] px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5">
                <Building2 className="h-3.5 w-3.5 text-blue-400" />
                <span className="text-xs font-medium text-blue-300">For Engineering Teams</span>
              </div>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Built for teams that ship at scale
              </h2>
              <p className="mt-3 max-w-xl text-gray-400 text-sm sm:text-base">
                Everything your QA team needs — from automated test generation to coverage analytics and CI/CD integration.
              </p>
            </div>
            <Link href="/sign-up" className="shrink-0">
              <Button className="gap-2 border-white/10 bg-white/10 text-white hover:bg-white/20">
                Get team access <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {B2B_FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-xl border border-white/5 bg-white/[0.03] p-5 transition-colors hover:bg-white/[0.06]"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/20">
                  <Icon className="h-4 w-4 text-blue-400" />
                </div>
                <h3 className="mb-1.5 text-sm font-semibold text-white">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── B2C section ── */}
      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5">
                <User className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-700">For QA Candidates</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Accelerate your QA career
              </h2>
              <p className="mt-3 max-w-xl text-gray-500 text-sm sm:text-base">
                From your first resume to your dream SDET role — AITestCraft gives you the tools to stand out.
              </p>
            </div>
            <Link href="/sign-up" className="shrink-0">
              <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                Start for free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {B2C_FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-xl border border-gray-200 bg-gray-50 p-5 transition-all hover:border-emerald-200 hover:bg-emerald-50/50"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100">
                  <Icon className="h-4 w-4 text-emerald-600" />
                </div>
                <h3 className="mb-1.5 text-sm font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="border-y bg-slate-50 px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <Badge className="mb-4 border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-50">
              Simple workflow
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Up and running in minutes
            </h2>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {[
              { n: "01", icon: Code2, title: "Describe", desc: "Paste your user story, acceptance criteria, or feature description in plain English." },
              { n: "02", icon: Sparkles, title: "Generate", desc: "AI generates production-ready tests with edge cases, assertions and smart selectors." },
              { n: "03", icon: Rocket, title: "Deploy", desc: "Copy, download or push directly to your repo. Integrate with your CI/CD pipeline." },
            ].map(({ n, icon: Icon, title, desc }, i) => (
              <div key={n} className="relative text-center">
                {/* Connector line — desktop only */}
                {i < 2 && (
                  <div className="absolute top-7 left-[calc(50%+36px)] hidden h-px w-[calc(100%-72px)] bg-violet-200 sm:block" />
                )}
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 shadow-lg shadow-violet-200">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <p className="mb-1 text-xs font-bold text-violet-400 tracking-widest">{n}</p>
                <h3 className="mb-2 text-base font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <div className="mb-4 flex items-center justify-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Loved by QA engineers
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map(({ quote, author, company, avatar }) => (
              <div key={author} className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mb-5 flex-1 text-sm text-gray-600 leading-relaxed italic">
                  &ldquo;{quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 border-t pt-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-bold text-white">
                    {avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{author}</p>
                    <p className="text-xs text-gray-400">{company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="border-y bg-slate-50 px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <Badge className="mb-4 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
              Pricing
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Start free, scale when ready
            </h2>
            <p className="mt-3 text-gray-500 text-sm">No credit card required.</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {[
              {
                name: "Free",
                price: "$0",
                period: "forever",
                desc: "Perfect for individual candidates and exploration.",
                features: ["50 test cases / month", "AI Test Generator", "Resume Builder (1 export)", "Code Converter", "Interview Prep access"],
                cta: "Get started",
                href: "/sign-up",
                highlight: false,
              },
              {
                name: "Pro",
                price: "$19",
                period: "/ month",
                desc: "For serious QA engineers and active job seekers.",
                features: ["Unlimited test cases", "All 6 tools, full access", "Unlimited resume exports", "Priority AI generation", "Email support"],
                cta: "Start Pro trial",
                href: "/sign-up",
                highlight: true,
              },
              {
                name: "Teams",
                price: "$49",
                period: "/ month",
                desc: "For QA teams and engineering organisations.",
                features: ["Everything in Pro", "Up to 10 members", "CI/CD integration", "Coverage analytics", "SSO / SAML", "Priority support"],
                cta: "Contact sales",
                href: "#",
                highlight: false,
              },
            ].map(({ name, price, period, desc, features, cta, href, highlight }) => (
              <div
                key={name}
                className={`relative rounded-2xl border p-7 ${
                  highlight
                    ? "border-violet-600 bg-violet-600 text-white shadow-xl shadow-violet-200"
                    : "border-gray-200 bg-white shadow-sm"
                }`}
              >
                {highlight && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-3 py-0.5 text-[11px] font-bold text-gray-900 whitespace-nowrap">
                    Most Popular
                  </span>
                )}
                <p className={`mb-1 text-sm font-semibold ${highlight ? "text-violet-200" : "text-gray-500"}`}>{name}</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className={`text-4xl font-extrabold ${highlight ? "text-white" : "text-gray-900"}`}>{price}</span>
                  <span className={`text-sm ${highlight ? "text-violet-200" : "text-gray-400"}`}>{period}</span>
                </div>
                <p className={`mb-5 text-sm ${highlight ? "text-violet-100" : "text-gray-500"}`}>{desc}</p>
                <ul className="mb-6 space-y-2.5">
                  {features.map((f) => (
                    <li key={f} className={`flex items-start gap-2 text-sm ${highlight ? "text-violet-100" : "text-gray-600"}`}>
                      <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${highlight ? "text-violet-200" : "text-violet-600"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={href}>
                  <Button
                    className={`w-full ${
                      highlight
                        ? "bg-white text-violet-700 hover:bg-violet-50"
                        : "bg-violet-600 text-white hover:bg-violet-700"
                    }`}
                  >
                    {cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-[#0a0f1e] px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            Ready to transform your<br />
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              QA workflow?
            </span>
          </h2>
          <p className="mb-8 text-gray-400 text-base sm:text-lg">
            Join thousands of QA engineers generating better tests in less time.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/sign-up">
              <Button size="lg" className="w-full gap-2 bg-violet-600 px-10 text-base hover:bg-violet-700 shadow-lg shadow-violet-900/50 sm:w-auto">
                Get AITestCraft Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/resume-builder">
              <Button
                size="lg"
                variant="outline"
                className="w-full gap-2 border-white/10 bg-white/5 px-8 text-base text-white hover:bg-white/10 sm:w-auto"
              >
                <FileText className="h-4 w-4" /> Try Resume Builder
              </Button>
            </Link>
          </div>
          <p className="mt-5 text-xs text-gray-500">No credit card required · Free to start · Cancel anytime</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
                  <TestTube className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-gray-900">AITestCraft</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                AI-powered QA tools for teams and candidates.
              </p>
              <div className="flex gap-4">
                {["GitHub", "X", "LinkedIn"].map((s) => (
                  <a key={s} href="#" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">{s}</a>
                ))}
              </div>
            </div>

            {/* Columns */}
            {FOOTER_COLS.map(({ heading, links }) => (
              <div key={heading}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">{heading}</p>
                <ul className="space-y-2">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <Link href={href} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-8 sm:flex-row">
            <p className="text-xs text-gray-400">© {new Date().getFullYear()} AITestCraft. All rights reserved.</p>
            <div className="flex gap-5">
              {["Terms of Service", "Privacy Policy", "Cookie Policy"].map((l) => (
                <a key={l} href="#" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

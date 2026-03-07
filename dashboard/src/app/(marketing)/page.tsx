"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Zap, Shield, Code2, ArrowRight, TestTube, Sparkles,
  ChevronDown, Play, CheckCircle2, Clock, GitBranch,
  BarChart3, Bug, Users, Layers, Globe, Smartphone,
  CloudLightning, Settings2, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ─── Nav links ─────────────────────────────────────────── */
const navLinks = [
  {
    label: "Products",
    items: ["Playwright Tests", "Cypress Tests", "Jest / Unit Tests", "API Tests", "Gherkin / BDD"],
  },
  {
    label: "Solutions",
    items: ["QA Engineers", "Dev Teams", "Agile / Scrum", "CI/CD Integration"],
  },
  { label: "Pricing", items: [] },
  { label: "Blog", items: [] },
  { label: "Docs", items: [] },
];

/* ─── Social proof logos (text-only stand-ins) ─────────── */
const socialLogos = ["Microsoft", "Atlassian", "Stripe", "Shopify", "Vercel", "GitHub", "Twilio"];

/* ─── Core capability cards ──────────────────────────────── */
const capabilities = [
  {
    icon: Sparkles,
    title: "AI that writes tests for you",
    body: "Describe a feature in plain English. AITestCraft generates complete, idiomatic test suites in seconds — no prompt-engineering needed.",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
  },
  {
    icon: Shield,
    title: "Reduce test maintenance pain",
    body: "Self-healing selectors and smart locator suggestions keep your suite green even as your UI evolves.",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
  },
  {
    icon: Zap,
    title: "Ship faster, with confidence",
    body: "Integrate with your CI/CD pipeline. Get instant test coverage on every PR, with zero manual effort.",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
];

/* ─── Product lines ──────────────────────────────────────── */
const products = [
  { icon: Code2, label: "AI", desc: "Autonomous test authoring, execution & management powered by Claude." },
  { icon: Globe, label: "Web", desc: "Playwright & Cypress E2E tests for any web application." },
  { icon: Smartphone, label: "Mobile", desc: "Cloud-based mobile testing for iOS and Android." },
  { icon: CloudLightning, label: "API", desc: "Contract and integration tests for REST & GraphQL APIs." },
];

/* ─── Feature tabs ────────────────────────────────────────── */
const featureTabs = [
  {
    id: "create",
    label: "Create",
    icon: Sparkles,
    heading: "Author tests faster than ever",
    body: "Paste a user story, acceptance criteria, or free-form description. AITestCraft uses Claude to produce production-ready tests — with assertions, selectors, edge cases, and comments — in under 30 seconds.",
    bullets: [
      "Natural language → test code",
      "Happy path + edge cases automatically",
      "Playwright, Cypress, Jest, Selenium, Gherkin",
    ],
    code: `test('user can reset password', async ({ page }) => {
  await page.goto('/forgot-password');
  await page.fill('[data-testid="email"]', 'user@example.com');
  await page.click('[data-testid="send-reset"]');

  // Verify confirmation message
  await expect(page.locator('[data-testid="confirm"]'))
    .toContainText('Check your inbox');

  // Edge: invalid email
  await page.fill('[data-testid="email"]', 'notanemail');
  await page.click('[data-testid="send-reset"]');
  await expect(page.locator('[data-testid="error"]'))
    .toContainText('valid email');
});`,
  },
  {
    id: "maintain",
    label: "Maintain",
    icon: Settings2,
    heading: "Keep tests green as your UI evolves",
    body: "AITestCraft generates resilient selectors using data-testid attributes and ARIA roles — so your tests survive UI redesigns. Get smart suggestions when tests break.",
    bullets: [
      "Resilient data-testid & ARIA selectors",
      "Broken-test diagnosis suggestions",
      "Diff-aware re-generation on UI change",
    ],
    code: `// AITestCraft-generated resilient selectors
// Uses ARIA + data-testid over fragile CSS paths

await page.getByRole('button', { name: 'Submit' }).click();
await page.getByTestId('checkout-summary').toBeVisible();
await page.getByLabel('Email address').fill('...');

// Fallback chain if primary selector fails
await page.locator('[data-testid="cta"], button[type=submit]')
  .first().click();`,
  },
  {
    id: "manage",
    label: "Manage",
    icon: BarChart3,
    heading: "Full visibility across your test suite",
    body: "Organise generated tests into collections. Track coverage per feature, export to your test management tool, and share with your team in one click.",
    bullets: [
      "Save & organise test libraries",
      "Export to TestRail, Jira, Notion",
      "Team workspaces (coming soon)",
    ],
    code: `// Saved test library structure
{
  "collection": "Checkout Flow",
  "framework": "Playwright",
  "tests": 12,
  "coverage": {
    "happy_path": true,
    "edge_cases": true,
    "error_states": true,
    "security": true
  },
  "exportedTo": ["TestRail", "Jira"],
  "lastGenerated": "2025-03-01"
}`,
  },
  {
    id: "debug",
    label: "Debug",
    icon: Bug,
    heading: "Root-cause analysis at a glance",
    body: "When a test fails, AITestCraft explains why in plain English — highlighting the exact assertion, the likely cause, and a suggested fix. No more staring at stack traces.",
    bullets: [
      "Human-readable failure explanations",
      "Suggested fixes for broken assertions",
      "Diff view of expected vs actual",
    ],
    code: `// AITestCraft failure analysis
❌ Test: 'checkout completes with valid card'

Assertion failed:
  expect(page.locator('[data-testid="success"]'))
    .toBeVisible()

Likely cause:
  The /api/payments endpoint returned 500.
  The success screen is never rendered.

Suggested fix:
  Mock the payment API in your test setup,
  or check the Stripe webhook configuration.`,
  },
];

/* ─── Case studies ───────────────────────────────────────── */
const caseStudies = [
  { company: "FinTech Co.", stat: "95%", label: "reduction in test-writing time", quote: "We went from 2-day test cycles to 20 minutes. The edge cases AI catches are invaluable.", author: "Sarah K., QA Lead" },
  { company: "SaaS Startup", stat: "10×", label: "faster coverage on new features", quote: "One sprint went from zero E2E coverage to 80%. Nothing else comes close.", author: "Marcus T., CTO" },
  { company: "E-commerce", stat: "30%", label: "fewer production bugs", quote: "AITestCraft catches regressions we'd never have caught manually.", author: "Priya R., Automation Lead" },
  { company: "Agency", stat: "3×", label: "faster test creation vs manual", quote: "Our devs now own their own test suites. No dedicated QA needed for greenfield features.", author: "James L., Engineering Manager" },
  { company: "Enterprise", stat: "50%", label: "less time spent on test maintenance", quote: "The resilient selectors mean we stopped chasing flaky tests every sprint.", author: "Aiko M., SDET" },
];

/* ─── Integrations ───────────────────────────────────────── */
const integrations = [
  "GitHub", "GitLab", "Jenkins", "CircleCI", "Jira", "Slack",
  "TestRail", "Browserstack", "Playwright", "Cypress", "Notion", "Linear",
];

/* ─── Footer columns ─────────────────────────────────────── */
const footerCols = [
  { heading: "Product", links: ["Playwright Generator", "Cypress Generator", "Jest Generator", "API Tests", "Pricing"] },
  { heading: "Developers", links: ["Documentation", "Changelog", "GitHub", "API Reference"] },
  { heading: "Company", links: ["About", "Careers", "Blog", "Contact"] },
  { heading: "Resources", links: ["Success Stories", "Webinars", "Community", "Status"] },
];

/* ─── Nav dropdown ────────────────────────────────────────── */
const NAV_ROUTES: Record<string, string> = {
  Pricing: "/pricing",
  Blog: "/blog",
  Docs: "/docs",
};

function NavDropdown({ label, items }: { label: string; items: string[] }) {
  const [open, setOpen] = useState(false);
  if (!items.length) {
    const href = NAV_ROUTES[label] ?? "#";
    return (
      <Link href={href} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
        {label}
      </Link>
    );
  }
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
        {label} <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded-xl border bg-white p-2 shadow-xl">
          {items.map((item) => (
            <a key={item} href="#" className="block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
              {item}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState("create");
  const tab = featureTabs.find((t) => t.id === activeTab)!;

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">

      {/* ── Top banner ── */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-center text-xs font-medium text-white">
        🎉 New: Gherkin / BDD output now available —{" "}
        <Link href="/sign-up" className="underline underline-offset-2 hover:opacity-80">Try it free →</Link>
      </div>

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
              <TestTube className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">AITestCraft</span>
          </div>

          {/* Links */}
          <div className="hidden items-center gap-8 lg:flex">
            {navLinks.map((l) => (
              <NavDropdown key={l.label} label={l.label} items={l.items} />
            ))}
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm" className="text-sm text-gray-600">Login</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="bg-violet-600 hover:bg-violet-700 px-5 text-sm">
                Get AITestCraft Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white px-6 pb-16 pt-20">
        {/* Background grid */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:64px_64px] opacity-40" />

        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Badge className="mb-5 border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 hover:bg-violet-50">
                AI-driven testing · Powered by Claude
              </Badge>
              <h1 className="mb-5 text-5xl font-extrabold leading-[1.1] tracking-tight text-gray-900 sm:text-6xl">
                AI-driven test generation<br />
                <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  for every framework
                </span>
              </h1>
              <p className="mb-8 text-lg text-gray-500 sm:text-xl">
                Describe your feature. AITestCraft generates production-ready Playwright, Cypress,
                Jest and Selenium tests in seconds — including edge cases you'd never think of.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/sign-up">
                  <Button size="lg" className="gap-2 bg-violet-600 px-8 text-base hover:bg-violet-700 shadow-lg shadow-violet-200">
                    Try AITestCraft for free <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="gap-2 border-gray-200 px-8 text-base text-gray-700 hover:bg-gray-50">
                  <Play className="h-4 w-4 text-violet-600" /> Watch the demo
                </Button>
              </div>
              <p className="mt-4 text-xs text-gray-400">No credit card required · Free to start · Works in 30 seconds</p>
            </motion.div>
          </div>

          {/* Product screenshot mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-14 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-200"
          >
            {/* Browser chrome */}
            <div className="flex items-center gap-2 border-b bg-gray-50 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="h-3 w-3 rounded-full bg-green-400" />
              <div className="mx-4 flex-1 rounded-md bg-white border border-gray-200 px-3 py-1 text-xs text-gray-400">
                app.aitestcraft.com/test-cases
              </div>
            </div>
            {/* App UI mockup */}
            <div className="grid grid-cols-2 divide-x divide-gray-100">
              {/* Left – input */}
              <div className="p-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">Feature description</p>
                <div className="mb-4 flex gap-2">
                  {["Playwright", "Cypress", "Jest"].map((f, i) => (
                    <span key={f} className={`rounded-full px-3 py-1 text-xs font-medium ${i === 0 ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-600"}`}>{f}</span>
                  ))}
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-xs text-gray-600 leading-relaxed">
                  As a user, I want to reset my password via email so that I can regain access to my account.<br /><br />
                  Acceptance criteria:<br />
                  - Show error for invalid email<br />
                  - Send reset link within 30s<br />
                  - Link expires after 1 hour<br />
                  - Show success confirmation
                </div>
                <Button className="mt-4 w-full gap-2 bg-violet-600 hover:bg-violet-700 text-sm">
                  <Zap className="h-3.5 w-3.5" /> Generate Test Cases
                </Button>
              </div>
              {/* Right – output */}
              <div className="bg-gray-950 p-6">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Generated output</p>
                  <Badge className="border-green-500/30 bg-green-500/10 text-[10px] text-green-400 hover:bg-green-500/10">✓ 7 tests</Badge>
                </div>
                <pre className="text-xs leading-relaxed text-green-400 font-mono overflow-hidden whitespace-pre">{`test('reset password – valid email', async ({ page }) => {
  await page.goto('/forgot-password');
  await page.fill('[data-testid="email"]',
    'user@test.com');
  await page.click('[data-testid="submit"]');
  await expect(
    page.locator('[data-testid="success"]')
  ).toBeVisible();
});

// + 6 more: invalid email, expired link,
// rate limit, network error...`}</pre>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Social proof logos ── */}
      <section className="border-y bg-gray-50 px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-gray-400">
            Trusted by engineering teams at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {socialLogos.map((name) => (
              <span key={name} className="text-lg font-bold text-gray-300 hover:text-gray-400 transition-colors cursor-default">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3 Core capabilities ── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Quality software, shipped faster
            </h2>
            <p className="mt-3 text-gray-500">Three things AITestCraft does better than manual testing.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {capabilities.map(({ icon: Icon, title, body, color, bg, border }) => (
              <motion.div
                key={title}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className={`rounded-2xl border ${border} ${bg} p-7`}
              >
                <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Product lines ── */}
      <section className="border-y bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <Badge className="mb-4 border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-50">Platform</Badge>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">One platform, every test type</h2>
            <p className="mt-3 text-gray-500">From E2E to API to mobile — AITestCraft covers your full stack.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="group cursor-pointer rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-violet-200 hover:shadow-md">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-sm">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="mb-1.5 font-semibold text-gray-900">{label}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-violet-600 opacity-0 transition-opacity group-hover:opacity-100">
                  Learn more <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature tabs ── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              From idea to test suite in one workflow
            </h2>
            <p className="mt-3 text-gray-500">Every stage of the test lifecycle, powered by AI.</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-10 flex h-auto flex-wrap justify-center gap-2 bg-transparent p-0">
              {featureTabs.map(({ id, label, icon: Icon }) => (
                <TabsTrigger
                  key={id}
                  value={id}
                  className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 data-[state=active]:border-violet-600 data-[state=active]:bg-violet-600 data-[state=active]:text-white shadow-sm"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid gap-8 lg:grid-cols-2 lg:items-center"
          >
            {/* Text */}
            <div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900">{tab.heading}</h3>
              <p className="mb-6 text-gray-500 leading-relaxed">{tab.body}</p>
              <ul className="space-y-3">
                {tab.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-3 text-sm text-gray-700">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-violet-600" />
                    {b}
                  </li>
                ))}
              </ul>
              <Link href="/sign-up" className="mt-8 inline-flex">
                <Button className="gap-2 bg-violet-600 hover:bg-violet-700">
                  Try it free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            {/* Code */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-950 shadow-xl">
              <div className="flex items-center gap-2 border-b border-white/5 bg-white/[0.03] px-5 py-3">
                <span className="h-3 w-3 rounded-full bg-red-500/60" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/60" />
                <span className="h-3 w-3 rounded-full bg-green-500/60" />
                <span className="ml-2 text-xs text-gray-500">generated.spec.ts</span>
              </div>
              <pre className="overflow-x-auto p-5 text-xs leading-relaxed text-gray-300 font-mono whitespace-pre">
                {tab.code}
              </pre>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Case studies ── */}
      <section className="border-y bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <Badge className="mb-4 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">Results</Badge>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Real teams, real results</h2>
            <p className="mt-3 text-gray-500">What engineering teams achieve with AITestCraft.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {caseStudies.slice(0, 3).map(({ company, stat, label, quote, author }) => (
              <motion.div
                key={company}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col rounded-2xl border border-gray-200 bg-white p-7 shadow-sm"
              >
                <div className="mb-1 text-4xl font-extrabold text-violet-600">{stat}</div>
                <p className="mb-4 text-sm font-medium text-gray-700">{label}</p>
                <p className="flex-1 text-sm text-gray-500 italic leading-relaxed">&ldquo;{quote}&rdquo;</p>
                <div className="mt-5 flex items-center gap-3 border-t pt-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-xs font-bold text-white">
                    {author[0]}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900">{author}</p>
                    <p className="text-xs text-gray-400">{company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {/* Two more wider cards */}
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {caseStudies.slice(3).map(({ company, stat, label, quote, author }) => (
              <div key={company} className="flex items-center gap-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="shrink-0 text-center">
                  <div className="text-3xl font-extrabold text-violet-600">{stat}</div>
                  <p className="mt-0.5 text-xs text-gray-500 max-w-[80px] leading-tight">{label}</p>
                </div>
                <div className="border-l pl-6">
                  <p className="text-sm text-gray-500 italic">&ldquo;{quote}&rdquo;</p>
                  <p className="mt-2 text-xs font-medium text-gray-700">{author} · {company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Integrations ── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Works with your stack</h2>
            <p className="mt-3 text-gray-500">Drop AITestCraft into the tools you already use.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {integrations.map((name) => (
              <div key={name} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 transition-all cursor-default">
                <Layers className="h-3.5 w-3.5 opacity-60" />
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quality intelligence banner ── */}
      <section className="border-y bg-gradient-to-br from-violet-600 to-indigo-700 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <Badge className="mb-4 border-white/20 bg-white/10 text-white hover:bg-white/10">Intelligence</Badge>
              <h2 className="mb-4 text-3xl font-bold text-white">
                Make every test count with quality intelligence
              </h2>
              <p className="mb-6 text-violet-100">
                AITestCraft doesn't just generate tests — it tracks coverage, identifies gaps,
                and tells you exactly which features need more attention.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {["Optimise coverage", "Manage test impact", "Close coverage gaps", "Minimise release risk"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-violet-100">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-white/70" />
                    {item}
                  </div>
                ))}
              </div>
              <Link href="/sign-up" className="mt-8 inline-flex">
                <Button size="lg" className="bg-white text-violet-700 hover:bg-violet-50 gap-2">
                  Start for free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { n: "< 30s", l: "Average generation time" },
                { n: "5", l: "Frameworks supported" },
                { n: "95%", l: "Edge-case coverage rate" },
                { n: "10×", l: "Faster than manual writing" },
              ].map(({ n, l }) => (
                <div key={l} className="rounded-2xl border border-white/15 bg-white/10 p-5 text-center">
                  <p className="text-3xl font-extrabold text-white">{n}</p>
                  <p className="mt-1 text-xs text-violet-200">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <Search className="mx-auto mb-4 h-10 w-10 text-violet-400" />
          <h2 className="mb-4 text-4xl font-extrabold text-gray-900">
            Stop writing tests manually
          </h2>
          <p className="mb-8 text-lg text-gray-500">
            Join QA engineers and developers who ship faster with AITestCraft.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/sign-up">
              <Button size="lg" className="gap-2 bg-violet-600 px-10 text-base hover:bg-violet-700 shadow-lg shadow-violet-200">
                Get AITestCraft Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="gap-2 px-8 text-base border-gray-200 text-gray-700">
              <Users className="h-4 w-4" /> Schedule a demo
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
                  <TestTube className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-gray-900">AITestCraft</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                AI-powered test case generation for modern engineering teams.
              </p>
              <div className="mt-4 flex gap-3">
                {["GitHub", "X", "LinkedIn"].map((s) => (
                  <a key={s} href="#" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">{s}</a>
                ))}
              </div>
            </div>
            {/* Columns */}
            {footerCols.map(({ heading, links }) => (
              <div key={heading}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">{heading}</p>
                <ul className="space-y-2">
                  {links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{l}</a>
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

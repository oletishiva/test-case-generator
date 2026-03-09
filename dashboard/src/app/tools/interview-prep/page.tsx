"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  TestTube, Target, Sparkles, ChevronDown, ChevronUp,
  Search, BookOpen, Code2, CheckCircle2, Star,
  GraduationCap, Zap, BarChart3, Users, Filter,
  Copy, Check, ChevronRight,
} from "lucide-react";
import {
  QUESTIONS, CATEGORIES,
  type Difficulty, type ExperienceLevel, type Language, type Question,
} from "./questions";

/* ── Badge configs ─────────────────────────────────────── */
const DIFF_CONFIG: Record<Difficulty, { label: string; bg: string; color: string; border: string }> = {
  "easy":        { label: "Easy",            bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  "medium":      { label: "Medium",          bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  "hard":        { label: "Hard",            bg: "#fff7ed", color: "#ea580c", border: "#fed7aa" },
  "very-hard":   { label: "Very Hard",       bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  "logical":     { label: "Logical",         bg: "#eef2ff", color: "#4338ca", border: "#c7d2fe" },
  "design":      { label: "Framework Design",bg: "#fdf4ff", color: "#9333ea", border: "#e9d5ff" },
  "leadership":  { label: "Leadership",      bg: "#fff1f2", color: "#be185d", border: "#fecdd3" },
};

const EXP_CONFIG: Record<ExperienceLevel, { label: string; bg: string; color: string }> = {
  "junior": { label: "Junior (0-2yr)", bg: "#f0fdfa", color: "#0d9488" },
  "mid":    { label: "Mid (2-5yr)",    bg: "#eff6ff", color: "#2563eb" },
  "senior": { label: "Senior (5-8yr)", bg: "#faf5ff", color: "#7c3aed" },
  "lead":   { label: "Lead / Arch",   bg: "#fff7ed", color: "#c2410c" },
};

const LANG_CONFIG: Record<Language, { label: string; color: string }> = {
  typescript: { label: "TypeScript", color: "#6366f1" },
  javascript: { label: "JavaScript", color: "#d97706" },
  python:     { label: "Python",     color: "#2563eb" },
  java:       { label: "Java",       color: "#dc2626" },
  any:        { label: "All",        color: "#64748b" },
};

/* ── Learning paths ──────────────────────────────────── */
const LEARNING_PATHS: Record<ExperienceLevel, { title: string; steps: string[] }> = {
  junior: {
    title: "Junior QA (0-2yr) Preparation Path",
    steps: [
      "QA Fundamentals — testing pyramid, bug lifecycle, test case design",
      "Playwright Basics — installation, locators, auto-waiting",
      "Page Object Model — why & basic structure",
      "Running & debugging tests locally",
      "Basic CI/CD concepts — what is a pipeline?",
    ],
  },
  mid: {
    title: "Mid-Level QA (2-5yr) Preparation Path",
    steps: [
      "Advanced locators — filter(), chaining, iframe handling",
      "Fixtures & test configuration — storageState, auth reuse",
      "API testing with Playwright — request fixture, route mocking",
      "Parallel execution & workers configuration",
      "CI/CD integration — GitHub Actions, artifact upload",
      "Framework design basics — project structure, data management",
    ],
  },
  senior: {
    title: "Senior QA (5-8yr) Preparation Path",
    steps: [
      "Framework architecture — multi-layer, fixtures, composition",
      "Multi-environment configuration — projects, sharding",
      "Advanced API testing — HAR recording, WebSocket testing",
      "Visual regression testing — baselines, CI integration",
      "Performance & reliability — flakiness root cause, optimization",
      "Mentoring & code review skills",
    ],
  },
  lead: {
    title: "QA Lead / Architect Preparation Path",
    steps: [
      "Framework design for scale — 500+ tests, team of 5+ QAs",
      "Test strategy & ROI — measurement, stakeholder communication",
      "Sharding, observability, Allure dashboards",
      "Shift-left testing, BDD adoption strategy",
      "Building QA culture — onboarding, developer collaboration",
      "Leadership & conflict scenarios (STAR format)",
    ],
  },
};

/* ── Stats ───────────────────────────────────────────── */
const STATS = [
  { n: `${QUESTIONS.length}+`, l: "Questions", icon: BookOpen },
  { n: "7",   l: "Difficulty levels",    icon: BarChart3 },
  { n: "4",   l: "Languages",            icon: Code2 },
  { n: "4",   l: "Experience levels",    icon: Users },
];

/* ── Code block component ────────────────────────────── */
function CodeBlock({ code, lang }: { code: string; lang?: Language }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  const langLabel = lang && lang !== "any" ? LANG_CONFIG[lang].label : "";
  return (
    <div style={{ background: "#0f172a", borderRadius: 10, overflow: "hidden", marginTop: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{langLabel || "Code example"}</span>
        <button onClick={copy} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: copied ? "#2dd4bf" : "#64748b", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
          {copied ? <Check style={{ width: 12, height: 12 }} /> : <Copy style={{ width: 12, height: 12 }} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre style={{ margin: 0, padding: "14px 16px", fontSize: 12, lineHeight: 1.65, color: "#e2e8f0", fontFamily: "'Fira Code',monospace", overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {code}
      </pre>
    </div>
  );
}

/* ── Question card ───────────────────────────────────── */
function QuestionCard({ q, idx }: { q: Question; idx: number }) {
  const [open, setOpen] = useState(false);
  const diff = DIFF_CONFIG[q.difficulty];
  const primaryExp = EXP_CONFIG[q.experience[0]];

  return (
    <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${open ? "#c7d2fe" : "#e2e8f0"}`, boxShadow: open ? "0 4px 20px rgba(99,102,241,0.08)" : "0 1px 3px rgba(0,0,0,0.04)", transition: "all 0.2s", marginBottom: 10 }}>
      {/* Header row */}
      <button
        onClick={() => setOpen(!open)}
        style={{ width: "100%", display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
      >
        {/* Number */}
        <span style={{ flexShrink: 0, width: 24, height: 24, borderRadius: 6, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#64748b", marginTop: 1 }}>
          {idx + 1}
        </span>

        {/* Question text + badges */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", margin: "0 0 8px", lineHeight: 1.55 }}>{q.question}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {/* Category */}
            <span style={{ fontSize: 10, fontWeight: 700, color: "#6366f1", background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: 10, padding: "2px 8px" }}>
              {q.category}
            </span>
            {/* Difficulty */}
            <span style={{ fontSize: 10, fontWeight: 700, color: diff.color, background: diff.bg, border: `1px solid ${diff.border}`, borderRadius: 10, padding: "2px 8px" }}>
              {diff.label}
            </span>
            {/* Experience */}
            <span style={{ fontSize: 10, fontWeight: 600, color: primaryExp.color, background: primaryExp.bg, borderRadius: 10, padding: "2px 8px" }}>
              {q.experience.map(e => EXP_CONFIG[e].label).join(" · ")}
            </span>
            {/* Language */}
            {q.language && q.language !== "any" && (
              <span style={{ fontSize: 10, fontWeight: 700, color: LANG_CONFIG[q.language].color, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "2px 8px" }}>
                {LANG_CONFIG[q.language].label}
              </span>
            )}
          </div>
        </div>

        {/* Expand icon */}
        <span style={{ flexShrink: 0, marginTop: 2, color: "#94a3b8" }}>
          {open ? <ChevronUp style={{ width: 16, height: 16 }} /> : <ChevronDown style={{ width: 16, height: 16 }} />}
        </span>
      </button>

      {/* Answer */}
      {open && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid #f1f5f9" }}>
          <div style={{ paddingTop: 14 }}>
            {/* Render answer paragraphs */}
            {q.answer.split("\n\n").map((para, i) => {
              if (para.startsWith("```")) return null; // handled by code block
              return (
                <p key={i} style={{ fontSize: 13, color: "#334155", margin: "0 0 10px", lineHeight: 1.75, whiteSpace: "pre-line" }}>
                  {para.replace(/\*\*(.*?)\*\*/g, (_, t) => t)}
                </p>
              );
            })}
            {q.code && <CodeBlock code={q.code} lang={q.language} />}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Toggle button ───────────────────────────────────── */
function Toggle({ active, onClick, label, color }: { active: boolean; onClick: () => void; label: string; color?: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
        border: `1px solid ${active ? (color ?? "#6366f1") : "#e2e8f0"}`,
        background: active ? (color ? `${color}18` : "#eef2ff") : "#fff",
        color: active ? (color ?? "#4338ca") : "#64748b",
      }}
    >
      {label}
    </button>
  );
}

/* ── Main page ───────────────────────────────────────── */
export default function InterviewPrepPage() {
  const [search,       setSearch]       = useState("");
  const [selDiff,      setSelDiff]      = useState<Difficulty | "all">("all");
  const [selExp,       setSelExp]       = useState<ExperienceLevel | "all">("all");
  const [selLang,      setSelLang]      = useState<Language | "all">("all");
  const [selCat,       setSelCat]       = useState<string | "all">("all");
  const [pathLevel,    setPathLevel]    = useState<ExperienceLevel>("mid");
  const [pathOpen,     setPathOpen]     = useState(false);
  const [filterOpen,   setFilterOpen]   = useState(true);

  const filtered = useMemo(() => {
    let qs = QUESTIONS;
    if (selDiff !== "all") qs = qs.filter(q => q.difficulty === selDiff);
    if (selExp  !== "all") qs = qs.filter(q => q.experience.includes(selExp as ExperienceLevel));
    if (selLang !== "all") qs = qs.filter(q => !q.language || q.language === "any" || q.language === selLang);
    if (selCat  !== "all") qs = qs.filter(q => q.category === selCat);
    if (search.trim()) {
      const s = search.toLowerCase();
      qs = qs.filter(q =>
        q.question.toLowerCase().includes(s) ||
        q.answer.toLowerCase().includes(s) ||
        q.tags.some(t => t.toLowerCase().includes(s))
      );
    }
    return qs;
  }, [selDiff, selExp, selLang, selCat, search]);

  function clearFilters() {
    setSelDiff("all"); setSelExp("all"); setSelLang("all"); setSelCat("all"); setSearch("");
  }

  const hasFilters = selDiff !== "all" || selExp !== "all" || selLang !== "all" || selCat !== "all" || search.trim();

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "system-ui,-apple-system,sans-serif" }}>

      {/* ── Nav ── */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 24px", display: "flex", alignItems: "center", height: 56, gap: 20, position: "sticky", top: 0, zIndex: 50, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", flexShrink: 0 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TestTube style={{ width: 14, height: 14, color: "#fff" }} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>AITestCraft</span>
        </Link>
        <div style={{ flex: 1 }} />
        <Link href="/dashboard"      style={{ fontSize: 13, color: "#64748b", textDecoration: "none", fontWeight: 500 }}>Test Generator</Link>
        <Link href="/tools/locators" style={{ fontSize: 13, color: "#64748b", textDecoration: "none", fontWeight: 500 }}>Locators</Link>
        <Link href="/tools/test-data" style={{ fontSize: 13, color: "#64748b", textDecoration: "none", fontWeight: 500 }}>Test Data</Link>
        <Link href="/resume-builder" style={{ fontSize: 13, color: "#64748b", textDecoration: "none", fontWeight: 500 }}>Resume Builder</Link>
        <Link href="/sign-up" style={{ fontSize: 13, fontWeight: 700, color: "#fff", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", borderRadius: 8, padding: "7px 16px", textDecoration: "none", flexShrink: 0, whiteSpace: "nowrap" }}>
          Get Started Free
        </Link>
      </nav>

      {/* ── Hero ── */}
      <div style={{ background: "linear-gradient(135deg,#0a0f1e 0%,#0c1a2e 50%,#0a1a1e 100%)", padding: "40px 24px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(139,92,246,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.05) 1px,transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -80, right: "10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(139,92,246,0.12) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 20, padding: "5px 14px", marginBottom: 16 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a78bfa", display: "inline-block" }} />
            <GraduationCap style={{ width: 13, height: 13, color: "#a78bfa" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#a78bfa" }}>QA Interview Preparation</span>
          </div>
          <h1 style={{ fontSize: "clamp(24px,4.5vw,40px)", fontWeight: 900, color: "#fff", margin: "0 0 12px", lineHeight: 1.1, letterSpacing: "-0.5px" }}>
            Ace Your QA Engineering<br />
            <span style={{ background: "linear-gradient(135deg,#a78bfa,#60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Interview with Confidence</span>
          </h1>
          <p style={{ fontSize: 15, color: "#94a3b8", margin: "0 auto 20px", maxWidth: 560, lineHeight: 1.7 }}>
            Your single stop for QA interview prep. Playwright (TS/JS, Python, Java), Page Object Model,
            Framework Design, Behavioral questions — all in one place, filterable by level.
          </p>
          {/* Stats */}
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            {STATS.map(({ n, l, icon: Icon }) => (
              <div key={l} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "9px 16px", textAlign: "center", minWidth: 80 }}>
                <p style={{ fontSize: 18, fontWeight: 800, color: "#fff", margin: 0 }}>{n}</p>
                <p style={{ fontSize: 10, color: "#64748b", margin: 0, marginTop: 2 }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Learning Path Banner ── */}
      <div style={{ background: "linear-gradient(90deg,#4f46e5,#7c3aed)", padding: "0" }}>
        <button
          onClick={() => setPathOpen(!pathOpen)}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", background: "none", border: "none", cursor: "pointer" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Zap style={{ width: 15, height: 15, color: "#fde68a" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
              Study Path for: {EXP_CONFIG[pathLevel].label}
            </span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>— click to change level & view steps</span>
          </div>
          {pathOpen ? <ChevronUp style={{ width: 14, height: 14, color: "#fff" }} /> : <ChevronDown style={{ width: 14, height: 14, color: "#fff" }} />}
        </button>
        {pathOpen && (
          <div style={{ padding: "0 24px 16px" }}>
            {/* Level selector */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              {(["junior","mid","senior","lead"] as ExperienceLevel[]).map(lv => (
                <button
                  key={lv}
                  onClick={() => setPathLevel(lv)}
                  style={{ padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1px solid ${pathLevel === lv ? "#fff" : "rgba(255,255,255,0.3)"}`, background: pathLevel === lv ? "#fff" : "transparent", color: pathLevel === lv ? "#4f46e5" : "#fff", transition: "all 0.15s" }}
                >
                  {EXP_CONFIG[lv].label}
                </button>
              ))}
            </div>
            {/* Steps */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {LEARNING_PATHS[pathLevel].steps.map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ flexShrink: 0, width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", marginTop: 1 }}>{i + 1}</div>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", margin: 0, lineHeight: 1.55 }}>{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Main layout ── */}
      <div style={{ padding: "24px", display: "flex", gap: 20, alignItems: "flex-start", maxWidth: 1400, margin: "0 auto" }}>

        {/* ── LEFT: Filters ── */}
        <div style={{ flex: "0 0 260px", minWidth: 0, position: "sticky", top: 72 }}>
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            {/* Filter header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Filter style={{ width: 13, height: 13, color: "#6366f1" }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>Filters</span>
                {hasFilters && (
                  <span style={{ fontSize: 10, background: "#6366f1", color: "#fff", borderRadius: 10, padding: "1px 7px", fontWeight: 700 }}>
                    active
                  </span>
                )}
              </div>
              {hasFilters && (
                <button onClick={clearFilters} style={{ fontSize: 11, color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                  Clear all
                </button>
              )}
            </div>

            <div style={{ padding: "14px 14px" }}>
              {/* Search */}
              <div style={{ position: "relative", marginBottom: 16 }}>
                <Search style={{ width: 13, height: 13, position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search questions…"
                  style={{ width: "100%", fontSize: 12, border: "1px solid #e2e8f0", borderRadius: 9, padding: "9px 12px 9px 30px", outline: "none", color: "#0f172a", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              {/* Difficulty */}
              <div style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 8px" }}>Difficulty</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  <Toggle active={selDiff === "all"} onClick={() => setSelDiff("all")} label="All" />
                  {(Object.keys(DIFF_CONFIG) as Difficulty[]).map(d => (
                    <Toggle key={d} active={selDiff === d} onClick={() => setSelDiff(d === selDiff ? "all" : d)} label={DIFF_CONFIG[d].label} color={DIFF_CONFIG[d].color} />
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 8px" }}>Experience Level</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  <Toggle active={selExp === "all"} onClick={() => setSelExp("all")} label="All" />
                  {(["junior","mid","senior","lead"] as ExperienceLevel[]).map(e => (
                    <Toggle key={e} active={selExp === e} onClick={() => setSelExp(e === selExp ? "all" : e)} label={EXP_CONFIG[e].label} color={EXP_CONFIG[e].color} />
                  ))}
                </div>
              </div>

              {/* Language */}
              <div style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 8px" }}>Language / Platform</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  <Toggle active={selLang === "all"} onClick={() => setSelLang("all")} label="All" />
                  {(["typescript","javascript","python","java"] as Language[]).map(l => (
                    <Toggle key={l} active={selLang === l} onClick={() => setSelLang(l === selLang ? "all" : l)} label={LANG_CONFIG[l].label} color={LANG_CONFIG[l].color} />
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 8px" }}>Category</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <button
                    onClick={() => setSelCat("all")}
                    style={{ textAlign: "left", padding: "6px 10px", borderRadius: 8, border: "none", background: selCat === "all" ? "#eef2ff" : "none", color: selCat === "all" ? "#4338ca" : "#475569", fontSize: 12, fontWeight: selCat === "all" ? 700 : 500, cursor: "pointer", display: "flex", justifyContent: "space-between" }}
                  >
                    <span>All categories</span>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>{QUESTIONS.length}</span>
                  </button>
                  {CATEGORIES.map(cat => {
                    const count = QUESTIONS.filter(q => q.category === cat).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelCat(cat === selCat ? "all" : cat)}
                        style={{ textAlign: "left", padding: "6px 10px", borderRadius: 8, border: "none", background: selCat === cat ? "#eef2ff" : "none", color: selCat === cat ? "#4338ca" : "#475569", fontSize: 12, fontWeight: selCat === cat ? 700 : 500, cursor: "pointer", display: "flex", justifyContent: "space-between" }}
                      >
                        <span>{cat}</span>
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Questions ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Result count + sort bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, padding: "10px 16px", background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", margin: 0 }}>
              <span style={{ color: "#6366f1" }}>{filtered.length}</span>
              {" "}{filtered.length === 1 ? "question" : "questions"} found
              {hasFilters && <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: 8 }}>({QUESTIONS.length} total)</span>}
            </p>
            <div style={{ display: "flex", gap: 6 }}>
              {hasFilters && (
                <button onClick={clearFilters} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#ef4444", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontWeight: 600 }}>
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Quick access chips */}
          {!hasFilters && (
            <div style={{ marginBottom: 14, display: "flex", flexWrap: "wrap", gap: 6 }}>
              {[
                { label: "🎯 Playwright Basics", diff: "all" as const, cat: "Playwright Basics" },
                { label: "🐍 Python", lang: "python" as Language },
                { label: "☕ Java", lang: "java" as Language },
                { label: "🏗️ Framework Design", diff: "design" as Difficulty },
                { label: "👔 Leadership", diff: "leadership" as Difficulty },
                { label: "🧠 Logical", diff: "logical" as Difficulty },
                { label: "⭐ Senior", exp: "senior" as ExperienceLevel },
              ].map(({ label, diff, cat, lang, exp }) => (
                <button
                  key={label}
                  onClick={() => {
                    if (diff && diff !== "all") setSelDiff(diff);
                    if (cat) setSelCat(cat);
                    if (lang) setSelLang(lang);
                    if (exp) setSelExp(exp);
                  }}
                  style={{ fontSize: 12, fontWeight: 600, color: "#4338ca", background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: 20, padding: "5px 13px", cursor: "pointer", transition: "background 0.15s" }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Questions list */}
          {filtered.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: "40px", textAlign: "center" }}>
              <Search style={{ width: 32, height: 32, color: "#cbd5e1", margin: "0 auto 12px" }} />
              <p style={{ fontSize: 15, fontWeight: 600, color: "#64748b", margin: "0 0 8px" }}>No questions match your filters</p>
              <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 16px" }}>Try adjusting or clearing your filters</p>
              <button onClick={clearFilters} style={{ fontSize: 13, fontWeight: 700, color: "#6366f1", background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: 9, padding: "8px 18px", cursor: "pointer" }}>
                Clear all filters
              </button>
            </div>
          ) : (
            filtered.map((q, i) => <QuestionCard key={q.id} q={q} idx={i} />)
          )}

          {/* Bottom tip */}
          {filtered.length > 0 && (
            <div style={{ marginTop: 20, background: "linear-gradient(135deg,#0a0f1e,#0c1a2e)", borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "flex-start", gap: 14 }}>
              <Star style={{ width: 18, height: 18, color: "#fde68a", flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 6px" }}>
                  Pro tip: Prepare your own examples
                </p>
                <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, lineHeight: 1.65 }}>
                  For behavioral and leadership questions, prepare 2-3 real stories using the STAR format (Situation, Task, Action, Result).
                  For technical questions, be ready to write code on a whiteboard — practice with our{" "}
                  <Link href="/tools/locators" style={{ color: "#a78bfa", textDecoration: "underline" }}>Locator Capture tool</Link>
                  {" "}and{" "}
                  <Link href="/dashboard" style={{ color: "#a78bfa", textDecoration: "underline" }}>Test Generator</Link>.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

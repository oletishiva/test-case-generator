"use client";

import { useState, useRef } from "react";
import {
  Sparkles, Loader2, Copy, Check, Download,
  Target, Code2, Layers, ChevronDown,
  ChevronUp, AlertCircle, Settings2, ThumbsUp, ThumbsDown,
  MessageSquare, RefreshCw, Clock, CheckCircle2, Play,
  BookOpen,
} from "lucide-react";
import JSZip from "jszip";

/* ── Types ─────────────────────────────────────────────────── */
type Mode = "suite" | "classic";
type TabId = "locators" | "pageObject" | "stepDefs" | "scenarios";
type StepStatus = "pending" | "active" | "done";
type Language = "typescript" | "javascript" | "python" | "java";

interface GeneratedFiles {
  locators: string;
  pageObject: string;
  stepDefs: string;
  scenarios: string;
  provider: string;
  pageName: string;
}

interface ProcessStep {
  id: TabId;
  label: string;
  sublabel: string;
  status: StepStatus;
}

interface Tab {
  id: TabId;
  label: string;
  folder: string;
  filename: (p: string) => string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
}

/* ── Tab config ─────────────────────────────────────────────── */
const TABS: Tab[] = [
  {
    id: "locators",
    label: "Locators",
    folder: "1_Locators",
    filename: (p) => `${p}.locators.ts`,
    icon: <Target size={14} />,
    color: "#2563eb",
    bg: "#eff6ff",
    border: "#bfdbfe",
  },
  {
    id: "pageObject",
    label: "Page Object",
    folder: "2_Page-Object",
    filename: (p) => `${p}.po.ts`,
    icon: <Layers size={14} />,
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ddd6fe",
  },
  {
    id: "stepDefs",
    label: "Step Definitions",
    folder: "3_Step-Definitions",
    filename: (p) => `${p}.steps.ts`,
    icon: <Code2 size={14} />,
    color: "#0891b2",
    bg: "#ecfeff",
    border: "#a5f3fc",
  },
  {
    id: "scenarios",
    label: "Feature File",
    folder: "4_Feature-Files",
    filename: (p) => `${p}.feature`,
    icon: <BookOpen size={14} />,
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
  },
];

const PROCESS_STEPS: { id: TabId; label: string; sublabel: string }[] = [
  { id: "locators",   label: "Locators",         sublabel: "Locators" },
  { id: "pageObject", label: "Page-Object",       sublabel: "Page Object" },
  { id: "stepDefs",   label: "Step-Definitions",  sublabel: "Step Definitions" },
  { id: "scenarios",  label: "Test-Scenarios",    sublabel: "Feature File" },
];

/* ── Stats helpers ──────────────────────────────────────────── */
function countLocators(code: string) {
  return (code.match(/^export const \w/gm) || []).length;
}
function countStepDefs(code: string) {
  return (code.match(/@(Given|When|Then|And)\(/g) || []).length;
}
function countScenarios(code: string) {
  return (code.match(/^\s*Scenario[^:]*:/gm) || []).length;
}
function estimateMinSaved(loc: number, steps: number, scen: number) {
  return loc * 3 + steps * 4 + scen * 8;
}

/* ── Component ─────────────────────────────────────────────── */
export default function LocatorsPage() {
  const [mode, setMode] = useState<Mode>("suite");

  /* Suite mode state */
  const [dom, setDom]           = useState("");
  const [pageName, setPageName] = useState("");
  const [loading, setLoading]   = useState(false);
  const [steps, setSteps]       = useState<ProcessStep[]>(
    PROCESS_STEPS.map((s) => ({ ...s, status: "pending" }))
  );
  const [completedCount, setCompletedCount] = useState(0);
  const [result, setResult]     = useState<GeneratedFiles | null>(null);
  const [error, setError]       = useState("");
  const [collapsed, setCollapsed] = useState<Record<TabId, boolean>>({
    locators: false, pageObject: false, stepDefs: false, scenarios: false,
  });
  const [copied, setCopied]     = useState<TabId | null>(null);
  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Classic mode state */
  const [cDom, setCDom]             = useState("");
  const [cPageName, setCPageName]   = useState("");
  const [cLang, setCLang]           = useState<Language>("typescript");
  const cFramework                  = "playwright";
  const [cLoading, setCLoading]     = useState(false);
  const [cResult, setCResult]       = useState("");
  const [cCopied, setCCopied]       = useState(false);
  const [cError, setCError]         = useState("");

  /* ── Sequential step animation ── */
  function startStepAnimation() {
    setSteps(PROCESS_STEPS.map((s, i) => ({ ...s, status: i === 0 ? "active" : "pending" })));
    setCompletedCount(0);
    let idx = 0;
    intervalRef.current = setInterval(() => {
      idx++;
      if (idx >= PROCESS_STEPS.length) { clearInterval(intervalRef.current!); return; }
      setSteps((prev) =>
        prev.map((s, i) =>
          i < idx ? { ...s, status: "done" } : i === idx ? { ...s, status: "active" } : s
        )
      );
      setCompletedCount(idx);
    }, 2800);
  }

  function finishStepAnimation() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSteps(PROCESS_STEPS.map((s) => ({ ...s, status: "done" })));
    setCompletedCount(4);
  }

  /* ── Suite generate ── */
  async function generateSuite() {
    if (!dom.trim()) { setError("Please paste your DOM / HTML content."); return; }
    setError("");
    setResult(null);
    setLoading(true);
    startStepAnimation();
    try {
      const res = await fetch("/api/locators/multifile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: dom, pageName: pageName || "GeneratedPage" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      finishStepAnimation();
      setResult(data as GeneratedFiles);
      setCollapsed({ locators: false, pageObject: false, stepDefs: false, scenarios: false });
    } catch (e) {
      finishStepAnimation();
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  /* ── Classic generate ── */
  async function generateClassic() {
    if (!cDom.trim()) { setCError("Please paste your DOM / HTML content."); return; }
    setCError("");
    setCResult("");
    setCLoading(true);
    try {
      const res = await fetch("/api/locators/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputType: "html", content: cDom,
          framework: cFramework, language: cLang,
          groupIntoPOM: true, includeActions: true,
          preferredStrategy: "role",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setCResult(data.code || "");
    } catch (e) {
      setCError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setCLoading(false);
    }
  }

  function resetSuite() {
    setResult(null);
    setError("");
    setSteps(PROCESS_STEPS.map((s) => ({ ...s, status: "pending" })));
    setCompletedCount(0);
    setFeedback(null);
  }

  async function copyTab(id: TabId) {
    if (!result) return;
    await navigator.clipboard.writeText(result[id]);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  function downloadFile(id: TabId) {
    if (!result) return;
    const tab  = TABS.find((t) => t.id === id)!;
    const blob = new Blob([result[id]], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = tab.filename(result.pageName); a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadZip() {
    if (!result) return;
    const zip  = new JSZip();
    const root = zip.folder("output");
    for (const tab of TABS) {
      root!.folder(tab.folder)!.file(tab.filename(result.pageName), result[tab.id]);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `${result.pageName}_playwright_suite.zip`; a.click();
    URL.revokeObjectURL(url);
  }

  /* ── Stats ── */
  const stats = result ? {
    locators:  countLocators(result.locators),
    steps:     countStepDefs(result.stepDefs),
    scenarios: countScenarios(result.scenarios),
    minSaved:  estimateMinSaved(
      countLocators(result.locators),
      countStepDefs(result.stepDefs),
      countScenarios(result.scenarios)
    ),
  } : null;

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* ── Page Header ── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "20px 32px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 10,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Target size={20} color="#fff" />
              </div>
              <div>
                <h1 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                  Playwright Test Weaver
                </h1>
                <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                  An agent that analyzes HTML pages to automatically generate Playwright locators, page objects, step definitions, and test scenarios
                </p>
              </div>
            </div>

            {/* Mode toggle */}
            <div style={{ display: "flex", gap: 4, background: "#f1f5f9", borderRadius: 8, padding: 4 }}>
              {(["suite", "classic"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    padding: "6px 16px", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 500,
                    cursor: "pointer",
                    background: mode === m ? "#fff" : "transparent",
                    color: mode === m ? "#6366f1" : "#64748b",
                    boxShadow: mode === m ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  }}
                >
                  {m === "suite" ? "Full Suite" : "Classic"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 32px" }}>

        {/* ═══════════════════════════════════════ SUITE MODE ═══════════════════════════════════════ */}
        {mode === "suite" && (
          <>
            {/* Input Card */}
            {!result && (
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 24, marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1" }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>Target Users:</span>
                  <span style={{ fontSize: 13, color: "#64748b" }}>QA Engineers, Product Owners, Developers, Automation Engineers</span>
                </div>

                <div style={{ background: "#f8faff", border: "1px solid #e0e7ff", borderRadius: 8, padding: "12px 14px", marginBottom: 16, fontSize: 13, color: "#4338ca", lineHeight: 1.6 }}>
                  Playwright Test Weaver streamlines the test automation workflow by transforming raw HTML input into ready-to-use automation assets. It understands DOM structure, identifies stable locators, and produces optimized Playwright components following best practices.
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>
                    Page Name <span style={{ color: "#94a3b8", fontWeight: 400 }}>(used for class & file names)</span>
                  </label>
                  <input
                    value={pageName}
                    onChange={(e) => setPageName(e.target.value)}
                    placeholder="e.g. LoginPage, CheckoutPage, DashboardPage"
                    style={{
                      width: "100%", padding: "9px 12px", fontSize: 13,
                      border: "1px solid #d1d5db", borderRadius: 7, outline: "none",
                      background: "#f9fafb", color: "#1e293b", boxSizing: "border-box",
                    }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>
                    DOM / HTML <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <textarea
                      value={dom}
                      onChange={(e) => setDom(e.target.value)}
                      placeholder="Paste your page HTML or DOM snippet here…"
                      rows={10}
                      style={{
                        width: "100%", padding: "10px 12px", fontSize: 12.5,
                        fontFamily: "'Fira Code', 'Courier New', monospace",
                        border: "1px solid #d1d5db", borderRadius: 7, outline: "none",
                        background: "#f9fafb", color: "#1e293b", resize: "vertical",
                        boxSizing: "border-box", lineHeight: 1.6,
                      }}
                    />
                    {dom && (
                      <span style={{
                        position: "absolute", bottom: 8, right: 10,
                        fontSize: 11, color: "#94a3b8",
                      }}>
                        {dom.length.toLocaleString()} chars
                      </span>
                    )}
                  </div>
                </div>

                {error && (
                  <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 12px", background: "#fef2f2", borderRadius: 7, marginBottom: 14, border: "1px solid #fecaca" }}>
                    <AlertCircle size={15} color="#dc2626" />
                    <span style={{ fontSize: 13, color: "#dc2626" }}>{error}</span>
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {TABS.map((tab) => (
                      <div key={tab.id} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: tab.color }}>
                        {tab.icon}
                        <span style={{ fontWeight: 500 }}>{tab.label}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={generateSuite}
                    disabled={loading}
                    style={{
                      padding: "10px 24px", background: loading ? "#94a3b8" : "linear-gradient(135deg, #4f46e5, #7c3aed)",
                      color: "#fff", border: "none", borderRadius: 22, fontSize: 14, fontWeight: 600,
                      cursor: loading ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", gap: 7,
                      boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
                    }}
                  >
                    <Play size={15} />
                    RUN
                  </button>
                </div>
              </div>
            )}

            {/* Processing Steps Panel */}
            {loading && (
              <div style={{ background: "#fff", borderRadius: 12, border: "2px solid #c7d2fe", padding: 24, marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <ChevronDown size={16} color="#6366f1" />
                    <span style={{ fontSize: 15, fontWeight: 600, color: "#1e293b" }}>Processing Steps</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", background: "#eff6ff", color: "#6366f1", borderRadius: 20, border: "1px solid #c7d2fe" }}>
                    In Progress
                  </span>
                </div>

                <div style={{ position: "relative" }}>
                  {steps.map((step, i) => (
                    <div key={step.id} style={{ position: "relative", paddingLeft: 40, paddingBottom: i < steps.length - 1 ? 24 : 0 }}>
                      {/* Connector line */}
                      {i < steps.length - 1 && (
                        <div style={{
                          position: "absolute", left: 12, top: 28, bottom: -4,
                          width: 2, background: step.status === "done" ? "#22c55e" : "#e2e8f0",
                        }} />
                      )}

                      {/* Step icon */}
                      <div style={{
                        position: "absolute", left: 0, top: 0,
                        width: 26, height: 26, borderRadius: "50%",
                        background: step.status === "done" ? "#f0fdf4" : step.status === "active" ? "#eff6ff" : "#f8fafc",
                        border: `2px solid ${step.status === "done" ? "#22c55e" : step.status === "active" ? "#6366f1" : "#e2e8f0"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {step.status === "done" ? (
                          <CheckCircle2 size={14} color="#22c55e" />
                        ) : step.status === "active" ? (
                          <Loader2 size={13} color="#6366f1" style={{ animation: "spin 1s linear infinite" }} />
                        ) : (
                          <Clock size={13} color="#94a3b8" />
                        )}
                      </div>

                      <div>
                        <div style={{ fontSize: 14, fontWeight: step.status !== "pending" ? 600 : 400, color: step.status === "pending" ? "#94a3b8" : "#1e293b" }}>
                          {step.label}
                        </div>
                        <div style={{ fontSize: 12, color: "#94a3b8" }}>{step.sublabel}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {completedCount < 4 && (
                  <div style={{ marginTop: 20, padding: "10px 14px", background: "#eff6ff", borderRadius: 8, border: "1px solid #c7d2fe", display: "flex", alignItems: "center", gap: 8 }}>
                    <Loader2 size={14} color="#6366f1" style={{ animation: "spin 1s linear infinite" }} />
                    <span style={{ fontSize: 13, color: "#6366f1", fontWeight: 500 }}>
                      Results updating... ({completedCount} of 4 steps completed)
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Results Section */}
            {result && (
              <>
                {/* Stats + header */}
                <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "18px 24px", marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Sparkles size={18} color="#6366f1" />
                      <span style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>Agent Processed Results</span>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={resetSuite}
                        style={{ padding: "7px 16px", background: "#fff", border: "1px solid #d1d5db", borderRadius: 22, fontSize: 13, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, color: "#374151" }}
                      >
                        <RefreshCw size={13} />
                        Run New Query
                      </button>
                      <button
                        onClick={downloadZip}
                        style={{ padding: "7px 16px", background: "#fff", border: "1px solid #d1d5db", borderRadius: 22, fontSize: 13, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, color: "#374151" }}
                      >
                        <Download size={13} />
                        Download
                      </button>
                    </div>
                  </div>

                  {/* Stats bar */}
                  <div style={{ display: "flex", gap: 0, flexWrap: "wrap", border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
                    {[
                      { label: "Step(s) Executed", value: "4", color: "#1e293b" },
                      { label: "File(s) Generated", value: "4", color: "#1e293b" },
                      { label: "Locators", value: String(stats!.locators), color: "#2563eb" },
                      { label: "min Saved", value: String(stats!.minSaved), color: "#0891b2" },
                      { label: "Page Object", value: "1", color: "#7c3aed" },
                      { label: "Step Definitions", value: String(stats!.steps), color: "#2563eb" },
                      { label: "Test Scenarios", value: String(stats!.scenarios), color: "#16a34a" },
                    ].map((s, i, arr) => (
                      <div
                        key={s.label}
                        style={{
                          padding: "10px 16px", background: i % 2 === 0 ? "#fafafa" : "#fff",
                          borderRight: i < arr.length - 1 ? "1px solid #e2e8f0" : "none",
                          flex: "1 1 auto", textAlign: "center", minWidth: 80,
                        }}
                      >
                        <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* File sections */}
                {TABS.map((tab) => (
                  <div key={tab.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", marginBottom: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                    {/* Section header */}
                    <button
                      onClick={() => setCollapsed((prev) => ({ ...prev, [tab.id]: !prev[tab.id] }))}
                      style={{
                        width: "100%", padding: "14px 20px", background: "#fafafa",
                        border: "none", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        borderBottom: collapsed[tab.id] ? "none" : "1px solid #e2e8f0",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Settings2 size={16} color="#64748b" />
                        <span style={{ fontSize: 15, fontWeight: 600, color: "#1e293b" }}>{tab.label}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, color: "#64748b" }}>1 file generated</span>
                        {collapsed[tab.id] ? <ChevronDown size={16} color="#64748b" /> : <ChevronUp size={16} color="#64748b" />}
                      </div>
                    </button>

                    {!collapsed[tab.id] && (
                      <>
                        {/* File bar */}
                        <div style={{ padding: "8px 20px", background: tab.bg, borderBottom: `1px solid ${tab.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <span style={{ color: tab.color, fontSize: 16 }}>{"<>"}</span>
                            <code style={{ fontSize: 13, color: tab.color, fontWeight: 600 }}>
                              {tab.filename(result.pageName)}
                            </code>
                          </div>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              onClick={() => copyTab(tab.id)}
                              title="Copy"
                              style={{ width: 30, height: 30, border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                              {copied === tab.id ? <Check size={13} color="#16a34a" /> : <Copy size={13} color="#374151" />}
                            </button>
                            <button
                              onClick={() => downloadFile(tab.id)}
                              title="Download"
                              style={{ width: 30, height: 30, border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                              <Download size={13} color="#374151" />
                            </button>
                          </div>
                        </div>

                        {/* Code */}
                        <pre style={{
                          margin: 0, padding: "20px", background: "#0d1117", color: "#e6edf3",
                          fontSize: 12.5, lineHeight: 1.7, overflow: "auto", maxHeight: 480,
                          fontFamily: "'Fira Code', 'Cascadia Code', 'Courier New', monospace",
                          counterReset: "line",
                        }}>
                          {result[tab.id].split("\n").map((line, i) => (
                            <div key={i} style={{ display: "flex", gap: 16 }}>
                              <span style={{ userSelect: "none", color: "#3d444d", minWidth: 28, textAlign: "right", flexShrink: 0 }}>
                                {i + 1}
                              </span>
                              <span style={{ flex: 1 }}>{colorizeCode(line, tab.id)}</span>
                            </div>
                          ))}
                        </pre>

                        {/* Footer */}
                        <div style={{ padding: "8px 20px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", textAlign: "center" }}>
                          <span style={{ fontSize: 11, color: "#94a3b8" }}>This content is generated by AITestCraft</span>
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {/* Run New Query */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 4 }}>
                  <button
                    onClick={resetSuite}
                    style={{
                      padding: "16px 20px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10,
                      cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 600, color: "#1e293b",
                    }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #eff6ff, #f5f3ff)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Sparkles size={16} color="#6366f1" />
                    </div>
                    Run New Query
                    <ChevronDown size={16} style={{ marginLeft: "auto", transform: "rotate(-90deg)" }} color="#94a3b8" />
                  </button>

                  {/* Feedback */}
                  <div style={{ padding: "16px 20px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>Was this helpful?</span>
                    <button
                      onClick={() => setFeedback("like")}
                      style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", border: "1px solid #d1d5db", borderRadius: 6, background: feedback === "like" ? "#f0fdf4" : "#fff", cursor: "pointer", fontSize: 13, color: feedback === "like" ? "#16a34a" : "#374151", fontWeight: 500 }}
                    >
                      <ThumbsUp size={14} /> Like
                    </button>
                    <button
                      onClick={() => setFeedback("dislike")}
                      style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", border: "1px solid #d1d5db", borderRadius: 6, background: feedback === "dislike" ? "#fef2f2" : "#fff", cursor: "pointer", fontSize: 13, color: feedback === "dislike" ? "#dc2626" : "#374151", fontWeight: 500 }}
                    >
                      <ThumbsDown size={14} /> Dislike
                    </button>
                    <button
                      style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 13, color: "#374151", fontWeight: 500 }}
                    >
                      <MessageSquare size={14} /> Comment
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Empty state */}
            {!result && !loading && (
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "40px 32px", textAlign: "center" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, maxWidth: 640, margin: "0 auto" }}>
                  {[
                    { icon: <Target size={20} />, label: "Locators", sub: "Playwright semantic locators", color: "#2563eb", bg: "#eff6ff" },
                    { icon: <Layers size={20} />, label: "Page Object", sub: "POM with actions & assertions", color: "#7c3aed", bg: "#f5f3ff" },
                    { icon: <Code2 size={20} />, label: "Step Defs", sub: "Cucumber @Given @When @Then", color: "#0891b2", bg: "#ecfeff" },
                    { icon: <BookOpen size={20} />, label: "Feature File", sub: "Gherkin BDD scenarios", color: "#16a34a", bg: "#f0fdf4" },
                  ].map((item) => (
                    <div key={item.label} style={{ padding: "18px 12px", background: item.bg, borderRadius: 10 }}>
                      <div style={{ color: item.color, marginBottom: 8 }}>{item.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: item.color }}>{item.label}</div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>{item.sub}</div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 16 }}>
                  Paste your HTML DOM above and click <strong>RUN</strong> to generate all 4 files
                </p>
              </div>
            )}
          </>
        )}

        {/* ═══════════════════════════════════════ CLASSIC MODE ═══════════════════════════════════════ */}
        {mode === "classic" && (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <Settings2 size={16} color="#6366f1" />
              <span style={{ fontSize: 15, fontWeight: 600, color: "#1e293b" }}>Classic Generator — Single File Mode</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>Page Name</label>
                <input
                  value={cPageName} onChange={(e) => setCPageName(e.target.value)}
                  placeholder="e.g. LoginPage"
                  style={{ width: "100%", padding: "8px 12px", fontSize: 13, border: "1px solid #d1d5db", borderRadius: 7, outline: "none", background: "#f9fafb", color: "#1e293b", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>Language</label>
                <select
                  value={cLang} onChange={(e) => setCLang(e.target.value as Language)}
                  style={{ width: "100%", padding: "8px 12px", fontSize: 13, border: "1px solid #d1d5db", borderRadius: 7, outline: "none", background: "#f9fafb", color: "#1e293b", boxSizing: "border-box" }}
                >
                  <option value="typescript">TypeScript</option>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>
                DOM / HTML <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <textarea
                value={cDom} onChange={(e) => setCDom(e.target.value)}
                placeholder="Paste your page HTML or DOM snippet here…"
                rows={10}
                style={{
                  width: "100%", padding: "10px 12px", fontSize: 12.5,
                  fontFamily: "'Fira Code', 'Courier New', monospace",
                  border: "1px solid #d1d5db", borderRadius: 7, outline: "none",
                  background: "#f9fafb", color: "#1e293b", resize: "vertical", boxSizing: "border-box", lineHeight: 1.6,
                }}
              />
            </div>

            {cError && (
              <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 12px", background: "#fef2f2", borderRadius: 7, marginBottom: 14, border: "1px solid #fecaca" }}>
                <AlertCircle size={15} color="#dc2626" />
                <span style={{ fontSize: 13, color: "#dc2626" }}>{cError}</span>
              </div>
            )}

            <button
              onClick={generateClassic}
              disabled={cLoading}
              style={{
                padding: "10px 24px", background: cLoading ? "#94a3b8" : "linear-gradient(135deg, #4f46e5, #7c3aed)",
                color: "#fff", border: "none", borderRadius: 22, fontSize: 14, fontWeight: 600,
                cursor: cLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 7,
              }}
            >
              {cLoading ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <Sparkles size={15} />}
              {cLoading ? "Generating…" : "Generate Page Object"}
            </button>

            {cResult && (
              <div style={{ marginTop: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <code style={{ fontSize: 13, color: "#6366f1", fontWeight: 600 }}>
                    {(cPageName || "GeneratedPage")}.po.{cLang === "typescript" ? "ts" : cLang === "javascript" ? "js" : cLang === "python" ? "py" : "java"}
                  </code>
                  <button
                    onClick={async () => { await navigator.clipboard.writeText(cResult); setCCopied(true); setTimeout(() => setCCopied(false), 2000); }}
                    style={{ padding: "5px 14px", background: "#fff", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, color: "#374151" }}
                  >
                    {cCopied ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                    {cCopied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <pre style={{
                  margin: 0, padding: "20px", background: "#0d1117", color: "#e6edf3",
                  fontSize: 12.5, lineHeight: 1.7, overflow: "auto", maxHeight: 500, borderRadius: 8,
                  fontFamily: "'Fira Code', 'Cascadia Code', 'Courier New', monospace",
                }}>
                  {cResult.split("\n").map((line, i) => (
                    <div key={i} style={{ display: "flex", gap: 16 }}>
                      <span style={{ userSelect: "none", color: "#3d444d", minWidth: 28, textAlign: "right", flexShrink: 0 }}>{i + 1}</span>
                      <span>{line}</span>
                    </div>
                  ))}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        textarea:focus, input:focus, select:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.1) !important; }
        button:hover:not(:disabled) { opacity: 0.88; }
      `}</style>
    </div>
  );
}

/* ── Syntax colorize (lightweight, no deps) ─────────────────── */
function colorizeCode(line: string, tabId: TabId): React.ReactNode {
  // For feature files - Gherkin keywords
  if (tabId === "scenarios") {
    const gherkin = /^(\s*)(Feature:|Background:|Scenario:|Scenario Outline:|Examples:|Given |When |Then |And |But )(.*)$/;
    const m = line.match(gherkin);
    if (m) {
      const keyword = m[2];
      const kColor = keyword.startsWith("Feature") ? "#ff7b72"
        : keyword.startsWith("Background") ? "#f0883e"
        : keyword.startsWith("Scenario") ? "#d2a8ff"
        : keyword.startsWith("Examples") ? "#79c0ff"
        : "#7ee787"; // Given/When/Then/And
      return (
        <>
          <span style={{ color: kColor, fontWeight: 600 }}>{m[1]}{m[2]}</span>
          <span style={{ color: "#e6edf3" }}>{m[3]}</span>
        </>
      );
    }
    // Table row
    if (line.includes("|")) return <span style={{ color: "#56d364" }}>{line}</span>;
    if (line.trim().startsWith("#")) return <span style={{ color: "#6e7681" }}>{line}</span>;
    if (line.trim().startsWith("As a") || line.trim().startsWith("I want") || line.trim().startsWith("So that"))
      return <span style={{ color: "#8b949e" }}>{line}</span>;
    return <span>{line}</span>;
  }

  // TypeScript syntax coloring
  const keyword = /\b(import|export|from|const|let|var|class|extends|implements|interface|type|function|async|await|return|new|this|public|private|protected|readonly|static|constructor|get|set|if|else|throw|try|catch|void|string|number|boolean|Promise|Page|Locator|test|describe|expect|Given|When|Then|And)\b/g;
  const comment = /(\/\/.*$)/;
  const decorator = /^(\s*)(@\w+)/;

  if (comment.test(line)) {
    const [before, after] = line.split(/(?=\/\/)/);
    return <><span>{before}</span><span style={{ color: "#6e7681" }}>{after}</span></>;
  }

  const decM = line.match(decorator);
  if (decM) {
    return (
      <>
        <span style={{ color: "#e6edf3" }}>{decM[1]}</span>
        <span style={{ color: "#f0883e", fontWeight: 600 }}>{decM[2]}</span>
        <span style={{ color: "#e6edf3" }}>{line.slice(decM[1].length + decM[2].length)}</span>
      </>
    );
  }

  // Simple: just colorize keywords inline
  const parts: React.ReactNode[] = [];
  let last = 0;
  const re = new RegExp(keyword.source, "g");
  let match;
  while ((match = re.exec(line)) !== null) {
    if (match.index > last) parts.push(<span key={last}>{line.slice(last, match.index)}</span>);
    const kw = match[0];
    const color = ["import","export","from","class","extends","interface","type"].includes(kw) ? "#ff7b72"
      : ["const","let","var","public","private","protected","readonly","static"].includes(kw) ? "#79c0ff"
      : ["async","await","return","new","this","function","constructor","get","set"].includes(kw) ? "#ff7b72"
      : ["Page","Locator","string","number","boolean","Promise","void"].includes(kw) ? "#ffa657"
      : ["test","describe","expect","Given","When","Then","And"].includes(kw) ? "#d2a8ff"
      : "#79c0ff";
    parts.push(<span key={match.index} style={{ color, fontWeight: 500 }}>{kw}</span>);
    last = match.index + kw.length;
  }
  if (last < line.length) parts.push(<span key={last}>{line.slice(last)}</span>);
  return <>{parts}</>;
}

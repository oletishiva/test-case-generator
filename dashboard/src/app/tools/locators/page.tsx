"use client";

import { useState } from "react";
import {
  Sparkles, Loader2, Copy, Check, Download, FileCode2,
  Target, Code2, TestTube2, Layers, FolderOpen, ChevronRight,
  AlertCircle,
} from "lucide-react";
import JSZip from "jszip";

/* ── Types ─────────────────────────────────────────────────── */
interface GeneratedFiles {
  locators:   string;
  pageObject: string;
  stepDefs:   string;
  scenarios:  string;
  provider:   string;
  pageName:   string;
}

type TabId = "locators" | "pageObject" | "stepDefs" | "scenarios";

interface Tab {
  id:       TabId;
  label:    string;
  folder:   string;
  filename: (page: string) => string;
  icon:     React.ReactNode;
  color:    string;
  bg:       string;
}

const TABS: Tab[] = [
  {
    id: "locators",
    label: "1 · Locators",
    folder: "1_Locators",
    filename: (p) => `${p}.locators.ts`,
    icon: <Target size={15} />,
    color: "#2563eb",
    bg: "#eff6ff",
  },
  {
    id: "pageObject",
    label: "2 · Page Object",
    folder: "2_Page-Object",
    filename: (p) => `${p}.po.ts`,
    icon: <Layers size={15} />,
    color: "#7c3aed",
    bg: "#f5f3ff",
  },
  {
    id: "stepDefs",
    label: "3 · Step Definitions",
    folder: "3_Step-Definitions",
    filename: (p) => `${p}.steps.ts`,
    icon: <Code2 size={15} />,
    color: "#0891b2",
    bg: "#ecfeff",
  },
  {
    id: "scenarios",
    label: "4 · Test Scenarios",
    folder: "4_Test-Scenarios",
    filename: (p) => `${p}.spec.ts`,
    icon: <TestTube2 size={15} />,
    color: "#16a34a",
    bg: "#f0fdf4",
  },
];

const LOADING_STEPS = [
  "Parsing DOM structure...",
  "Extracting semantic locators...",
  "Building Page Object Model...",
  "Generating Step Definitions...",
  "Writing Test Scenarios...",
  "Packaging files...",
];

/* ── Component ─────────────────────────────────────────────── */
export default function LocatorsPage() {
  const [dom,      setDom]      = useState("");
  const [pageName, setPageName] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [stepIdx,  setStepIdx]  = useState(0);
  const [result,   setResult]   = useState<GeneratedFiles | null>(null);
  const [error,    setError]    = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("locators");
  const [copied,   setCopied]   = useState<TabId | null>(null);

  /* advance loading message */
  function startLoadingCycle() {
    setStepIdx(0);
    let i = 0;
    const id = setInterval(() => {
      i++;
      if (i >= LOADING_STEPS.length) { clearInterval(id); return; }
      setStepIdx(i);
    }, 1800);
    return id;
  }

  async function generate() {
    if (!dom.trim()) { setError("Please paste your DOM / HTML content."); return; }
    setError("");
    setResult(null);
    setLoading(true);
    const interval = startLoadingCycle();

    try {
      const res = await fetch("/api/locators/multifile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: dom, pageName: pageName || "GeneratedPage" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setResult(data as GeneratedFiles);
      setActiveTab("locators");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  }

  function getContent(id: TabId): string {
    if (!result) return "";
    return result[id];
  }

  async function copyTab(id: TabId) {
    await navigator.clipboard.writeText(getContent(id));
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  function downloadFile(id: TabId) {
    if (!result) return;
    const tab   = TABS.find((t) => t.id === id)!;
    const fname = tab.filename(result.pageName);
    const blob  = new Blob([getContent(id)], { type: "text/plain" });
    const url   = URL.createObjectURL(blob);
    const a     = document.createElement("a");
    a.href     = url; a.download = fname; a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadZip() {
    if (!result) return;
    const zip = new JSZip();
    const root = zip.folder("output");
    for (const tab of TABS) {
      const folder = root!.folder(tab.folder);
      folder!.file(tab.filename(result.pageName), getContent(tab.id));
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url; a.download = `${result.pageName}_playwright.zip`; a.click();
    URL.revokeObjectURL(url);
  }

  const activeTabData = TABS.find((t) => t.id === activeTab)!;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* ── Header ── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "24px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Target size={20} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                Smart Locator Generator
              </h1>
              <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
                Paste DOM → generate Locators, Page Object, Step Definitions & Test Scenarios
              </p>
            </div>
          </div>

          {/* breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12 }}>
            {["Tools", "Locator Generator"].map((crumb, i, arr) => (
              <span key={crumb} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 12, color: i === arr.length - 1 ? "#6366f1" : "#94a3b8", fontWeight: i === arr.length - 1 ? 600 : 400 }}>
                  {crumb}
                </span>
                {i < arr.length - 1 && <ChevronRight size={12} color="#cbd5e1" />}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 32px" }}>
        {/* ── Input Card ── */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 28, marginBottom: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <FileCode2 size={18} color="#6366f1" />
            <span style={{ fontSize: 15, fontWeight: 600, color: "#1e293b" }}>Input</span>
          </div>

          {/* Page name */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>
              Page Name <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional — used for class & file names)</span>
            </label>
            <input
              value={pageName}
              onChange={(e) => setPageName(e.target.value)}
              placeholder="e.g. LoginPage, CheckoutPage, DashboardPage"
              style={{
                width: "100%", padding: "10px 14px", fontSize: 14,
                border: "1px solid #d1d5db", borderRadius: 8, outline: "none",
                background: "#f9fafb", color: "#1e293b", boxSizing: "border-box",
              }}
            />
          </div>

          {/* DOM input */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>
              DOM / HTML <span style={{ color: "#dc2626", fontWeight: 600 }}>*</span>
            </label>
            <textarea
              value={dom}
              onChange={(e) => setDom(e.target.value)}
              placeholder="Paste your page HTML or DOM snippet here…"
              rows={12}
              style={{
                width: "100%", padding: "12px 14px", fontSize: 13, fontFamily: "'Fira Code', 'Courier New', monospace",
                border: "1px solid #d1d5db", borderRadius: 8, outline: "none",
                background: "#f9fafb", color: "#1e293b", resize: "vertical", boxSizing: "border-box",
                lineHeight: 1.6,
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#fef2f2", borderRadius: 8, marginBottom: 16, border: "1px solid #fecaca" }}>
              <AlertCircle size={16} color="#dc2626" />
              <span style={{ fontSize: 13, color: "#dc2626" }}>{error}</span>
            </div>
          )}

          {/* Generate button */}
          <button
            onClick={generate}
            disabled={loading}
            style={{
              padding: "11px 28px", background: loading ? "#94a3b8" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8,
            }}
          >
            {loading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Sparkles size={16} />}
            {loading ? LOADING_STEPS[stepIdx] : "Generate All Files"}
          </button>
        </div>

        {/* ── Output Section ── */}
        {result && (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            {/* Output header */}
            <div style={{ padding: "20px 28px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FolderOpen size={18} color="#6366f1" />
                <span style={{ fontSize: 15, fontWeight: 600, color: "#1e293b" }}>
                  Generated Files — <code style={{ fontSize: 13, background: "#f1f5f9", padding: "2px 8px", borderRadius: 4, color: "#6366f1" }}>{result.pageName}</code>
                </span>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", fontWeight: 600 }}>
                  via {result.provider}
                </span>
              </div>

              {/* Download ZIP */}
              <button
                onClick={downloadZip}
                style={{
                  padding: "8px 18px", background: "linear-gradient(135deg, #16a34a, #15803d)",
                  color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                }}
              >
                <Download size={14} />
                Download All as ZIP
              </button>
            </div>

            {/* Folder structure preview */}
            <div style={{ padding: "14px 28px", background: "#f8fafc", borderBottom: "1px solid #f1f5f9", display: "flex", gap: 8, flexWrap: "wrap" }}>
              {TABS.map((tab) => (
                <div key={tab.id} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", background: "#fff", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, color: "#64748b" }}>
                  <span style={{ color: tab.color }}>{tab.icon}</span>
                  <span style={{ fontFamily: "monospace" }}>{tab.folder}/{tab.filename(result.pageName)}</span>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", padding: "0 28px" }}>
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: "14px 18px", border: "none", background: "none", cursor: "pointer",
                    fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 400,
                    color: activeTab === tab.id ? tab.color : "#64748b",
                    borderBottom: activeTab === tab.id ? `2px solid ${tab.color}` : "2px solid transparent",
                    display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s",
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Code block */}
            <div style={{ padding: 0 }}>
              {/* File header */}
              <div style={{
                padding: "12px 24px", background: activeTabData.bg,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                borderBottom: "1px solid #e2e8f0",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: activeTabData.color }}>{activeTabData.icon}</span>
                  <code style={{ fontSize: 13, color: activeTabData.color, fontWeight: 600 }}>
                    {activeTabData.folder}/{activeTabData.filename(result.pageName)}
                  </code>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => copyTab(activeTab)}
                    style={{
                      padding: "6px 14px", background: "#fff", border: "1px solid #d1d5db",
                      borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 5, color: "#374151",
                    }}
                  >
                    {copied === activeTab ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                    {copied === activeTab ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={() => downloadFile(activeTab)}
                    style={{
                      padding: "6px 14px", background: "#fff", border: "1px solid #d1d5db",
                      borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 5, color: "#374151",
                    }}
                  >
                    <Download size={13} />
                    Download
                  </button>
                </div>
              </div>

              {/* Code */}
              <pre style={{
                margin: 0, padding: "24px", background: "#0f172a", color: "#e2e8f0",
                fontSize: 13, lineHeight: 1.7, overflow: "auto",
                fontFamily: "'Fira Code', 'Cascadia Code', 'Courier New', monospace",
                maxHeight: 520, borderRadius: "0 0 16px 16px",
              }}>
                <code>{getContent(activeTab)}</code>
              </pre>
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {!result && !loading && (
          <div style={{ textAlign: "center", padding: "60px 32px", background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0" }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg, #eff6ff, #f5f3ff)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Target size={28} color="#6366f1" />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: "#1e293b", margin: "0 0 8px" }}>
              Ready to generate
            </h3>
            <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 24px", maxWidth: 420, marginLeft: "auto", marginRight: "auto" }}>
              Paste your page HTML or DOM, give the page a name, and click <strong>Generate All Files</strong> to get 4 production-ready Playwright TypeScript files.
            </p>

            {/* Output preview cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, maxWidth: 700, margin: "0 auto" }}>
              {TABS.map((tab) => (
                <div key={tab.id} style={{ padding: "14px 12px", background: tab.bg, borderRadius: 10, border: `1px solid ${tab.color}22` }}>
                  <div style={{ color: tab.color, marginBottom: 6 }}>{tab.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: tab.color }}>{tab.folder}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Playwright TS</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Loading state ── */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 32px", background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0" }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg, #eff6ff, #f5f3ff)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Loader2 size={28} color="#6366f1" style={{ animation: "spin 1s linear infinite" }} />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: "#1e293b", margin: "0 0 8px" }}>
              Generating your files…
            </h3>
            <p style={{ fontSize: 14, color: "#6366f1", margin: "0 0 32px", fontWeight: 500 }}>
              {LOADING_STEPS[stepIdx]}
            </p>

            {/* Progress steps */}
            <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
              {TABS.map((tab, i) => (
                <div key={tab.id} style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
                  background: i <= stepIdx ? tab.bg : "#f8fafc",
                  border: `1px solid ${i <= stepIdx ? tab.color + "44" : "#e2e8f0"}`,
                  borderRadius: 8, fontSize: 12, fontWeight: 500,
                  color: i <= stepIdx ? tab.color : "#94a3b8",
                  transition: "all 0.3s",
                }}>
                  {i < stepIdx ? <Check size={13} /> : i === stepIdx ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : tab.icon}
                  {tab.folder}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        textarea:focus, input:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.1) !important; }
        button:hover:not(:disabled) { opacity: 0.9; }
      `}</style>
    </div>
  );
}

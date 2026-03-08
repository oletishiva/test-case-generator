"use client";

import { useState, useMemo, type ComponentType } from "react";
import Link from "next/link";
import {
  TestTube, Sparkles, Loader2, Copy, Check, Download,
  Code2, Globe, FileText, RefreshCw, Target, Zap,
  ChevronDown, ChevronUp, AlertCircle, MousePointerClick,
  MousePointer2, Type, Link2, LayoutGrid, TestTube2,
} from "lucide-react";

/* ── Types ─────────────────────────────────────────────────── */
type InputMode  = "html" | "url" | "describe";
type Framework  = "playwright" | "cypress" | "selenium";
type Strategy   = "role" | "text" | "label" | "placeholder" | "testid" | "css";
type Language   = "typescript" | "javascript";

interface ParsedLocator { name: string; type: string; args: string; fullExpr: string; category: "button" | "input" | "link" | "other"; }
interface ParsedMethod  { name: string; params: string; }

/* ── Locator badge colours ─────────────────────────────────── */
const LOCATOR_BADGES: Record<string, { bg: string; color: string; border: string }> = {
  getByRole:        { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  getByLabel:       { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  getByPlaceholder: { bg: "#faf5ff", color: "#7c3aed", border: "#e9d5ff" },
  getByText:        { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  getByTestId:      { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  getByAltText:     { bg: "#eef2ff", color: "#4338ca", border: "#c7d2fe" },
  getByTitle:       { bg: "#fdf4ff", color: "#9333ea", border: "#f3e8ff" },
  locator:          { bg: "#f8fafc", color: "#64748b", border: "#e2e8f0" },
};

/* ── Resilience by locator type ─────────────────────────────── */
function getResilience(type: string): { label: string; bg: string; color: string } {
  if (["getByRole", "getByLabel", "getByTestId"].includes(type))
    return { label: "High",   bg: "#f0fdf4", color: "#16a34a" };
  if (["getByPlaceholder", "getByText", "getByAltText", "getByTitle"].includes(type))
    return { label: "Medium", bg: "#fffbeb", color: "#d97706" };
  return   { label: "Low",    bg: "#fef2f2", color: "#dc2626" };
}

/* ── Categorise a single locator ────────────────────────────── */
function categoriseLocator(name: string, type: string, args: string): "button" | "input" | "link" | "other" {
  const a = args.toLowerCase();
  const n = name.toLowerCase();
  if (type === "getByRole") {
    if (a.startsWith("'button'") || a.startsWith('"button"')) return "button";
    if (a.startsWith("'link'")   || a.startsWith('"link"'))   return "link";
    if (/^'(textbox|combobox|checkbox|radio|spinbutton|searchbox|switch)'/.test(a)) return "input";
  }
  if (type === "getByPlaceholder" || type === "getByLabel") return "input";
  if (n.includes("btn") || n.includes("button")) return "button";
  if (n.includes("input") || n.includes("field") || n.includes("email") || n.includes("password")) return "input";
  if (n.includes("link")) return "link";
  return "other";
}

/* ── Parse generated TypeScript / JavaScript POM ────────────── */
function parseCode(code: string): { locators: ParsedLocator[]; methods: ParsedMethod[] } {
  const locators: ParsedLocator[] = [];
  const methods:  ParsedMethod[]  = [];
  const seen = new Set<string>();

  for (const line of code.split("\n")) {
    const fm = line.match(
      /^\s*(?:(?:private|public|protected)\s+)?(?:readonly\s+)?(\w+)\s*=\s*this\.page\.(getBy\w+|locator)\((.*)$/
    );
    if (fm) {
      const [, name, type, rest] = fm;
      if (!seen.has(`L:${name}`)) {
        seen.add(`L:${name}`);
        const args = rest.replace(/\);\s*$/, "").replace(/\)\s*$/, "").trim();
        locators.push({
          name, type, args,
          fullExpr: `this.page.${type}(${args})`,
          category: categoriseLocator(name, type, args),
        });
      }
      continue;
    }
    const mm = line.match(/^\s*async\s+(\w+)\s*\(([^)]*)\)/);
    if (mm) {
      const [, name, params] = mm;
      if (!seen.has(`M:${name}`)) { seen.add(`M:${name}`); methods.push({ name, params }); }
    }
  }
  return { locators, methods };
}

/* ── Build a smoke test snippet from locators ───────────────── */
function buildSmokeTest(className: string | null, locators: ParsedLocator[], language: Language): string {
  const cn = className ?? "GeneratedPage";
  const fields = locators.slice(0, 5).map(l => `  await expect(po.${l.name}).toBeVisible();`).join("\n");
  if (language === "javascript") {
    return `const { test, expect } = require('@playwright/test');\nconst { ${cn} } = require('./${cn}');\n\ntest('smoke test — ${cn}', async ({ page }) => {\n  const po = new ${cn}(page);\n${fields}\n});`;
  }
  return `import { test, expect } from '@playwright/test';\nimport { ${cn} } from './${cn}';\n\ntest('smoke test — ${cn}', async ({ page }) => {\n  const po = new ${cn}(page);\n${fields}\n});`;
}

/* ── Config constants ────────────────────────────────────────── */
const STRATEGIES: { value: Strategy; label: string; desc: string }[] = [
  { value: "role",        label: "getByRole",        desc: "Semantic — recommended" },
  { value: "label",       label: "getByLabel",       desc: "Form labels" },
  { value: "placeholder", label: "getByPlaceholder", desc: "Input placeholders" },
  { value: "text",        label: "getByText",        desc: "Visible text" },
  { value: "testid",      label: "getByTestId",      desc: "data-testid attributes" },
  { value: "css",         label: "CSS / XPath",      desc: "Last resort fallback" },
];

const FRAMEWORKS: { value: Framework; label: string; color: string }[] = [
  { value: "playwright", label: "Playwright", color: "#2dd4bf" },
  { value: "cypress",    label: "Cypress",    color: "#10b981" },
  { value: "selenium",   label: "Selenium",   color: "#f59e0b" },
];

const HTML_EXAMPLE = `<form>
  <label for="email">Email</label>
  <input id="email" type="email" placeholder="you@example.com" />

  <label for="password">Password</label>
  <input id="password" type="password" placeholder="Enter password" />

  <button type="submit">Sign In</button>
  <a href="/forgot">Forgot password?</a>
</form>`;

const DESCRIBE_EXAMPLES = [
  "A login page with email input, password input, Sign In button and Forgot Password link",
  "A checkout form with billing address, card number, expiry date, CVV and Pay Now button",
  "A search results page with a search bar, filter dropdown, 10 product cards each with Add to Cart",
];

function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/* ── Category chip colours ───────────────────────────────────── */
const CAT_STYLE = {
  button: { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  input:  { bg: "#faf5ff", color: "#7c3aed", border: "#e9d5ff" },
  link:   { bg: "#eef2ff", color: "#4338ca", border: "#c7d2fe" },
  other:  { bg: "#f8fafc", color: "#64748b", border: "#e2e8f0" },
};

/* ── Page ────────────────────────────────────────────────────── */
export default function LocatorsPage() {
  /* input */
  const [mode,          setMode]          = useState<InputMode>("html");
  const [htmlInput,     setHtmlInput]     = useState("");
  const [urlInput,      setUrlInput]      = useState("");
  const [description,   setDescription]  = useState("");
  /* config */
  const [framework,     setFramework]     = useState<Framework>("playwright");
  const [language,      setLanguage]      = useState<Language>("typescript");
  const [strategy,      setStrategy]      = useState<Strategy>("role");
  const [groupPOM,      setGroupPOM]      = useState(true);
  const [includeActions,       setIncludeActions]      = useState(true);
  const [includeDynamic,       setIncludeDynamic]      = useState(false);
  const [ignoreSections,       setIgnoreSections]      = useState("");
  const [ignoreOpen,    setIgnoreOpen]    = useState(false);
  /* output state */
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState("");
  const [code,          setCode]          = useState("");
  const [provider,      setProvider]      = useState("");
  /* UI state */
  const [copied,        setCopied]        = useState(false);
  const [copiedRowId,   setCopiedRowId]   = useState<string | null>(null);
  const [tableOpen,     setTableOpen]     = useState(true);
  const [elementsOpen,  setElementsOpen]  = useState(true);
  const [awaitMode,     setAwaitMode]     = useState(false);
  const [smokeVisible,  setSmokeVisible]  = useState(false);

  const hasCode = code.trim().length > 0;
  const ext = language === "javascript" ? "js" : "ts";

  const className = (() => {
    const m = code.match(/export\s+(?:default\s+)?class\s+(\w+)/);
    return m ? m[1] : null;
  })();

  const { locators: parsedLocators, methods: parsedMethods } = useMemo(
    () => (code ? parseCode(code) : { locators: [], methods: [] }),
    [code]
  );

  /* Categorised element groups */
  const elementGroups = useMemo(() => {
    const g = { button: [] as string[], input: [] as string[], link: [] as string[], other: [] as string[] };
    for (const l of parsedLocators) g[l.category].push(l.name);
    return g;
  }, [parsedLocators]);

  const smokeTest = useMemo(
    () => (hasCode ? buildSmokeTest(className, parsedLocators, language) : ""),
    [hasCode, className, parsedLocators, language]
  );

  async function generate() {
    setError("");
    const content = mode === "html" ? htmlInput : mode === "url" ? urlInput : description;
    if (!content.trim()) {
      setError(mode === "url" ? "Enter a URL." : "Provide some input to analyse.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/locators/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputType: mode,
          content: content.trim(),
          preferredStrategy: strategy,
          framework,
          groupIntoPOM: groupPOM,
          language,
          includeActions,
          includeDynamicLocators: includeDynamic,
          ignoreSections,
        }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Generation failed");
      setCode(json.code);
      setProvider(json.provider);
      setTableOpen(true);
      setElementsOpen(true);
      setSmokeVisible(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function copyText(text: string, id: string) {
    await navigator.clipboard.writeText(text);
    setCopiedRowId(id);
    setTimeout(() => setCopiedRowId(null), 1500);
  }

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  /* Copy a locator row — normal or "with await" (SelectorsHub style) */
  function getRowCopyText(row: ParsedLocator): string {
    if (awaitMode) return `const ${row.name} = await this.page.${row.type}(${row.args});`;
    return row.fullExpr;
  }

  const INPUT_TABS: { id: InputMode; icon: ComponentType<{ style?: React.CSSProperties }>; label: string }[] = [
    { id: "html",     icon: FileText, label: "HTML Source" },
    { id: "url",      icon: Globe,    label: "URL" },
    { id: "describe", icon: Sparkles, label: "Describe" },
  ];

  /* Element Discovery categories config */
  const EL_CATS: { key: "button" | "input" | "link" | "other"; label: string; icon: ComponentType<{ style?: React.CSSProperties }> }[] = [
    { key: "button", label: "Buttons",      icon: MousePointer2 },
    { key: "input",  label: "Input Fields", icon: Type },
    { key: "link",   label: "Links",        icon: Link2 },
    { key: "other",  label: "Other",        icon: LayoutGrid },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#f1f5f9", fontFamily: "system-ui,-apple-system,sans-serif" }}>

      {/* ── Nav ── */}
      <nav className="lc-nav" style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 24px", display: "flex", alignItems: "center", height: 56, gap: 20, position: "sticky", top: 0, zIndex: 50, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", flexShrink: 0 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TestTube style={{ width: 14, height: 14, color: "#fff" }} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>AITestCraft</span>
        </Link>
        <div style={{ flex: 1 }} />
        <Link className="lc-nav-link" href="/dashboard"       style={{ fontSize: 13, color: "#64748b", textDecoration: "none", fontWeight: 500 }}>Test Generator</Link>
        <Link className="lc-nav-link" href="/tools/test-data" style={{ fontSize: 13, color: "#64748b", textDecoration: "none", fontWeight: 500 }}>Test Data</Link>
        <Link className="lc-nav-link" href="/resume-builder"  style={{ fontSize: 13, color: "#64748b", textDecoration: "none", fontWeight: 500 }}>Resume Builder</Link>
        <Link href="/sign-up" style={{ fontSize: 13, fontWeight: 700, color: "#fff", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", borderRadius: 8, padding: "7px 16px", textDecoration: "none", flexShrink: 0, whiteSpace: "nowrap" }}>
          Get Started Free
        </Link>
      </nav>

      {/* ── Hero ── */}
      <div style={{ background: "linear-gradient(135deg,#0a0f1e 0%,#0c1a2e 50%,#0a1a1e 100%)", padding: "40px 24px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(45,212,191,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(45,212,191,0.04) 1px,transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -80, right: "10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(45,212,191,0.12) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(45,212,191,0.12)", border: "1px solid rgba(45,212,191,0.3)", borderRadius: 20, padding: "5px 14px", marginBottom: 16 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2dd4bf", display: "inline-block", animation: "pulse 2s infinite" }} />
            <Target style={{ width: 13, height: 13, color: "#2dd4bf" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#2dd4bf" }}>Smart Locator Capture</span>
          </div>
          <h1 style={{ fontSize: "clamp(24px,4.5vw,40px)", fontWeight: 900, color: "#fff", margin: "0 0 12px", lineHeight: 1.1, letterSpacing: "-0.5px" }}>
            Generate Production-Ready<br />
            <span style={{ background: "linear-gradient(135deg,#2dd4bf,#60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Locators & Page Objects</span>
          </h1>
          <p style={{ fontSize: 15, color: "#94a3b8", margin: "0 auto 20px", maxWidth: 520, lineHeight: 1.7 }}>
            Paste HTML, enter a URL, or describe your page — get semantic Playwright/Cypress/Selenium
            locators with a full Page Object Model in seconds.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            {[
              { n: "3",   l: "Input modes" }, { n: "3",   l: "Frameworks" },
              { n: "TS+JS", l: "Languages" },  { n: "POM", l: "Auto-generated" },
            ].map(({ n, l }) => (
              <div key={l} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "9px 16px", textAlign: "center", minWidth: 76 }}>
                <p style={{ fontSize: 18, fontWeight: 800, color: "#fff", margin: 0 }}>{n}</p>
                <p style={{ fontSize: 10, color: "#64748b", margin: 0, marginTop: 2 }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="lc-main" style={{ padding: "24px 24px", display: "flex", gap: 22, alignItems: "flex-start" }}>

        {/* ── LEFT PANEL ── */}
        <div className="lc-left" style={{ flex: "0 0 480px", minWidth: 0 }}>

          {/* Input tabs */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden", marginBottom: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0" }}>
              {INPUT_TABS.map(({ id, icon: Icon, label }) => (
                <button key={id} onClick={() => setMode(id)} style={{ flex: 1, padding: "12px 0", border: "none", borderBottom: `2px solid ${mode === id ? "#2dd4bf" : "transparent"}`, background: mode === id ? "#f0fdfa" : "transparent", fontSize: 12, fontWeight: mode === id ? 700 : 500, color: mode === id ? "#0d9488" : "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, transition: "all 0.15s" }}>
                  <Icon style={{ width: 13, height: 13 }} />{label}
                </button>
              ))}
            </div>
            <div style={{ padding: "16px 16px" }}>
              {mode === "html" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <p style={{ fontSize: 12, color: "#475569", fontWeight: 600, margin: 0 }}>Paste HTML source or component snippet</p>
                    <button onClick={() => setHtmlInput(HTML_EXAMPLE)} style={{ fontSize: 11, color: "#2dd4bf", background: "#f0fdfa", border: "1px solid #99f6e4", borderRadius: 6, padding: "3px 9px", cursor: "pointer", fontWeight: 600 }}>Load example</button>
                  </div>
                  <textarea value={htmlInput} onChange={(e) => setHtmlInput(e.target.value)} placeholder={`<form>\n  <label for="email">Email</label>\n  <input id="email" type="email" />\n</form>`} rows={11} style={{ width: "100%", fontSize: 12, fontFamily: "'Fira Code',monospace", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px", lineHeight: 1.65, resize: "vertical", color: "#0f172a", outline: "none", background: "#f8fafc", boxSizing: "border-box" }} />
                  <p style={{ fontSize: 11, color: "#94a3b8", margin: "5px 0 0", textAlign: "right" }}>{htmlInput.length > 0 ? `${htmlInput.length.toLocaleString()} chars` : ""}</p>
                </div>
              )}
              {mode === "url" && (
                <div>
                  <p style={{ fontSize: 12, color: "#475569", fontWeight: 600, margin: "0 0 8px" }}>Enter a public URL — page will be fetched server-side</p>
                  <input value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://example.com/login" style={{ width: "100%", fontSize: 13, border: "1px solid #e2e8f0", borderRadius: 10, padding: "11px 14px", color: "#0f172a", outline: "none", boxSizing: "border-box" }} />
                  <div style={{ marginTop: 10, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 9, padding: "9px 12px", display: "flex", gap: 8 }}>
                    <AlertCircle style={{ width: 13, height: 13, color: "#d97706", flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 11, color: "#92400e", margin: 0, lineHeight: 1.5 }}>Works best with public pages. JS-heavy or login-gated sites may produce limited results.</p>
                  </div>
                </div>
              )}
              {mode === "describe" && (
                <div>
                  <p style={{ fontSize: 12, color: "#475569", fontWeight: 600, margin: "0 0 8px" }}>Describe the page in plain English</p>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="E.g. A login page with email input, password input, Sign In button and Forgot Password link" rows={5} style={{ width: "100%", fontSize: 13, border: "1px solid #e2e8f0", borderRadius: 10, padding: "11px 13px", lineHeight: 1.65, resize: "vertical", color: "#0f172a", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
                  <p style={{ fontSize: 11, color: "#94a3b8", margin: "8px 0 5px" }}>Try an example:</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {DESCRIBE_EXAMPLES.map((ex) => (
                      <button key={ex} onClick={() => setDescription(ex)} style={{ textAlign: "left", fontSize: 11, color: "#0d9488", background: "#f0fdfa", border: "1px solid #99f6e4", borderRadius: 7, padding: "6px 10px", cursor: "pointer", lineHeight: 1.5 }}>{ex}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Ignore Sections (collapsible) */}
              <div style={{ marginTop: 12, borderTop: "1px solid #f1f5f9", paddingTop: 10 }}>
                <button onClick={() => setIgnoreOpen(!ignoreOpen)} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: "#64748b", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  {ignoreOpen ? <ChevronUp style={{ width: 12, height: 12 }} /> : <ChevronDown style={{ width: 12, height: 12 }} />}
                  Ignore Sections (Optional)
                  {ignoreSections.trim() && <span style={{ fontSize: 10, background: "#fef3c7", color: "#d97706", border: "1px solid #fde68a", borderRadius: 10, padding: "1px 6px", marginLeft: 2 }}>active</span>}
                </button>
                {ignoreOpen && (
                  <textarea
                    value={ignoreSections}
                    onChange={(e) => setIgnoreSections(e.target.value)}
                    placeholder="e.g. footer, side panel, navigation menu, cookie banner"
                    rows={2}
                    style={{ marginTop: 8, width: "100%", fontSize: 12, border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", lineHeight: 1.55, resize: "vertical", color: "#0f172a", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Config */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: "16px", marginBottom: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 14px" }}>Configuration</p>

            {/* Framework */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 7 }}>Framework</label>
              <div style={{ display: "flex", gap: 7 }}>
                {FRAMEWORKS.map(({ value, label, color }) => (
                  <button key={value} onClick={() => setFramework(value)} style={{ flex: 1, padding: "7px 0", borderRadius: 9, border: `2px solid ${framework === value ? color : "#e2e8f0"}`, background: framework === value ? `${color}18` : "#fff", color: framework === value ? color : "#64748b", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 7 }}>Language</label>
              <div style={{ display: "flex", gap: 7 }}>
                {(["typescript", "javascript"] as Language[]).map((lang) => (
                  <button key={lang} onClick={() => setLanguage(lang)} style={{ flex: 1, padding: "7px 0", borderRadius: 9, border: `2px solid ${language === lang ? "#6366f1" : "#e2e8f0"}`, background: language === lang ? "#eef2ff" : "#fff", color: language === lang ? "#4338ca" : "#64748b", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.15s", textTransform: "uppercase" as const, letterSpacing: "0.3px" }}>
                    {lang === "typescript" ? "TypeScript" : "JavaScript"}
                  </button>
                ))}
              </div>
            </div>

            {/* Strategy */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 7 }}>Locator Strategy Priority</label>
              <div style={{ position: "relative" }}>
                <select value={strategy} onChange={(e) => setStrategy(e.target.value as Strategy)} style={{ width: "100%", fontSize: 13, border: "1px solid #e2e8f0", borderRadius: 9, padding: "9px 32px 9px 12px", appearance: "none", background: "#fff", color: "#0f172a", cursor: "pointer", outline: "none" }}>
                  {STRATEGIES.map(({ value, label, desc }) => <option key={value} value={value}>{label} — {desc}</option>)}
                </select>
                <ChevronDown style={{ width: 13, height: 13, position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8" }} />
              </div>
            </div>

            {/* Toggles */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Generate POM */}
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <div onClick={() => setGroupPOM(!groupPOM)} style={{ width: 36, height: 20, borderRadius: 10, background: groupPOM ? "#2dd4bf" : "#e2e8f0", position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}>
                  <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: groupPOM ? 19 : 3, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", margin: 0 }}>Generate Page Object Model</p>
                  <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>Wraps locators in a class</p>
                </div>
              </label>

              {/* Include Actions */}
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <div onClick={() => setIncludeActions(!includeActions)} style={{ width: 36, height: 20, borderRadius: 10, background: includeActions ? "#2dd4bf" : "#e2e8f0", position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}>
                  <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: includeActions ? 19 : 3, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", margin: 0 }}>Include Page Action Methods</p>
                  <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>clickLogin(), enterEmail() etc.</p>
                </div>
              </label>

              {/* Include Dynamic Locators */}
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", background: "#f8fafc", borderRadius: 10, padding: "8px 10px", border: "1px solid #f1f5f9" }}>
                <div onClick={() => setIncludeDynamic(!includeDynamic)} style={{ width: 36, height: 20, borderRadius: 10, background: includeDynamic ? "#6366f1" : "#e2e8f0", position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}>
                  <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: includeDynamic ? 19 : 3, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", margin: 0 }}>Include Dynamic Locators</p>
                  <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>getRowByText(text), getProductCard(index) etc.</p>
                </div>
              </label>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
              <AlertCircle style={{ width: 16, height: 16, color: "#ef4444", flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: "#dc2626" }}>{error}</span>
            </div>
          )}

          {/* Generate button */}
          <button onClick={generate} disabled={loading} style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: "none", background: loading ? "#5eead4" : "linear-gradient(135deg,#0d9488,#0891b2)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 20px rgba(13,148,136,0.4)", transition: "opacity 0.15s", letterSpacing: "-0.2px" }}>
            {loading
              ? <><Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} /> Analysing…</>
              : <><Zap style={{ width: 18, height: 18 }} /> Generate Page Object</>}
          </button>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="lc-right" style={{ flex: 1, minWidth: 0 }}>
          {!hasCode ? (
            <div style={{ background: "#fff", borderRadius: 16, border: "2px dashed #e2e8f0", padding: "56px 32px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div style={{ width: 68, height: 68, borderRadius: 20, background: "linear-gradient(135deg,#f0fdfa,#ccfbf1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", boxShadow: "0 4px 12px rgba(13,148,136,0.15)" }}>
                <MousePointerClick style={{ width: 30, height: 30, color: "#0d9488" }} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>Your locators will appear here</h3>
              <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 26px", lineHeight: 1.7 }}>
                Paste HTML, enter a URL, or describe your page on the left,<br />then click <strong style={{ color: "#0d9488" }}>Generate Page Object</strong>.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11, maxWidth: 480, margin: "0 auto 22px" }}>
                {[
                  { icon: "🎯", title: "Semantic first",       desc: "getByRole, getByLabel, getByText — accessibility-friendly" },
                  { icon: "📦", title: "Page Object Model",    desc: "Full class with setters, getters & action methods" },
                  { icon: "🌐", title: "Multi-framework",      desc: "Playwright, Cypress & Selenium supported" },
                  { icon: "⚡", title: "Dynamic locators",     desc: "Parameterized getRowByText(), getProductCard(n)" },
                ].map(({ icon, title, desc }) => (
                  <div key={title} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "13px", textAlign: "left" }}>
                    <span style={{ fontSize: 20 }}>{icon}</span>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", margin: "7px 0 3px" }}>{title}</p>
                    <p style={{ fontSize: 11, color: "#64748b", margin: 0, lineHeight: 1.5 }}>{desc}</p>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
                {["Playwright TS", "Playwright JS", "Cypress", "Selenium", "Page Object"].map((f) => (
                  <span key={f} style={{ fontSize: 11, fontWeight: 600, color: "#0d9488", background: "#f0fdfa", border: "1px solid #99f6e4", borderRadius: 20, padding: "4px 12px" }}>{f}</span>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {/* ── Toolbar ── */}
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{className ? `class ${className}` : "Page Object"}</span>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>via {provider}</span>
                </div>

                {parsedLocators.length > 0 && (
                  <span style={{ fontSize: 11, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 20, padding: "2px 9px", fontWeight: 600, color: "#475569" }}>
                    {parsedLocators.length} locator{parsedLocators.length !== 1 ? "s" : ""}
                    {parsedMethods.length > 0 ? ` · ${parsedMethods.length} method${parsedMethods.length !== 1 ? "s" : ""}` : ""}
                  </span>
                )}

                <span style={{ fontSize: 11, background: "#f0fdfa", border: "1px solid #99f6e4", borderRadius: 20, padding: "2px 9px", fontWeight: 600, color: "#0d9488" }}>
                  {framework} · {language === "typescript" ? "TS" : "JS"}
                </span>

                {/* await toggle — SelectorsHub style */}
                <button
                  onClick={() => setAwaitMode(!awaitMode)}
                  title="Copy locators with 'await' prefix (SelectorsHub style)"
                  style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", border: `1px solid ${awaitMode ? "#6366f1" : "#e2e8f0"}`, borderRadius: 20, background: awaitMode ? "#eef2ff" : "#fff", fontSize: 11, fontWeight: 700, color: awaitMode ? "#4338ca" : "#64748b", cursor: "pointer", fontFamily: "'Fira Code',monospace", transition: "all 0.15s" }}
                >
                  ⚡ await
                </button>

                <div style={{ marginLeft: "auto", display: "flex", gap: 7 }}>
                  <button onClick={copyCode} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 11px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", fontSize: 12, fontWeight: 600, color: "#475569", cursor: "pointer" }}>
                    {copied ? <Check style={{ width: 13, height: 13, color: "#10b981" }} /> : <Copy style={{ width: 13, height: 13 }} />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button onClick={() => downloadFile(code, `${className ?? "PageObject"}.${ext}`)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", border: "none", borderRadius: 8, background: "#0d9488", fontSize: 12, fontWeight: 600, color: "#fff", cursor: "pointer", boxShadow: "0 2px 8px rgba(13,148,136,0.3)" }}>
                    <Download style={{ width: 13, height: 13 }} /> .{ext}
                  </button>
                  <button onClick={() => setSmokeVisible(!smokeVisible)} title="Generate a smoke test using this POM" style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 11px", border: `1px solid ${smokeVisible ? "#6366f1" : "#e2e8f0"}`, borderRadius: 8, background: smokeVisible ? "#eef2ff" : "#fff", fontSize: 12, fontWeight: 600, color: smokeVisible ? "#4338ca" : "#475569", cursor: "pointer" }}>
                    <TestTube2 style={{ width: 13, height: 13 }} /> Smoke Test
                  </button>
                  <button onClick={generate} disabled={loading} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 11px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", fontSize: 12, fontWeight: 600, color: "#475569", cursor: "pointer" }}>
                    <RefreshCw style={{ width: 13, height: 13 }} /> Regenerate
                  </button>
                </div>
              </div>

              {/* ── Smoke Test Panel (out-of-box feature) ── */}
              {smokeVisible && (
                <div style={{ background: "#1e1b4b", borderRadius: 14, border: "1px solid #312e81", overflow: "hidden", marginBottom: 12, boxShadow: "0 4px 16px rgba(99,102,241,0.2)" }}>
                  <div style={{ display: "flex", alignItems: "center", padding: "9px 14px", borderBottom: "1px solid #312e81", background: "#1e1b4b", gap: 8 }}>
                    <TestTube2 style={{ width: 13, height: 13, color: "#818cf8" }} />
                    <span style={{ fontSize: 11, color: "#a5b4fc", fontFamily: "monospace" }}>{className ?? "PageObject"}.spec.{ext} — Smoke Test</span>
                    <button onClick={() => copyText(smokeTest, "smoke")} style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", border: "1px solid #312e81", borderRadius: 6, background: "#2e2c6e", fontSize: 11, fontWeight: 600, color: "#a5b4fc", cursor: "pointer" }}>
                      {copiedRowId === "smoke" ? <Check style={{ width: 10, height: 10, color: "#4ade80" }} /> : <Copy style={{ width: 10, height: 10 }} />}
                      {copiedRowId === "smoke" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <pre style={{ padding: "16px 20px", margin: 0, fontSize: 12, lineHeight: 1.8, color: "#e0e7ff", fontFamily: "'Fira Code',monospace", overflowX: "auto" }}>
                    {smokeTest}
                  </pre>
                </div>
              )}

              {/* ── Element Discovery Panel (Naveen-style) ── */}
              {parsedLocators.length > 0 && (
                <div style={{ background: "#f0fdf4", borderRadius: 14, border: "1px solid #bbf7d0", marginBottom: 12, overflow: "hidden" }}>
                  <button onClick={() => setElementsOpen(!elementsOpen)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", borderBottom: elementsOpen ? "1px solid #bbf7d0" : "none", cursor: "pointer", background: "#dcfce7", border: "none", textAlign: "left" }}>
                    <LayoutGrid style={{ width: 14, height: 14, color: "#16a34a", flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#15803d" }}>Elements Found on Page</span>
                    <span style={{ fontSize: 11, fontWeight: 600, background: "#bbf7d0", color: "#15803d", border: "1px solid #86efac", borderRadius: 20, padding: "1px 8px" }}>
                      {parsedLocators.length} interactive element{parsedLocators.length !== 1 ? "s" : ""}
                    </span>
                    <span style={{ marginLeft: "auto", color: "#16a34a" }}>
                      {elementsOpen ? <ChevronUp style={{ width: 14, height: 14 }} /> : <ChevronDown style={{ width: 14, height: 14 }} />}
                    </span>
                  </button>
                  {elementsOpen && (
                    <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
                      {/* Page class name */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", borderRadius: 8, padding: "8px 12px", border: "1px solid #bbf7d0" }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Page class:</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", fontFamily: "monospace" }}>{className ?? "GeneratedPage"}</span>
                      </div>
                      {/* Category groups */}
                      {EL_CATS.map(({ key, label, icon: Icon }) => {
                        const items = elementGroups[key];
                        if (items.length === 0) return null;
                        const cs = CAT_STYLE[key];
                        return (
                          <div key={key} style={{ background: "#fff", borderRadius: 10, padding: "10px 12px", border: "1px solid #bbf7d0" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                              <Icon style={{ width: 13, height: 13, color: cs.color }} />
                              <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>{label} ({items.length})</span>
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                              {items.map((name) => (
                                <button
                                  key={name}
                                  onClick={() => copyText(`this.page.${parsedLocators.find(l => l.name === name)?.type ?? "locator"}(...)`, `chip:${name}`)}
                                  title="Click to copy locator"
                                  style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 6, background: cs.bg, color: cs.color, border: `1px solid ${cs.border}`, cursor: "pointer", fontFamily: "'Fira Code',monospace" }}
                                >
                                  {copiedRowId === `chip:${name}` ? "✓" : name}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── Locator Breakdown Table ── */}
              {parsedLocators.length > 0 && (
                <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", marginBottom: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <button onClick={() => setTableOpen(!tableOpen)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: tableOpen ? "1px solid #e2e8f0" : "none", cursor: "pointer", background: "#f8fafc", border: "none", textAlign: "left" }}>
                    <Target style={{ width: 13, height: 13, color: "#0d9488", flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>Locator Breakdown</span>
                    {awaitMode && <span style={{ fontSize: 10, fontWeight: 700, background: "#eef2ff", color: "#4338ca", border: "1px solid #c7d2fe", borderRadius: 10, padding: "1px 7px" }}>⚡ await mode</span>}
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>{parsedLocators.length} fields</span>
                    <div style={{ marginLeft: "auto", color: "#94a3b8" }}>{tableOpen ? <ChevronUp style={{ width: 14, height: 14 }} /> : <ChevronDown style={{ width: 14, height: 14 }} />}</div>
                  </button>
                  {tableOpen && (
                    <div>
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                          <thead>
                            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                              {["Field", "Type", "Expression", "Resilience", ""].map((h) => (
                                <th key={h} style={{ textAlign: "left", padding: "8px 14px", fontWeight: 600, color: "#94a3b8", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {parsedLocators.map((row, i) => {
                              const badge = LOCATOR_BADGES[row.type] ?? LOCATOR_BADGES.locator;
                              const res   = getResilience(row.type);
                              return (
                                <tr key={row.name} style={{ background: i % 2 === 0 ? "#fff" : "#fafbfc", borderBottom: "1px solid #f1f5f9" }}>
                                  <td style={{ padding: "9px 14px", fontFamily: "'Fira Code',monospace", fontSize: 12, color: "#0f172a", whiteSpace: "nowrap", fontWeight: 500 }}>{row.name}</td>
                                  <td style={{ padding: "9px 14px", whiteSpace: "nowrap" }}>
                                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 6, background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>{row.type}</span>
                                  </td>
                                  <td style={{ padding: "9px 14px", maxWidth: 260 }}>
                                    <code style={{ fontSize: 11, color: "#475569", fontFamily: "'Fira Code',monospace", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                      ({row.args.length > 55 ? row.args.slice(0, 55) + "…" : row.args})
                                    </code>
                                  </td>
                                  <td style={{ padding: "9px 14px", whiteSpace: "nowrap" }}>
                                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 6, background: res.bg, color: res.color }}>{res.label}</span>
                                  </td>
                                  <td style={{ padding: "9px 14px", textAlign: "right" }}>
                                    <button onClick={() => copyText(getRowCopyText(row), row.name)} style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "3px 8px", border: "1px solid #e2e8f0", borderRadius: 6, background: "#fff", fontSize: 11, fontWeight: 600, color: "#64748b", cursor: "pointer", whiteSpace: "nowrap" }}>
                                      {copiedRowId === row.name ? <><Check style={{ width: 10, height: 10, color: "#10b981" }} /> ✓</> : <><Copy style={{ width: 10, height: 10 }} /> Copy</>}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      {parsedMethods.length > 0 && (
                        <div style={{ padding: "10px 14px", borderTop: "1px solid #f1f5f9", background: "#fafbfc", display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginRight: 2 }}>Methods</span>
                          {parsedMethods.map((m) => {
                            const mid = `method:${m.name}`;
                            return (
                              <button key={m.name} onClick={() => copyText(`await page.${m.name}(${m.params})`, mid)} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: "#fff", border: "1px solid #e2e8f0", color: "#475569", cursor: "pointer", fontFamily: "'Fira Code',monospace" }}>
                                {copiedRowId === mid ? <Check style={{ width: 9, height: 9, color: "#10b981" }} /> : <Copy style={{ width: 9, height: 9 }} />}
                                {m.name}()
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── Code panel ── */}
              <div style={{ background: "#0d1117", borderRadius: 14, border: "1px solid #21262d", overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}>
                <div style={{ display: "flex", alignItems: "center", padding: "10px 16px", borderBottom: "1px solid #21262d", background: "#161b22", gap: 8 }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f56" }} />
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ffbd2e" }} />
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#27c93f" }} />
                  </div>
                  <Code2 style={{ width: 13, height: 13, color: "#8b949e", marginLeft: 8 }} />
                  <span style={{ fontSize: 11, color: "#8b949e", fontFamily: "monospace" }}>{className ?? "PageObject"}.{ext}</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "#484f58" }}>{code.split("\n").length} lines · {language === "typescript" ? "TypeScript" : "JavaScript"}</span>
                </div>
                <pre style={{ padding: "20px 22px", margin: 0, fontSize: 13, lineHeight: 1.8, color: "#e6edf3", fontFamily: "'Fira Code','JetBrains Mono',monospace", overflowX: "auto", maxHeight: "calc(100vh - 300px)", overflowY: "auto" }}>
                  {code}
                </pre>
              </div>

              {/* ── Usage tip ── */}
              <div style={{ marginTop: 12, background: "#f0fdfa", border: "1px solid #99f6e4", borderRadius: 12, padding: "13px 16px", display: "flex", gap: 10 }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", margin: "0 0 3px" }}>How to use this Page Object</p>
                  <p style={{ fontSize: 12, color: "#475569", margin: 0, lineHeight: 1.6 }}>
                    Download the <code style={{ background: "#ccfbf1", padding: "1px 5px", borderRadius: 4, color: "#0d9488", fontFamily: "monospace" }}>.{ext}</code> file and import in your test:{" "}
                    <code style={{ background: "#ccfbf1", padding: "1px 5px", borderRadius: 4, color: "#0d9488", fontFamily: "monospace", fontSize: 11 }}>
                      const po = new {className ?? "GeneratedPage"}(page);
                    </code>
                    {" "}· Toggle <strong style={{ color: "#4338ca" }}>⚡ await</strong> to copy locators with await already included.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }

        .lc-main  { width: 100%; box-sizing: border-box; }
        .lc-left  { flex: 0 0 480px; min-width: 0; }
        .lc-right { flex: 1; min-width: 0; }

        @media (max-width: 1100px) {
          .lc-main { padding: 18px 16px; }
          .lc-left { flex: 0 0 400px; }
        }
        @media (max-width: 780px) {
          .lc-nav { padding: 0 16px !important; }
          .lc-nav-link { display: none !important; }
          .lc-main { flex-direction: column !important; padding: 14px 12px !important; gap: 14px !important; }
          .lc-left  { flex: none !important; width: 100% !important; }
          .lc-right { width: 100% !important; }
        }
      `}</style>
    </div>
  );
}

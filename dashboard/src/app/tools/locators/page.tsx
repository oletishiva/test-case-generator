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
type Language   = "typescript" | "javascript" | "python" | "java";

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

/* ── Python ↔ JS method name mapping ────────────────────────── */
const PYTHON_METHOD_MAP: Record<string, string> = {
  get_by_label: "getByLabel", get_by_role: "getByRole",
  get_by_placeholder: "getByPlaceholder", get_by_text: "getByText",
  get_by_test_id: "getByTestId", get_by_alt_text: "getByAltText",
  get_by_title: "getByTitle", locator: "locator",
};
/** camelCase type → Python method name */
function toPythonMethod(type: string): string {
  return Object.entries(PYTHON_METHOD_MAP).find(([, v]) => v === type)?.[0] ?? type;
}
/** camelCase → snake_case */
function camelToSnake(str: string): string {
  return str.replace(/([A-Z])/g, (m) => `_${m.toLowerCase()}`);
}

/* ── Normalise raw args string from a matched line ───────────── */
function cleanArgs(raw: string): string {
  // Remove trailing chained calls: .first(), .last(), .nth(n)
  let a = raw.replace(/\)\.(?:first|last)\(\)\s*;?\s*$/, ")");
  a = a.replace(/\)\.nth\(\d+\)\s*;?\s*$/, ")");
  // Remove trailing ); or )
  a = a.replace(/\);\s*$/, "").replace(/\)\s*$/, "").trim();
  return a;
}

/* ── Parse generated TypeScript / JavaScript POM ────────────── */
function parseCode(code: string): { locators: ParsedLocator[]; methods: ParsedMethod[] } {
  const locators: ParsedLocator[] = [];
  const methods:  ParsedMethod[]  = [];
  const seen = new Set<string>();

  let pendingGetterName: string | null = null;
  let pendingProperty = false; // for Python @property

  for (const line of code.split("\n")) {
    // Python @property decorator
    if (line.trim() === "@property") { pendingProperty = true; continue; }

    // Python @property def: def name(self) -> ...: (after @property)
    const fmPyDef = pendingProperty ? line.match(/^\s*def\s+(\w+)\s*\(self\)/) : null;
    if (fmPyDef) {
      pendingGetterName = fmPyDef[1];
      pendingProperty = false;
      continue;
    }
    if (pendingProperty) pendingProperty = false; // reset if non-matching line

    // Pattern C-single — single-line TS getter: get name(): Locator { return this.page.getByXxx(...) }
    const fmCSingle = line.match(
      /^\s*get\s+(\w+)\s*\(\s*\)(?:\s*:\s*\w+)?\s*\{\s*return\s+this\.page\.(getBy\w+|locator)\((.*)$/
    );
    if (fmCSingle) {
      const [, name, type, rest] = fmCSingle;
      if (!seen.has(`L:${name}`)) {
        seen.add(`L:${name}`);
        const args = cleanArgs(rest);
        locators.push({ name, type, args, fullExpr: `this.page.${type}(${args})`, category: categoriseLocator(name, type, args) });
      }
      pendingGetterName = null;
      continue;
    }

    // Pattern C1 — TS getter opening: get name(): Locator {
    const fmC1 = line.match(/^\s*get\s+(\w+)\s*\(\s*\)(?:\s*:\s*\w+)?\s*\{/);
    if (fmC1) { pendingGetterName = fmC1[1]; continue; }

    // Pattern C1b — Java lazy getter: public Locator fieldName() {
    const fmC1b = line.match(/^\s*public\s+Locator\s+(\w+)\s*\(\s*\)\s*\{/);
    if (fmC1b) { pendingGetterName = fmC1b[1]; continue; }

    // Pattern C2 — return inside any getter (TS/JS/Java/Python)
    //   TS/Java: return this.page.getByXxx(...) or return page.getByXxx(...)
    //   Python:  return self.page.get_by_xxx(...)
    const fmC2 = line.match(
      /^\s*return\s+(?:self\.page|(?:this\.)?page)\.(get_by_\w+|getBy\w+|locator)\((.*)$/
    );
    if (fmC2 && pendingGetterName) {
      const name = pendingGetterName;
      pendingGetterName = null;
      const [, rawMethod, rest] = fmC2;
      const type = PYTHON_METHOD_MAP[rawMethod] ?? rawMethod;
      if (!seen.has(`L:${name}`)) {
        seen.add(`L:${name}`);
        const args = cleanArgs(rest);
        locators.push({ name, type, args, fullExpr: `this.page.${type}(${args})`, category: categoriseLocator(name, type, args) });
      }
      continue;
    }

    // Pattern A — TS/JS field initializer:  name = this.page.getByXxx(...)
    const fmA = line.match(
      /^\s*(?:(?:private|public|protected)\s+)?(?:readonly\s+)?(\w+)\s*=\s*this\.page\.(getBy\w+|locator)\((.*)$/
    );
    // Pattern B — constructor assignment:  this.name = page.getByXxx(...)
    //             also handles:           this.name = this.page.getByXxx(...)
    const fmB = !fmA && line.match(
      /^\s*this\.(\w+)\s*=\s*(?:this\.)?page\.(getBy\w+|locator)\((.*)$/
    );
    // Pattern D — Python field: self.name = page.get_by_xxx(...)
    const fmD = !fmA && !fmB && line.match(
      /^\s*self\.(\w+)\s*=\s*(?:self\.)?page\.(get_by_\w+|locator)\((.*)$/
    );

    const fm = fmA ?? fmB ?? fmD;
    if (fm) {
      pendingGetterName = null;
      const [, name, rawMethod, rest] = fm;
      const type = PYTHON_METHOD_MAP[rawMethod] ?? rawMethod;
      if (!seen.has(`L:${name}`)) {
        seen.add(`L:${name}`);
        const args = cleanArgs(rest);
        locators.push({
          name, type, args,
          fullExpr: `this.page.${type}(${args})`,
          category: categoriseLocator(name, type, args),
        });
      }
      continue;
    }

    // Method detection — async (TS/JS), def (Python), public void/Locator (Java)
    const mm = line.match(/^\s*async\s+(\w+)\s*\(([^)]*)\)/)
      ?? line.match(/^\s*def\s+([a-z]\w+)\s*\(self(?:,\s*([^)]*))?\)/)
      ?? line.match(/^\s*public\s+(?:void|boolean|String|int)\s+(\w+)\s*\(([^)]*)\)/);
    if (mm) {
      const [, name, params = ""] = mm;
      if (!seen.has(`M:${name}`)) { seen.add(`M:${name}`); methods.push({ name, params }); }
    }
  }
  return { locators, methods };
}

/* ── Build a smoke test snippet from locators ───────────────── */
function buildSmokeTest(className: string | null, locators: ParsedLocator[], language: Language): string {
  const cn = className ?? "GeneratedPage";
  if (language === "python") {
    const snakeCn = camelToSnake(cn);
    const fields = locators.slice(0, 5).map(l => `    expect(po.${l.name}).to_be_visible()`).join("\n");
    return `import pytest\nfrom playwright.sync_api import Page, expect\nfrom ${cn} import ${cn}\n\ndef test_smoke_${snakeCn}(page: Page):\n    po = ${cn}(page)\n${fields}`;
  }
  if (language === "java") {
    const fields = locators.slice(0, 5).map(l => `        assertThat(po.${l.name}).isVisible();`).join("\n");
    return `import com.microsoft.playwright.*;\nimport static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;\nimport org.junit.jupiter.api.Test;\n\npublic class ${cn}Test {\n    @Test\n    void smokeTest(Page page) {\n        ${cn} po = new ${cn}(page);\n${fields}\n    }\n}`;
  }
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

const LANG_OPTIONS: { value: Language; label: string; color: string }[] = [
  { value: "typescript", label: "TypeScript", color: "#6366f1" },
  { value: "javascript", label: "JavaScript", color: "#f59e0b" },
  { value: "python",     label: "Python",     color: "#3b82f6" },
  { value: "java",       label: "Java",       color: "#ef4444" },
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
  const [lazyInit,             setLazyInit]            = useState(false);
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
  const [selectedRows,  setSelectedRows]  = useState<Set<string>>(new Set());
  const [copiedSel,     setCopiedSel]     = useState(false);
  const [spaHelpOpen,   setSpaHelpOpen]   = useState(false);
  const [copiedCmd,     setCopiedCmd]     = useState(false);

  const hasCode = code.trim().length > 0;
  const ext = language === "javascript" ? "js" : language === "python" ? "py" : language === "java" ? "java" : "ts";

  const className = (() => {
    const m = code.match(/(?:export\s+(?:default\s+)?class|public\s+class|^class)\s+(\w+)/m);
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
          lazyInit,
        }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Generation failed");
      setCode(json.code);
      setProvider(json.provider);
      setTableOpen(true);
      setElementsOpen(true);
      setSmokeVisible(false);
      setSelectedRows(new Set());
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

  async function copyDevToolsCmd() {
    await navigator.clipboard.writeText("copy(document.documentElement.outerHTML)");
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  }

  /* Copy a locator row — normal, await, or lazy-getter style */
  function getRowCopyText(row: ParsedLocator): string {
    if (awaitMode && (language === "typescript" || language === "javascript"))
      return `const ${row.name} = await this.page.${row.type}(${row.args});`;
    if (language === "python") {
      const m = toPythonMethod(row.type);
      if (lazyInit) return `@property\ndef ${row.name}(self) -> Locator:\n    return self.page.${m}(${row.args})`;
      return `self.page.${m}(${row.args})`;
    }
    if (language === "java") {
      if (lazyInit) return `public Locator ${row.name}() {\n    return page.${row.type}(${row.args});\n}`;
      return `page.${row.type}(${row.args})`;
    }
    if (lazyInit) {
      return language === "javascript"
        ? `get ${row.name}() {\n  return this.page.${row.type}(${row.args});\n}`
        : `get ${row.name}(): Locator {\n  return this.page.${row.type}(${row.args});\n}`;
    }
    return row.fullExpr;
  }

  /* Selection helpers */
  function toggleRow(name: string) {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }
  function selectAll()   { setSelectedRows(new Set(parsedLocators.map(l => l.name))); }
  function deselectAll() { setSelectedRows(new Set()); }

  async function copySelected() {
    const rows = parsedLocators.filter(l => selectedRows.has(l.name));
    const lines = rows.map(r => {
      if (language === "python") {
        const m = toPythonMethod(r.type);
        if (lazyInit)
          return `    @property\n    def ${r.name}(self) -> Locator:\n        return self.page.${m}(${r.args})`;
        return `        self.${r.name} = self.page.${m}(${r.args})`;
      }
      if (language === "java") {
        if (lazyInit)
          return `    public Locator ${r.name}() {\n        return page.${r.type}(${r.args});\n    }`;
        return `        this.${r.name} = page.${r.type}(${r.args});`;
      }
      if (lazyInit) {
        return language === "javascript"
          ? `  get ${r.name}() {\n    return this.page.${r.type}(${r.args});\n  }`
          : `  get ${r.name}(): Locator {\n    return this.page.${r.type}(${r.args});\n  }`;
      }
      return language === "javascript"
        ? `  this.${r.name} = this.page.${r.type}(${r.args});`
        : `  private readonly ${r.name} = this.page.${r.type}(${r.args});`;
    }).join("\n");
    await navigator.clipboard.writeText(lines);
    setCopiedSel(true);
    setTimeout(() => setCopiedSel(false), 2000);
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
                    <div>
                      <p style={{ fontSize: 12, color: "#475569", fontWeight: 600, margin: 0 }}>Paste HTML source or component snippet</p>
                      <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0" }}>Also works for SPAs — see URL tab for how to grab live page HTML</p>
                    </div>
                    <button onClick={() => setHtmlInput(HTML_EXAMPLE)} style={{ fontSize: 11, color: "#2dd4bf", background: "#f0fdfa", border: "1px solid #99f6e4", borderRadius: 6, padding: "3px 9px", cursor: "pointer", fontWeight: 600, flexShrink: 0, marginLeft: 8 }}>Load example</button>
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

                  {/* SPA / Dynamic page helper */}
                  <div style={{ marginTop: 10, border: "1px solid #e0e7ff", borderRadius: 9, overflow: "hidden" }}>
                    <button
                      onClick={() => setSpaHelpOpen(!spaHelpOpen)}
                      style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: spaHelpOpen ? "#eef2ff" : "#f5f3ff", border: "none", cursor: "pointer" }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, fontWeight: 700, color: "#4338ca" }}>
                        <span style={{ fontSize: 13 }}>💡</span>
                        SPA or dynamic page? URL won&apos;t work — use this instead
                      </span>
                      {spaHelpOpen
                        ? <ChevronUp style={{ width: 12, height: 12, color: "#6366f1" }} />
                        : <ChevronDown style={{ width: 12, height: 12, color: "#6366f1" }} />}
                    </button>
                    {spaHelpOpen && (
                      <div style={{ padding: "12px 14px", background: "#fafbff", borderTop: "1px solid #e0e7ff" }}>
                        <p style={{ fontSize: 11, color: "#475569", margin: "0 0 10px", lineHeight: 1.6 }}>
                          Some sites (SPAs, React/Angular apps, post-login pages) always show the same URL
                          even when you navigate. Server-side fetch only gets the <strong>initial HTML skeleton</strong> — not the rendered page.
                        </p>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#1e1b4b", margin: "0 0 8px" }}>Grab the live HTML in 3 steps:</p>
                        <ol style={{ margin: "0 0 10px", padding: "0 0 0 18px", display: "flex", flexDirection: "column", gap: 5 }}>
                          {[
                            "Navigate to the exact page in your browser",
                            "Open DevTools → Console  (F12 or Cmd+Option+J)",
                            "Paste and run the command below, then switch to the HTML Source tab and Ctrl+V",
                          ].map((step, i) => (
                            <li key={i} style={{ fontSize: 11, color: "#475569", lineHeight: 1.55 }}>{step}</li>
                          ))}
                        </ol>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#1e1b4b", borderRadius: 8, padding: "9px 12px" }}>
                          <code style={{ flex: 1, fontSize: 12, color: "#a5b4fc", fontFamily: "'Fira Code',monospace", wordBreak: "break-all" }}>
                            copy(document.documentElement.outerHTML)
                          </code>
                          <button
                            onClick={copyDevToolsCmd}
                            style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, background: copiedCmd ? "#16a34a" : "#4f46e5", color: "#fff", border: "none", borderRadius: 6, padding: "5px 10px", cursor: "pointer", transition: "background 0.2s" }}
                          >
                            {copiedCmd ? <Check style={{ width: 12, height: 12 }} /> : <Copy style={{ width: 12, height: 12 }} />}
                            {copiedCmd ? "Copied!" : "Copy"}
                          </button>
                        </div>
                        <p style={{ fontSize: 10, color: "#94a3b8", margin: "7px 0 0", lineHeight: 1.5 }}>
                          This copies the fully-rendered DOM to your clipboard. Paste it in the <strong>HTML Source</strong> tab and generate.
                        </p>
                      </div>
                    )}
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                {LANG_OPTIONS.map(({ value, label, color }) => (
                  <button key={value} onClick={() => setLanguage(value)} style={{ padding: "7px 0", borderRadius: 9, border: `2px solid ${language === value ? color : "#e2e8f0"}`, background: language === value ? `${color}18` : "#fff", color: language === value ? color : "#64748b", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}>
                    {label}
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

              {/* Lazy Initialization */}
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", background: lazyInit ? "#fdf4ff" : "#f8fafc", borderRadius: 10, padding: "8px 10px", border: `1px solid ${lazyInit ? "#e9d5ff" : "#f1f5f9"}`, transition: "all 0.2s" }}>
                <div onClick={() => setLazyInit(!lazyInit)} style={{ width: 36, height: 20, borderRadius: 10, background: lazyInit ? "#9333ea" : "#e2e8f0", position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}>
                  <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: lazyInit ? 19 : 3, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: lazyInit ? "#7e22ce" : "#0f172a", margin: 0 }}>
                    Lazy Initialization
                    {lazyInit && <span style={{ fontSize: 10, fontWeight: 700, background: "#e9d5ff", color: "#7e22ce", borderRadius: 10, padding: "1px 6px", marginLeft: 6 }}>getter</span>}
                  </p>
                  <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>
                    {lazyInit
                      ? language === "python" ? "@property / def email_field(self) → Locator"
                      : language === "java"   ? "public Locator emailField() { return page.getByLabel(...); }"
                      : language === "javascript" ? "get emailField() { return this.page.getByLabel(...) }"
                      : "get emailField(): Locator { return this.page.getByLabel(...) }"
                      : "Locator created on each access — @property (Py), method (Java), getter (TS/JS)"}
                  </p>
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
                  {framework} · {language === "typescript" ? "TS" : language === "javascript" ? "JS" : language === "python" ? "PY" : "Java"}
                </span>

                {/* await toggle — TS/JS only (SelectorsHub style) */}
                {(language === "typescript" || language === "javascript") && (
                  <button
                    onClick={() => setAwaitMode(!awaitMode)}
                    title="Copy locators with 'await' prefix (SelectorsHub style)"
                    style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", border: `1px solid ${awaitMode ? "#6366f1" : "#e2e8f0"}`, borderRadius: 20, background: awaitMode ? "#eef2ff" : "#fff", fontSize: 11, fontWeight: 700, color: awaitMode ? "#4338ca" : "#64748b", cursor: "pointer", fontFamily: "'Fira Code',monospace", transition: "all 0.15s" }}
                  >
                    ⚡ await
                  </button>
                )}

                {lazyInit && (
                  <span title="Lazy initialization mode — getters were used in generated code" style={{ display: "flex", alignItems: "center", gap: 3, padding: "4px 10px", border: "1px solid #e9d5ff", borderRadius: 20, background: "#fdf4ff", fontSize: 11, fontWeight: 700, color: "#7e22ce" }}>
                    🔮 lazy
                  </span>
                )}

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
                  {/* Table header row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: tableOpen ? "1px solid #e2e8f0" : "none", background: "#f8fafc" }}>
                    <button onClick={() => setTableOpen(!tableOpen)} style={{ display: "flex", alignItems: "center", gap: 7, flex: 1, background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}>
                      <Target style={{ width: 13, height: 13, color: "#0d9488", flexShrink: 0 }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>Locator Breakdown</span>
                      {awaitMode && <span style={{ fontSize: 10, fontWeight: 700, background: "#eef2ff", color: "#4338ca", border: "1px solid #c7d2fe", borderRadius: 10, padding: "1px 7px" }}>⚡ await mode</span>}
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>{parsedLocators.length} fields</span>
                      <span style={{ color: "#94a3b8" }}>{tableOpen ? <ChevronUp style={{ width: 14, height: 14 }} /> : <ChevronDown style={{ width: 14, height: 14 }} />}</span>
                    </button>
                    {/* Selection controls — always visible when table is open */}
                    {tableOpen && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        {selectedRows.size > 0 && (
                          <button
                            onClick={copySelected}
                            style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 11px", border: "none", borderRadius: 7, background: copiedSel ? "#10b981" : "#0d9488", fontSize: 11, fontWeight: 700, color: "#fff", cursor: "pointer", transition: "background 0.2s" }}
                          >
                            {copiedSel ? <><Check style={{ width: 10, height: 10 }} /> Copied!</> : <><Copy style={{ width: 10, height: 10 }} /> Copy Selected ({selectedRows.size})</>}
                          </button>
                        )}
                        <button onClick={selectedRows.size === parsedLocators.length ? deselectAll : selectAll} style={{ fontSize: 11, fontWeight: 600, color: "#64748b", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}>
                          {selectedRows.size === parsedLocators.length ? "Deselect All" : "Select All"}
                        </button>
                      </div>
                    )}
                  </div>
                  {tableOpen && (
                    <div>
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                          <thead>
                            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                              <th style={{ padding: "8px 6px 8px 14px", width: 32 }} />
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
                                <tr key={row.name} style={{ background: selectedRows.has(row.name) ? "#f0fdfa" : i % 2 === 0 ? "#fff" : "#fafbfc", borderBottom: "1px solid #f1f5f9", transition: "background 0.1s" }}>
                                  <td style={{ padding: "9px 6px 9px 14px", width: 32 }}>
                                    <input
                                      type="checkbox"
                                      checked={selectedRows.has(row.name)}
                                      onChange={() => toggleRow(row.name)}
                                      style={{ width: 14, height: 14, accentColor: "#0d9488", cursor: "pointer" }}
                                    />
                                  </td>
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

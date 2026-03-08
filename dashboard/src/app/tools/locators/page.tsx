"use client";

import { useState, type ComponentType } from "react";
import Link from "next/link";
import {
  TestTube, Sparkles, Loader2, Copy, Check, Download,
  Code2, Globe, FileText, RefreshCw, Target, Zap,
  ChevronDown, AlertCircle, MousePointerClick,
} from "lucide-react";

/* ── Types ─────────────────────────────────────────────────── */
type InputMode  = "html" | "url" | "describe";
type Framework  = "playwright" | "cypress" | "selenium";
type Strategy   = "role" | "text" | "label" | "placeholder" | "testid" | "css";

/* ── Strategies ─────────────────────────────────────────────── */
const STRATEGIES: { value: Strategy; label: string; desc: string }[] = [
  { value: "role",        label: "getByRole",        desc: "Semantic — recommended" },
  { value: "label",       label: "getByLabel",       desc: "Form labels" },
  { value: "placeholder", label: "getByPlaceholder", desc: "Input placeholders" },
  { value: "text",        label: "getByText",        desc: "Visible text" },
  { value: "testid",      label: "getByTestId",      desc: "data-testid attributes" },
  { value: "css",         label: "CSS / XPath",      desc: "Last resort fallback" },
];

const FRAMEWORKS: { value: Framework; label: string; color: string }[] = [
  { value: "playwright", label: "Playwright",  color: "#2dd4bf" },
  { value: "cypress",    label: "Cypress",     color: "#10b981" },
  { value: "selenium",   label: "Selenium",    color: "#f59e0b" },
];

/* ── Example snippets ───────────────────────────────────────── */
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
  "A search results page with a search bar, filter dropdown, 10 product cards each with Add to Cart button",
];

/* ── Helpers ─────────────────────────────────────────────────── */
function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/* ── Page ────────────────────────────────────────────────────── */
export default function LocatorsPage() {
  const [mode,         setMode]         = useState<InputMode>("html");
  const [htmlInput,    setHtmlInput]    = useState("");
  const [urlInput,     setUrlInput]     = useState("");
  const [description,  setDescription]  = useState("");
  const [framework,    setFramework]    = useState<Framework>("playwright");
  const [strategy,     setStrategy]     = useState<Strategy>("role");
  const [groupPOM,     setGroupPOM]     = useState(true);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [code,         setCode]         = useState("");
  const [provider,     setProvider]     = useState("");
  const [copied,       setCopied]       = useState(false);

  const hasCode = code.trim().length > 0;

  /* derive class name from first line of code */
  const className = (() => {
    const m = code.match(/export\s+(?:default\s+)?class\s+(\w+)/);
    return m ? m[1] : null;
  })();

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
        }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Generation failed");
      setCode(json.code);
      setProvider(json.provider);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const INPUT_TABS: { id: InputMode; icon: ComponentType<{ style?: React.CSSProperties }>; label: string }[] = [
    { id: "html",     icon: FileText,         label: "HTML Source" },
    { id: "url",      icon: Globe,            label: "URL" },
    { id: "describe", icon: Sparkles,         label: "Describe" },
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
      <div style={{ background: "linear-gradient(135deg,#0a0f1e 0%,#0c1a2e 50%,#0a1a1e 100%)", padding: "44px 24px 52px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(45,212,191,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(45,212,191,0.04) 1px,transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -80, right: "10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(45,212,191,0.12) 0%,transparent 70%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(45,212,191,0.12)", border: "1px solid rgba(45,212,191,0.3)", borderRadius: 20, padding: "5px 14px", marginBottom: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2dd4bf", display: "inline-block", animation: "pulse 2s infinite" }} />
            <Target style={{ width: 13, height: 13, color: "#2dd4bf" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#2dd4bf" }}>Smart Locator Capture</span>
          </div>

          <h1 style={{ fontSize: "clamp(26px,5vw,42px)", fontWeight: 900, color: "#fff", margin: "0 0 14px", lineHeight: 1.1, letterSpacing: "-0.5px" }}>
            Generate Production-Ready<br />
            <span style={{ background: "linear-gradient(135deg,#2dd4bf,#60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Locators & Page Objects</span>
          </h1>
          <p style={{ fontSize: 16, color: "#94a3b8", margin: "0 auto 24px", maxWidth: 540, lineHeight: 1.75 }}>
            Paste HTML, enter a URL, or describe your page — get semantic Playwright/Cypress/Selenium
            locators with a full Page Object Model in seconds.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            {[
              { n: "3",  l: "Input modes" },
              { n: "3",  l: "Frameworks" },
              { n: "6",  l: "Strategies" },
              { n: "POM", l: "Auto-generated" },
            ].map(({ n, l }) => (
              <div key={l} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 18px", textAlign: "center", minWidth: 80 }}>
                <p style={{ fontSize: 20, fontWeight: 800, color: "#fff", margin: 0 }}>{n}</p>
                <p style={{ fontSize: 11, color: "#64748b", margin: 0, marginTop: 2 }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="lc-main" style={{ padding: "28px 24px", display: "flex", gap: 24, alignItems: "flex-start" }}>

        {/* ── LEFT PANEL ── */}
        <div className="lc-left" style={{ flex: "0 0 480px", minWidth: 0 }}>

          {/* Input tabs */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden", marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            {/* Tab bar */}
            <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0" }}>
              {INPUT_TABS.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setMode(id)}
                  style={{
                    flex: 1, padding: "12px 0", border: "none",
                    borderBottom: `2px solid ${mode === id ? "#2dd4bf" : "transparent"}`,
                    background: mode === id ? "#f0fdfa" : "transparent",
                    fontSize: 12, fontWeight: mode === id ? 700 : 500,
                    color: mode === id ? "#0d9488" : "#64748b",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                    transition: "all 0.15s",
                  }}
                >
                  <Icon style={{ width: 13, height: 13 }} />
                  {label}
                </button>
              ))}
            </div>

            <div style={{ padding: "18px 18px" }}>
              {/* HTML mode */}
              {mode === "html" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <p style={{ fontSize: 12, color: "#475569", fontWeight: 600, margin: 0 }}>Paste HTML source or component snippet</p>
                    <button
                      onClick={() => setHtmlInput(HTML_EXAMPLE)}
                      style={{ fontSize: 11, color: "#2dd4bf", background: "#f0fdfa", border: "1px solid #99f6e4", borderRadius: 6, padding: "3px 9px", cursor: "pointer", fontWeight: 600 }}
                    >
                      Load example
                    </button>
                  </div>
                  <textarea
                    value={htmlInput}
                    onChange={(e) => setHtmlInput(e.target.value)}
                    placeholder={`<form>\n  <label for="email">Email</label>\n  <input id="email" type="email" />\n  <button>Submit</button>\n</form>`}
                    rows={12}
                    style={{ width: "100%", fontSize: 12, fontFamily: "'Fira Code',monospace", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px", lineHeight: 1.65, resize: "vertical", color: "#0f172a", outline: "none", background: "#f8fafc", boxSizing: "border-box" }}
                  />
                </div>
              )}

              {/* URL mode */}
              {mode === "url" && (
                <div>
                  <p style={{ fontSize: 12, color: "#475569", fontWeight: 600, margin: "0 0 8px" }}>
                    Enter a public URL — the page will be fetched server-side
                  </p>
                  <input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/login"
                    style={{ width: "100%", fontSize: 13, border: "1px solid #e2e8f0", borderRadius: 10, padding: "11px 14px", color: "#0f172a", outline: "none", boxSizing: "border-box" }}
                  />
                  <div style={{ marginTop: 12, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 9, padding: "10px 12px", display: "flex", gap: 8 }}>
                    <AlertCircle style={{ width: 14, height: 14, color: "#d97706", flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 11, color: "#92400e", margin: 0, lineHeight: 1.5 }}>
                      Works best with publicly accessible pages. Pages behind login or heavy JavaScript
                      may produce limited results.
                    </p>
                  </div>
                </div>
              )}

              {/* Describe mode */}
              {mode === "describe" && (
                <div>
                  <p style={{ fontSize: 12, color: "#475569", fontWeight: 600, margin: "0 0 8px" }}>
                    Describe the page or component in plain English
                  </p>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="E.g. A login page with email input, password input, Sign In button and Forgot Password link"
                    rows={5}
                    style={{ width: "100%", fontSize: 13, border: "1px solid #e2e8f0", borderRadius: 10, padding: "11px 13px", lineHeight: 1.65, resize: "vertical", color: "#0f172a", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                  />
                  <p style={{ fontSize: 11, color: "#94a3b8", margin: "10px 0 6px" }}>Try an example:</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {DESCRIBE_EXAMPLES.map((ex) => (
                      <button
                        key={ex}
                        onClick={() => setDescription(ex)}
                        style={{ textAlign: "left", fontSize: 11, color: "#0d9488", background: "#f0fdfa", border: "1px solid #99f6e4", borderRadius: 7, padding: "7px 10px", cursor: "pointer", lineHeight: 1.5 }}
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Config */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: "18px", marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 16px" }}>Configuration</p>

            {/* Framework selector */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 8 }}>Framework</label>
              <div style={{ display: "flex", gap: 8 }}>
                {FRAMEWORKS.map(({ value, label, color }) => (
                  <button
                    key={value}
                    onClick={() => setFramework(value)}
                    style={{
                      flex: 1, padding: "8px 0", borderRadius: 9,
                      border: `2px solid ${framework === value ? color : "#e2e8f0"}`,
                      background: framework === value ? `${color}18` : "#fff",
                      color: framework === value ? color : "#64748b",
                      fontSize: 12, fontWeight: 700, cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Strategy selector */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 8 }}>Locator Strategy Priority</label>
              <div style={{ position: "relative" }}>
                <select
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value as Strategy)}
                  style={{ width: "100%", fontSize: 13, border: "1px solid #e2e8f0", borderRadius: 9, padding: "9px 32px 9px 12px", appearance: "none", background: "#fff", color: "#0f172a", cursor: "pointer", outline: "none" }}
                >
                  {STRATEGIES.map(({ value, label, desc }) => (
                    <option key={value} value={value}>{label} — {desc}</option>
                  ))}
                </select>
                <ChevronDown style={{ width: 13, height: 13, position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8" }} />
              </div>
              <p style={{ fontSize: 11, color: "#94a3b8", margin: "5px 0 0" }}>
                The AI uses this as the first-choice strategy, falling back automatically.
              </p>
            </div>

            {/* POM toggle */}
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <div
                onClick={() => setGroupPOM(!groupPOM)}
                style={{ width: 40, height: 22, borderRadius: 11, background: groupPOM ? "#2dd4bf" : "#e2e8f0", position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}
              >
                <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: groupPOM ? 21 : 3, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", margin: 0 }}>Generate Page Object Model</p>
                <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>Wraps locators in a TypeScript class</p>
              </div>
            </label>
          </div>

          {/* Error */}
          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
              <AlertCircle style={{ width: 16, height: 16, color: "#ef4444", flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: "#dc2626" }}>{error}</span>
            </div>
          )}

          {/* Generate button */}
          <button
            onClick={generate}
            disabled={loading}
            style={{
              width: "100%", padding: "15px 0", borderRadius: 12, border: "none",
              background: loading ? "#5eead4" : "linear-gradient(135deg,#0d9488,#0891b2)",
              color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 4px 20px rgba(13,148,136,0.4)",
              transition: "opacity 0.15s", letterSpacing: "-0.2px",
            }}
          >
            {loading
              ? <><Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} /> Analysing…</>
              : <><Zap style={{ width: 18, height: 18 }} /> Generate Locators</>}
          </button>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="lc-right" style={{ flex: 1, minWidth: 0 }}>
          {!hasCode ? (
            /* Empty state */
            <div style={{ background: "#fff", borderRadius: 16, border: "2px dashed #e2e8f0", padding: "60px 32px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div style={{ width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg,#f0fdfa,#ccfbf1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 4px 12px rgba(13,148,136,0.15)" }}>
                <MousePointerClick style={{ width: 32, height: 32, color: "#0d9488" }} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 8px", letterSpacing: "-0.3px" }}>
                Your locators will appear here
              </h3>
              <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 28px", lineHeight: 1.7 }}>
                Paste HTML, enter a URL, or describe your page on the left,<br />
                then click <strong style={{ color: "#0d9488" }}>Generate Locators</strong>.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 500, margin: "0 auto 24px" }}>
                {[
                  { icon: "🎯", title: "Semantic first",      desc: "getByRole, getByLabel, getByText — accessibility-friendly" },
                  { icon: "📦", title: "Page Object Model",   desc: "Full TypeScript class with setters, getters & actions" },
                  { icon: "🌐", title: "Multi-framework",     desc: "Playwright, Cypress & Selenium supported" },
                  { icon: "🔗", title: "Convenience methods", desc: "Auto-generates login(), isForgotPasswordVisible() etc." },
                ].map(({ icon, title, desc }) => (
                  <div key={title} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px", textAlign: "left" }}>
                    <span style={{ fontSize: 22 }}>{icon}</span>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", margin: "8px 0 4px" }}>{title}</p>
                    <p style={{ fontSize: 11, color: "#64748b", margin: 0, lineHeight: 1.5 }}>{desc}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
                {["Playwright TS", "Cypress JS", "Selenium JS", "Page Object"].map((f) => (
                  <span key={f} style={{ fontSize: 11, fontWeight: 600, color: "#0d9488", background: "#f0fdfa", border: "1px solid #99f6e4", borderRadius: 20, padding: "4px 12px" }}>
                    {f}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            /* Results */
            <div>
              {/* Toolbar */}
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>
                    {className ? `class ${className}` : "Page Object generated"}
                  </span>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>via {provider}</span>
                </div>

                <span style={{ fontSize: 11, background: "#f0fdfa", border: "1px solid #99f6e4", borderRadius: 20, padding: "2px 10px", fontWeight: 600, color: "#0d9488" }}>
                  {framework} · {strategy}
                </span>

                <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                  <button
                    onClick={copyCode}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", fontSize: 12, fontWeight: 600, color: "#475569", cursor: "pointer" }}
                  >
                    {copied ? <Check style={{ width: 13, height: 13, color: "#10b981" }} /> : <Copy style={{ width: 13, height: 13 }} />}
                    {copied ? "Copied!" : "Copy"}
                  </button>

                  <button
                    onClick={() => downloadFile(code, `${className ?? "PageObject"}.ts`)}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", border: "none", borderRadius: 8, background: "#0d9488", fontSize: 12, fontWeight: 600, color: "#fff", cursor: "pointer", boxShadow: "0 2px 8px rgba(13,148,136,0.3)" }}
                  >
                    <Download style={{ width: 13, height: 13 }} /> .ts
                  </button>

                  <button
                    onClick={generate}
                    disabled={loading}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", fontSize: 12, fontWeight: 600, color: "#475569", cursor: "pointer" }}
                  >
                    <RefreshCw style={{ width: 13, height: 13 }} /> Regenerate
                  </button>
                </div>
              </div>

              {/* Code panel — macOS style */}
              <div style={{ background: "#0d1117", borderRadius: 14, border: "1px solid #21262d", overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}>
                <div style={{ display: "flex", alignItems: "center", padding: "10px 16px", borderBottom: "1px solid #21262d", background: "#161b22", gap: 8 }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f56" }} />
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ffbd2e" }} />
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#27c93f" }} />
                  </div>
                  <Code2 style={{ width: 13, height: 13, color: "#8b949e", marginLeft: 8 }} />
                  <span style={{ fontSize: 11, color: "#8b949e", fontFamily: "monospace" }}>
                    {className ?? "PageObject"}.ts
                  </span>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "#484f58" }}>
                    {code.split("\n").length} lines · TypeScript
                  </span>
                </div>
                <pre style={{
                  padding: "20px 22px",
                  margin: 0,
                  fontSize: 13,
                  lineHeight: 1.8,
                  color: "#e6edf3",
                  fontFamily: "'Fira Code','JetBrains Mono','Cascadia Code',monospace",
                  overflowX: "auto",
                  maxHeight: "calc(100vh - 320px)",
                  overflowY: "auto",
                }}>
                  {code}
                </pre>
              </div>

              {/* Usage tip */}
              <div style={{ marginTop: 14, background: "#f0fdfa", border: "1px solid #99f6e4", borderRadius: 12, padding: "14px 16px", display: "flex", gap: 10 }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>How to use this Page Object</p>
                  <p style={{ fontSize: 12, color: "#475569", margin: 0, lineHeight: 1.6 }}>
                    Download the <code style={{ background: "#ccfbf1", padding: "1px 5px", borderRadius: 4, color: "#0d9488", fontFamily: "monospace" }}>.ts</code> file and import it into your test:
                    {" "}<code style={{ background: "#ccfbf1", padding: "1px 5px", borderRadius: 4, color: "#0d9488", fontFamily: "monospace", fontSize: 11 }}>
                      const page = new {className ?? "GeneratedPage"}(page);
                    </code>
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
          .lc-main { padding: 20px 16px; }
          .lc-left { flex: 0 0 400px; }
        }
        @media (max-width: 780px) {
          .lc-nav { padding: 0 16px !important; }
          .lc-nav-link { display: none !important; }
          .lc-main { flex-direction: column !important; padding: 16px 12px !important; gap: 16px !important; }
          .lc-left  { flex: none !important; width: 100% !important; }
          .lc-right { width: 100% !important; }
        }
      `}</style>
    </div>
  );
}

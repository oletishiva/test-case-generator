"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TestTube, RefreshCw, Copy, Check, Download,
  AlertCircle, ChevronDown, Loader2, ArrowRight,
  FileText, Sparkles, Code2, Info,
} from "lucide-react";

/* ── Source frameworks ───────────────────────────────── */
const SOURCE_FRAMEWORKS = [
  {
    group: "Selenium",
    items: [
      { value: "selenium-java",   label: "Selenium + Java",        badge: "Java",   color: "#ef4444" },
      { value: "selenium-python", label: "Selenium + Python",      badge: "Python", color: "#3b82f6" },
      { value: "selenium-js",     label: "Selenium + JavaScript",  badge: "JS",     color: "#f59e0b" },
    ],
  },
  {
    group: "Other Frameworks",
    items: [
      { value: "cypress",      label: "Cypress",        badge: "JS/TS",  color: "#10b981" },
      { value: "webdriverio",  label: "WebDriverIO",    badge: "JS/TS",  color: "#0ea5e9" },
      { value: "protractor",   label: "Protractor",     badge: "TS",     color: "#8b5cf6" },
      { value: "puppeteer",    label: "Puppeteer",      badge: "JS/TS",  color: "#64748b" },
      { value: "nightwatch",   label: "Nightwatch.js",  badge: "JS/TS",  color: "#f97316" },
      { value: "appium-java",  label: "Appium + Java",  badge: "Java",   color: "#ef4444" },
      { value: "appium-python",label: "Appium + Python",badge: "Python", color: "#3b82f6" },
    ],
  },
];

/* ── Target languages ────────────────────────────────── */
const TARGET_LANGUAGES = [
  { value: "typescript", label: "TypeScript", color: "#6366f1", ext: "ts" },
  { value: "javascript", label: "JavaScript", color: "#f59e0b", ext: "js" },
  { value: "python",     label: "Python",     color: "#3b82f6", ext: "py" },
  { value: "java",       label: "Java",       color: "#ef4444", ext: "java" },
];

/* ── Example snippets per source ─────────────────────── */
const EXAMPLES: Record<string, string> = {
  "selenium-java": `import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.*;
import org.testng.Assert;
import org.testng.annotations.*;

public class LoginTest {
    WebDriver driver;

    @BeforeMethod
    public void setup() {
        driver = new ChromeDriver();
        driver.get("https://example.com/login");
    }

    @Test
    public void validLogin() {
        driver.findElement(By.id("email")).sendKeys("user@test.com");
        driver.findElement(By.id("password")).sendKeys("secret123");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement btn = wait.until(
            ExpectedConditions.elementToBeClickable(By.cssSelector("button[type='submit']"))
        );
        btn.click();

        wait.until(ExpectedConditions.urlContains("/dashboard"));
        Assert.assertTrue(driver.findElement(By.id("welcome-msg")).isDisplayed());
    }

    @AfterMethod
    public void teardown() {
        driver.quit();
    }
}`,
  "selenium-python": `import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

@pytest.fixture
def driver():
    d = webdriver.Chrome()
    d.get("https://example.com/login")
    yield d
    d.quit()

def test_valid_login(driver):
    driver.find_element(By.ID, "email").send_keys("user@test.com")
    driver.find_element(By.ID, "password").send_keys("secret123")

    wait = WebDriverWait(driver, 10)
    btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']")))
    btn.click()

    wait.until(EC.url_contains("/dashboard"))
    assert driver.find_element(By.ID, "welcome-msg").is_displayed()`,
  "cypress": `describe('Login', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('logs in with valid credentials', () => {
    cy.get('#email').type('user@test.com');
    cy.get('#password').type('secret123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    cy.get('#welcome-msg').should('be.visible');
  });

  it('shows error for invalid credentials', () => {
    cy.get('#email').type('bad@test.com');
    cy.get('#password').type('wrong');
    cy.get('button[type="submit"]').click();
    cy.contains('Invalid credentials').should('be.visible');
  });
});`,
  "selenium-js": `const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

describe('Login Tests', function () {
  let driver;

  before(async function () {
    driver = await new Builder().forBrowser('chrome').build();
    await driver.get('https://example.com/login');
  });

  it('should login with valid credentials', async function () {
    await driver.findElement(By.id('email')).sendKeys('user@test.com');
    await driver.findElement(By.id('password')).sendKeys('secret123');
    await driver.findElement(By.css("button[type='submit']")).click();
    await driver.wait(until.urlContains('/dashboard'), 10000);
    const msg = await driver.findElement(By.id('welcome-msg'));
    assert.ok(await msg.isDisplayed());
  });

  after(async function () {
    await driver.quit();
  });
});`,
};

function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/* ── Diff badge ──────────────────────────────────────── */
const DIFF_FEATURES = [
  { from: "WebDriverWait / EC.visibility_of", to: "Auto-wait (removed)", good: true },
  { from: "driver.findElement(By.id(…))",     to: "page.getByLabel() / getByRole()", good: true },
  { from: "Thread.sleep() / time.sleep()",     to: "Removed entirely", good: true },
  { from: "driver.get(url)",                  to: "await page.goto(url)", good: true },
  { from: "@BeforeMethod / @AfterMethod",     to: "test.beforeEach / afterEach", good: true },
  { from: "Assert.assertEquals(…)",           to: "await expect(…).toHaveText(…)", good: true },
];

/* ── Page ────────────────────────────────────────────── */
export default function CodeConverterPage() {
  const [sourceFramework, setSourceFramework] = useState("selenium-java");
  const [targetLanguage,  setTargetLanguage]  = useState("typescript");
  const [sourceCode,      setSourceCode]      = useState("");
  const [convertedCode,   setConvertedCode]   = useState("");
  const [notes,           setNotes]           = useState("");
  const [provider,        setProvider]        = useState("");
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState("");
  const [copied,          setCopied]          = useState(false);
  const [showDiff,        setShowDiff]        = useState(false);

  const hasResult = convertedCode.trim().length > 0;
  const ext = TARGET_LANGUAGES.find(l => l.value === targetLanguage)?.ext ?? "ts";
  const srcLabel = SOURCE_FRAMEWORKS.flatMap(g => g.items).find(i => i.value === sourceFramework)?.label ?? sourceFramework;

  async function convert() {
    if (!sourceCode.trim()) { setError("Paste some source code first."); return; }
    setError(""); setLoading(true); setConvertedCode(""); setNotes(""); setProvider("");
    try {
      const res = await fetch("/api/code-converter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceCode, sourceFramework, targetLanguage }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Conversion failed");
      setConvertedCode(json.code);
      setNotes(json.notes ?? "");
      setProvider(json.provider);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function copyCode() {
    await navigator.clipboard.writeText(convertedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function loadExample() {
    setSourceCode(EXAMPLES[sourceFramework] ?? EXAMPLES["selenium-java"]);
    setConvertedCode(""); setNotes(""); setError("");
  }

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
        <Link href="/dashboard"             style={{ fontSize: 13, color: "#64748b", textDecoration: "none", fontWeight: 500 }}>Test Generator</Link>
        <Link href="/tools/locators"        style={{ fontSize: 13, color: "#64748b", textDecoration: "none", fontWeight: 500 }}>Locators</Link>
        <Link href="/tools/test-data"       style={{ fontSize: 13, color: "#64748b", textDecoration: "none", fontWeight: 500 }}>Test Data</Link>
        <Link href="/tools/interview-prep"  style={{ fontSize: 13, color: "#64748b", textDecoration: "none", fontWeight: 500 }}>Interview Prep</Link>
        <Link href="/resume-builder"        style={{ fontSize: 13, color: "#64748b", textDecoration: "none", fontWeight: 500 }}>Resume</Link>
        <Link href="/sign-up" style={{ fontSize: 13, fontWeight: 700, color: "#fff", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", borderRadius: 8, padding: "7px 16px", textDecoration: "none", flexShrink: 0, whiteSpace: "nowrap" }}>
          Get Started Free
        </Link>
      </nav>

      {/* ── Hero ── */}
      <div style={{ background: "linear-gradient(135deg,#0a0f1e 0%,#0c1a2e 50%,#0a1a1e 100%)", padding: "40px 24px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(251,146,60,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(251,146,60,0.04) 1px,transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -80, left: "10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(251,146,60,0.1) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(251,146,60,0.12)", border: "1px solid rgba(251,146,60,0.3)", borderRadius: 20, padding: "5px 14px", marginBottom: 16 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fb923c", display: "inline-block" }} />
            <RefreshCw style={{ width: 13, height: 13, color: "#fb923c" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#fb923c" }}>AI Code Converter</span>
          </div>
          <h1 style={{ fontSize: "clamp(24px,4.5vw,40px)", fontWeight: 900, color: "#fff", margin: "0 0 12px", lineHeight: 1.1, letterSpacing: "-0.5px" }}>
            Migrate Test Code to Playwright<br />
            <span style={{ background: "linear-gradient(135deg,#fb923c,#f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>in Seconds, Not Weeks</span>
          </h1>
          <p style={{ fontSize: 15, color: "#94a3b8", margin: "0 auto 20px", maxWidth: 520, lineHeight: 1.7 }}>
            Paste Selenium, Cypress, WebDriverIO or Protractor code.
            Get production-ready Playwright code in TypeScript, JavaScript, Python or Java — with migration notes.
          </p>
          {/* Framework pills */}
          <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
            {["Selenium Java", "Selenium Python", "Cypress", "WebDriverIO", "Protractor", "Puppeteer"].map(f => (
              <span key={f} style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "4px 12px" }}>{f}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── What gets converted strip ── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "10px 24px" }}>
        <button onClick={() => setShowDiff(!showDiff)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#6366f1", background: "none", border: "none", cursor: "pointer", margin: "0 auto" }}>
          <Info style={{ width: 13, height: 13 }} />
          What gets auto-converted?
          {showDiff ? <ChevronDown style={{ width: 12, height: 12, transform: "rotate(180deg)" }} /> : <ChevronDown style={{ width: 12, height: 12 }} />}
        </button>
        {showDiff && (
          <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            {DIFF_FEATURES.map(({ from, to }) => (
              <div key={from} style={{ display: "flex", alignItems: "center", gap: 6, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "5px 10px", fontSize: 11 }}>
                <span style={{ color: "#ef4444", fontFamily: "'Fira Code',monospace" }}>{from}</span>
                <ArrowRight style={{ width: 10, height: 10, color: "#94a3b8", flexShrink: 0 }} />
                <span style={{ color: "#16a34a", fontWeight: 600 }}>{to}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Main layout ── */}
      <div style={{ padding: "24px", display: "flex", gap: 20, alignItems: "flex-start", maxWidth: 1400, margin: "0 auto" }}>

        {/* ── LEFT: Input panel ── */}
        <div style={{ flex: "0 0 460px", minWidth: 0 }}>

          {/* Config card */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 16, marginBottom: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 14px" }}>Configuration</p>

            {/* Source framework */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 7 }}>Source Framework</label>
              <div style={{ position: "relative" }}>
                <select
                  value={sourceFramework}
                  onChange={e => { setSourceFramework(e.target.value); setConvertedCode(""); setNotes(""); }}
                  style={{ width: "100%", fontSize: 13, border: "1px solid #e2e8f0", borderRadius: 9, padding: "9px 32px 9px 12px", appearance: "none", background: "#fff", color: "#0f172a", cursor: "pointer", outline: "none" }}
                >
                  {SOURCE_FRAMEWORKS.map(g => (
                    <optgroup key={g.group} label={g.group}>
                      {g.items.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
                    </optgroup>
                  ))}
                </select>
                <ChevronDown style={{ width: 13, height: 13, position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8" }} />
              </div>
            </div>

            {/* Target language */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 7 }}>Target: Playwright +</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                {TARGET_LANGUAGES.map(({ value, label, color }) => (
                  <button
                    key={value}
                    onClick={() => { setTargetLanguage(value); setConvertedCode(""); setNotes(""); }}
                    style={{ padding: "8px 0", borderRadius: 9, border: `2px solid ${targetLanguage === value ? color : "#e2e8f0"}`, background: targetLanguage === value ? `${color}18` : "#fff", color: targetLanguage === value ? color : "#64748b", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Source code textarea */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden", marginBottom: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <Code2 style={{ width: 13, height: 13, color: "#6366f1" }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>Source Code</span>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>— paste your {srcLabel} test</span>
              </div>
              <button
                onClick={loadExample}
                style={{ fontSize: 11, color: "#fb923c", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 6, padding: "3px 9px", cursor: "pointer", fontWeight: 600 }}
              >
                Load example
              </button>
            </div>
            <textarea
              value={sourceCode}
              onChange={e => setSourceCode(e.target.value)}
              placeholder={`Paste your ${srcLabel} test code here…`}
              rows={20}
              style={{ width: "100%", fontSize: 12, fontFamily: "'Fira Code',monospace", border: "none", padding: "14px 16px", lineHeight: 1.7, resize: "vertical", color: "#0f172a", outline: "none", background: "#f8fafc", boxSizing: "border-box" }}
            />
            <div style={{ padding: "8px 14px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#94a3b8" }}>{sourceCode.length > 0 ? `${sourceCode.length.toLocaleString()} chars` : ""}</span>
              <span style={{ fontSize: 11, color: "#94a3b8" }}>Supports any test framework file</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ display: "flex", gap: 8, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
              <AlertCircle style={{ width: 14, height: 14, color: "#dc2626", flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 13, color: "#991b1b", margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Convert button */}
          <button
            onClick={convert}
            disabled={loading}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 9, padding: "14px 0", borderRadius: 12, border: "none", background: loading ? "#94a3b8" : "linear-gradient(135deg,#ea580c,#f59e0b)", color: "#fff", fontSize: 15, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", transition: "opacity 0.2s", letterSpacing: "-0.2px" }}
          >
            {loading
              ? <><Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> Converting…</>
              : <><RefreshCw style={{ width: 16, height: 16 }} /> Convert to Playwright {TARGET_LANGUAGES.find(l => l.value === targetLanguage)?.label}</>
            }
          </button>
        </div>

        {/* ── RIGHT: Output panel ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {!hasResult && !loading && (
            /* Placeholder state */
            <div style={{ background: "#fff", borderRadius: 16, border: "2px dashed #e2e8f0", padding: "60px 40px", textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg,#fff7ed,#fef3c7)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <RefreshCw style={{ width: 24, height: 24, color: "#f59e0b" }} />
              </div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" }}>Converted code appears here</p>
              <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 24px", lineHeight: 1.65 }}>
                Paste your {srcLabel} test on the left and click Convert.<br />
                No account needed — results are instant.
              </p>
              {/* Quick start cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { icon: "🔄", title: "Auto-wait migration", desc: "All WebDriverWait patterns removed automatically" },
                  { icon: "🎯", title: "Semantic locators", desc: "By.id → getByLabel / getByRole" },
                  { icon: "📋", title: "POM preserved", desc: "Page Object classes fully converted" },
                  { icon: "📝", title: "Migration notes", desc: "Steps you need to complete manually" },
                ].map(({ icon, title, desc }) => (
                  <div key={title} style={{ background: "#f8fafc", borderRadius: 12, padding: "14px", textAlign: "left", border: "1px solid #f1f5f9" }}>
                    <p style={{ fontSize: 18, margin: "0 0 6px" }}>{icon}</p>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", margin: "0 0 3px" }}>{title}</p>
                    <p style={{ fontSize: 11, color: "#64748b", margin: 0, lineHeight: 1.5 }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: "60px 40px", textAlign: "center" }}>
              <Loader2 style={{ width: 32, height: 32, color: "#fb923c", margin: "0 auto 16px", animation: "spin 1s linear infinite" }} />
              <p style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" }}>Converting…</p>
              <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
                AI is analysing your {srcLabel} code and mapping to Playwright patterns
              </p>
            </div>
          )}

          {hasResult && (
            <div>
              {/* Toolbar */}
              <div style={{ background: "#fff", borderRadius: "14px 14px 0 0", border: "1px solid #e2e8f0", borderBottom: "none", padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
                  <Sparkles style={{ width: 13, height: 13, color: "#fb923c" }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                    Playwright {TARGET_LANGUAGES.find(l => l.value === targetLanguage)?.label}
                  </span>
                  <span style={{ fontSize: 11, color: "#64748b" }}>converted from {srcLabel}</span>
                  {provider && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", background: "#6366f1", borderRadius: 10, padding: "2px 7px" }}>
                      via {provider}
                    </span>
                  )}
                </div>
                <button onClick={copyCode} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: copied ? "#16a34a" : "#475569", background: copied ? "#f0fdf4" : "#f8fafc", border: `1px solid ${copied ? "#bbf7d0" : "#e2e8f0"}`, borderRadius: 8, padding: "6px 12px", cursor: "pointer", transition: "all 0.2s" }}>
                  {copied ? <Check style={{ width: 13, height: 13 }} /> : <Copy style={{ width: 13, height: 13 }} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={() => downloadFile(convertedCode, `playwright-converted.${ext}`)}
                  style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "#fb923c", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}
                >
                  <Download style={{ width: 13, height: 13 }} />
                  Download .{ext}
                </button>
              </div>

              {/* Code block */}
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0 0 14px 14px", overflow: "hidden" }}>
                <pre style={{ margin: 0, padding: "18px 20px", fontSize: 12.5, lineHeight: 1.7, color: "#e2e8f0", fontFamily: "'Fira Code',monospace", overflowX: "auto", whiteSpace: "pre", maxHeight: 600, overflow: "auto" }}>
                  {convertedCode}
                </pre>
              </div>

              {/* Migration notes */}
              {notes && (
                <div style={{ marginTop: 14, background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 14px", borderBottom: "1px solid #f1f5f9", background: "#fffbeb" }}>
                    <FileText style={{ width: 13, height: 13, color: "#d97706" }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#92400e" }}>Migration Notes — manual steps required</span>
                  </div>
                  <pre style={{ margin: 0, padding: "14px 16px", fontSize: 12, lineHeight: 1.7, color: "#475569", fontFamily: "'Fira Code',monospace", overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {notes}
                  </pre>
                </div>
              )}

              {/* Next steps */}
              <div style={{ marginTop: 14, background: "linear-gradient(135deg,#0a0f1e,#0c1a2e)", borderRadius: 14, padding: "18px 20px" }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 7 }}>
                  <Sparkles style={{ width: 14, height: 14, color: "#fb923c" }} />
                  Next steps for your migration
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { label: "Generate locators for your pages", href: "/tools/locators" },
                    { label: "Generate test cases from requirements", href: "/dashboard" },
                    { label: "Interview prep for Playwright roles", href: "/tools/interview-prep" },
                    { label: "Build your QA resume", href: "/resume-builder" },
                  ].map(({ label, href }) => (
                    <Link key={label} href={href} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "#94a3b8", textDecoration: "none", background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "8px 12px", border: "1px solid rgba(255,255,255,0.06)", transition: "background 0.15s" }}>
                      <ChevronDown style={{ width: 11, height: 11, transform: "rotate(-90deg)", flexShrink: 0, color: "#fb923c" }} />
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Spin keyframe ── */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

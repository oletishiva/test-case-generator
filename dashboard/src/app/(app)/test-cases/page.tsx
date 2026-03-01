"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Zap, Copy, Check, Save, RotateCcw, FileText, Code2, TestTube, Globe,
  Download, CheckCircle2, ArrowRight, Upload, Loader2, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  ManualTestTable,
  ProviderBadge,
  parseMarkdownTable,
  downloadFile,
  getDownloadContent,
} from "@/lib/test-output";
import { downloadPDF, downloadExcel } from "@/lib/download-utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type OutputType = "manual" | "bdd" | "playwright" | "api";

const OUTPUT_TYPES: {
  id: OutputType;
  label: string;
  icon: React.ElementType;
  description: string;
  ext: string;
  mime: string;
}[] = [
  { id: "manual",     label: "Manual Tests",  icon: FileText,  description: "Step-by-step test cases",    ext: "json",        mime: "application/json" },
  { id: "bdd",        label: "BDD / Gherkin", icon: TestTube,  description: "Given/When/Then scenarios",  ext: "feature",     mime: "text/plain" },
  { id: "playwright", label: "Playwright",    icon: Code2,     description: "TypeScript automation code", ext: "spec.ts",     mime: "text/typescript" },
  { id: "api",        label: "API Tests",     icon: Globe,     description: "Playwright API test code",   ext: "api.spec.ts", mime: "text/typescript" },
];

type Results    = Partial<Record<OutputType, string>>;
type LoadingMap = Partial<Record<OutputType, boolean>>;
type ProviderMap = Partial<Record<OutputType, "anthropic" | "openai" | "gemini">>;

// ─── Prompt builders ─────────────────────────────────────────────────────────

function buildPrompt(type: OutputType, description: string): string {
  switch (type) {
    case "manual":
      return `You are an expert QA engineer. Generate comprehensive manual test cases for the following feature:

${description}

Format the output as a markdown table with EXACTLY these columns:
| Test Case ID | Test Name | Type | Priority | Test Level | Steps | Expected Result | Test Data |

Rules:
- Type must be: POSITIVE, NEGATIVE, or EDGE
- Priority must be: Critical, High, Medium, or Low
- Test Level must be: E2E, Unit, Integration, or API
- Steps: numbered list separated by semicolons (e.g. "1. Do X; 2. Do Y; 3. Click Z")
- Test Data: sample values used in the test (or "N/A")
- Include 10-20 test cases covering happy path, edge cases, and negative scenarios
- Return ONLY the markdown table, no extra explanation before or after

Generate the test cases now:`;

    case "bdd":
      return `You are an expert QA engineer. Generate BDD test scenarios in Gherkin syntax for the following feature:

${description}

Requirements:
- Start with a Feature block with a clear description
- Include 5-8 Scenario blocks (happy path, edge cases, error scenarios)
- Use Scenario Outline with Examples table where applicable
- Standard Gherkin keywords: Feature, Background, Scenario, Scenario Outline, Given, When, Then, And, But, Examples
- Return ONLY the Gherkin feature file content, no extra text

Generate the BDD scenarios now:`;

    case "playwright":
      return `You are an expert QA engineer. Generate comprehensive Playwright TypeScript test code for the following feature:

${description}

Requirements:
- Use @playwright/test with TypeScript (import { test, expect, Page } from '@playwright/test')
- Implement Page Object Model pattern with a class
- Include happy path, edge cases, and error scenarios in test.describe blocks
- Add clear comments for complex assertions
- Follow Playwright best practices for locators (getByRole, getByLabel, getByPlaceholder)
- Return ONLY the TypeScript code, no markdown fences, no extra explanation

Generate the Playwright tests now:`;

    case "api":
      return `You are an expert QA engineer. Generate comprehensive API test cases using Playwright for the following feature:

${description}

Requirements:
- Use Playwright APIRequestContext (import { test, expect } from '@playwright/test')
- Define BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'
- Test all relevant HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Validate status codes, response body schema, and data values
- Include Authorization headers where relevant
- Cover happy path, error responses (400, 401, 403, 404, 422, 500), and edge cases
- Return ONLY the TypeScript code, no markdown fences, no extra explanation

Generate the API tests now:`;
  }
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TestCasesPage() {
  const [description, setDescription]    = useState("");
  const [selectedTypes, setSelectedTypes] = useState<OutputType[]>(["playwright"]);
  const [results, setResults]            = useState<Results>({});
  const [loading, setLoading]            = useState<LoadingMap>({});
  const [providers, setProviders]        = useState<ProviderMap>({});
  const [copied, setCopied]              = useState<Partial<Record<OutputType, boolean>>>({});
  const [saved, setSaved]                = useState(false);
  const [saveError, setSaveError]        = useState("");
  const [error, setError]                = useState("");
  const [progress, setProgress]          = useState(0);
  const [activeTab, setActiveTab]        = useState<OutputType>("playwright");

  // JIRA fetch state
  const [jiraKey, setJiraKey]           = useState("");
  const [jiraLoading, setJiraLoading]   = useState(false);
  const [jiraError, setJiraError]       = useState("");

  // Zephyr upload state
  const [zephyrState, setZephyrState]   = useState<"idle"|"loading"|"ok"|"error">("idle");
  const [zephyrMsg, setZephyrMsg]       = useState("");

  // JIRA upload state
  const [jiraUpState, setJiraUpState]   = useState<"idle"|"loading"|"ok"|"error">("idle");
  const [jiraUpMsg, setJiraUpMsg]       = useState("");
  const [jiraUpLinks, setJiraUpLinks]   = useState<{ key: string; url: string }[]>([]);

  const isGenerating = Object.values(loading).some(Boolean);
  const hasAnyResult = selectedTypes.some((t) => results[t]);

  function toggleType(type: OutputType) {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.length === 1 ? prev : prev.filter((t) => t !== type)
        : [...prev, type]
    );
  }

  async function generateOne(type: OutputType) {
    setLoading((prev) => ({ ...prev, [type]: true }));
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildPrompt(type, description) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setResults((prev)   => ({ ...prev, [type]: data.result }));
      setProviders((prev) => ({ ...prev, [type]: data.provider }));
    } catch (err) {
      setResults((prev) => ({
        ...prev,
        [type]: `Error: ${err instanceof Error ? err.message : "Something went wrong"}`,
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [type]: false }));
    }
  }

  async function generate() {
    if (!description.trim() || selectedTypes.length === 0) return;
    setError("");
    setSaved(false);
    setSaveError("");
    setResults({});
    setProviders({});
    setProgress(0);
    setActiveTab(selectedTypes[0]);

    const tick = setInterval(() => setProgress((p) => Math.min(p + 6, 85)), 300);
    await Promise.all(selectedTypes.map(generateOne));
    clearInterval(tick);
    setProgress(100);
    setTimeout(() => setProgress(0), 600);
  }

  function reset() {
    setDescription("");
    setResults({});
    setProviders({});
    setLoading({});
    setCopied({});
    setSaved(false);
    setSaveError("");
    setError("");
    setProgress(0);
    setJiraUpState("idle");
    setJiraUpMsg("");
    setJiraUpLinks([]);
    setZephyrState("idle");
    setZephyrMsg("");
  }

  async function copyResult(type: OutputType) {
    const text = results[type];
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied((prev) => ({ ...prev, [type]: true }));
    setTimeout(() => setCopied((prev) => ({ ...prev, [type]: false })), 2000);
  }

  async function saveToLibrary() {
    setSaveError("");
    const title = description.split("\n")[0].slice(0, 80);
    const generatedTypes = selectedTypes.filter((t) => results[t]);

    const responses = await Promise.all(
      generatedTypes.map((type) =>
        fetch("/api/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `${title} [${type.toUpperCase()}]`,
            description,
            framework: type,
            test_type: type,
            result: results[type],
            provider: providers[type],
          }),
        })
      )
    );

    if (responses.every((r) => r.ok)) {
      setSaved(true);
    } else {
      setSaveError("Save failed — make sure the Supabase table exists");
    }
  }

  // ─── JIRA fetch ──────────────────────────────────────────────────────────────

  async function fetchFromJira() {
    if (!jiraKey.trim()) return;
    setJiraLoading(true);
    setJiraError("");
    const jiraUrl   = localStorage.getItem("jira_url")   ?? "";
    const email     = localStorage.getItem("jira_email") ?? "";
    const token     = localStorage.getItem("jira_token") ?? "";

    if (!jiraUrl || !email || !token) {
      setJiraError("Add JIRA credentials in Settings first.");
      setJiraLoading(false);
      return;
    }

    const res = await fetch("/api/jira", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jiraUrl, email, token, issueKey: jiraKey.trim() }),
    });

    const data = await res.json();
    if (res.ok) {
      setDescription(data.description);
    } else {
      setJiraError(data.error ?? "Failed to fetch JIRA story");
    }
    setJiraLoading(false);
  }

  // ─── JIRA upload ──────────────────────────────────────────────────────────────

  async function uploadToJira() {
    const jiraUrl    = localStorage.getItem("jira_url")    ?? "";
    const email      = localStorage.getItem("jira_email")  ?? "";
    const token      = localStorage.getItem("jira_token")  ?? "";
    const projectKey = localStorage.getItem("jira_project") ?? "";

    if (!jiraUrl || !email || !token || !projectKey) {
      setJiraUpMsg("Add JIRA credentials + project key in Settings first.");
      setJiraUpState("error");
      return;
    }

    setJiraUpState("loading");
    setJiraUpMsg("");
    setJiraUpLinks([]);
    const title = description.split("\n")[0].slice(0, 80);
    const generatedTypes = selectedTypes.filter((t) => results[t]);

    const res = await fetch("/api/jira/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jiraUrl, email, token, projectKey,
        testCases: generatedTypes.map((type) => ({
          title: `${title} [${type.toUpperCase()}]`,
          type,
          result: results[type],
        })),
      }),
    });

    const data = await res.json();
    if (data.allOk) {
      setJiraUpState("ok");
      setJiraUpLinks(data.results.map((r: { key: string; url: string }) => ({ key: r.key, url: r.url })));
      setJiraUpMsg(`Created ${data.results.length} issue${data.results.length > 1 ? "s" : ""} in JIRA`);
    } else {
      setJiraUpState("error");
      setJiraUpMsg(data.results?.[0]?.error ?? "Upload failed");
    }
  }

  // ─── Zephyr upload ────────────────────────────────────────────────────────────

  async function uploadToZephyr() {
    const zephyrToken = localStorage.getItem("zephyr_token")   ?? "";
    const projectKey  = localStorage.getItem("zephyr_project") ?? "";

    if (!zephyrToken || !projectKey) {
      setZephyrMsg("Add Zephyr credentials in Settings first.");
      setZephyrState("error");
      return;
    }

    setZephyrState("loading");
    setZephyrMsg("");
    const title = description.split("\n")[0].slice(0, 80);
    const generatedTypes = selectedTypes.filter((t) => results[t]);

    const res = await fetch("/api/zephyr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        zephyrToken,
        projectKey,
        testCases: generatedTypes.map((type) => ({
          title: `${title} [${type.toUpperCase()}]`,
          type,
          result: results[type],
        })),
      }),
    });

    const data = await res.json();
    if (data.allOk) {
      setZephyrState("ok");
      const ids = data.results.map((r: { id?: string }) => r.id).filter(Boolean).join(", ");
      setZephyrMsg(`Uploaded to Zephyr${ids ? ` as ${ids}` : ""}`);
    } else {
      setZephyrState("error");
      setZephyrMsg(data.results?.[0]?.error ?? "Upload failed");
    }
  }

  // ─── Per-tab download dropdown ────────────────────────────────────────────────

  function downloadAs(type: OutputType, format: "native" | "pdf" | "excel") {
    const text = results[type];
    if (!text) return;
    const slug = description.split("\n")[0].slice(0, 30).replace(/\s+/g, "_").toLowerCase();
    const title = description.split("\n")[0].slice(0, 80);
    if (format === "pdf")   { downloadPDF(type, text, title); return; }
    if (format === "excel") { downloadExcel(type, text, title); return; }
    const meta = OUTPUT_TYPES.find((o) => o.id === type)!;
    downloadFile(getDownloadContent(type, text), `${slug}_${type}.${meta.ext}`, meta.mime);
  }

  const typesWithResults = selectedTypes.filter((t) => results[t]);

  function tabCount(type: OutputType): number | null {
    const text = results[type];
    if (!text || type !== "manual") return null;
    const parsed = parseMarkdownTable(text);
    return parsed?.rows.length ?? null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Generate Test Cases</h1>
        <p className="mt-1 text-sm text-gray-500">
          Select output types, describe your feature, and generate all tests at once.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Input panel ──────────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-base">Feature description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-5">
            <div>
              <p className="mb-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Output types <span className="normal-case text-gray-400">(select one or more)</span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                {OUTPUT_TYPES.map(({ id, label, icon: Icon, description: desc }) => {
                  const selected = selectedTypes.includes(id);
                  return (
                    <button
                      key={id}
                      onClick={() => toggleType(id)}
                      className={`flex items-start gap-3 rounded-xl border-2 p-3 text-left transition-all ${
                        selected ? "border-violet-500 bg-violet-50" : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${selected ? "bg-violet-100" : "bg-gray-100"}`}>
                        <Icon className={`h-4 w-4 ${selected ? "text-violet-600" : "text-gray-500"}`} />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${selected ? "text-violet-700" : "text-gray-700"}`}>{label}</p>
                        <p className="text-xs text-gray-400">{desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* JIRA fetch */}
            <div>
              <p className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Fetch from JIRA <span className="normal-case text-gray-400">(optional)</span>
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Issue key, e.g. PROJ-123"
                  value={jiraKey}
                  onChange={(e) => setJiraKey(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchFromJira()}
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchFromJira}
                  disabled={jiraLoading || !jiraKey.trim()}
                  className="shrink-0 gap-1.5"
                >
                  {jiraLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                  {jiraLoading ? "Fetching…" : "Fetch"}
                </Button>
              </div>
              {jiraError && (
                <p className="mt-1 text-xs text-red-500">
                  {jiraError}
                  {jiraError.includes("Settings") && (
                    <a href="/settings" className="ml-1 underline">Go to Settings →</a>
                  )}
                </p>
              )}
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">User story / requirements</p>
              <Textarea
                placeholder={`Example:\nAs a user, I want to log in with my email and password.\nAcceptance criteria:\n- Show error if email is invalid\n- Lock account after 5 failed attempts\n- Redirect to dashboard on success`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={10}
                className="resize-none font-mono text-sm"
              />
              <p className="mt-1 text-right text-xs text-gray-400">{description.length} chars</p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={generate}
                disabled={isGenerating || !description.trim()}
                className="flex-1 gap-2 bg-violet-600 hover:bg-violet-700"
              >
                <Zap className="h-4 w-4" />
                {isGenerating ? "Generating…" : selectedTypes.length > 1 ? `Generate All (${selectedTypes.length})` : "Generate"}
              </Button>
              {(hasAnyResult || description) && (
                <Button variant="outline" size="icon" onClick={reset} title="Reset">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>

            {isGenerating && (
              <div className="space-y-1">
                <Progress value={progress} className="h-1.5" />
                <p className="text-xs text-gray-400 text-center">
                  Generating {selectedTypes.length > 1 ? `${selectedTypes.length} types in parallel` : ""}…
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Output panel ─────────────────────────────────────────────────── */}
        <Card className="flex flex-col">
          <CardHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Generated output</CardTitle>
              {hasAnyResult && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => copyResult(activeTab)} disabled={!results[activeTab]}>
                    {copied[activeTab] ? <><Check className="h-3 w-3 text-green-500" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
                  </Button>
                  {/* Download dropdown */}
                  <div className="relative group">
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs" disabled={!results[activeTab]}>
                      <Download className="h-3 w-3" /> Download ▾
                    </Button>
                    <div className="absolute right-0 top-full z-20 mt-1 hidden w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg group-hover:block">
                      {[
                        { label: activeTab === "manual" ? "JSON" : activeTab === "bdd" ? ".feature" : ".ts", fmt: "native" as const },
                        { label: "PDF",        fmt: "pdf"    as const },
                        { label: "Excel (.xlsx)", fmt: "excel" as const },
                      ].map(({ label, fmt }) => (
                        <button key={fmt} onClick={() => downloadAs(activeTab, fmt)}
                          className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50">
                          <Download className="h-3 w-3 text-gray-400" /> {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button
                    size="sm" variant="outline"
                    className={`gap-1.5 text-xs ${saved ? "text-green-600 border-green-300 bg-green-50" : ""}`}
                    onClick={saveToLibrary} disabled={saved}
                  >
                    {saved ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <Save className="h-3 w-3" />}
                    {saved ? "Saved" : "Save all"}
                  </Button>
                  <Button
                    size="sm" variant="outline"
                    className={`gap-1.5 text-xs ${jiraUpState === "ok" ? "border-blue-300 text-blue-700" : jiraUpState === "error" ? "border-red-300 text-red-500" : ""}`}
                    onClick={uploadToJira}
                    disabled={jiraUpState === "loading" || !hasAnyResult}
                  >
                    {jiraUpState === "loading" ? <Loader2 className="h-3 w-3 animate-spin" /> : jiraUpState === "ok" ? <CheckCircle2 className="h-3 w-3 text-blue-500" /> : <Upload className="h-3 w-3" />}
                    {jiraUpState === "loading" ? "Uploading…" : jiraUpState === "ok" ? "In JIRA" : "JIRA"}
                  </Button>
                  <Button
                    size="sm" variant="outline"
                    className={`gap-1.5 text-xs ${zephyrState === "ok" ? "border-green-300 text-green-700" : zephyrState === "error" ? "border-red-300 text-red-500" : ""}`}
                    onClick={uploadToZephyr}
                    disabled={zephyrState === "loading" || !hasAnyResult}
                  >
                    {zephyrState === "loading" ? <Loader2 className="h-3 w-3 animate-spin" /> : zephyrState === "ok" ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <Upload className="h-3 w-3" />}
                    {zephyrState === "loading" ? "Uploading…" : zephyrState === "ok" ? "Uploaded" : "Zephyr"}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="flex-1 pt-4">
            {saved && (
              <div className="mb-4 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle2 className="h-4 w-4 shrink-0" /> Saved to your library
                </div>
                <Link href="/library" className="flex items-center gap-1 text-xs font-medium text-green-700 hover:underline">
                  View Library <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}
            {saveError && (
              <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-700">{saveError}</div>
            )}
            {jiraUpMsg && (
              <div className={`mb-4 rounded-lg border px-4 py-3 text-sm ${jiraUpState === "ok" ? "border-blue-200 bg-blue-50 text-blue-700" : "border-red-200 bg-red-50 text-red-700"}`}>
                <span>{jiraUpMsg}</span>
                {jiraUpLinks.length > 0 && (
                  <span className="ml-2">
                    {jiraUpLinks.map(({ key, url }) => (
                      <a key={key} href={url} target="_blank" rel="noopener noreferrer"
                        className="ml-1 font-mono font-semibold underline hover:opacity-80">
                        {key}
                      </a>
                    ))}
                  </span>
                )}
                {jiraUpState === "error" && jiraUpMsg.includes("Settings") && (
                  <a href="/settings" className="ml-1 underline">Go to Settings →</a>
                )}
              </div>
            )}
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}

            {!hasAnyResult && !isGenerating && (
              <div className="flex h-72 flex-col items-center justify-center text-center text-gray-400">
                <Zap className="mb-3 h-10 w-10 opacity-30" />
                <p className="text-sm">Your generated tests will appear here</p>
                <p className="mt-1 text-xs">Select output types, fill in the form, and click Generate</p>
              </div>
            )}

            {(hasAnyResult || isGenerating) && (
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as OutputType)}>
                <TabsList className="mb-4 flex h-auto flex-wrap gap-1 bg-gray-100 p-1">
                  {selectedTypes.map((type) => {
                    const meta = OUTPUT_TYPES.find((o) => o.id === type)!;
                    const count = tabCount(type);
                    return (
                      <TabsTrigger key={type} value={type} className="gap-1.5 text-xs">
                        {loading[type] && <div className="h-3 w-3 animate-spin rounded-full border border-violet-600 border-t-transparent" />}
                        {!loading[type] && results[type] && <Check className="h-3 w-3 text-green-500" />}
                        {meta.label}
                        {count !== null && (
                          <span className="ml-1 rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700">{count}</span>
                        )}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {selectedTypes.map((type) => (
                  <TabsContent key={type} value={type} className="mt-0">
                    {loading[type] && (
                      <div className="flex h-64 flex-col items-center justify-center text-center text-gray-400">
                        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
                        <p className="text-sm">Generating {OUTPUT_TYPES.find((o) => o.id === type)?.label}…</p>
                      </div>
                    )}
                    {!loading[type] && results[type] && (
                      <>
                        <div className="mb-3 flex items-center justify-between">
                          <ProviderBadge provider={providers[type]} />
                          <div className="flex items-center gap-3">
                            {["native", "pdf", "excel"].map((fmt) => (
                              <button key={fmt} onClick={() => downloadAs(type, fmt as "native"|"pdf"|"excel")}
                                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700">
                                <Download className="h-3 w-3" />
                                {fmt === "native" ? (type === "manual" ? "JSON" : type === "bdd" ? ".feature" : ".ts") : fmt === "pdf" ? "PDF" : "Excel"}
                              </button>
                            ))}
                          </div>
                        </div>
                        {zephyrMsg && type === activeTab && (
                          <p className={`mb-2 text-xs ${zephyrState === "ok" ? "text-green-600" : "text-red-500"}`}>
                            {zephyrState === "ok" ? "✓ " : "✗ "}{zephyrMsg}
                            {zephyrMsg.includes("Settings") && <a href="/settings" className="ml-1 underline">Settings →</a>}
                          </p>
                        )}
                        {type === "manual" ? (
                          <ManualTestTable text={results[type]!} />
                        ) : (
                          <pre className="max-h-[500px] overflow-y-auto rounded-lg bg-gray-950 p-4 text-xs leading-relaxed text-green-400 font-mono whitespace-pre-wrap">
                            {results[type]!.replace(/^```[a-z]*\n?/gm, "").replace(/^```$/gm, "").trim()}
                          </pre>
                        )}
                      </>
                    )}
                    {!loading[type] && !results[type] && (
                      <div className="flex h-64 flex-col items-center justify-center text-center text-gray-400">
                        <p className="text-sm">Click Generate to produce {OUTPUT_TYPES.find((o) => o.id === type)?.label}</p>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            )}

            {typesWithResults.length > 0 && (
              <p className="mt-3 text-right text-xs text-gray-400">
                {typesWithResults.length} of {selectedTypes.length} generated
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

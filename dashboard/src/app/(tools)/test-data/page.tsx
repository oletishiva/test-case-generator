"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  Plus, Trash2, Download, Copy, Check, Loader2, Database,
  Sparkles, Code2, LayoutTemplate, ChevronDown, TestTube,
  Settings2, AlertCircle, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ── Types ───────────────────────────────────────────────── */
type FieldDef = { id: string; name: string; type: string; options: string };
type InputMode = "build" | "describe" | "schema" | "template";
type ExportFormat = "json" | "csv" | "sql" | "js";

/* ── Field type catalogue ────────────────────────────────── */
const FIELD_GROUPS: { group: string; types: string[] }[] = [
  { group: "Personal", types: ["Full Name", "First Name", "Last Name", "Email", "Phone", "Mobile", "Date of Birth", "Age", "Gender", "National ID"] },
  { group: "Address", types: ["Street Address", "City", "State / Province", "Country", "Postcode / ZIP", "Full Address"] },
  { group: "Banking & Finance", types: ["IBAN", "SWIFT / BIC", "Account Number", "Sort Code", "Bank Name", "Credit Card Number", "Card Expiry", "CVV", "Currency Amount"] },
  { group: "Business", types: ["Company Name", "Job Title", "Department", "Employee ID", "VAT / Tax Number"] },
  { group: "Technical", types: ["UUID", "Username", "Password", "API Key", "URL", "IP Address", "MAC Address"] },
  { group: "Dates & Numbers", types: ["Date", "DateTime", "Future Date", "Past Date", "Integer", "Decimal", "Boolean", "Percentage"] },
  { group: "Custom", types: ["Constant Value", "From List", "Alphanumeric ID", "Regex Pattern"] },
];
const ALL_TYPES = FIELD_GROUPS.flatMap((g) => g.types);

/* ── Domain templates ────────────────────────────────────── */
const TEMPLATES = [
  {
    id: "payee",
    name: "Bank Payee",
    emoji: "🏦",
    desc: "IBAN, SWIFT, account & sort code",
    fields: [
      { name: "payee_name", type: "Full Name", options: "" },
      { name: "iban", type: "IBAN", options: "" },
      { name: "swift_bic", type: "SWIFT / BIC", options: "" },
      { name: "account_number", type: "Account Number", options: "" },
      { name: "sort_code", type: "Sort Code", options: "" },
      { name: "bank_name", type: "Bank Name", options: "" },
    ],
  },
  {
    id: "customer",
    name: "Customer",
    emoji: "👤",
    desc: "Name, email, phone, address",
    fields: [
      { name: "customer_id", type: "UUID", options: "" },
      { name: "full_name", type: "Full Name", options: "" },
      { name: "email", type: "Email", options: "" },
      { name: "phone", type: "Phone", options: "" },
      { name: "address", type: "Full Address", options: "" },
      { name: "date_of_birth", type: "Date of Birth", options: "" },
    ],
  },
  {
    id: "order",
    name: "E-commerce Order",
    emoji: "🛒",
    desc: "Order ID, product, quantity, amount",
    fields: [
      { name: "order_id", type: "UUID", options: "" },
      { name: "customer_name", type: "Full Name", options: "" },
      { name: "email", type: "Email", options: "" },
      { name: "product_name", type: "From List", options: "Laptop,Smartphone,Tablet,Headphones,Monitor,Keyboard,Mouse,Webcam" },
      { name: "quantity", type: "Integer", options: "1-10" },
      { name: "unit_price", type: "Currency Amount", options: "" },
      { name: "order_date", type: "Date", options: "" },
      { name: "status", type: "From List", options: "pending,processing,shipped,delivered,cancelled" },
    ],
  },
  {
    id: "employee",
    name: "Employee / HR",
    emoji: "👔",
    desc: "Staff profile with salary & dept",
    fields: [
      { name: "employee_id", type: "UUID", options: "" },
      { name: "full_name", type: "Full Name", options: "" },
      { name: "email", type: "Email", options: "" },
      { name: "department", type: "Department", options: "" },
      { name: "job_title", type: "Job Title", options: "" },
      { name: "salary", type: "Currency Amount", options: "" },
      { name: "start_date", type: "Date", options: "" },
    ],
  },
  {
    id: "patient",
    name: "Healthcare Patient",
    emoji: "🏥",
    desc: "Patient ID, DOB, diagnosis, contact",
    fields: [
      { name: "patient_id", type: "UUID", options: "" },
      { name: "full_name", type: "Full Name", options: "" },
      { name: "date_of_birth", type: "Date of Birth", options: "" },
      { name: "gender", type: "Gender", options: "" },
      { name: "phone", type: "Phone", options: "" },
      { name: "address", type: "Full Address", options: "" },
      { name: "blood_type", type: "From List", options: "A+,A-,B+,B-,AB+,AB-,O+,O-" },
    ],
  },
  {
    id: "transaction",
    name: "Bank Transaction",
    emoji: "💳",
    desc: "TX ID, amount, merchant, status",
    fields: [
      { name: "transaction_id", type: "UUID", options: "" },
      { name: "account_number", type: "Account Number", options: "" },
      { name: "merchant_name", type: "Company Name", options: "" },
      { name: "amount", type: "Currency Amount", options: "" },
      { name: "currency", type: "From List", options: "GBP,USD,EUR,INR,AUD" },
      { name: "timestamp", type: "DateTime", options: "" },
      { name: "status", type: "From List", options: "completed,pending,failed,refunded" },
    ],
  },
];

const LOCALES = [
  { value: "en-US", label: "🇺🇸 English (US)" },
  { value: "en-GB", label: "🇬🇧 English (UK)" },
  { value: "de-DE", label: "🇩🇪 German" },
  { value: "fr-FR", label: "🇫🇷 French" },
  { value: "en-IN", label: "🇮🇳 English (India)" },
  { value: "en-AU", label: "🇦🇺 English (Australia)" },
  { value: "ja-JP", label: "🇯🇵 Japanese" },
  { value: "es-ES", label: "🇪🇸 Spanish" },
];

const ROW_OPTIONS = [5, 10, 25, 50, 100, 250, 500, 1000];

/* ── Helpers ─────────────────────────────────────────────── */
function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function toCSV(data: Record<string, unknown>[]): string {
  if (!data.length) return "";
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((h) => {
      const v = row[h] == null ? "" : String(row[h]);
      return v.includes(",") || v.includes('"') || v.includes("\n")
        ? `"${v.replace(/"/g, '""')}"`
        : v;
    }).join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

function toSQL(data: Record<string, unknown>[], tableName = "test_data"): string {
  if (!data.length) return "";
  const headers = Object.keys(data[0]);
  const cols = headers.map((h) => `\`${h}\``).join(", ");
  const rows = data.map((row) => {
    const vals = headers.map((h) => {
      const v = row[h];
      if (v === null || v === undefined) return "NULL";
      if (typeof v === "boolean") return v ? "1" : "0";
      if (typeof v === "number") return String(v);
      return `'${String(v).replace(/'/g, "''")}'`;
    });
    return `  (${vals.join(", ")})`;
  });
  return `INSERT INTO \`${tableName}\` (${cols})\nVALUES\n${rows.join(",\n")};`;
}

function toJS(data: Record<string, unknown>[]): string {
  return `const testData = ${JSON.stringify(data, null, 2)};`;
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Page ────────────────────────────────────────────────── */
export default function TestDataPage() {
  /* Config state */
  const [mode, setMode] = useState<InputMode>("template");
  const [fields, setFields] = useState<FieldDef[]>([
    { id: uid(), name: "payee_name", type: "Full Name", options: "" },
    { id: uid(), name: "iban", type: "IBAN", options: "" },
    { id: uid(), name: "swift_bic", type: "SWIFT / BIC", options: "" },
    { id: uid(), name: "account_number", type: "Account Number", options: "" },
    { id: uid(), name: "sort_code", type: "Sort Code", options: "" },
    { id: uid(), name: "bank_name", type: "Bank Name", options: "" },
  ]);
  const [rowCount, setRowCount] = useState(10);
  const [locale, setLocale] = useState("en-GB");
  const [includeEdgeCases, setIncludeEdgeCases] = useState(false);
  const [description, setDescription] = useState("");
  const [schema, setSchema] = useState("");

  /* Output state */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedData, setGeneratedData] = useState<Record<string, unknown>[]>([]);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("json");
  const [copied, setCopied] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState("payee");

  /* ── Field management ── */
  const addField = () =>
    setFields((f) => [...f, { id: uid(), name: "", type: "Full Name", options: "" }]);

  const removeField = (id: string) =>
    setFields((f) => f.filter((x) => x.id !== id));

  const updateField = (id: string, key: keyof FieldDef, val: string) =>
    setFields((f) => f.map((x) => (x.id === id ? { ...x, [key]: val } : x)));

  const applyTemplate = useCallback((tplId: string) => {
    const tpl = TEMPLATES.find((t) => t.id === tplId);
    if (!tpl) return;
    setActiveTemplate(tplId);
    setFields(tpl.fields.map((f) => ({ ...f, id: uid() })));
    setMode("build");
  }, []);

  /* ── Generate ── */
  async function generate() {
    setError("");
    if (mode === "build" && fields.length === 0) {
      setError("Add at least one field.");
      return;
    }
    if (mode === "describe" && !description.trim()) {
      setError("Enter a description.");
      return;
    }
    if (mode === "schema" && !schema.trim()) {
      setError("Paste a schema.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/testdata/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputMode: mode,
          fields: fields.map(({ name, type, options }) => ({ name, type, options })),
          rowCount,
          locale,
          domain: TEMPLATES.find((t) => t.id === activeTemplate)?.name ?? "general",
          includeEdgeCases,
          description,
          schema,
        }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Generation failed");
      setGeneratedData(json.data);
      setExportFormat("json");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  /* ── Export ── */
  function getExportContent(): string {
    if (!generatedData.length) return "";
    switch (exportFormat) {
      case "csv": return toCSV(generatedData);
      case "sql": return toSQL(generatedData);
      case "js": return toJS(generatedData);
      default: return JSON.stringify(generatedData, null, 2);
    }
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(getExportContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadExport() {
    const content = getExportContent();
    const ext = exportFormat === "js" ? "js" : exportFormat;
    const mime = exportFormat === "json"
      ? "application/json"
      : exportFormat === "csv"
        ? "text/csv"
        : "text/plain";
    downloadFile(content, `test-data.${ext}`, mime);
  }

  const columns = generatedData.length > 0 ? Object.keys(generatedData[0]) : [];
  const hasData = generatedData.length > 0;

  return (
    <div className="min-h-screen bg-[#f8fafc]" style={{ fontFamily: "system-ui, sans-serif" }}>

      {/* ── Nav ── */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 24px", display: "flex", alignItems: "center", height: 56, gap: 20, position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TestTube style={{ width: 14, height: 14, color: "#fff" }} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>AITestCraft</span>
        </Link>
        <div style={{ flex: 1 }} />
        <Link href="/dashboard" style={{ fontSize: 13, color: "#64748b", textDecoration: "none" }}>Test Generator</Link>
        <Link href="/resume-builder" style={{ fontSize: 13, color: "#64748b", textDecoration: "none" }}>Resume Builder</Link>
        <Link href="/blog" style={{ fontSize: 13, color: "#64748b", textDecoration: "none" }}>Blog</Link>
        <Link href="/sign-up" style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: "#7c3aed", borderRadius: 8, padding: "7px 16px", textDecoration: "none" }}>
          Get Started Free
        </Link>
      </nav>

      {/* ── Header ── */}
      <div style={{ background: "linear-gradient(135deg,#0a0f1e 0%,#1a0a2e 100%)", padding: "40px 24px 44px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 20, padding: "5px 14px", marginBottom: 16 }}>
          <Database style={{ width: 13, height: 13, color: "#a78bfa" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#a78bfa" }}>AI-Powered Test Data Generator</span>
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: "#fff", margin: "0 0 12px", lineHeight: 1.15 }}>
          Generate Realistic Test Data
        </h1>
        <p style={{ fontSize: 16, color: "#94a3b8", margin: "0 auto", maxWidth: 560, lineHeight: 1.7 }}>
          Build from a template, describe in plain English, or paste your schema.
          Get realistic, consistent data exported as JSON, CSV or SQL — instantly.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 20 }}>
          {[["6", "Domain templates"], ["12+", "Export formats"], ["1,000", "Max rows/request"], ["Free", "Always"]].map(([n, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <p style={{ fontSize: 20, fontWeight: 800, color: "#fff", margin: 0 }}>{n}</p>
              <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main layout ── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 16px", display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>

        {/* ── LEFT PANEL ── */}
        <div style={{ flex: "0 0 420px", minWidth: 0, width: "100%" }}>

          {/* Template quick-picks */}
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: "18px 20px", marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 12px" }}>
              Quick Templates
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => applyTemplate(t.id)}
                  style={{
                    border: `2px solid ${activeTemplate === t.id ? "#7c3aed" : "#e2e8f0"}`,
                    borderRadius: 10,
                    padding: "10px 12px",
                    background: activeTemplate === t.id ? "#f5f3ff" : "#fff",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: 18 }}>{t.emoji}</span>
                  <p style={{ fontSize: 13, fontWeight: 700, color: activeTemplate === t.id ? "#7c3aed" : "#0f172a", margin: "4px 0 2px" }}>
                    {t.name}
                  </p>
                  <p style={{ fontSize: 11, color: "#94a3b8", margin: 0, lineHeight: 1.4 }}>{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Input mode tabs + fields */}
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden", marginBottom: 16 }}>
            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0" }}>
              {([
                { id: "build", icon: Settings2, label: "Build" },
                { id: "describe", icon: Sparkles, label: "Describe" },
                { id: "schema", icon: Code2, label: "Schema" },
              ] as { id: InputMode; icon: React.ElementType; label: string }[]).map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setMode(id)}
                  style={{
                    flex: 1,
                    padding: "11px 0",
                    border: "none",
                    borderBottom: `2px solid ${mode === id ? "#7c3aed" : "transparent"}`,
                    background: "transparent",
                    fontSize: 13,
                    fontWeight: mode === id ? 700 : 500,
                    color: mode === id ? "#7c3aed" : "#64748b",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    transition: "all 0.15s",
                  }}
                >
                  <Icon style={{ width: 14, height: 14 }} />
                  {label}
                </button>
              ))}
            </div>

            <div style={{ padding: "16px 20px" }}>
              {/* Build mode */}
              {mode === "build" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                      {fields.length} field{fields.length !== 1 ? "s" : ""}
                    </span>
                    <button
                      onClick={addField}
                      style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "#7c3aed", background: "#f5f3ff", border: "1px solid #ede9fe", borderRadius: 7, padding: "5px 10px", cursor: "pointer" }}
                    >
                      <Plus style={{ width: 12, height: 12 }} /> Add Field
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 360, overflowY: "auto" }}>
                    {fields.map((f) => (
                      <div key={f.id} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                        <input
                          value={f.name}
                          onChange={(e) => updateField(f.id, "name", e.target.value)}
                          placeholder="field_name"
                          style={{ flex: 1, minWidth: 0, fontSize: 12, border: "1px solid #e2e8f0", borderRadius: 7, padding: "7px 10px", fontFamily: "monospace", color: "#0f172a", outline: "none" }}
                        />
                        <div style={{ position: "relative" }}>
                          <select
                            value={f.type}
                            onChange={(e) => updateField(f.id, "type", e.target.value)}
                            style={{ fontSize: 12, border: "1px solid #e2e8f0", borderRadius: 7, padding: "7px 28px 7px 10px", appearance: "none", background: "#fff", color: "#0f172a", cursor: "pointer", outline: "none" }}
                          >
                            {FIELD_GROUPS.map((g) => (
                              <optgroup key={g.group} label={g.group}>
                                {g.types.map((t) => (
                                  <option key={t} value={t}>{t}</option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                          <ChevronDown style={{ width: 12, height: 12, position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8" }} />
                        </div>
                        {(f.type === "Constant Value" || f.type === "From List" || f.type === "Regex Pattern") && (
                          <input
                            value={f.options}
                            onChange={(e) => updateField(f.id, "options", e.target.value)}
                            placeholder={
                              f.type === "From List" ? "a,b,c"
                                : f.type === "Regex Pattern" ? "[A-Z]{3}"
                                  : "value"
                            }
                            style={{ width: 90, fontSize: 12, border: "1px solid #e2e8f0", borderRadius: 7, padding: "7px 10px", fontFamily: "monospace", color: "#0f172a", outline: "none" }}
                          />
                        )}
                        <button
                          onClick={() => removeField(f.id)}
                          style={{ padding: "7px 8px", border: "1px solid #fee2e2", borderRadius: 7, background: "#fff", cursor: "pointer", color: "#ef4444", flexShrink: 0 }}
                        >
                          <Trash2 style={{ width: 13, height: 13 }} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Describe mode */}
              {mode === "describe" && (
                <div>
                  <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 8px" }}>
                    Describe what data you need in plain English:
                  </p>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="E.g. I need test data for a UK bank payee system with payee name, IBAN, sort code, account number and bank name. Include some international payees."
                    rows={6}
                    style={{ width: "100%", fontSize: 13, border: "1px solid #e2e8f0", borderRadius: 9, padding: "12px 14px", lineHeight: 1.65, resize: "vertical", color: "#0f172a", outline: "none", boxSizing: "border-box" }}
                  />
                  <div style={{ marginTop: 8 }}>
                    <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 6px" }}>Example prompts:</p>
                    {[
                      "Customer records for a UK retail bank with full name, email, phone and address",
                      "E-commerce orders with product name, price, quantity and shipping status",
                      "Employee payroll data with salary, department and national insurance number",
                    ].map((ex) => (
                      <button
                        key={ex}
                        onClick={() => setDescription(ex)}
                        style={{ display: "block", width: "100%", textAlign: "left", fontSize: 11, color: "#7c3aed", background: "#f5f3ff", border: "1px solid #ede9fe", borderRadius: 7, padding: "6px 10px", marginBottom: 5, cursor: "pointer", lineHeight: 1.4 }}
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Schema mode */}
              {mode === "schema" && (
                <div>
                  <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 8px" }}>
                    Paste a JSON Schema, SQL CREATE TABLE, or TypeScript interface:
                  </p>
                  <textarea
                    value={schema}
                    onChange={(e) => setSchema(e.target.value)}
                    placeholder={`-- SQL example:\nCREATE TABLE payees (\n  id UUID PRIMARY KEY,\n  payee_name VARCHAR(100),\n  iban VARCHAR(34),\n  bank_name VARCHAR(100)\n);\n\n// Or JSON Schema, TypeScript interface, etc.`}
                    rows={10}
                    style={{ width: "100%", fontSize: 12, fontFamily: "monospace", border: "1px solid #e2e8f0", borderRadius: 9, padding: "12px 14px", lineHeight: 1.65, resize: "vertical", color: "#0f172a", outline: "none", background: "#f8fafc", boxSizing: "border-box" }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Settings */}
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: "18px 20px", marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 14px" }}>
              Generation Settings
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 5 }}>Rows</label>
                <div style={{ position: "relative" }}>
                  <select
                    value={rowCount}
                    onChange={(e) => setRowCount(Number(e.target.value))}
                    style={{ width: "100%", fontSize: 13, border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 28px 8px 12px", appearance: "none", background: "#fff", color: "#0f172a", cursor: "pointer", outline: "none" }}
                  >
                    {ROW_OPTIONS.map((n) => (
                      <option key={n} value={n}>{n} rows</option>
                    ))}
                  </select>
                  <ChevronDown style={{ width: 12, height: 12, position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8" }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 5 }}>Locale</label>
                <div style={{ position: "relative" }}>
                  <select
                    value={locale}
                    onChange={(e) => setLocale(e.target.value)}
                    style={{ width: "100%", fontSize: 13, border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 28px 8px 12px", appearance: "none", background: "#fff", color: "#0f172a", cursor: "pointer", outline: "none" }}
                  >
                    {LOCALES.map((l) => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                  <ChevronDown style={{ width: 12, height: 12, position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8" }} />
                </div>
              </div>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <div
                onClick={() => setIncludeEdgeCases(!includeEdgeCases)}
                style={{
                  width: 40, height: 22, borderRadius: 11,
                  background: includeEdgeCases ? "#7c3aed" : "#e2e8f0",
                  position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0,
                }}
              >
                <div style={{
                  width: 16, height: 16, borderRadius: "50%", background: "#fff",
                  position: "absolute", top: 3, left: includeEdgeCases ? 21 : 3,
                  transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", margin: 0 }}>Include edge cases</p>
                <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>Null, empty, max-length, special chars</p>
              </div>
            </label>
          </div>

          {/* Error */}
          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
              <AlertCircle style={{ width: 16, height: 16, color: "#ef4444", flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: "#ef4444" }}>{error}</span>
            </div>
          )}

          {/* Generate button */}
          <button
            onClick={generate}
            disabled={loading}
            style={{
              width: "100%", padding: "14px 0", borderRadius: 12, border: "none",
              background: loading ? "#a78bfa" : "linear-gradient(135deg,#7c3aed,#4f46e5)",
              color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
              transition: "opacity 0.15s",
            }}
          >
            {loading
              ? <><Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} /> Generating…</>
              : <><Sparkles style={{ width: 18, height: 18 }} /> Generate {rowCount} Rows</>}
          </button>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {!hasData ? (
            /* Empty state */
            <div style={{ background: "#fff", borderRadius: 14, border: "2px dashed #e2e8f0", padding: "64px 32px", textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Database style={{ width: 28, height: 28, color: "#7c3aed" }} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" }}>
                Your data will appear here
              </h3>
              <p style={{ fontSize: 14, color: "#94a3b8", margin: "0 0 24px", lineHeight: 1.6 }}>
                Pick a template or build your fields on the left,<br />then click <strong>Generate</strong>.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
                {["JSON", "CSV", "SQL INSERT", "JavaScript"].map((f) => (
                  <span key={f} style={{ fontSize: 12, fontWeight: 600, color: "#7c3aed", background: "#f5f3ff", border: "1px solid #ede9fe", borderRadius: 20, padding: "4px 12px" }}>
                    {f}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            /* Results */
            <div>
              {/* Toolbar */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, display: "flex", overflow: "hidden" }}>
                  {(["json", "csv", "sql", "js"] as ExportFormat[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setExportFormat(f)}
                      style={{
                        padding: "8px 16px", border: "none",
                        background: exportFormat === f ? "#7c3aed" : "transparent",
                        color: exportFormat === f ? "#fff" : "#64748b",
                        fontSize: 13, fontWeight: 600, cursor: "pointer",
                        borderRight: f !== "js" ? "1px solid #e2e8f0" : "none",
                        transition: "all 0.15s",
                      }}
                    >
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>

                <span style={{ fontSize: 13, color: "#64748b", marginLeft: "auto" }}>
                  <strong style={{ color: "#0f172a" }}>{generatedData.length}</strong> rows · {columns.length} fields
                </span>

                <button
                  onClick={copyToClipboard}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", border: "1px solid #e2e8f0", borderRadius: 9, background: "#fff", fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer" }}
                >
                  {copied ? <Check style={{ width: 14, height: 14, color: "#10b981" }} /> : <Copy style={{ width: 14, height: 14 }} />}
                  {copied ? "Copied!" : "Copy"}
                </button>

                <button
                  onClick={downloadExport}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", border: "none", borderRadius: 9, background: "#7c3aed", fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer" }}
                >
                  <Download style={{ width: 14, height: 14 }} /> Download .{exportFormat === "js" ? "js" : exportFormat}
                </button>

                <button
                  onClick={generate}
                  disabled={loading}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 9, background: "#fff", fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer" }}
                >
                  <RefreshCw style={{ width: 14, height: 14 }} /> Regenerate
                </button>
              </div>

              {/* Preview table */}
              <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden", marginBottom: 14 }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                        <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap", width: 40 }}>#</th>
                        {columns.map((col) => (
                          <th key={col} style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#475569", whiteSpace: "nowrap", fontFamily: "monospace" }}>
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {generatedData.slice(0, 50).map((row, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                          <td style={{ padding: "9px 14px", color: "#cbd5e1", fontSize: 12, fontWeight: 600 }}>{i + 1}</td>
                          {columns.map((col) => {
                            const val = row[col];
                            const display = val === null ? "null" : val === "" ? "(empty)" : String(val);
                            const isNull = val === null || val === undefined;
                            const isEmpty = val === "";
                            return (
                              <td
                                key={col}
                                style={{
                                  padding: "9px 14px",
                                  color: isNull ? "#94a3b8" : isEmpty ? "#94a3b8" : "#0f172a",
                                  fontStyle: isNull || isEmpty ? "italic" : "normal",
                                  fontFamily: "monospace",
                                  fontSize: 12,
                                  maxWidth: 200,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {display}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {generatedData.length > 50 && (
                  <div style={{ padding: "10px 14px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", fontSize: 12, color: "#94a3b8", textAlign: "center" }}>
                    Showing 50 of {generatedData.length} rows — download to see all
                  </div>
                )}
              </div>

              {/* Code view */}
              <div style={{ background: "#0f172a", borderRadius: 14, border: "1px solid #1e293b", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", padding: "10px 16px", borderBottom: "1px solid #1e293b", gap: 8 }}>
                  <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                    {exportFormat === "json" ? "JSON" : exportFormat === "csv" ? "CSV" : exportFormat === "sql" ? "SQL INSERT statements" : "JavaScript const"}
                  </span>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "#475569" }}>
                    {getExportContent().split("\n").length} lines
                  </span>
                </div>
                <pre style={{
                  padding: "16px 20px",
                  margin: 0,
                  fontSize: 12,
                  lineHeight: 1.7,
                  color: "#94a3b8",
                  fontFamily: "monospace",
                  overflowX: "auto",
                  maxHeight: 320,
                  overflowY: "auto",
                }}>
                  {getExportContent().slice(0, 4000)}{getExportContent().length > 4000 ? "\n…truncated (download for full output)" : ""}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Spin animation */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

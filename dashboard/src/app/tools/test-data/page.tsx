"use client";

import { useState, useCallback, type ComponentType } from "react";
import Link from "next/link";
import {
  Plus, Trash2, Download, Copy, Check, Loader2, Database,
  Sparkles, Code2, ChevronDown, TestTube,
  Settings2, AlertCircle, RefreshCw, Lock, User, CreditCard,
  ShoppingCart, Building2, Heart, Zap, Key, Shield, Wifi,
  Package, Bell, Headphones,
} from "lucide-react";

/* ── Types ───────────────────────────────────────────────── */
type FieldDef = { id: string; name: string; type: string; options: string };
type InputMode = "build" | "describe" | "schema" | "template";
type ExportFormat = "json" | "csv" | "sql" | "js";
type TemplateCategory = "all" | "auth" | "finance" | "people" | "commerce";

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

/* ── Template definitions ────────────────────────────────── */
const TEMPLATES = [
  /* ── Auth & Identity ── */
  {
    id: "email-login",
    name: "Email Login",
    category: "auth" as TemplateCategory,
    icon: Lock,
    gradient: "linear-gradient(135deg,#7c3aed,#4f46e5)",
    desc: "Email, password, login attempt fields",
    badge: "Popular",
    fields: [
      { name: "user_id", type: "UUID", options: "" },
      { name: "email", type: "Email", options: "" },
      { name: "password_hash", type: "Alphanumeric ID", options: "" },
      { name: "login_attempt", type: "Integer", options: "1-5" },
      { name: "last_login", type: "DateTime", options: "" },
      { name: "is_active", type: "Boolean", options: "" },
      { name: "ip_address", type: "IP Address", options: "" },
    ],
  },
  {
    id: "phone-otp",
    name: "Phone OTP Login",
    category: "auth" as TemplateCategory,
    icon: Wifi,
    gradient: "linear-gradient(135deg,#0ea5e9,#6366f1)",
    desc: "Phone number, OTP code, expiry",
    badge: "New",
    fields: [
      { name: "session_id", type: "UUID", options: "" },
      { name: "phone_number", type: "Mobile", options: "" },
      { name: "otp_code", type: "Alphanumeric ID", options: "" },
      { name: "expires_at", type: "Future Date", options: "" },
      { name: "attempt_count", type: "Integer", options: "1-3" },
      { name: "verified", type: "Boolean", options: "" },
      { name: "country_code", type: "From List", options: "+1,+44,+49,+33,+91,+61" },
    ],
  },
  {
    id: "user-registration",
    name: "User Registration",
    category: "auth" as TemplateCategory,
    icon: User,
    gradient: "linear-gradient(135deg,#10b981,#0ea5e9)",
    desc: "Sign-up form fields with verification",
    badge: null,
    fields: [
      { name: "user_id", type: "UUID", options: "" },
      { name: "username", type: "Username", options: "" },
      { name: "email", type: "Email", options: "" },
      { name: "password", type: "Password", options: "" },
      { name: "full_name", type: "Full Name", options: "" },
      { name: "date_of_birth", type: "Date of Birth", options: "" },
      { name: "email_verified", type: "Boolean", options: "" },
      { name: "created_at", type: "DateTime", options: "" },
    ],
  },
  {
    id: "oauth-social",
    name: "OAuth / Social Login",
    category: "auth" as TemplateCategory,
    icon: Shield,
    gradient: "linear-gradient(135deg,#f59e0b,#ef4444)",
    desc: "Provider, access token, scope, expiry",
    badge: null,
    fields: [
      { name: "user_id", type: "UUID", options: "" },
      { name: "provider", type: "From List", options: "google,github,facebook,microsoft,apple" },
      { name: "provider_user_id", type: "Alphanumeric ID", options: "" },
      { name: "access_token", type: "API Key", options: "" },
      { name: "refresh_token", type: "API Key", options: "" },
      { name: "scope", type: "From List", options: "read,write,admin,email,profile" },
      { name: "token_expiry", type: "Future Date", options: "" },
      { name: "email", type: "Email", options: "" },
    ],
  },
  {
    id: "session-jwt",
    name: "Session / JWT Token",
    category: "auth" as TemplateCategory,
    icon: Key,
    gradient: "linear-gradient(135deg,#8b5cf6,#ec4899)",
    desc: "Session ID, JWT, device, expiry",
    badge: null,
    fields: [
      { name: "session_id", type: "UUID", options: "" },
      { name: "user_id", type: "UUID", options: "" },
      { name: "jwt_token", type: "API Key", options: "" },
      { name: "device_type", type: "From List", options: "mobile,desktop,tablet,api-client" },
      { name: "ip_address", type: "IP Address", options: "" },
      { name: "created_at", type: "DateTime", options: "" },
      { name: "expires_at", type: "Future Date", options: "" },
      { name: "is_revoked", type: "Boolean", options: "" },
    ],
  },
  {
    id: "api-service",
    name: "API Service Account",
    category: "auth" as TemplateCategory,
    icon: Zap,
    gradient: "linear-gradient(135deg,#06b6d4,#3b82f6)",
    desc: "API keys, rate limits, permissions",
    badge: "Teams",
    fields: [
      { name: "service_id", type: "UUID", options: "" },
      { name: "service_name", type: "Company Name", options: "" },
      { name: "api_key", type: "API Key", options: "" },
      { name: "api_secret", type: "API Key", options: "" },
      { name: "rate_limit_per_min", type: "Integer", options: "60-1000" },
      { name: "permissions", type: "From List", options: "read,write,admin,read+write" },
      { name: "environment", type: "From List", options: "production,staging,development,sandbox" },
      { name: "created_at", type: "DateTime", options: "" },
    ],
  },

  /* ── Finance ── */
  {
    id: "payee",
    name: "Bank Payee",
    category: "finance" as TemplateCategory,
    icon: Building2,
    gradient: "linear-gradient(135deg,#0ea5e9,#2dd4bf)",
    desc: "IBAN, SWIFT, account & sort code",
    badge: "Popular",
    fields: [
      { name: "payee_id", type: "UUID", options: "" },
      { name: "payee_name", type: "Full Name", options: "" },
      { name: "iban", type: "IBAN", options: "" },
      { name: "swift_bic", type: "SWIFT / BIC", options: "" },
      { name: "account_number", type: "Account Number", options: "" },
      { name: "sort_code", type: "Sort Code", options: "" },
      { name: "bank_name", type: "Bank Name", options: "" },
    ],
  },
  {
    id: "transaction",
    name: "Bank Transaction",
    category: "finance" as TemplateCategory,
    icon: CreditCard,
    gradient: "linear-gradient(135deg,#f59e0b,#ef4444)",
    desc: "TX ID, amount, merchant, status",
    badge: null,
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
  {
    id: "credit-card",
    name: "Credit Card",
    category: "finance" as TemplateCategory,
    icon: CreditCard,
    gradient: "linear-gradient(135deg,#7c3aed,#ec4899)",
    desc: "Card number, CVV, expiry, holder",
    badge: null,
    fields: [
      { name: "card_id", type: "UUID", options: "" },
      { name: "cardholder_name", type: "Full Name", options: "" },
      { name: "card_number", type: "Credit Card Number", options: "" },
      { name: "card_expiry", type: "Card Expiry", options: "" },
      { name: "cvv", type: "CVV", options: "" },
      { name: "card_type", type: "From List", options: "Visa,Mastercard,Amex,Discover" },
      { name: "billing_address", type: "Full Address", options: "" },
      { name: "credit_limit", type: "Currency Amount", options: "" },
    ],
  },

  /* ── People ── */
  {
    id: "customer",
    name: "Customer",
    category: "people" as TemplateCategory,
    icon: User,
    gradient: "linear-gradient(135deg,#10b981,#059669)",
    desc: "Name, email, phone, address",
    badge: "Popular",
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
    id: "employee",
    name: "Employee / HR",
    category: "people" as TemplateCategory,
    icon: Building2,
    gradient: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
    desc: "Staff profile with salary & dept",
    badge: null,
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
    category: "people" as TemplateCategory,
    icon: Heart,
    gradient: "linear-gradient(135deg,#ef4444,#f97316)",
    desc: "Patient ID, DOB, diagnosis, blood type",
    badge: null,
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
    id: "address-book",
    name: "Address Book",
    category: "people" as TemplateCategory,
    icon: User,
    gradient: "linear-gradient(135deg,#06b6d4,#0ea5e9)",
    desc: "Contact with full address & phone",
    badge: null,
    fields: [
      { name: "contact_id", type: "UUID", options: "" },
      { name: "full_name", type: "Full Name", options: "" },
      { name: "email", type: "Email", options: "" },
      { name: "phone", type: "Phone", options: "" },
      { name: "street_address", type: "Street Address", options: "" },
      { name: "city", type: "City", options: "" },
      { name: "country", type: "Country", options: "" },
      { name: "postcode", type: "Postcode / ZIP", options: "" },
    ],
  },

  /* ── Commerce ── */
  {
    id: "order",
    name: "E-commerce Order",
    category: "commerce" as TemplateCategory,
    icon: ShoppingCart,
    gradient: "linear-gradient(135deg,#f59e0b,#f97316)",
    desc: "Order ID, product, quantity, status",
    badge: "Popular",
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
    id: "product-catalog",
    name: "Product Catalog",
    category: "commerce" as TemplateCategory,
    icon: Package,
    gradient: "linear-gradient(135deg,#8b5cf6,#7c3aed)",
    desc: "SKU, product name, price, stock",
    badge: null,
    fields: [
      { name: "product_id", type: "UUID", options: "" },
      { name: "sku", type: "Alphanumeric ID", options: "" },
      { name: "product_name", type: "From List", options: "Wireless Mouse,USB Hub,Laptop Stand,Webcam HD,Mechanical Keyboard,Monitor 27in,Headset Pro,Desk Lamp" },
      { name: "category", type: "From List", options: "Electronics,Accessories,Peripherals,Office,Audio" },
      { name: "price", type: "Currency Amount", options: "" },
      { name: "stock_quantity", type: "Integer", options: "0-500" },
      { name: "is_active", type: "Boolean", options: "" },
    ],
  },
  {
    id: "subscription",
    name: "Subscription / SaaS",
    category: "commerce" as TemplateCategory,
    icon: Bell,
    gradient: "linear-gradient(135deg,#10b981,#3b82f6)",
    desc: "Plan, billing cycle, renewal date",
    badge: null,
    fields: [
      { name: "subscription_id", type: "UUID", options: "" },
      { name: "customer_email", type: "Email", options: "" },
      { name: "plan", type: "From List", options: "free,starter,pro,enterprise" },
      { name: "billing_cycle", type: "From List", options: "monthly,annual" },
      { name: "amount", type: "Currency Amount", options: "" },
      { name: "status", type: "From List", options: "active,trialing,cancelled,past_due" },
      { name: "renewal_date", type: "Future Date", options: "" },
    ],
  },
  {
    id: "support-ticket",
    name: "Support Ticket",
    category: "commerce" as TemplateCategory,
    icon: Headphones,
    gradient: "linear-gradient(135deg,#ef4444,#8b5cf6)",
    desc: "Ticket ID, priority, status, assignee",
    badge: null,
    fields: [
      { name: "ticket_id", type: "Alphanumeric ID", options: "" },
      { name: "customer_name", type: "Full Name", options: "" },
      { name: "email", type: "Email", options: "" },
      { name: "subject", type: "From List", options: "Login issue,Payment failed,Feature request,Bug report,Account access,Billing query" },
      { name: "priority", type: "From List", options: "critical,high,medium,low" },
      { name: "status", type: "From List", options: "open,in_progress,resolved,closed" },
      { name: "created_at", type: "DateTime", options: "" },
      { name: "assigned_to", type: "Full Name", options: "" },
    ],
  },
];

const CATEGORY_TABS: { id: TemplateCategory; label: string; color: string }[] = [
  { id: "all", label: "All Templates", color: "#64748b" },
  { id: "auth", label: "Auth & Identity", color: "#7c3aed" },
  { id: "finance", label: "Finance", color: "#0ea5e9" },
  { id: "people", label: "People", color: "#10b981" },
  { id: "commerce", label: "Commerce", color: "#f59e0b" },
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

/* ── Badge colours ───────────────────────────────────────── */
const BADGE_STYLES: Record<string, { bg: string; color: string }> = {
  Popular: { bg: "#fef3c7", color: "#d97706" },
  New: { bg: "#dcfce7", color: "#16a34a" },
  Teams: { bg: "#ede9fe", color: "#7c3aed" },
};

/* ── Page ────────────────────────────────────────────────── */
export default function TestDataPage() {
  const [mode, setMode] = useState<InputMode>("template");
  const [fields, setFields] = useState<FieldDef[]>(
    TEMPLATES[0].fields.map((f) => ({ ...f, id: uid() }))
  );
  const [rowCount, setRowCount] = useState(10);
  const [locale, setLocale] = useState("en-GB");
  const [includeEdgeCases, setIncludeEdgeCases] = useState(false);
  const [description, setDescription] = useState("");
  const [schema, setSchema] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedData, setGeneratedData] = useState<Record<string, unknown>[]>([]);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("json");
  const [copied, setCopied] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState("email-login");
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>("all");

  const filteredTemplates = activeCategory === "all"
    ? TEMPLATES
    : TEMPLATES.filter((t) => t.category === activeCategory);

  /* ── Field management ── */
  const addField = () =>
    setFields((f) => [...f, { id: uid(), name: "", type: "Full Name", options: "" }]);

  const removeField = (id: string) =>
    setFields((f) => f.filter((x) => x.id !== id));

  const updateField = (id: string, key: keyof FieldDef, val: string) =>
    setFields((f) => f.map((x) => (x.id === id ? { ...x, [key]: val } : x)));

  const applyTemplate = useCallback((tplId: string) => {
    if (tplId === "custom") {
      setActiveTemplate("custom");
      setFields([{ id: uid(), name: "", type: "Full Name", options: "" }]);
      setMode("build");
      return;
    }
    const tpl = TEMPLATES.find((t) => t.id === tplId);
    if (!tpl) return;
    setActiveTemplate(tplId);
    setFields(tpl.fields.map((f) => ({ ...f, id: uid() })));
    setMode("build");
  }, []);

  /* ── Generate ── */
  async function generate() {
    setError("");
    if (mode === "build" && fields.length === 0) { setError("Add at least one field."); return; }
    if (mode === "describe" && !description.trim()) { setError("Enter a description."); return; }
    if (mode === "schema" && !schema.trim()) { setError("Paste a schema."); return; }
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
    const mime = exportFormat === "json" ? "application/json"
      : exportFormat === "csv" ? "text/csv" : "text/plain";
    downloadFile(content, `test-data.${ext}`, mime);
  }

  const columns = generatedData.length > 0 ? Object.keys(generatedData[0]) : [];
  const hasData = generatedData.length > 0;
  const activeTpl = TEMPLATES.find((t) => t.id === activeTemplate);

  return (
    <div className="min-h-screen" style={{ background: "#f1f5f9", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* ── Nav ── */}
      <nav className="td-nav" style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 24px", display: "flex", alignItems: "center", height: 56, gap: 20, position: "sticky", top: 0, zIndex: 50, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", flexShrink: 0 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TestTube style={{ width: 14, height: 14, color: "#fff" }} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>AITestCraft</span>
        </Link>
        <div style={{ flex: 1 }} />
        <Link className="td-nav-link" href="/dashboard" style={{ fontSize: 13, color: "#64748b", textDecoration: "none", fontWeight: 500 }}>Test Generator</Link>
        <Link className="td-nav-link" href="/resume-builder" style={{ fontSize: 13, color: "#64748b", textDecoration: "none", fontWeight: 500 }}>Resume Builder</Link>
        <Link className="td-nav-link" href="/blog" style={{ fontSize: 13, color: "#64748b", textDecoration: "none", fontWeight: 500 }}>Blog</Link>
        <Link href="/sign-up" style={{ fontSize: 13, fontWeight: 700, color: "#fff", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", borderRadius: 8, padding: "7px 16px", textDecoration: "none", flexShrink: 0, whiteSpace: "nowrap" }}>
          Get Started Free
        </Link>
      </nav>

      {/* ── Hero header ── */}
      <div style={{ background: "linear-gradient(135deg,#0a0f1e 0%,#1a0a2e 50%,#0a1628 100%)", padding: "44px 24px 52px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* Grid overlay */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(124,58,237,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.05) 1px,transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.35)", borderRadius: 20, padding: "5px 14px", marginBottom: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a78bfa", display: "inline-block", animation: "pulse 2s infinite" }} />
            <Database style={{ width: 13, height: 13, color: "#a78bfa" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#a78bfa" }}>AI-Powered Test Data Generator</span>
          </div>

          <h1 style={{ fontSize: "clamp(28px,5vw,44px)", fontWeight: 900, color: "#fff", margin: "0 0 14px", lineHeight: 1.1, letterSpacing: "-0.5px" }}>
            Generate Realistic<br />
            <span style={{ background: "linear-gradient(135deg,#a78bfa,#60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Test Data Instantly</span>
          </h1>
          <p style={{ fontSize: 16, color: "#94a3b8", margin: "0 auto 24px", maxWidth: 560, lineHeight: 1.75 }}>
            17 smart templates across Auth, Finance, People & Commerce. Build fields,
            describe in plain English, or paste your schema — export as JSON, CSV or SQL.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
            {[
              { n: "17", l: "Templates" },
              { n: "1,000", l: "Max rows" },
              { n: "4", l: "Export formats" },
              { n: "Free", l: "Always" },
            ].map(({ n, l }) => (
              <div key={l} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 20px", textAlign: "center", minWidth: 80 }}>
                <p style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: 0 }}>{n}</p>
                <p style={{ fontSize: 11, color: "#64748b", margin: 0, marginTop: 2 }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="td-main" style={{ padding: "28px 24px", display: "flex", gap: 24, alignItems: "flex-start" }}>

        {/* ── LEFT PANEL ── */}
        <div className="td-left" style={{ flex: "0 0 500px", minWidth: 0 }}>

          {/* Template gallery — dark glass panel */}
          <div style={{
            background: "linear-gradient(145deg,#0d1221 0%,#130d24 50%,#0a1628 100%)",
            borderRadius: 20,
            border: "1px solid rgba(255,255,255,0.08)",
            padding: "22px",
            marginBottom: 16,
            boxShadow: "0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Subtle glow orb */}
            <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,0.18) 0%,transparent 70%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -40, left: -40, width: 150, height: 150, borderRadius: "50%", background: "radial-gradient(circle,rgba(79,70,229,0.12) 0%,transparent 70%)", pointerEvents: "none" }} />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Database style={{ width: 15, height: 15, color: "#a78bfa" }} />
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>Templates</p>
                </div>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "2px 10px" }}>
                  {filteredTemplates.length} of {TEMPLATES.length}
                </span>
              </div>

              {/* Category filter */}
              <div style={{ display: "flex", gap: 6, marginBottom: 18, overflowX: "auto", paddingBottom: 4 }}>
                {CATEGORY_TABS.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    style={{
                      padding: "5px 13px", borderRadius: 20,
                      border: `1px solid ${activeCategory === cat.id ? cat.color : "rgba(255,255,255,0.12)"}`,
                      background: activeCategory === cat.id ? cat.color : "rgba(255,255,255,0.05)",
                      color: activeCategory === cat.id ? "#fff" : "rgba(255,255,255,0.5)",
                      fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                      transition: "all 0.15s",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Template grid */}
              <div className="td-tpl-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxHeight: 460, overflowY: "auto" }}>

                {/* Custom / blank card */}
                <button
                  onClick={() => applyTemplate("custom")}
                  style={{
                    gridColumn: "1 / -1",
                    border: `1.5px dashed ${activeTemplate === "custom" ? "rgba(167,139,250,0.8)" : "rgba(255,255,255,0.15)"}`,
                    borderRadius: 14,
                    background: activeTemplate === "custom"
                      ? "rgba(124,58,237,0.18)"
                      : "rgba(255,255,255,0.03)",
                    cursor: "pointer",
                    textAlign: "left",
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    transition: "all 0.2s",
                    boxShadow: activeTemplate === "custom" ? "0 0 0 1px rgba(124,58,237,0.4), 0 4px 20px rgba(124,58,237,0.2)" : "none",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: activeTemplate === "custom" ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                    <Plus style={{ width: 18, height: 18, color: activeTemplate === "custom" ? "#fff" : "rgba(255,255,255,0.45)" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: activeTemplate === "custom" ? "#c4b5fd" : "rgba(255,255,255,0.85)", margin: "0 0 3px" }}>
                      Custom / Blank
                    </p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: 0 }}>
                      Start from scratch — define your own fields
                    </p>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 10, background: "rgba(99,102,241,0.25)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.3)", flexShrink: 0 }}>
                    DIY
                  </span>
                </button>

                {filteredTemplates.map((t) => {
                  const Icon = t.icon as ComponentType<{ style?: React.CSSProperties }>;
                  const isActive = activeTemplate === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => applyTemplate(t.id)}
                      style={{
                        border: `1px solid ${isActive ? "rgba(167,139,250,0.6)" : "rgba(255,255,255,0.08)"}`,
                        borderRadius: 14,
                        background: isActive
                          ? "rgba(124,58,237,0.2)"
                          : "rgba(255,255,255,0.04)",
                        cursor: "pointer",
                        textAlign: "left",
                        padding: 0,
                        overflow: "hidden",
                        transition: "all 0.2s",
                        boxShadow: isActive
                          ? "0 0 0 1px rgba(124,58,237,0.35), 0 8px 24px rgba(124,58,237,0.18)"
                          : "0 2px 8px rgba(0,0,0,0.2)",
                        backdropFilter: "blur(12px)",
                      }}
                    >
                      {/* Gradient top bar */}
                      <div style={{ height: 3, background: t.gradient }} />
                      <div style={{ padding: "14px 14px 13px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: t.gradient, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 12px rgba(0,0,0,0.3)` }}>
                            <Icon style={{ width: 17, height: 17, color: "#fff" }} />
                          </div>
                          {t.badge && BADGE_STYLES[t.badge] && (
                            <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: BADGE_STYLES[t.badge].bg, color: BADGE_STYLES[t.badge].color }}>
                              {t.badge}
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: isActive ? "#c4b5fd" : "rgba(255,255,255,0.9)", margin: "0 0 4px", lineHeight: 1.3 }}>{t.name}</p>
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.5 }}>{t.desc}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
                          <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.06)", borderRadius: 6, padding: "2px 7px", border: "1px solid rgba(255,255,255,0.08)" }}>
                            {t.fields.length} fields
                          </span>
                        </div>
                    </div>
                  </button>
                );
              })}
            </div>
            </div>{/* end position:relative */}
          </div>

          {/* Input mode tabs */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden", marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0" }}>
              {([
                { id: "build", icon: Settings2, label: "Build" },
                { id: "describe", icon: Sparkles, label: "Describe" },
                { id: "schema", icon: Code2, label: "Schema" },
              ] as { id: InputMode; icon: ComponentType<{ style?: object }>; label: string }[]).map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setMode(id)}
                  style={{
                    flex: 1, padding: "12px 0", border: "none",
                    borderBottom: `2px solid ${mode === id ? "#7c3aed" : "transparent"}`,
                    background: mode === id ? "#faf5ff" : "transparent",
                    fontSize: 12, fontWeight: mode === id ? 700 : 500,
                    color: mode === id ? "#7c3aed" : "#64748b",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                    transition: "all 0.15s",
                  }}
                >
                  <Icon style={{ width: 13, height: 13 }} />
                  {label}
                </button>
              ))}
            </div>

            <div style={{ padding: "16px 18px" }}>

              {/* Build mode */}
              {mode === "build" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{fields.length} fields</span>
                      {activeTemplate === "custom"
                        ? <span style={{ fontSize: 10, color: "#7c3aed", marginLeft: 6, fontWeight: 600 }}>Custom schema</span>
                        : activeTpl && <span style={{ fontSize: 10, color: "#94a3b8", marginLeft: 6 }}>from {activeTpl.name}</span>
                      }
                    </div>
                    <button
                      onClick={addField}
                      style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "#7c3aed", background: "#f5f3ff", border: "1px solid #ede9fe", borderRadius: 7, padding: "5px 10px", cursor: "pointer" }}
                    >
                      <Plus style={{ width: 12, height: 12 }} /> Add Field
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7, maxHeight: 380, overflowY: "auto", paddingRight: 2 }}>
                    {fields.map((f, i) => (
                      <div key={f.id} style={{ display: "flex", gap: 5, alignItems: "center", background: "#f8fafc", borderRadius: 9, padding: "6px 8px", border: "1px solid #f1f5f9" }}>
                        <span style={{ width: 20, height: 20, borderRadius: 5, background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#4f46e5", flexShrink: 0 }}>{i + 1}</span>
                        <input
                          value={f.name}
                          onChange={(e) => updateField(f.id, "name", e.target.value)}
                          placeholder="field_name"
                          style={{ flex: 1, minWidth: 0, fontSize: 12, border: "1px solid #e2e8f0", borderRadius: 6, padding: "5px 8px", fontFamily: "monospace", color: "#0f172a", outline: "none", background: "#fff" }}
                        />
                        <div style={{ position: "relative" }}>
                          <select
                            value={f.type}
                            onChange={(e) => updateField(f.id, "type", e.target.value)}
                            style={{ fontSize: 11, border: "1px solid #e2e8f0", borderRadius: 6, padding: "5px 22px 5px 8px", appearance: "none", background: "#fff", color: "#0f172a", cursor: "pointer", outline: "none", maxWidth: 130 }}
                          >
                            {FIELD_GROUPS.map((g) => (
                              <optgroup key={g.group} label={g.group}>
                                {g.types.map((t) => <option key={t} value={t}>{t}</option>)}
                              </optgroup>
                            ))}
                          </select>
                          <ChevronDown style={{ width: 10, height: 10, position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8" }} />
                        </div>
                        {(f.type === "Constant Value" || f.type === "From List" || f.type === "Regex Pattern") && (
                          <input
                            value={f.options}
                            onChange={(e) => updateField(f.id, "options", e.target.value)}
                            placeholder={f.type === "From List" ? "a,b,c" : f.type === "Regex Pattern" ? "[A-Z]{3}" : "value"}
                            style={{ width: 80, fontSize: 11, border: "1px solid #e2e8f0", borderRadius: 6, padding: "5px 8px", fontFamily: "monospace", color: "#0f172a", outline: "none", background: "#fff" }}
                          />
                        )}
                        <button
                          onClick={() => removeField(f.id)}
                          style={{ padding: "5px 6px", border: "1px solid #fee2e2", borderRadius: 6, background: "#fff5f5", cursor: "pointer", color: "#ef4444", flexShrink: 0 }}
                        >
                          <Trash2 style={{ width: 11, height: 11 }} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Describe mode */}
              {mode === "describe" && (
                <div>
                  <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 8px", lineHeight: 1.5 }}>
                    Describe what data you need in plain English:
                  </p>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="E.g. I need test data for a UK bank payee system with payee name, IBAN, sort code, account number and bank name. Include some international payees."
                    rows={5}
                    style={{ width: "100%", fontSize: 13, border: "1px solid #e2e8f0", borderRadius: 10, padding: "11px 13px", lineHeight: 1.65, resize: "vertical", color: "#0f172a", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                  />
                  <p style={{ fontSize: 11, color: "#94a3b8", margin: "10px 0 6px" }}>Try an example:</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {[
                      "Login test data with email, password hash, MFA code and last login timestamp",
                      "Customer records for a UK retail bank with full name, email, phone and address",
                      "E-commerce orders with product name, price, quantity and shipping status",
                    ].map((ex) => (
                      <button
                        key={ex}
                        onClick={() => setDescription(ex)}
                        style={{ textAlign: "left", fontSize: 11, color: "#7c3aed", background: "#f5f3ff", border: "1px solid #ede9fe", borderRadius: 7, padding: "7px 10px", cursor: "pointer", lineHeight: 1.5 }}
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
                  <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 8px", lineHeight: 1.5 }}>
                    Paste a JSON Schema, SQL CREATE TABLE, or TypeScript interface:
                  </p>
                  <textarea
                    value={schema}
                    onChange={(e) => setSchema(e.target.value)}
                    placeholder={`-- SQL example:\nCREATE TABLE users (\n  id UUID PRIMARY KEY,\n  email VARCHAR(255),\n  password_hash TEXT,\n  created_at TIMESTAMP\n);`}
                    rows={10}
                    style={{ width: "100%", fontSize: 12, fontFamily: "monospace", border: "1px solid #e2e8f0", borderRadius: 10, padding: "11px 13px", lineHeight: 1.65, resize: "vertical", color: "#0f172a", outline: "none", background: "#f8fafc", boxSizing: "border-box" }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Settings */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: "18px 18px", marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 14px" }}>Settings</p>
            <div className="td-settings-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 5 }}>Rows</label>
                <div style={{ position: "relative" }}>
                  <select
                    value={rowCount}
                    onChange={(e) => setRowCount(Number(e.target.value))}
                    style={{ width: "100%", fontSize: 13, border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 28px 8px 11px", appearance: "none", background: "#fff", color: "#0f172a", cursor: "pointer", outline: "none" }}
                  >
                    {ROW_OPTIONS.map((n) => <option key={n} value={n}>{n} rows</option>)}
                  </select>
                  <ChevronDown style={{ width: 11, height: 11, position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8" }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 5 }}>Locale</label>
                <div style={{ position: "relative" }}>
                  <select
                    value={locale}
                    onChange={(e) => setLocale(e.target.value)}
                    style={{ width: "100%", fontSize: 12, border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 28px 8px 11px", appearance: "none", background: "#fff", color: "#0f172a", cursor: "pointer", outline: "none" }}
                  >
                    {LOCALES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                  <ChevronDown style={{ width: 11, height: 11, position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8" }} />
                </div>
              </div>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <div
                onClick={() => setIncludeEdgeCases(!includeEdgeCases)}
                style={{ width: 40, height: 22, borderRadius: 11, background: includeEdgeCases ? "#7c3aed" : "#e2e8f0", position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}
              >
                <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: includeEdgeCases ? 21 : 3, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", margin: 0 }}>Include edge cases</p>
                <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>Null, empty, max-length, special chars</p>
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
              background: loading ? "#a78bfa" : "linear-gradient(135deg,#7c3aed,#4f46e5)",
              color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
              transition: "opacity 0.15s",
              letterSpacing: "-0.2px",
            }}
          >
            {loading
              ? <><Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} /> Generating…</>
              : <><Sparkles style={{ width: 18, height: 18 }} /> Generate {rowCount} Rows</>}
          </button>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="td-right" style={{ flex: 1, minWidth: 0 }}>
          {!hasData ? (
            /* ── Empty state ── */
            <div style={{ background: "#fff", borderRadius: 16, border: "2px dashed #e2e8f0", padding: "60px 32px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div style={{ width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg,#f5f3ff,#ede9fe)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 4px 12px rgba(124,58,237,0.15)" }}>
                <Database style={{ width: 32, height: 32, color: "#7c3aed" }} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 8px", letterSpacing: "-0.3px" }}>
                Your data will appear here
              </h3>
              <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 28px", lineHeight: 1.7 }}>
                Pick a template from the left and click <strong style={{ color: "#7c3aed" }}>Generate</strong><br />
                — or describe your schema in plain English.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 480, margin: "0 auto" }}>
                {[
                  { icon: "🔐", title: "Auth & Identity", desc: "Login, OTP, OAuth, JWT — 6 templates", color: "#7c3aed", bg: "#f5f3ff" },
                  { icon: "💰", title: "Finance", desc: "Payee, transactions, credit cards", color: "#0ea5e9", bg: "#f0f9ff" },
                  { icon: "👥", title: "People", desc: "Customers, employees, patients", color: "#10b981", bg: "#f0fdf4" },
                  { icon: "🛒", title: "Commerce", desc: "Orders, products, subscriptions", color: "#f59e0b", bg: "#fffbeb" },
                ].map(({ icon, title, desc, color, bg }) => (
                  <div key={title} style={{ background: bg, border: `1px solid ${color}22`, borderRadius: 12, padding: "16px", textAlign: "left" }}>
                    <span style={{ fontSize: 24 }}>{icon}</span>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: "8px 0 4px" }}>{title}</p>
                    <p style={{ fontSize: 11, color: "#64748b", margin: 0, lineHeight: 1.5 }}>{desc}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24, flexWrap: "wrap" }}>
                {["JSON", "CSV", "SQL INSERT", "JavaScript"].map((f) => (
                  <span key={f} style={{ fontSize: 11, fontWeight: 600, color: "#7c3aed", background: "#f5f3ff", border: "1px solid #ede9fe", borderRadius: 20, padding: "4px 12px" }}>
                    {f}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            /* ── Results ── */
            <div>
              {/* Toolbar */}
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>

                {/* Format selector */}
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 9, display: "flex", overflow: "hidden" }}>
                  {(["json", "csv", "sql", "js"] as ExportFormat[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setExportFormat(f)}
                      style={{
                        padding: "6px 14px", border: "none",
                        background: exportFormat === f ? "#7c3aed" : "transparent",
                        color: exportFormat === f ? "#fff" : "#64748b",
                        fontSize: 12, fontWeight: 700, cursor: "pointer",
                        borderRight: f !== "js" ? "1px solid #e2e8f0" : "none",
                        transition: "all 0.15s",
                        letterSpacing: "0.3px",
                      }}
                    >
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>

                <span style={{ fontSize: 12, color: "#64748b", marginLeft: "auto" }}>
                  <strong style={{ color: "#0f172a" }}>{generatedData.length}</strong> rows · <strong style={{ color: "#0f172a" }}>{columns.length}</strong> fields
                </span>

                <button
                  onClick={copyToClipboard}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", fontSize: 12, fontWeight: 600, color: "#475569", cursor: "pointer", transition: "all 0.15s" }}
                >
                  {copied ? <Check style={{ width: 13, height: 13, color: "#10b981" }} /> : <Copy style={{ width: 13, height: 13 }} />}
                  {copied ? "Copied!" : "Copy"}
                </button>

                <button
                  onClick={downloadExport}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", border: "none", borderRadius: 8, background: "#7c3aed", fontSize: 12, fontWeight: 600, color: "#fff", cursor: "pointer", boxShadow: "0 2px 8px rgba(124,58,237,0.3)" }}
                >
                  <Download style={{ width: 13, height: 13 }} /> .{exportFormat === "js" ? "js" : exportFormat}
                </button>

                <button
                  onClick={generate}
                  disabled={loading}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", fontSize: 12, fontWeight: 600, color: "#475569", cursor: "pointer" }}
                >
                  <RefreshCw style={{ width: 13, height: 13 }} /> Regenerate
                </button>
              </div>

              {/* Preview table */}
              <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden", marginBottom: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                        <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap", width: 36 }}>#</th>
                        {columns.map((col) => (
                          <th key={col} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#475569", whiteSpace: "nowrap", fontFamily: "monospace" }}>
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {generatedData.slice(0, 50).map((row, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                          <td style={{ padding: "8px 14px", color: "#cbd5e1", fontSize: 11, fontWeight: 600 }}>{i + 1}</td>
                          {columns.map((col) => {
                            const val = row[col];
                            const display = val === null ? "null" : val === "" ? "(empty)" : String(val);
                            const isNull = val === null || val === undefined;
                            const isEmpty = val === "";
                            return (
                              <td
                                key={col}
                                title={display}
                                style={{
                                  padding: "8px 14px",
                                  color: isNull ? "#94a3b8" : isEmpty ? "#94a3b8" : "#1e293b",
                                  fontStyle: isNull || isEmpty ? "italic" : "normal",
                                  fontFamily: "monospace",
                                  fontSize: 12,
                                  maxWidth: 180,
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
                    Showing 50 of <strong style={{ color: "#475569" }}>{generatedData.length}</strong> rows — download to see all
                  </div>
                )}
              </div>

              {/* Code panel — macOS style */}
              <div style={{ background: "#0d1117", borderRadius: 14, border: "1px solid #21262d", overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}>
                {/* Window chrome */}
                <div style={{ display: "flex", alignItems: "center", padding: "10px 16px", borderBottom: "1px solid #21262d", background: "#161b22", gap: 8 }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f56" }} />
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ffbd2e" }} />
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#27c93f" }} />
                  </div>
                  <span style={{ fontSize: 11, color: "#8b949e", marginLeft: 8, fontFamily: "monospace" }}>
                    test-data.{exportFormat === "js" ? "js" : exportFormat}
                  </span>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "#484f58" }}>
                    {getExportContent().split("\n").length} lines
                  </span>
                </div>
                <pre style={{
                  padding: "18px 20px",
                  margin: 0,
                  fontSize: 12,
                  lineHeight: 1.75,
                  color: "#e6edf3",
                  fontFamily: "'Fira Code', 'JetBrains Mono', 'Cascadia Code', monospace",
                  overflowX: "auto",
                  maxHeight: 340,
                  overflowY: "auto",
                }}>
                  {getExportContent().slice(0, 5000)}{getExportContent().length > 5000 ? "\n\n// … truncated — download for full output" : ""}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        ::-webkit-scrollbar       { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        /* ── Layout: full-width, side-by-side ── */
        .td-main {
          width: 100%;
          box-sizing: border-box;
        }
        .td-left  { flex: 0 0 500px; min-width: 0; }
        .td-right { flex: 1; min-width: 0; }

        /* ── Tablet (<= 1100px): narrow left panel ── */
        @media (max-width: 1100px) {
          .td-main  { padding: 20px 16px; }
          .td-left  { flex: 0 0 420px; }
        }

        /* ── Small tablet (<= 860px): compress further ── */
        @media (max-width: 860px) {
          .td-left  { flex: 0 0 360px; }
          .td-tpl-grid { grid-template-columns: 1fr !important; }
        }

        /* ── Mobile (<= 680px): stack vertically ── */
        @media (max-width: 680px) {
          .td-nav { padding: 0 16px !important; gap: 12px !important; }
          .td-nav-link { display: none !important; }
          .td-main  { flex-direction: column !important; padding: 16px 12px !important; gap: 16px !important; }
          .td-left  { flex: none !important; width: 100% !important; }
          .td-right { width: 100% !important; }
          .td-tpl-grid { grid-template-columns: 1fr 1fr !important; max-height: none !important; }
          .td-settings-grid { grid-template-columns: 1fr 1fr !important; }
        }

        /* ── Very small mobile (<= 420px): single column cards ── */
        @media (max-width: 420px) {
          .td-tpl-grid { grid-template-columns: 1fr !important; }
          .td-settings-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

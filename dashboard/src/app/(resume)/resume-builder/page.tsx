"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  ArrowRight, Upload, Sparkles, CheckCircle2, Zap,
  FileText, BarChart3, Download, ChevronRight, ChevronLeft, Star,
} from "lucide-react";
import { SAMPLE_RESUME } from "@/lib/resume/parser";
import type { ResumeData } from "@/types/resume";

/* ── Lazy-load templates ────────────────────────────────────── */
const ClassicWhite   = dynamic(() => import("@/components/resume/templates/ClassicWhite"),   { ssr: false, loading: () => <TemplateSkeleton bg="#ffffff" /> });
const TwoColumnClean = dynamic(() => import("@/components/resume/templates/TwoColumnClean"), { ssr: false, loading: () => <TemplateSkeleton bg="#ffffff" /> });
const EditorialBloom = dynamic(() => import("@/components/resume/templates/EditorialBloom"), { ssr: false, loading: () => <TemplateSkeleton bg="#faf8f4" /> });
const MintFresh      = dynamic(() => import("@/components/resume/templates/MintFresh"),      { ssr: false, loading: () => <TemplateSkeleton bg="#f6fef9" /> });
const ObsidianGold   = dynamic(() => import("@/components/resume/templates/ObsidianGold"),   { ssr: false, loading: () => <TemplateSkeleton bg="#0e0e16" /> });

const TEMPLATES: { id: string; name: string; role: string; accent: string; Component: React.ComponentType<{ data: ResumeData }> }[] = [
  { id: "classic-white",    name: "Classic White",    role: "All QA Roles · ATS Optimised",  accent: "#2563eb", Component: ClassicWhite },
  { id: "two-column-clean", name: "Two Column",       role: "Senior QA / QA Lead",           accent: "#2563eb", Component: TwoColumnClean },
  { id: "editorial-bloom",  name: "Editorial Bloom",  role: "QA Lead / People Manager",      accent: "#FF6B9D", Component: EditorialBloom },
  { id: "mint-fresh",       name: "Mint Fresh",       role: "API / Backend QA Engineer",     accent: "#4CAF7D", Component: MintFresh },
  { id: "obsidian-gold",    name: "Obsidian Gold",    role: "QA Architect / Senior Lead",    accent: "#C9A84C", Component: ObsidianGold },
];

/* ── Skeleton ──────────────────────────────────────────────── */
function TemplateSkeleton({ bg }: { bg: string }) {
  return <div style={{ width: 794, minHeight: 1123, background: bg }} />;
}

/* ══════════════════════════════════════════════════════════════
   HERO RESUME MOCKUP — rotating resume with floating UI cards
   ══════════════════════════════════════════════════════════════ */
const ACCENT_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

function HeroMockup() {
  const [activeColor, setActiveColor] = useState(0);
  const [activeTemplate, setActiveTemplate] = useState(0);

  // Auto-rotate every 3 seconds
  useEffect(() => {
    const t = setInterval(() => {
      setActiveTemplate(i => (i + 1) % TEMPLATES.length);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const tpl = TEMPLATES[activeTemplate];
  const { Component } = tpl;
  const PREVIEW_W = 260;
  const sc = PREVIEW_W / 794;
  const PREVIEW_H = Math.round(1123 * sc);

  return (
    <div style={{ position: "relative", width: 460, height: 520, flexShrink: 0 }}>

      {/* Main resume card — slightly tilted */}
      <motion.div
        key={activeTemplate}
        initial={{ opacity: 0, rotateY: -15, scale: 0.92 }}
        animate={{ opacity: 1, rotateY: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          position: "absolute", left: 80, top: 30,
          background: "#fff",
          borderRadius: 16,
          padding: 8,
          boxShadow: "0 32px 80px rgba(0,0,0,0.22)",
          transform: "perspective(1000px) rotateY(-4deg) rotateX(2deg)",
          zIndex: 2,
        }}
      >
        <div style={{ width: PREVIEW_W, height: PREVIEW_H, overflow: "hidden", borderRadius: 10 }}>
          <div style={{ transform: `scale(${sc})`, transformOrigin: "top left", width: 794, pointerEvents: "none" }}>
            <Component data={SAMPLE_RESUME} />
          </div>
        </div>
      </motion.div>

      {/* Template strip — left floating card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        style={{
          position: "absolute", left: 0, top: 80, zIndex: 10,
          background: "#fff", borderRadius: 12,
          padding: "10px 8px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.16)",
          width: 72,
        }}
      >
        <p style={{ fontSize: 7, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px", textAlign: "center" }}>
          Templates
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {TEMPLATES.slice(0, 4).map((t, i) => {
            const Mini = t.Component;
            const ms = 54 / 794;
            return (
              <button key={t.id} onClick={() => setActiveTemplate(i)}
                style={{
                  border: activeTemplate === i ? `2px solid ${t.accent}` : "2px solid #e5e7eb",
                  borderRadius: 6, overflow: "hidden", width: 54, height: Math.round(1123 * ms),
                  background: "transparent", padding: 0, cursor: "pointer",
                  boxShadow: activeTemplate === i ? `0 0 0 2px ${t.accent}33` : "none",
                  transition: "border-color 0.2s",
                }}>
                <div style={{ transform: `scale(${ms})`, transformOrigin: "top left", width: 794, pointerEvents: "none" }}>
                  <Mini data={SAMPLE_RESUME} />
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Color picker floating card — bottom right */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        style={{
          position: "absolute", right: 0, bottom: 40, zIndex: 10,
          background: "#fff", borderRadius: 14,
          padding: "12px 14px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.16)",
          minWidth: 160,
        }}
      >
        <p style={{ fontSize: 9, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>
          Accent Color
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {ACCENT_COLORS.map((c, i) => (
            <button key={c} onClick={() => setActiveColor(i)}
              style={{
                width: 22, height: 22, borderRadius: "50%", background: c,
                border: activeColor === i ? `2px solid #111` : "2px solid transparent",
                outline: activeColor === i ? `2px solid ${c}` : "none",
                outlineOffset: 2,
                cursor: "pointer", padding: 0, transition: "transform 0.15s",
                transform: activeColor === i ? "scale(1.2)" : "scale(1)",
              }}
            />
          ))}
        </div>
        <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
          <span style={{ fontSize: 9, color: "#6b7280" }}>ATS Optimised</span>
          <CheckCircle2 style={{ width: 10, height: 10, color: "#10b981", marginLeft: "auto" }} />
        </div>
      </motion.div>

      {/* "HIRED" badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, type: "spring", stiffness: 300 }}
        style={{
          position: "absolute", right: 20, top: 20, zIndex: 12,
          background: "#10b981", color: "#fff",
          borderRadius: 99, padding: "5px 14px",
          fontSize: 11, fontWeight: 800, letterSpacing: "0.1em",
          boxShadow: "0 4px 16px #10b98144",
        }}
      >
        HIRED ✓
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CAROUSEL — 3 cards, light section
   ══════════════════════════════════════════════════════════════ */
const CARD_W = 330;

function RealPreview({ t, featured = false }: { t: typeof TEMPLATES[0]; featured?: boolean }) {
  const { Component } = t;
  const w = featured ? Math.round(CARD_W * 1.09) : CARD_W;
  const h = Math.round(w / 794 * 1123);
  const sc = w / 794;
  return (
    <div style={{
      background: "#fff", borderRadius: 18, padding: 10,
      boxShadow: featured ? "0 32px 80px rgba(0,0,0,0.22), 0 0 0 2px #2563eb44" : "0 6px 28px rgba(0,0,0,0.12)",
      border: featured ? "2px solid #2563eb33" : "1px solid #e5e7eb",
      flexShrink: 0,
    }}>
      <div style={{ width: w, height: h, overflow: "hidden", borderRadius: 10, position: "relative" }}>
        <div style={{ transform: `scale(${sc})`, transformOrigin: "top left", width: 794, pointerEvents: "none" }}>
          <Component data={SAMPLE_RESUME} />
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 48, background: "linear-gradient(transparent, rgba(255,255,255,0.7))" }} />
      </div>
    </div>
  );
}

function TemplateCarousel({ onSelect }: { onSelect: (id: string) => void }) {
  const [active, setActive] = useState(0);
  const visible = 3;
  const total = TEMPLATES.length;
  const maxActive = total - visible;

  return (
    <div style={{ position: "relative", padding: "24px 64px 8px" }}>
      <button onClick={() => setActive(a => Math.max(0, a - 1))} disabled={active === 0}
        style={{ position: "absolute", left: 8, top: "46%", transform: "translateY(-50%)", zIndex: 10, width: 48, height: 48, borderRadius: "50%", border: "1px solid #e5e7eb", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: active === 0 ? "default" : "pointer", opacity: active === 0 ? 0.2 : 1, boxShadow: "0 4px 16px rgba(0,0,0,0.14)", transition: "opacity 0.2s" }}>
        <ChevronLeft style={{ width: 22, height: 22, color: "#374151" }} />
      </button>

      <div style={{ display: "flex", gap: 22, alignItems: "flex-end", justifyContent: "center" }}>
        {TEMPLATES.map((t, i) => {
          const offset = i - active;
          if (offset < 0 || offset >= visible) return null;
          const featured = offset === 1;
          return (
            <motion.div key={t.id} layout
              animate={{ y: featured ? -18 : 0 }}
              whileHover={{ y: featured ? -26 : -10, scale: 1.015 }}
              transition={{ duration: 0.24, type: "spring", stiffness: 260, damping: 22 }}
              onClick={() => onSelect(t.id)}
              style={{ cursor: "pointer", position: "relative" }}
            >
              <RealPreview t={t} featured={featured} />

              {/* Hover overlay */}
              <motion.div initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} transition={{ duration: 0.18 }}
                style={{ position: "absolute", inset: 0, borderRadius: 18, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 20, background: "linear-gradient(transparent 50%, rgba(0,0,0,0.42) 100%)" }}>
                <div style={{ background: t.accent, color: "#fff", fontWeight: 800, fontSize: 13, borderRadius: 10, padding: "10px 24px", boxShadow: `0 6px 20px ${t.accent}66` }}>
                  Use this template →
                </div>
              </motion.div>

              <div style={{ paddingTop: 14, textAlign: "center" }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: 0 }}>{t.name}</p>
                <p style={{ fontSize: 12, color: "#6b7280", margin: "4px 0 0" }}>{t.role}</p>
                {featured && <span style={{ display: "inline-block", marginTop: 6, background: "#2563eb", color: "#fff", fontSize: 10, fontWeight: 800, borderRadius: 99, padding: "2px 10px", letterSpacing: "0.06em" }}>FEATURED</span>}
              </div>
            </motion.div>
          );
        })}
      </div>

      <button onClick={() => setActive(a => Math.min(maxActive, a + 1))} disabled={active >= maxActive}
        style={{ position: "absolute", right: 8, top: "46%", transform: "translateY(-50%)", zIndex: 10, width: 48, height: 48, borderRadius: "50%", border: "1px solid #e5e7eb", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: active >= maxActive ? "default" : "pointer", opacity: active >= maxActive ? 0.2 : 1, boxShadow: "0 4px 16px rgba(0,0,0,0.14)", transition: "opacity 0.2s" }}>
        <ChevronRight style={{ width: 22, height: 22, color: "#374151" }} />
      </button>

      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 28 }}>
        {TEMPLATES.map((_, i) => (
          <button key={i} onClick={() => setActive(Math.min(i, maxActive))}
            style={{ width: i === active ? 28 : 8, height: 8, borderRadius: 99, border: "none", cursor: "pointer", background: i === active ? "#2563eb" : "#d1d5db", transition: "all 0.28s", padding: 0 }} />
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE
   ══════════════════════════════════════════════════════════════ */
export default function ResumeBuilderPage() {
  const router = useRouter();

  function handleTemplateSelect(id: string) {
    sessionStorage.setItem("selectedTemplate", id);
    router.push("/resume-builder/upload");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", color: "#111827", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* ── NAV ─────────────────────────────────────────── */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 48px", borderBottom: "1px solid #f3f4f6", position: "sticky", top: 0, background: "#ffffffee", backdropFilter: "blur(12px)", zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FileText style={{ width: 15, height: 15, color: "#fff" }} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, color: "#111827" }}>
            AITestCraft <span style={{ color: "#2563eb" }}>Resume</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={() => router.push("/dashboard")} style={{ background: "transparent", border: "none", color: "#6b7280", fontSize: 13, cursor: "pointer" }}>
            ← Dashboard
          </button>
          <motion.button whileHover={{ scale: 1.04 }}
            onClick={() => router.push("/resume-builder/upload")}
            style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            Build My Resume
          </motion.button>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{
        background: "linear-gradient(135deg, #f0f7ff 0%, #fafafa 50%, #f0fdf4 100%)",
        padding: "64px 72px 80px",
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 80, flexWrap: "wrap",
        minHeight: 580,
      }}>
        {/* Left: Text */}
        <div style={{ flex: 1, minWidth: 320, maxWidth: 540 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 99, border: "1px solid #bfdbfe", background: "#eff6ff", padding: "5px 12px", marginBottom: 20 }}>
            <Sparkles style={{ width: 12, height: 12, color: "#2563eb" }} />
            <span style={{ fontSize: 12, color: "#2563eb", fontWeight: 600 }}>AI-Powered · QA Domain Specific · ATS Optimized</span>
          </div>

          <h1 style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.1, marginBottom: 20, letterSpacing: "-1.5px", color: "#0f172a" }}>
            Land more interviews with your{" "}
            <span style={{ color: "#2563eb" }}>QA Resume</span>
          </h1>

          <p style={{ fontSize: 17, color: "#475569", lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
            ATS Check, AI Writer, and QA-specific keywords make your resume stand out to recruiters.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/resume-builder/upload")}
              style={{ display: "flex", alignItems: "center", gap: 8, background: "#2563eb", color: "#fff", border: "none", borderRadius: 10, padding: "14px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px #2563eb44" }}>
              <Upload style={{ width: 16, height: 16 }} /> Build Your Resume <ArrowRight style={{ width: 16, height: 16 }} />
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/resume-builder/editor")}
              style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", color: "#374151", border: "1px solid #e5e7eb", borderRadius: 10, padding: "14px 24px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
              Get Your Resume Score
            </motion.button>
          </div>

          {/* Social proof */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ display: "flex", gap: 2 }}>
                {[1,2,3,4,5].map(i => (
                  <Star key={i} style={{ width: 14, height: 14, fill: "#f59e0b", color: "#f59e0b" }} />
                ))}
              </div>
              <span style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>4.8</span>
              <span style={{ fontSize: 12, color: "#9ca3af" }}>· 2,847 reviews</span>
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
              <span><strong style={{ color: "#111827" }}>14,200+ QA engineers</strong> hired last month</span>
            </div>
          </div>
        </div>

        {/* Right: Animated resume mockup */}
        <HeroMockup />
      </section>

      {/* ── TEMPLATE CAROUSEL ────────────────────────────── */}
      <section style={{ background: "#f9fafb", padding: "72px 0 56px", borderTop: "1px solid #f3f4f6" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, textAlign: "center", color: "#0f172a", marginBottom: 8, letterSpacing: "-0.5px" }}>
            Pick a template and build your resume in minutes!
          </h2>
          <p style={{ textAlign: "center", color: "#6b7280", fontSize: 15, marginBottom: 48 }}>
            5 stunning QA-specific templates, all ATS-compatible
          </p>

          <TemplateCarousel onSelect={handleTemplateSelect} />

          <div style={{ display: "flex", justifyContent: "center", gap: 48, marginTop: 48, flexWrap: "wrap" }}>
            {[
              { icon: CheckCircle2, label: "ATS-friendly professionally designed resumes", color: "#10b981" },
              { icon: Zap,          label: "AI-powered content with QA keywords & metrics", color: "#2563eb" },
              { icon: BarChart3,    label: "23-point ATS score checker & analysis",         color: "#f59e0b" },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, color: "#374151" }}>
                <Icon style={{ width: 20, height: 20, color }} />
                <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────── */}
      <section style={{ background: "#0f172a", padding: "32px 48px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 24 }}>
          {[
            { value: "28,000+", label: "QA resumes built" },
            { value: "94%",     label: "Average ATS score" },
            { value: "5",       label: "QA-specific templates" },
            { value: "3×",      label: "Higher interview rate" },
          ].map(({ value, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <p style={{ fontSize: 30, fontWeight: 900, color: "#2563eb", margin: 0, letterSpacing: "-0.5px" }}>{value}</p>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0" }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section style={{ padding: "80px 48px", maxWidth: 960, margin: "0 auto" }}>
        <h2 style={{ fontSize: 34, fontWeight: 800, textAlign: "center", color: "#0f172a", marginBottom: 48, letterSpacing: "-0.5px" }}>
          Interview-ready in 3 steps
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
          {[
            { icon: Upload,    n: "01", title: "Upload your resume",      desc: "Drop your existing PDF or paste plain text. AI extracts everything in seconds.",                     color: "#2563eb" },
            { icon: Sparkles,  n: "02", title: "AI rewrites your content", desc: "Gemini AI rewrites bullets with real metrics and QA keywords — fully ATS-optimised.", color: "#10b981", glow: true },
            { icon: Download,  n: "03", title: "Pick template & download", desc: "Choose from 5 QA designs. Run ATS score check. Export as PDF.",                                     color: "#f59e0b" },
          ].map(({ icon: Icon, n, title, desc, color, glow }) => (
            <motion.div key={n}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              style={{ position: "relative", borderRadius: 20, border: `1px solid ${glow ? color + "44" : "#e5e7eb"}`, padding: "32px 24px", textAlign: "center", background: glow ? `${color}08` : "#fff", boxShadow: glow ? `0 0 40px ${color}14` : "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: color, color: "#fff", fontSize: 11, fontWeight: 800, borderRadius: 99, padding: "3px 10px" }}>{n}</div>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Icon style={{ width: 24, height: 24, color }} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: "#0f172a" }}>{title}</h3>
              <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, margin: 0 }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ───────────────────────────────────── */}
      <section style={{ background: "linear-gradient(135deg,#eff6ff,#f0fdf4)", padding: "72px 48px", textAlign: "center", borderTop: "1px solid #e5e7eb" }}>
        <h2 style={{ fontSize: 36, fontWeight: 900, color: "#0f172a", marginBottom: 14, letterSpacing: "-0.5px" }}>
          Ready to land your dream QA job?
        </h2>
        <p style={{ fontSize: 16, color: "#64748b", marginBottom: 32 }}>
          Join thousands of QA professionals who upgraded their resumes with AI.
        </p>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/resume-builder/upload")}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#2563eb", color: "#fff", border: "none", borderRadius: 14, padding: "16px 40px", fontSize: 16, fontWeight: 800, cursor: "pointer", boxShadow: "0 8px 24px #2563eb44" }}>
          Build My QA Resume Now <ArrowRight style={{ width: 18, height: 18 }} />
        </motion.button>
        <p style={{ marginTop: 14, fontSize: 12, color: "#9ca3af" }}>No credit card · Free ATS score · PDF from Pro plan</p>
      </section>
    </div>
  );
}

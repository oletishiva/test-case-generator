"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  ArrowRight, ArrowLeft, Upload, Sparkles,
  CheckCircle2, Zap, FileText, BarChart3, Download, ChevronRight, ChevronLeft,
} from "lucide-react";
import { SAMPLE_RESUME } from "@/lib/resume/parser";
import type { ResumeData } from "@/types/resume";

/* ── Lazy-load real template components ────────────────────── */
const ObsidianGold   = dynamic(() => import("@/components/resume/templates/ObsidianGold"),   { ssr: false, loading: () => <TemplateSkeleton bg="#0e0e16" /> });
const NeonCircuit    = dynamic(() => import("@/components/resume/templates/NeonCircuit"),    { ssr: false, loading: () => <TemplateSkeleton bg="#050510" /> });
const EditorialBloom = dynamic(() => import("@/components/resume/templates/EditorialBloom"), { ssr: false, loading: () => <TemplateSkeleton bg="#faf8f4" /> });
const MintFresh      = dynamic(() => import("@/components/resume/templates/MintFresh"),      { ssr: false, loading: () => <TemplateSkeleton bg="#f6fef9" /> });
const SteelPro       = dynamic(() => import("@/components/resume/templates/SteelPro"),       { ssr: false, loading: () => <TemplateSkeleton bg="#111827" /> });

const TEMPLATES: { id: string; name: string; role: string; accent: string; Component: React.ComponentType<{ data: ResumeData }> }[] = [
  { id: "obsidian-gold",   name: "Obsidian Gold",   role: "QA Architect / Senior Lead",  accent: "#C9A84C", Component: ObsidianGold },
  { id: "neon-circuit",    name: "Neon Circuit",    role: "SDET / DevOps QA",            accent: "#00F5FF", Component: NeonCircuit },
  { id: "editorial-bloom", name: "Editorial Bloom", role: "QA Lead / People Manager",    accent: "#FF6B9D", Component: EditorialBloom },
  { id: "mint-fresh",      name: "Mint Fresh",      role: "API / Backend QA Engineer",   accent: "#4CAF7D", Component: MintFresh },
  { id: "steel-pro",       name: "Steel Pro",       role: "Performance / Security QA",   accent: "#8B9BB4", Component: SteelPro },
];

/* ── Template skeleton while loading ──────────────────────── */
function TemplateSkeleton({ bg }: { bg: string }) {
  return <div style={{ width: 794, minHeight: 1123, background: bg }} />;
}

/* ── Scaled real template preview ─────────────────────────── */
const CARD_W = 216;
const CARD_H = 305;
const SCALE  = CARD_W / 794;

function RealPreview({ t }: { t: typeof TEMPLATES[0] }) {
  const { Component } = t;
  return (
    <div style={{ width: CARD_W, height: CARD_H, overflow: "hidden", borderRadius: 10, flexShrink: 0, background: "#111" }}>
      <div style={{ transform: `scale(${SCALE})`, transformOrigin: "top left", width: 794, pointerEvents: "none" }}>
        <Component data={SAMPLE_RESUME} />
      </div>
    </div>
  );
}

/* ── Template Carousel ─────────────────────────────────────── */
function TemplateCarousel({ onSelect }: { onSelect: () => void }) {
  const [active, setActive] = useState(0);
  const visible = 5;

  const prev = () => setActive(a => Math.max(0, a - 1));
  const next = () => setActive(a => Math.min(TEMPLATES.length - visible, a + 1));

  return (
    <div style={{ position: "relative", padding: "0 48px" }}>
      {/* Arrow left */}
      <button onClick={prev} disabled={active === 0}
        style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", zIndex: 10, width: 40, height: 40, borderRadius: "50%", border: "1px solid #e5e7eb", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: active === 0 ? "default" : "pointer", opacity: active === 0 ? 0.3 : 1, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <ChevronLeft style={{ width: 18, height: 18, color: "#374151" }} />
      </button>

      {/* Cards */}
      <div style={{ display: "flex", gap: 14, overflow: "hidden" }}>
        {TEMPLATES.map((t, i) => {
          const offset = i - active;
          if (offset < 0 || offset >= visible) return null;
          return (
            <motion.div key={t.id}
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              onClick={onSelect}
              style={{ cursor: "pointer", flexShrink: 0, position: "relative" }}
            >
              <div style={{
                borderRadius: 12, overflow: "hidden",
                border: "2px solid #e5e7eb",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = t.accent;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 40px ${t.accent}33`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
                }}
              >
                <RealPreview t={t} />
              </div>

              {/* Hover overlay */}
              <div className="template-hover-overlay" style={{
                position: "absolute", inset: 0, borderRadius: 10,
                background: "rgba(0,0,0,0)", transition: "background 0.2s",
                display: "flex", alignItems: "flex-end", padding: 10,
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.45)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0)"}
              >
                <div style={{ width: "100%", opacity: 0, transition: "opacity 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                >
                  <div style={{ background: t.accent, color: "#000", fontWeight: 700, fontSize: 11, borderRadius: 6, padding: "6px 0", textAlign: "center", width: "100%" }}>
                    Use this template →
                  </div>
                </div>
              </div>

              {/* Label */}
              <div style={{ paddingTop: 8, textAlign: "center" }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#111827", margin: 0 }}>{t.name}</p>
                <p style={{ fontSize: 10, color: "#9ca3af", margin: "2px 0 0" }}>{t.role}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Arrow right */}
      <button onClick={next} disabled={active >= TEMPLATES.length - visible}
        style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", zIndex: 10, width: 40, height: 40, borderRadius: "50%", border: "1px solid #e5e7eb", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: active >= TEMPLATES.length - visible ? "default" : "pointer", opacity: active >= TEMPLATES.length - visible ? 0.3 : 1, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <ChevronRight style={{ width: 18, height: 18, color: "#374151" }} />
      </button>

      {/* Dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 20 }}>
        {TEMPLATES.map((_, i) => (
          <button key={i} onClick={() => setActive(Math.min(i, TEMPLATES.length - visible))}
            style={{ width: i === active ? 20 : 8, height: 8, borderRadius: 99, border: "none", cursor: "pointer", background: i === active ? "#C9A84C" : "#d1d5db", transition: "all 0.2s", padding: 0 }} />
        ))}
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────── */
export default function ResumeBuilderPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a12", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── NAV ──────────────────────────────────────────────── */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 48px", borderBottom: "1px solid #ffffff0d", position: "sticky", top: 0, background: "#0a0a12ee", backdropFilter: "blur(12px)", zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: "linear-gradient(135deg,#C9A84C,#E8C96A)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FileText style={{ width: 15, height: 15, color: "#000" }} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, fontFamily: "'Syne', sans-serif" }}>
            AITestCraft <span style={{ color: "#C9A84C" }}>Resume</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={() => router.push("/dashboard")} style={{ background: "transparent", border: "none", color: "#9ca3af", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
            <ArrowLeft style={{ width: 14, height: 14 }} /> Dashboard
          </button>
          <motion.button whileHover={{ scale: 1.04 }}
            onClick={() => router.push("/resume-builder/upload")}
            style={{ background: "linear-gradient(135deg,#C9A84C,#E8C96A)", color: "#000", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            Build My Resume
          </motion.button>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{ padding: "72px 48px 56px", maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 99, border: "1px solid #C9A84C44", background: "#C9A84C10", padding: "6px 14px", marginBottom: 24 }}>
          <Sparkles style={{ width: 12, height: 12, color: "#C9A84C" }} />
          <span style={{ fontSize: 12, color: "#C9A84C", fontWeight: 600 }}>AI-Powered · QA Domain Specific · ATS Optimized</span>
        </div>

        <h1 style={{ fontSize: 56, fontWeight: 900, lineHeight: 1.1, marginBottom: 18, fontFamily: "'Syne', sans-serif" }}>
          Build a QA Resume That
          <br />
          <span style={{ background: "linear-gradient(135deg,#C9A84C,#E8C96A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Gets You Hired
          </span>
        </h1>

        <p style={{ fontSize: 18, color: "#9ca3af", lineHeight: 1.7, marginBottom: 36, maxWidth: 600, margin: "0 auto 36px" }}>
          Upload your existing resume. AI rewrites it with QA-specific metrics and keywords. Download a stunning, ATS-ready PDF.
        </p>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/resume-builder/upload")}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg,#C9A84C,#E8C96A)", color: "#000", border: "none", borderRadius: 12, padding: "14px 32px", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
            <Upload style={{ width: 16, height: 16 }} /> Upload My Resume <ArrowRight style={{ width: 16, height: 16 }} />
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/resume-builder/editor")}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", color: "#d1d5db", border: "1px solid #ffffff22", borderRadius: 12, padding: "14px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
            Start from scratch
          </motion.button>
        </div>
        <p style={{ fontSize: 12, color: "#6b7280" }}>No credit card · Free ATS score · PDF from Pro plan</p>
      </section>

      {/* ── TEMPLATE CAROUSEL (light section like enhancv) ─────── */}
      <section style={{ background: "#f9fafb", padding: "64px 0 48px", borderTop: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <h2 style={{ fontSize: 34, fontWeight: 800, textAlign: "center", color: "#111827", fontFamily: "'Syne', sans-serif", marginBottom: 8 }}>
            Pick a template and build your resume in minutes!
          </h2>
          <p style={{ textAlign: "center", color: "#6b7280", fontSize: 15, marginBottom: 48 }}>
            5 stunning QA-specific templates, all ATS-compatible
          </p>

          <TemplateCarousel onSelect={() => router.push("/resume-builder/upload")} />

          {/* Feature bullets */}
          <div style={{ display: "flex", justifyContent: "center", gap: 48, marginTop: 40, flexWrap: "wrap" }}>
            {[
              { icon: CheckCircle2, label: "ATS-friendly professionally designed resumes" },
              { icon: Zap, label: "AI-powered content with QA keywords & metrics" },
              { icon: BarChart3, label: "23-point ATS score checker & analysis" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, color: "#374151" }}>
                <Icon style={{ width: 20, height: 20, color: "#10b981" }} />
                <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 28 }}>
            <button onClick={() => router.push("/resume-builder/upload")}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: "none", color: "#C9A84C", fontSize: 14, fontWeight: 700, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>
              Browse all templates <ArrowRight style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────── */}
      <section style={{ background: "#0e0e1a", padding: "28px 48px", borderBottom: "1px solid #ffffff0d" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 24 }}>
          {[
            { value: "28,000+", label: "QA resumes built" },
            { value: "94%", label: "Average ATS score" },
            { value: "5", label: "QA-specific templates" },
            { value: "3×", label: "Higher interview rate" },
          ].map(({ value, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <p style={{ fontSize: 28, fontWeight: 800, color: "#C9A84C", margin: 0, fontFamily: "'Space Mono', monospace" }}>{value}</p>
              <p style={{ fontSize: 12, color: "#6b7280", margin: "4px 0 0" }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section style={{ padding: "80px 48px", maxWidth: 950, margin: "0 auto" }}>
        <h2 style={{ fontSize: 34, fontWeight: 800, textAlign: "center", fontFamily: "'Syne', sans-serif", marginBottom: 48 }}>
          Interview-ready in 3 steps
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
          {[
            { icon: Upload, n: "01", title: "Upload your resume", desc: "Drop your existing PDF or paste plain text. AI extracts everything in seconds.", color: "#8B9BB4" },
            { icon: Sparkles, n: "02", title: "AI rewrites your content", desc: "Claude rewrites bullets with real metrics and QA keywords — ATS-optimised.", color: "#C9A84C", glow: true },
            { icon: Download, n: "03", title: "Pick template & download", desc: "Choose from 5 QA designs. Run ATS score check. Export as PDF.", color: "#4CAF7D" },
          ].map(({ icon: Icon, n, title, desc, color, glow }) => (
            <motion.div key={n}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              style={{ position: "relative", borderRadius: 20, border: `1px solid ${glow ? color + "55" : "#ffffff12"}`, padding: "32px 24px", textAlign: "center", background: "#13131f", boxShadow: glow ? `0 0 40px ${color}22` : undefined }}>
              <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: color, color: "#000", fontSize: 11, fontWeight: 800, borderRadius: 99, padding: "3px 10px" }}>{n}</div>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: `${color}22`, border: `1px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Icon style={{ width: 24, height: 24, color }} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.6, margin: 0 }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ───────────────────────────────────────── */}
      <section style={{ background: "linear-gradient(135deg,#0e0e1a,#1a1208)", padding: "72px 48px", textAlign: "center", borderTop: "1px solid #C9A84C22" }}>
        <h2 style={{ fontSize: 36, fontWeight: 900, fontFamily: "'Syne', sans-serif", marginBottom: 14 }}>Ready to land your dream QA job?</h2>
        <p style={{ fontSize: 16, color: "#9ca3af", marginBottom: 32 }}>Join thousands of QA professionals who upgraded their resumes with AI.</p>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/resume-builder/upload")}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg,#C9A84C,#E8C96A)", color: "#000", border: "none", borderRadius: 14, padding: "16px 40px", fontSize: 16, fontWeight: 800, cursor: "pointer" }}>
          Build My QA Resume Now <ArrowRight style={{ width: 18, height: 18 }} />
        </motion.button>
      </section>
    </div>
  );
}

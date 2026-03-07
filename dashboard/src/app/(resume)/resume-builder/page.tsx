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

/* ── Template skeleton while loading ──────────────────────── */
function TemplateSkeleton({ bg }: { bg: string }) {
  return <div style={{ width: 794, minHeight: 1123, background: bg }} />;
}

/* ── Scaled real template preview ─────────────────────────── */
// Show 3 cards; ~330px each → scale ~0.415 → text is clearly readable
const CARD_W = 330;

function RealPreview({ t, featured = false }: { t: typeof TEMPLATES[0]; featured?: boolean }) {
  const { Component } = t;
  const w = featured ? Math.round(CARD_W * 1.09) : CARD_W;
  const h = Math.round(w / 794 * 1123);
  const sc = w / 794;
  return (
    /* White card wrapper — shadows + accent border on featured */
    <div style={{
      background: "#fff",
      borderRadius: 18,
      padding: 10,
      boxShadow: featured
        ? "0 32px 80px rgba(0,0,0,0.22), 0 0 0 2px #C9A84C66"
        : "0 6px 28px rgba(0,0,0,0.12)",
      border: featured ? "2px solid #C9A84C44" : "1px solid #e5e7eb",
      transition: "box-shadow 0.25s, transform 0.25s",
      flexShrink: 0,
    }}>
      <div style={{ width: w, height: h, overflow: "hidden", borderRadius: 10, position: "relative" }}>
        <div style={{ transform: `scale(${sc})`, transformOrigin: "top left", width: 794, pointerEvents: "none" }}>
          <Component data={SAMPLE_RESUME} />
        </div>
        {/* Subtle gradient fade at the bottom edge */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 48,
          background: "linear-gradient(transparent, rgba(255,255,255,0.6))" }} />
      </div>
    </div>
  );
}

/* ── Template Carousel ─────────────────────────────────────── */
function TemplateCarousel({ onSelect }: { onSelect: () => void }) {
  const [active, setActive] = useState(0);
  const visible = 3;
  const total = TEMPLATES.length;
  const maxActive = total - visible; // 2

  const prev = () => setActive(a => Math.max(0, a - 1));
  const next = () => setActive(a => Math.min(maxActive, a + 1));

  return (
    <div style={{ position: "relative", padding: "24px 64px 8px" }}>
      {/* Left arrow */}
      <button onClick={prev} disabled={active === 0}
        style={{ position: "absolute", left: 8, top: "46%", transform: "translateY(-50%)", zIndex: 10, width: 48, height: 48, borderRadius: "50%", border: "1px solid #e5e7eb", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: active === 0 ? "default" : "pointer", opacity: active === 0 ? 0.2 : 1, boxShadow: "0 4px 16px rgba(0,0,0,0.14)", transition: "opacity 0.2s" }}>
        <ChevronLeft style={{ width: 22, height: 22, color: "#374151" }} />
      </button>

      {/* Cards row — center-aligned, featured card elevated */}
      <div style={{ display: "flex", gap: 22, alignItems: "flex-end", justifyContent: "center" }}>
        {TEMPLATES.map((t, i) => {
          const offset = i - active;
          if (offset < 0 || offset >= visible) return null;
          const featured = offset === 1; // middle card
          return (
            <motion.div key={t.id}
              layout
              animate={{ y: featured ? -18 : 0 }}
              whileHover={{ y: featured ? -26 : -10, scale: 1.015 }}
              transition={{ duration: 0.24, type: "spring", stiffness: 260, damping: 22 }}
              onClick={onSelect}
              style={{ cursor: "pointer", position: "relative" }}
            >
              <RealPreview t={t} featured={featured} />

              {/* "Use template" overlay on hover */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.18 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 18,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  paddingBottom: 20,
                  background: "linear-gradient(transparent 50%, rgba(0,0,0,0.38) 100%)",
                }}
              >
                <div style={{
                  background: t.accent,
                  color: t.accent === "#C9A84C" || t.accent === "#4CAF7D" ? "#000" : "#fff",
                  fontWeight: 800, fontSize: 13, borderRadius: 10,
                  padding: "10px 24px", whiteSpace: "nowrap",
                  boxShadow: `0 6px 20px ${t.accent}66`,
                  letterSpacing: "0.01em",
                }}>
                  Use this template →
                </div>
              </motion.div>

              {/* Label below */}
              <div style={{ paddingTop: 14, textAlign: "center" }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: 0 }}>{t.name}</p>
                <p style={{ fontSize: 12, color: "#6b7280", margin: "4px 0 0" }}>{t.role}</p>
                {featured && (
                  <span style={{ display: "inline-block", marginTop: 6, background: "#C9A84C", color: "#000", fontSize: 10, fontWeight: 800, borderRadius: 99, padding: "2px 10px", letterSpacing: "0.06em" }}>
                    FEATURED
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Right arrow */}
      <button onClick={next} disabled={active >= maxActive}
        style={{ position: "absolute", right: 8, top: "46%", transform: "translateY(-50%)", zIndex: 10, width: 48, height: 48, borderRadius: "50%", border: "1px solid #e5e7eb", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: active >= maxActive ? "default" : "pointer", opacity: active >= maxActive ? 0.2 : 1, boxShadow: "0 4px 16px rgba(0,0,0,0.14)", transition: "opacity 0.2s" }}>
        <ChevronRight style={{ width: 22, height: 22, color: "#374151" }} />
      </button>

      {/* Dot pagination */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 28 }}>
        {TEMPLATES.map((_, i) => (
          <button key={i}
            onClick={() => setActive(Math.min(i, maxActive))}
            style={{ width: i === active ? 28 : 8, height: 8, borderRadius: 99, border: "none", cursor: "pointer", background: i === active ? "#C9A84C" : "#d1d5db", transition: "all 0.28s", padding: 0 }}
          />
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

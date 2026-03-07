"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Upload, Sparkles, Palette, ChevronRight } from "lucide-react";
import { RESUME_TEMPLATES } from "@/types/resume";

/* ── CountUp hook ─────────────────────────────────────────── */
function useCountUp(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(interval); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(interval);
  }, [target, duration]);
  return count;
}

/* ── Stat item ────────────────────────────────────────────── */
function StatItem({ value, suffix = "", label }: { value: number; suffix?: string; label: string }) {
  const count = useCountUp(value);
  return (
    <div className="text-center">
      <p className="text-3xl font-bold" style={{ fontFamily: "'Space Mono', monospace", color: "#C9A84C" }}>
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-sm text-slate-400 mt-1">{label}</p>
    </div>
  );
}

/* ── Step card ────────────────────────────────────────────── */
const steps = [
  {
    icon: Upload,
    number: "01",
    title: "Upload your resume",
    desc: "Drop your existing PDF or paste plain text. We handle the rest.",
    color: "#8B9BB4",
  },
  {
    icon: Sparkles,
    number: "02",
    title: "AI rewrites your content",
    desc: "Claude extracts, rewrites bullets with metrics, and optimises for ATS.",
    color: "#C9A84C",
    glow: true,
  },
  {
    icon: Palette,
    number: "03",
    title: "Pick a template & download",
    desc: "10 QA-specific designs. Export as PDF or DOCX in one click.",
    color: "#4CAF7D",
  },
];

/* ── Shared resume mock (works for both mini + zoomed) ───── */
function ResumeMock({ t, s = 1 }: { t: typeof RESUME_TEMPLATES[0]; s?: number }) {
  const isLight = t.theme === "light";
  const bgMap: Record<string, string> = {
    "mint-fresh": "#f6fef9", "editorial-bloom": "#faf8f4",
    "aurora-soft": "#f8f5ff", "desi-bold": "#fff7ed",
  };
  const bg = bgMap[t.id] ?? (isLight ? "#f8f9fa" : t.id === "neon-circuit" ? "#050510" : t.id === "steel-pro" ? "#111827" : "#0e0e16");
  const line = isLight ? "#00000020" : "#ffffff20";
  const lineMed = isLight ? "#00000035" : "#ffffff35";
  const ac = t.accentColor;
  const txtColor = isLight ? "#111" : "#fff";

  return (
    <div style={{ width: 160 * s, height: 228 * s, background: bg, overflow: "hidden", position: "relative", flexShrink: 0 }}>
      {/* Top accent bar */}
      <div style={{ height: 3 * s, background: `linear-gradient(90deg,${ac},${ac}88)` }} />

      {/* Header */}
      <div style={{ padding: `${10 * s}px ${12 * s}px ${7 * s}px`, borderBottom: `1px solid ${ac}33` }}>
        <div style={{ height: 9 * s, width: "68%", borderRadius: 3 * s, background: ac, marginBottom: 4 * s }} />
        <div style={{ height: 5 * s, width: "46%", borderRadius: 2 * s, background: lineMed, marginBottom: 5 * s }} />
        <div style={{ display: "flex", gap: 4 * s }}>
          {[28, 22, 26].map((w, i) => <div key={i} style={{ height: 3 * s, width: `${w}%`, borderRadius: 2 * s, background: line }} />)}
        </div>
      </div>

      {/* Body */}
      <div style={{ display: "flex", flex: 1 }}>
        {/* Main */}
        <div style={{ flex: 1, padding: `${7 * s}px ${8 * s}px` }}>
          <div style={{ height: 4 * s, width: "38%", borderRadius: 2 * s, background: ac, opacity: 0.8, marginBottom: 5 * s }} />
          {[75, 55, 85, 48, 68, 58].map((w, i) => (
            <div key={i} style={{ height: 3 * s, width: `${w}%`, borderRadius: 2 * s, background: line, marginBottom: 3 * s }} />
          ))}
          <div style={{ height: 4 * s, width: "34%", borderRadius: 2 * s, background: ac, opacity: 0.8, margin: `${6 * s}px 0 ${5 * s}px` }} />
          {[62, 78, 50, 70].map((w, i) => (
            <div key={i} style={{ height: 3 * s, width: `${w}%`, borderRadius: 2 * s, background: line, marginBottom: 3 * s }} />
          ))}
        </div>

        {/* Sidebar — dark templates only */}
        {!isLight && (
          <div style={{ width: 44 * s, background: `${ac}0c`, borderLeft: `1px solid ${ac}22`, padding: `${7 * s}px ${5 * s}px` }}>
            <div style={{ height: 3 * s, width: "80%", borderRadius: 2 * s, background: ac, opacity: 0.7, marginBottom: 5 * s }} />
            {[90, 70, 82, 60, 75].map((w, i) => (
              <div key={i} style={{ height: 3 * s, width: `${w}%`, borderRadius: 2 * s, background: line, marginBottom: 3 * s }} />
            ))}
            <div style={{ marginTop: 6 * s }}>
              {[100, 80, 60, 90].map((w, i) => (
                <div key={i} style={{ height: 2 * s, width: "90%", borderRadius: 2 * s, background: "#ffffff0a", marginBottom: 4 * s, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${w}%`, background: ac, opacity: 0.75 }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer label */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: `${4 * s}px ${8 * s}px`,
        background: isLight ? "rgba(255,255,255,0.88)" : "rgba(0,0,0,0.65)",
        backdropFilter: "blur(4px)",
        borderTop: `1px solid ${ac}44`,
      }}>
        <p style={{ fontSize: 7 * s, fontWeight: 700, color: txtColor, margin: 0 }}>{t.name}</p>
        <p style={{ fontSize: 6 * s, color: ac, margin: 0 }}>{t.targetRole}</p>
      </div>
    </div>
  );
}

/* ── Template preview card ────────────────────────────────── */
function TemplateCard({ template, index }: { template: typeof RESUME_TEMPLATES[0]; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ position: "relative", flexShrink: 0 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Mini card */}
      <motion.div
        animate={{ y: hovered ? -6 : 0, scale: hovered ? 1.04 : 1 }}
        transition={{ duration: 0.18 }}
        style={{
          cursor: "pointer",
          borderRadius: 12,
          overflow: "hidden",
          border: `2px solid ${hovered ? template.accentColor : "#ffffff18"}`,
          boxShadow: hovered ? `0 8px 32px ${template.accentColor}55` : "0 2px 10px rgba(0,0,0,0.35)",
        }}
      >
        <ResumeMock t={template} s={1} />
      </motion.div>

      {/* Badges */}
      {index === 0 && (
        <div style={{ position: "absolute", top: 8, left: 8, background: "#C9A84C", color: "#000", fontSize: 8, fontWeight: 700, borderRadius: 4, padding: "2px 6px", pointerEvents: "none", zIndex: 2 }}>Popular</div>
      )}
      {index === 1 && (
        <div style={{ position: "absolute", top: 8, left: 8, background: "#FF4D6D", color: "#fff", fontSize: 8, fontWeight: 700, borderRadius: 4, padding: "2px 6px", pointerEvents: "none", zIndex: 2 }}>New</div>
      )}
      <div style={{ position: "absolute", top: 8, right: 8, background: "#4CAF7D22", border: "1px solid #4CAF7D66", color: "#4CAF7D", fontSize: 7, fontWeight: 600, borderRadius: 3, padding: "2px 5px", pointerEvents: "none", zIndex: 2 }}>ATS ✓</div>

      {/* Zoom popup on hover */}
      {hovered && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -55%)",
            zIndex: 100,
            pointerEvents: "none",
            filter: `drop-shadow(0 24px 48px ${template.accentColor}66)`,
          }}
        >
          <div style={{ border: `2px solid ${template.accentColor}`, borderRadius: 14, overflow: "hidden" }}>
            <ResumeMock t={template} s={1.95} />
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────── */
export default function ResumeBuilderPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen" style={{ background: "#0d0d14", color: "#ffffff", fontFamily: "'DM Sans', sans-serif" }}>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-20 pb-16 text-center">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-96 w-96 rounded-full opacity-10 blur-3xl"
            style={{ background: "radial-gradient(circle, #C9A84C, transparent)" }} />
        </div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="relative mx-auto max-w-4xl">

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-1.5 text-xs text-yellow-400">
            <Sparkles className="h-3 w-3" />
            Powered by Claude AI · QA Domain Specific
          </div>

          <h1 className="mb-5 text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl"
            style={{ fontFamily: "'Syne', sans-serif" }}>
            Build a QA Resume
            <br />
            <span style={{
              background: "linear-gradient(135deg, #C9A84C, #E8C96A)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              That Gets You Hired
            </span>
          </h1>

          <p className="mb-10 text-lg text-slate-400" style={{ fontFamily: "'Space Mono', monospace" }}>
            AI-powered. ATS-optimized. QA-domain specific.
          </p>

          {/* Stats */}
          <div className="mb-12 flex flex-wrap items-center justify-center gap-12">
            <StatItem value={1200} suffix="+" label="QA Resumes Built" />
            <div className="h-8 w-px bg-white/10 hidden sm:block" />
            <StatItem value={94} label="Avg ATS Score" />
            <div className="h-8 w-px bg-white/10 hidden sm:block" />
            <StatItem value={3} suffix="×" label="Interview Rate" />
          </div>

          {/* CTA */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/resume-builder/upload")}
            className="inline-flex items-center gap-2 rounded-2xl px-10 py-4 text-base font-bold text-black shadow-lg"
            style={{ background: "linear-gradient(135deg, #C9A84C, #E8C96A)" }}
          >
            Start Building for Free <ArrowRight className="h-5 w-5" />
          </motion.button>
          <p className="mt-3 text-xs text-slate-500">No credit card required · Free preview · Download from ₹999/mo</p>
        </motion.div>
      </section>

      {/* 3-step process */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-2xl font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>
            From old resume to interview-ready in 3 steps
          </h2>
          <div className="relative grid gap-6 sm:grid-cols-3">
            {/* Connecting line */}
            <div className="absolute left-1/6 right-1/6 top-10 hidden border-t border-dashed border-white/10 sm:block" />

            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="relative rounded-2xl border border-white/10 p-6 text-center"
                  style={{
                    background: "#13131f",
                    boxShadow: step.glow ? `0 0 40px ${step.color}22` : undefined,
                    borderColor: step.glow ? `${step.color}44` : undefined,
                  }}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-xs font-bold"
                    style={{ background: step.color, color: "#000" }}>
                    {step.number}
                  </div>
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{ background: `${step.color}22`, border: `1px solid ${step.color}44` }}>
                    <Icon className="h-6 w-6" style={{ color: step.color }} />
                  </div>
                  <h3 className="mb-2 font-semibold text-white">{step.title}</h3>
                  <p className="text-sm text-slate-400">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Template preview strip */}
      <section className="px-6 py-16" style={{ background: "#0a0a10" }}>
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>
              10 stunning QA templates
            </h2>
            <button
              onClick={() => router.push("/resume-builder/upload")}
              className="flex items-center gap-1 text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              See all <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" style={{ overflowY: "visible", paddingTop: "180px", marginTop: "-180px" }}>
            {RESUME_TEMPLATES.map((t, i) => (
              <TemplateCard key={t.id} template={t} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="px-6 py-12 text-center">
        <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Used by QA professionals at
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8">
          {["TCS", "Infosys", "Wipro", "Accenture", "Cognizant", "HCL"].map((co) => (
            <span key={co} className="text-lg font-bold text-slate-600 hover:text-slate-400 transition-colors cursor-default">
              {co}
            </span>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 pb-20 text-center">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/resume-builder/upload")}
          className="inline-flex items-center gap-2 rounded-2xl px-10 py-4 text-base font-bold text-black"
          style={{ background: "linear-gradient(135deg, #C9A84C, #E8C96A)" }}
        >
          Build My QA Resume Now <ArrowRight className="h-5 w-5" />
        </motion.button>
      </section>
    </div>
  );
}

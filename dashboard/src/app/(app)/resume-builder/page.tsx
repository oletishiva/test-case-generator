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

/* ── Template preview card ────────────────────────────────── */
function TemplateCard({ template, index }: { template: typeof RESUME_TEMPLATES[0]; index: number }) {
  const themeColors: Record<string, string> = {
    dark: "#1a1a2e",
    light: "#f8f9fa",
    colorful: "#fff7ed",
  };
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -4 }}
      className="relative shrink-0 w-40 h-56 rounded-xl overflow-hidden cursor-pointer border border-white/10"
      style={{ background: themeColors[template.theme] ?? "#1a1a2e" }}
    >
      {/* Mock resume lines */}
      <div className="p-3 h-full flex flex-col gap-1.5">
        <div className="h-3 rounded-full w-3/4" style={{ background: template.accentColor, opacity: 0.9 }} />
        <div className="h-1.5 rounded-full w-1/2 bg-white/20" />
        <div className="h-px w-full mt-1" style={{ background: template.accentColor, opacity: 0.4 }} />
        {[80, 60, 90, 50, 70].map((w, i) => (
          <div key={i} className="h-1 rounded-full bg-white/15" style={{ width: `${w}%` }} />
        ))}
        <div className="mt-1 h-1.5 rounded-full w-2/3 bg-white/20" />
        {[55, 75, 40, 65].map((w, i) => (
          <div key={i} className="h-1 rounded-full bg-white/10" style={{ width: `${w}%` }} />
        ))}
      </div>

      {/* Accent dot */}
      <div className="absolute top-2 right-2 h-2 w-2 rounded-full" style={{ background: template.accentColor }} />

      {/* Badges */}
      {index === 0 && (
        <div className="absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-black"
          style={{ background: "#C9A84C" }}>Popular</div>
      )}
      {index === 1 && (
        <div className="absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-black"
          style={{ background: "#FF4D6D" }}>New</div>
      )}

      {/* Hover label */}
      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 hover:opacity-100 transition-opacity">
        <div>
          <p className="text-[10px] font-semibold text-white">{template.name}</p>
          <p className="text-[9px] text-slate-400">{template.targetRole}</p>
        </div>
      </div>
    </motion.div>
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

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
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

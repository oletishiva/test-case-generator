"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Upload, Sparkles, Palette, Star,
  CheckCircle2, Zap, FileText, BarChart3, Download,
} from "lucide-react";
import { RESUME_TEMPLATES } from "@/types/resume";

/* ── CountUp ──────────────────────────────────────────────── */
function useCountUp(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const steps = 60;
    const inc = target / steps;
    let cur = 0;
    const iv = setInterval(() => {
      cur += inc;
      if (cur >= target) { setCount(target); clearInterval(iv); }
      else setCount(Math.floor(cur));
    }, duration / steps);
    return () => clearInterval(iv);
  }, [target, duration]);
  return count;
}

/* ── Resume Mock ──────────────────────────────────────────── */
function ResumeMock({ t, s = 1 }: { t: typeof RESUME_TEMPLATES[0]; s?: number }) {
  const isLight = t.theme === "light";
  const bgMap: Record<string, string> = {
    "mint-fresh": "#f6fef9", "editorial-bloom": "#faf8f4",
    "aurora-soft": "#f8f5ff", "desi-bold": "#fff7ed",
  };
  const bg = bgMap[t.id] ?? (isLight ? "#f8f9fa" : t.id === "neon-circuit" ? "#050510" : t.id === "steel-pro" ? "#111827" : "#0e0e16");
  const line = isLight ? "#00000020" : "#ffffff20";
  const lineMed = isLight ? "#00000038" : "#ffffff38";
  const ac = t.accentColor;
  const txtColor = isLight ? "#111" : "#fff";

  return (
    <div style={{ width: 180 * s, height: 254 * s, background: bg, overflow: "hidden", position: "relative", flexShrink: 0 }}>
      <div style={{ height: 3 * s, background: `linear-gradient(90deg,${ac},${ac}88)` }} />
      <div style={{ padding: `${11 * s}px ${13 * s}px ${8 * s}px`, borderBottom: `1px solid ${ac}33` }}>
        <div style={{ height: 10 * s, width: "68%", borderRadius: 3 * s, background: ac, marginBottom: 4 * s }} />
        <div style={{ height: 5 * s, width: "46%", borderRadius: 2 * s, background: lineMed, marginBottom: 5 * s }} />
        <div style={{ display: "flex", gap: 4 * s }}>
          {[30, 24, 28].map((w, i) => <div key={i} style={{ height: 3 * s, width: `${w}%`, borderRadius: 2 * s, background: line }} />)}
        </div>
      </div>
      <div style={{ display: "flex", flex: 1 }}>
        <div style={{ flex: 1, padding: `${8 * s}px ${9 * s}px` }}>
          <div style={{ height: 4 * s, width: "40%", borderRadius: 2 * s, background: ac, opacity: 0.8, marginBottom: 5 * s }} />
          {[75, 55, 85, 48, 68, 58, 72].map((w, i) => (
            <div key={i} style={{ height: 3 * s, width: `${w}%`, borderRadius: 2 * s, background: line, marginBottom: 3 * s }} />
          ))}
          <div style={{ height: 4 * s, width: "36%", borderRadius: 2 * s, background: ac, opacity: 0.8, margin: `${7 * s}px 0 ${5 * s}px` }} />
          {[62, 78, 50, 70, 58].map((w, i) => (
            <div key={i} style={{ height: 3 * s, width: `${w}%`, borderRadius: 2 * s, background: line, marginBottom: 3 * s }} />
          ))}
        </div>
        {!isLight && (
          <div style={{ width: 48 * s, background: `${ac}0c`, borderLeft: `1px solid ${ac}22`, padding: `${8 * s}px ${5 * s}px` }}>
            <div style={{ height: 3 * s, width: "80%", borderRadius: 2 * s, background: ac, opacity: 0.7, marginBottom: 5 * s }} />
            {[90, 70, 82, 60, 75].map((w, i) => (
              <div key={i} style={{ height: 3 * s, width: `${w}%`, borderRadius: 2 * s, background: line, marginBottom: 3 * s }} />
            ))}
            <div style={{ marginTop: 6 * s }}>
              {[100, 80, 60, 90, 70].map((w, i) => (
                <div key={i} style={{ height: 2 * s, width: "88%", borderRadius: 2 * s, background: "#ffffff0a", marginBottom: 4 * s, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${w}%`, background: ac, opacity: 0.75 }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: `${5 * s}px ${9 * s}px`,
        background: isLight ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
        borderTop: `1px solid ${ac}44`,
      }}>
        <p style={{ fontSize: 7.5 * s, fontWeight: 700, color: txtColor, margin: 0 }}>{t.name}</p>
        <p style={{ fontSize: 6.5 * s, color: ac, margin: 0 }}>{t.targetRole}</p>
      </div>
    </div>
  );
}

/* ── Template Card ─────────────────────────────────────────── */
function TemplateCard({ t, index, onUse }: { t: typeof RESUME_TEMPLATES[0]; index: number; onUse: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: "relative", cursor: "pointer" }}
      onClick={onUse}
    >
      <div style={{
        borderRadius: 16, overflow: "hidden",
        border: `2px solid ${hovered ? t.accentColor : "#ffffff12"}`,
        boxShadow: hovered ? `0 12px 40px ${t.accentColor}44` : "0 4px 16px rgba(0,0,0,0.3)",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}>
        <ResumeMock t={t} s={1} />
      </div>
      {index === 0 && <div style={{ position: "absolute", top: 8, left: 8, background: "#C9A84C", color: "#000", fontSize: 9, fontWeight: 700, borderRadius: 4, padding: "2px 7px" }}>Popular</div>}
      {index === 1 && <div style={{ position: "absolute", top: 8, left: 8, background: "#FF4D6D", color: "#fff", fontSize: 9, fontWeight: 700, borderRadius: 4, padding: "2px 7px" }}>New</div>}
      <div style={{ position: "absolute", top: 8, right: 8, background: "#4CAF7D22", border: "1px solid #4CAF7D66", color: "#4CAF7D", fontSize: 8, fontWeight: 600, borderRadius: 3, padding: "2px 6px" }}>ATS ✓</div>

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute", inset: 0, borderRadius: 14,
              background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            <div style={{ background: `linear-gradient(135deg,${t.accentColor},${t.accentColor}cc)`, color: "#000", fontWeight: 700, fontSize: 12, borderRadius: 8, padding: "8px 18px" }}>
              Use this template
            </div>
            <p style={{ fontSize: 10, color: "#d1d5db", margin: 0 }}>{t.name}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Page ─────────────────────────────────────────────────── */
export default function ResumeBuilderPage() {
  const router = useRouter();
  const interviews = useCountUp(28452);
  const atsAvg = useCountUp(94);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a12", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>

      {/* NAV */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 48px", borderBottom: "1px solid #ffffff0d", position: "sticky", top: 0, background: "#0a0a12dd", backdropFilter: "blur(12px)", zIndex: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#C9A84C,#E8C96A)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FileText style={{ width: 16, height: 16, color: "#000" }} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, fontFamily: "'Syne', sans-serif" }}>
            AITestCraft <span style={{ color: "#C9A84C" }}>Resume</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button onClick={() => router.push("/dashboard")} style={{ background: "transparent", border: "none", color: "#9ca3af", fontSize: 13, cursor: "pointer" }}>
            ← Back to Dashboard
          </button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            onClick={() => router.push("/resume-builder/upload")}
            style={{ background: "linear-gradient(135deg,#C9A84C,#E8C96A)", color: "#000", border: "none", borderRadius: 8, padding: "9px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
          >
            Build My Resume
          </motion.button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: "80px 48px 60px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 99, border: "1px solid #C9A84C44", background: "#C9A84C10", padding: "6px 14px", marginBottom: 24 }}>
              <Sparkles style={{ width: 12, height: 12, color: "#C9A84C" }} />
              <span style={{ fontSize: 12, color: "#C9A84C", fontWeight: 600 }}>Powered by Claude AI · QA Domain Expert</span>
            </div>
            <h1 style={{ fontSize: 54, fontWeight: 900, lineHeight: 1.1, marginBottom: 20, fontFamily: "'Syne', sans-serif" }}>
              Land More QA<br />
              <span style={{ background: "linear-gradient(135deg,#C9A84C,#E8C96A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Interviews
              </span> in 2025
            </h1>
            <p style={{ fontSize: 17, color: "#9ca3af", lineHeight: 1.7, marginBottom: 32 }}>
              AI-powered resume builder built for QA Engineers, SDETs, and Test Architects. ATS-optimised, metrics-driven, interview-ready.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
              <div style={{ display: "flex", gap: 2 }}>
                {[1,2,3,4,5].map(i => <Star key={i} style={{ width: 16, height: 16, fill: "#C9A84C", color: "#C9A84C" }} />)}
              </div>
              <span style={{ fontSize: 13, color: "#9ca3af" }}>4.8 from 2,400+ QA professionals</span>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => router.push("/resume-builder/upload")}
                style={{ display: "flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg,#C9A84C,#E8C96A)", color: "#000", border: "none", borderRadius: 12, padding: "14px 28px", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
                <Upload style={{ width: 16, height: 16 }} /> Upload My Resume <ArrowRight style={{ width: 16, height: 16 }} />
              </motion.button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => router.push("/resume-builder/editor")}
                style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", color: "#d1d5db", border: "1px solid #ffffff22", borderRadius: 12, padding: "14px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
                Start from scratch
              </motion.button>
            </div>
            <p style={{ marginTop: 12, fontSize: 12, color: "#6b7280" }}>No credit card · Free ATS score · PDF from Pro plan</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 28 }}>
              {[
                { icon: Zap, label: "AI Content Enhancement" },
                { icon: BarChart3, label: "ATS Score Analysis" },
                { icon: CheckCircle2, label: "23-Point QA Checklist" },
                { icon: Download, label: "PDF Export" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 99, border: "1px solid #ffffff15", background: "#ffffff08" }}>
                  <Icon style={{ width: 13, height: 13, color: "#C9A84C" }} />
                  <span style={{ fontSize: 12, color: "#d1d5db" }}>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Floating template stack */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            style={{ position: "relative", height: 380, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {[2, 1, 0].map((idx) => (
              <motion.div key={idx}
                animate={{ y: [0, -8 + idx * 3, 0] }}
                transition={{ duration: 3 + idx * 0.5, repeat: Infinity, ease: "easeInOut", delay: idx * 0.4 }}
                style={{
                  position: "absolute", left: `${idx * 36}px`, top: `${idx * 28}px`, zIndex: 3 - idx,
                  borderRadius: 16, overflow: "hidden",
                  border: `2px solid ${RESUME_TEMPLATES[idx].accentColor}66`,
                  boxShadow: `0 20px 60px ${RESUME_TEMPLATES[idx].accentColor}33`,
                  transform: `rotate(${(idx - 1) * 5}deg)`,
                }}>
                <ResumeMock t={RESUME_TEMPLATES[idx]} s={1.05} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* STATS BAR */}
      <section style={{ background: "#0e0e1a", borderTop: "1px solid #ffffff0d", borderBottom: "1px solid #ffffff0d", padding: "28px 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 24 }}>
          {[
            { value: `${interviews.toLocaleString()}+`, label: "QA resumes built this month" },
            { value: `${atsAvg}%`, label: "Average ATS score achieved" },
            { value: "10", label: "QA-specific templates" },
            { value: "3×", label: "Higher interview rate" },
          ].map(({ value, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <p style={{ fontSize: 30, fontWeight: 800, color: "#C9A84C", margin: 0, fontFamily: "'Space Mono', monospace" }}>{value}</p>
              <p style={{ fontSize: 12, color: "#6b7280", margin: "4px 0 0" }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TEMPLATE GRID */}
      <section style={{ padding: "80px 48px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, fontFamily: "'Syne', sans-serif", margin: "0 0 12px" }}>
            {RESUME_TEMPLATES.length} Stunning QA Templates
          </h2>
          <p style={{ fontSize: 15, color: "#9ca3af" }}>Every template is ATS-compatible and designed specifically for QA roles</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(188px, 1fr))", gap: 20 }}>
          {RESUME_TEMPLATES.map((t, i) => (
            <TemplateCard key={t.id} t={t} index={i} onUse={() => router.push("/resume-builder/upload")} />
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 44 }}>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/resume-builder/upload")}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg,#C9A84C,#E8C96A)", color: "#000", border: "none", borderRadius: 12, padding: "14px 32px", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
            <Sparkles style={{ width: 16, height: 16 }} /> Start Building for Free <ArrowRight style={{ width: 16, height: 16 }} />
          </motion.button>
        </div>
      </section>

      {/* 3 STEPS */}
      <section style={{ background: "#0e0e1a", padding: "80px 48px", borderTop: "1px solid #ffffff0d" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontSize: 34, fontWeight: 800, textAlign: "center", fontFamily: "'Syne', sans-serif", marginBottom: 48 }}>
            Interview-ready in 3 steps
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
            {[
              { icon: Upload, n: "01", title: "Upload your resume", desc: "Drop your existing PDF or paste plain text. Extracts everything in seconds.", color: "#8B9BB4" },
              { icon: Sparkles, n: "02", title: "AI rewrites your content", desc: "Claude rewrites bullets with metrics and QA keywords — ATS-optimised.", color: "#C9A84C", glow: true },
              { icon: Palette, n: "03", title: "Pick a template & export", desc: "10 QA designs, ATS score panel, and one-click PDF download.", color: "#4CAF7D" },
            ].map(({ icon: Icon, n, title, desc, color, glow }) => (
              <motion.div key={n}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                style={{ position: "relative", borderRadius: 20, border: `1px solid ${glow ? color + "55" : "#ffffff12"}`, padding: "32px 24px", textAlign: "center", background: "#13131f", boxShadow: glow ? `0 0 40px ${color}22` : undefined }}>
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: color, color: "#000", fontSize: 11, fontWeight: 800, borderRadius: 99, padding: "3px 10px" }}>{n}</div>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: `${color}22`, border: `1px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <Icon style={{ width: 24, height: 24, color }} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.6 }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section style={{ padding: "60px 48px", textAlign: "center" }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", color: "#6b7280", marginBottom: 24 }}>
          Used by QA professionals at
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 40 }}>
          {["TCS", "Infosys", "Wipro", "Accenture", "Cognizant", "HCL", "Capgemini"].map(co => (
            <span key={co} style={{ fontSize: 18, fontWeight: 700, color: "#374151", cursor: "default" }}>{co}</span>
          ))}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section style={{ background: "linear-gradient(135deg,#0e0e1a,#1a1208)", padding: "80px 48px", textAlign: "center", borderTop: "1px solid #C9A84C22" }}>
        <h2 style={{ fontSize: 38, fontWeight: 900, fontFamily: "'Syne', sans-serif", marginBottom: 16 }}>Ready to get hired as a QA Engineer?</h2>
        <p style={{ fontSize: 16, color: "#9ca3af", marginBottom: 32 }}>Join thousands of QA professionals who landed their dream jobs.</p>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/resume-builder/upload")}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg,#C9A84C,#E8C96A)", color: "#000", border: "none", borderRadius: 14, padding: "16px 40px", fontSize: 16, fontWeight: 800, cursor: "pointer" }}>
          Build My QA Resume Now <ArrowRight style={{ width: 18, height: 18 }} />
        </motion.button>
      </section>
    </div>
  );
}

"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import {
  Download, Sparkles, FileText, LayoutTemplate,
  ArrowLeft, ChevronLeft, ChevronRight,
  Save,
} from "lucide-react";
import type { ResumeData, AtsScore } from "@/types/resume";
import { SAMPLE_RESUME } from "@/lib/resume/parser";
import AtsScorePanel from "@/components/resume/AtsScorePanel";
import { supabase } from "@/lib/supabase";
import UsageBanner from "@/components/resume/UsageBanner";

// Lazy-load templates
const ClassicWhite   = dynamic(() => import("@/components/resume/templates/ClassicWhite"),   { ssr: false });
const TwoColumnClean = dynamic(() => import("@/components/resume/templates/TwoColumnClean"), { ssr: false });
const NavyPro        = dynamic(() => import("@/components/resume/templates/NavyPro"),        { ssr: false });
const EditorialBloom = dynamic(() => import("@/components/resume/templates/EditorialBloom"), { ssr: false });
const MintFresh      = dynamic(() => import("@/components/resume/templates/MintFresh"),      { ssr: false });
const ObsidianGold   = dynamic(() => import("@/components/resume/templates/ObsidianGold"),   { ssr: false });

const TEMPLATES = [
  { id: "classic-white",    name: "Classic White",   accent: "#2563eb", bg: "#ffffff" },
  { id: "two-column-clean", name: "Two Column",      accent: "#2563eb", bg: "#ffffff" },
  { id: "navy-pro",         name: "Navy Pro",        accent: "#3b6cb7", bg: "#1e2d4a" },
  { id: "editorial-bloom",  name: "Editorial Bloom", accent: "#FF6B9D", bg: "#faf8f4" },
  { id: "mint-fresh",       name: "Mint Fresh",      accent: "#4CAF7D", bg: "#f6fef9" },
  { id: "obsidian-gold",    name: "Obsidian Gold",   accent: "#C9A84C", bg: "#0e0e16" },
];

const TEMPLATE_MAP: Record<string, React.ComponentType<{ data: ResumeData }>> = {
  "classic-white":    ClassicWhite,
  "two-column-clean": TwoColumnClean,
  "navy-pro":         NavyPro,
  "editorial-bloom":  EditorialBloom,
  "mint-fresh":       MintFresh,
  "obsidian-gold":    ObsidianGold,
};

/* ── Sidebar tool button ──────────────────────────────────── */
function ToolBtn({
  icon: Icon, label, active, onClick,
}: { icon: React.ElementType; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 4, width: "100%", padding: "10px 6px", border: "none", cursor: "pointer",
      background: active ? "#eff6ff" : "transparent",
      borderRadius: 8,
      borderLeft: active ? "3px solid #2563eb" : "3px solid transparent",
      color: active ? "#2563eb" : "#6b7280",
      transition: "all 0.15s",
    }}>
      <Icon style={{ width: 18, height: 18 }} />
      <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</span>
    </button>
  );
}

/* ── Edit field ───────────────────────────────────────────── */
function Field({ label, value, onChange, multiline = false }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean;
}) {
  const base: React.CSSProperties = {
    width: "100%", borderRadius: 6, border: "1px solid #e5e7eb",
    background: "#f9fafb", padding: "6px 10px", fontSize: 12, color: "#111827",
    outline: "none", boxSizing: "border-box", fontFamily: "inherit",
    transition: "border-color 0.15s",
  };
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#6b7280", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </label>
      {multiline
        ? <textarea rows={3} style={{ ...base, resize: "vertical" }} value={value} onChange={e => onChange(e.target.value)} />
        : <input type="text" style={base} value={value} onChange={e => onChange(e.target.value)} />}
    </div>
  );
}

/* ── Mini template thumbnail ──────────────────────────────── */
function TemplateThumbnail({ t, selected, onSelect }: {
  t: typeof TEMPLATES[0]; selected: boolean; onSelect: () => void;
}) {
  const Component = TEMPLATE_MAP[t.id];
  const TH = 100;
  const sc = TH / 1123;
  const TW = Math.round(794 * sc);
  return (
    <button onClick={onSelect} style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
      background: "transparent", border: "none", cursor: "pointer", padding: "4px",
      borderRadius: 8, outline: "none",
    }}>
      <div style={{
        border: selected ? `2px solid ${t.accent}` : "2px solid #e5e7eb",
        borderRadius: 6, overflow: "hidden", width: TW, height: TH,
        boxShadow: selected ? `0 0 0 3px ${t.accent}33` : "0 1px 4px rgba(0,0,0,0.1)",
        background: t.bg, transition: "border-color 0.15s",
      }}>
        <div style={{ transform: `scale(${sc})`, transformOrigin: "top left", width: 794, pointerEvents: "none" }}>
          <Component data={SAMPLE_RESUME} />
        </div>
      </div>
      <span style={{ fontSize: 9, fontWeight: selected ? 700 : 500, color: selected ? t.accent : "#6b7280", textAlign: "center", lineHeight: 1.3 }}>
        {t.name}
      </span>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════ */
export default function EditorPage() {
  const { user } = useUser();
  const router = useRouter();
  const [resumeData, setResumeData] = useState<ResumeData>(SAMPLE_RESUME);
  const [selectedTemplate, setSelectedTemplate] = useState("classic-white");
  const [activePanel, setActivePanel] = useState<"edit" | "templates" | "ats">("edit");
  const [atsScore, setAtsScore] = useState<AtsScore | null>(null);
  const [atsLoading, setAtsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rightOpen, setRightOpen] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("resumeData");
    if (stored) {
      try { setResumeData(JSON.parse(stored)); } catch { /* use sample */ }
    }
    const tpl = sessionStorage.getItem("selectedTemplate");
    if (tpl && TEMPLATE_MAP[tpl]) setSelectedTemplate(tpl);
  }, []);

  const TemplateComponent = TEMPLATE_MAP[selectedTemplate] ?? ClassicWhite;
  const currentTpl = TEMPLATES.find(t => t.id === selectedTemplate) ?? TEMPLATES[0];

  /* ── ATS scoring ──────────────────────────────────────── */
  async function runAtsScore() {
    setAtsLoading(true);
    setActivePanel("ats");
    try {
      const res = await fetch("/api/resume/ats-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setAtsScore(json.atsScore);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ATS scoring failed");
    } finally {
      setAtsLoading(false);
    }
  }

  /* ── PDF download ─────────────────────────────────────── */
  async function downloadPdf() {
    try {
      toast("Generating PDF…", { duration: 2000 });
      const plan = user?.publicMetadata?.plan as string | undefined;
      const isPro = plan === "pro" || plan === "admin";

      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"), import("jspdf"),
      ]);
      const el = document.getElementById("resume-preview");
      if (!el) { toast.error("Preview not ready, try again."); return; }
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: 794,
        windowWidth: 794,
      });

      // Free users get a watermark banner at the bottom
      if (!isPro) {
        const ctx = canvas.getContext("2d")!;
        const bh = 56;
        // Blue banner
        ctx.fillStyle = "rgba(37, 99, 235, 0.92)";
        ctx.fillRect(0, canvas.height - bh, canvas.width, bh);
        // Main text
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${Math.round(canvas.width * 0.022)}px Arial, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText("✦ Created with AITestCraft Resume Builder", canvas.width / 2, canvas.height - bh + 22);
        // Sub text
        ctx.font = `${Math.round(canvas.width * 0.016)}px Arial, sans-serif`;
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.fillText("Upgrade to Pro for watermark-free PDF  ·  ai-testcraft.vercel.app", canvas.width / 2, canvas.height - bh + 44);
      }

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 210, 297);
      pdf.save(`${resumeData.personalInfo.name.replace(/\s/g, "_")}_Resume.pdf`);
      toast.success(isPro ? "Resume downloaded!" : "Resume downloaded! Upgrade to Pro to remove watermark.");
    } catch (err) {
      toast.error("Download failed: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  /* ── Save ─────────────────────────────────────────────── */
  async function saveSession() {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase()
        .from("resume_builder_sessions")
        .upsert({
          user_id: user.id,
          resume_data: resumeData,
          ats_score: atsScore,
          selected_template: selectedTemplate,
          is_enhanced: false,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
      if (error) throw error;
      toast.success("Resume saved!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function updatePersonal(key: string, val: string) {
    setResumeData(d => ({ ...d, personalInfo: { ...d.personalInfo, [key]: val } }));
  }

  /* ── Preview scale to fit viewport ───────────────────── */
  // Resume is 794px wide. Center area ≈ viewport minus 80 (tools) minus rightPanel
  const previewScale = 0.82;

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f3f4f6", overflow: "hidden", fontFamily: "system-ui, sans-serif" }}>

      {/* ══ LEFT NARROW TOOLBAR (like enhancv) ═══════════ */}
      <aside style={{
        width: 72, display: "flex", flexDirection: "column", alignItems: "center",
        background: "#ffffff", borderRight: "1px solid #e5e7eb",
        padding: "12px 6px", gap: 4, zIndex: 10, boxShadow: "1px 0 8px rgba(0,0,0,0.06)",
      }}>
        {/* Back */}
        <button onClick={() => router.push("/resume-builder")} style={{
          width: "100%", display: "flex", flexDirection: "column", alignItems: "center",
          gap: 3, padding: "8px 6px", background: "transparent", border: "none", cursor: "pointer",
          color: "#9ca3af", borderRadius: 8, marginBottom: 8,
        }}>
          <ArrowLeft style={{ width: 16, height: 16 }} />
          <span style={{ fontSize: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Back</span>
        </button>

        <div style={{ width: "80%", height: 1, background: "#f3f4f6", marginBottom: 4 }} />

        <ToolBtn icon={FileText}       label="Edit"      active={activePanel === "edit"}      onClick={() => { setActivePanel("edit"); setRightOpen(true); }} />
        <ToolBtn icon={LayoutTemplate} label="Templates" active={activePanel === "templates"} onClick={() => { setActivePanel("templates"); setRightOpen(true); }} />
        <ToolBtn icon={Sparkles}       label="ATS"       active={activePanel === "ats"}       onClick={() => { runAtsScore(); setRightOpen(true); }} />

        <div style={{ flex: 1 }} />

        <ToolBtn icon={Save}     label={saving ? "…" : "Save"} active={false} onClick={saveSession} />
        <ToolBtn icon={Download} label="Download" active={false} onClick={downloadPdf} />
      </aside>

      {/* ══ CENTER: RESUME PREVIEW ═══════════════════════ */}
      <main style={{
        flex: 1, overflowY: "auto", background: "#e9eaec",
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "16px 24px 40px",
      }}>
        {/* Top bar */}
        <div style={{
          width: "100%", maxWidth: 794 * previewScale + 40,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: currentTpl.accent }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{currentTpl.name}</span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => setRightOpen(o => !o)}
              style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, background: "#fff", border: "1px solid #e5e7eb", color: "#374151", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>
              {rightOpen ? <ChevronRight style={{ width: 12, height: 12 }} /> : <ChevronLeft style={{ width: 12, height: 12 }} />}
              {rightOpen ? "Hide panel" : "Show panel"}
            </button>
            <button onClick={downloadPdf}
              style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, background: "#2563eb", border: "none", color: "#fff", borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontWeight: 600 }}>
              <Download style={{ width: 12, height: 12 }} /> Download PDF
            </button>
          </div>
        </div>

        <UsageBanner />

        {/* Hidden full-size resume used by html2canvas for PDF export */}
        <div id="resume-preview" style={{ position: "fixed", top: 0, left: 0, width: 794, opacity: 0, pointerEvents: "none" }}>
          <TemplateComponent data={resumeData} />
        </div>

        {/* Visible scaled preview */}
        <div style={{
          transform: `scale(${previewScale})`,
          transformOrigin: "top center",
          marginBottom: `-${Math.round(794 * 1.415 * (1 - previewScale))}px`,
          boxShadow: "0 8px 48px rgba(0,0,0,0.18)",
          borderRadius: 2,
        }}>
          <TemplateComponent data={resumeData} />
        </div>
      </main>

      {/* ══ RIGHT PANEL: Edit / Templates / ATS ══════════ */}
      {rightOpen && (
        <aside style={{
          width: 300, borderLeft: "1px solid #e5e7eb", background: "#ffffff",
          overflowY: "auto", display: "flex", flexDirection: "column",
          boxShadow: "-2px 0 12px rgba(0,0,0,0.06)",
        }}>

          {/* ── Templates panel ─────────────────────────── */}
          {activePanel === "templates" && (
            <div style={{ padding: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
                Choose Template
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {TEMPLATES.map(t => (
                  <TemplateThumbnail key={t.id} t={t} selected={selectedTemplate === t.id}
                    onSelect={() => { setSelectedTemplate(t.id); sessionStorage.setItem("selectedTemplate", t.id); }} />
                ))}
              </div>
            </div>
          )}

          {/* ── Edit panel ──────────────────────────────── */}
          {activePanel === "edit" && (
            <div style={{ padding: 16, flex: 1 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
                Personal Info
              </p>
              <Field label="Full Name"  value={resumeData.personalInfo.name}     onChange={v => updatePersonal("name", v)} />
              <Field label="Title"      value={resumeData.personalInfo.title}    onChange={v => updatePersonal("title", v)} />
              <Field label="Email"      value={resumeData.personalInfo.email}    onChange={v => updatePersonal("email", v)} />
              <Field label="Phone"      value={resumeData.personalInfo.phone}    onChange={v => updatePersonal("phone", v)} />
              <Field label="Location"   value={resumeData.personalInfo.location} onChange={v => updatePersonal("location", v)} />
              <Field label="LinkedIn"   value={resumeData.personalInfo.linkedin ?? ""} onChange={v => updatePersonal("linkedin", v)} />
              <Field label="Summary"    value={resumeData.personalInfo.summary}  onChange={v => updatePersonal("summary", v)} multiline />

              <p style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.08em", margin: "18px 0 12px" }}>
                Experience
              </p>
              {resumeData.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: 12, padding: "10px 12px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#111827", marginBottom: 6 }}>{exp.role}</p>
                  <p style={{ fontSize: 10, color: "#6b7280", marginBottom: 8 }}>{exp.company}</p>
                  {exp.bullets.map((b, j) => (
                    <textarea key={j} rows={2} value={b}
                      onChange={e => {
                        const updated = resumeData.experience.map((ex, ei) =>
                          ei === i ? { ...ex, bullets: ex.bullets.map((bul, bi) => bi === j ? e.target.value : bul) } : ex
                        );
                        setResumeData(d => ({ ...d, experience: updated }));
                      }}
                      style={{ width: "100%", marginBottom: 4, borderRadius: 5, border: "1px solid #e5e7eb", background: "#fff", color: "#374151", padding: "5px 8px", fontSize: 10, resize: "none", outline: "none", boxSizing: "border-box", lineHeight: 1.5 }}
                    />
                  ))}
                </div>
              ))}

              <p style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.08em", margin: "18px 0 12px" }}>
                Skills
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
                {resumeData.skills.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, borderRadius: 6, border: "1px solid #e5e7eb", background: "#f9fafb", padding: "4px 8px" }}>
                    <input
                      value={s.name}
                      onChange={e => setResumeData(d => ({ ...d, skills: d.skills.map((sk, si) => si === i ? { ...sk, name: e.target.value } : sk) }))}
                      style={{ border: "none", background: "transparent", fontSize: 11, color: "#111827", outline: "none", width: 80 }}
                    />
                    <select
                      value={s.level}
                      onChange={e => setResumeData(d => ({ ...d, skills: d.skills.map((sk, si) => si === i ? { ...sk, level: Number(e.target.value) as 1|2|3|4|5 } : sk) }))}
                      style={{ border: "none", background: "transparent", fontSize: 10, color: "#2563eb", outline: "none", cursor: "pointer" }}
                    >
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{"★".repeat(n)}</option>)}
                    </select>
                  </div>
                ))}
              </div>

              <p style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.08em", margin: "18px 0 12px" }}>
                Education
              </p>
              {resumeData.education.map((ed, i) => (
                <div key={i} style={{ marginBottom: 10, padding: "10px 12px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb" }}>
                  <input value={ed.degree} placeholder="Degree"
                    onChange={e => setResumeData(d => ({ ...d, education: d.education.map((x, j) => j === i ? { ...x, degree: e.target.value } : x) }))}
                    style={{ width: "100%", marginBottom: 4, border: "1px solid #e5e7eb", borderRadius: 5, background: "#fff", color: "#111827", padding: "5px 8px", fontSize: 11, outline: "none", boxSizing: "border-box" }}
                  />
                  <input value={ed.institution} placeholder="Institution"
                    onChange={e => setResumeData(d => ({ ...d, education: d.education.map((x, j) => j === i ? { ...x, institution: e.target.value } : x) }))}
                    style={{ width: "100%", marginBottom: 4, border: "1px solid #e5e7eb", borderRadius: 5, background: "#fff", color: "#374151", padding: "5px 8px", fontSize: 11, outline: "none", boxSizing: "border-box" }}
                  />
                  <input value={ed.year} placeholder="Year"
                    onChange={e => setResumeData(d => ({ ...d, education: d.education.map((x, j) => j === i ? { ...x, year: e.target.value } : x) }))}
                    style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 5, background: "#fff", color: "#6b7280", padding: "5px 8px", fontSize: 11, outline: "none", boxSizing: "border-box" }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* ── ATS panel ───────────────────────────────── */}
          {activePanel === "ats" && (
            <AtsScorePanel score={atsScore} loading={atsLoading} onRescore={runAtsScore} />
          )}
        </aside>
      )}
    </div>
  );
}

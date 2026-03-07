"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Download, Eye, Sparkles, FileText } from "lucide-react";
import type { ResumeData, AtsScore } from "@/types/resume";
import { SAMPLE_RESUME } from "@/lib/resume/parser";
import TemplateGallery from "@/components/resume/TemplateGallery";
import AtsScorePanel from "@/components/resume/AtsScorePanel";
import { supabase } from "@/lib/supabase";

// Lazy-load template components (avoid SSR issues)
const ObsidianGold   = dynamic(() => import("@/components/resume/templates/ObsidianGold"),   { ssr: false });
const NeonCircuit    = dynamic(() => import("@/components/resume/templates/NeonCircuit"),    { ssr: false });
const EditorialBloom = dynamic(() => import("@/components/resume/templates/EditorialBloom"), { ssr: false });
const MintFresh      = dynamic(() => import("@/components/resume/templates/MintFresh"),      { ssr: false });
const SteelPro       = dynamic(() => import("@/components/resume/templates/SteelPro"),       { ssr: false });

const TEMPLATE_MAP: Record<string, React.ComponentType<{ data: ResumeData }>> = {
  "obsidian-gold":    ObsidianGold,
  "neon-circuit":     NeonCircuit,
  "editorial-bloom":  EditorialBloom,
  "mint-fresh":       MintFresh,
  "steel-pro":        SteelPro,
};

/* ── simple inline editor field ──────────────────────────── */
function Field({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  const cls = "w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-yellow-500/50 focus:outline-none";
  return (
    <div className="mb-2.5">
      <label className="mb-1 block text-[10px] text-slate-500">{label}</label>
      {multiline
        ? <textarea rows={3} className={cls} value={value} onChange={e => onChange(e.target.value)} />
        : <input type="text" className={cls} value={value} onChange={e => onChange(e.target.value)} />}
    </div>
  );
}

export default function EditorPage() {
  const { user } = useUser();
  const [resumeData, setResumeData] = useState<ResumeData>(SAMPLE_RESUME);
  const [selectedTemplate, setSelectedTemplate] = useState("obsidian-gold");
  const [activeTab, setActiveTab] = useState<"edit" | "ats">("edit");
  const [atsScore, setAtsScore] = useState<AtsScore | null>(null);
  const [atsLoading, setAtsLoading] = useState(false);
  const [fullPreview, setFullPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load resume from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("resumeData");
    if (stored) {
      try { setResumeData(JSON.parse(stored)); } catch { /* use sample */ }
    }
  }, []);

  const TemplateComponent = TEMPLATE_MAP[selectedTemplate] ?? ObsidianGold;

  /* ── ATS scoring ──────────────────────────────────────── */
  async function runAtsScore() {
    setAtsLoading(true);
    setActiveTab("ats");
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
    // Check plan — FREE users see upgrade prompt
    const plan = user?.publicMetadata?.plan as string | undefined;
    if (!plan || plan === "free") {
      toast.error("PDF download requires a Pro plan. Upgrade to unlock!", { duration: 4000 });
      return;
    }
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const el = document.getElementById("resume-preview");
      if (!el) return;
      const canvas = await html2canvas(el, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
      pdf.save(`${resumeData.personalInfo.name.replace(/\s/g, "_")}_Resume.pdf`);
      toast.success("Resume downloaded!");
    } catch {
      toast.error("Download failed. Please try again.");
    }
  }

  /* ── Save to Supabase ─────────────────────────────────── */
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

  /* ── Helpers ──────────────────────────────────────────── */
  function updatePersonal(key: string, val: string) {
    setResumeData(d => ({ ...d, personalInfo: { ...d.personalInfo, [key]: val } }));
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0d0d14", color: "#fff", overflow: "hidden" }}>

      {/* ── Left: Template gallery ──────────────────────── */}
      <aside style={{ width: "240px", overflowY: "auto", borderRight: "1px solid #ffffff10", padding: "16px 12px" }}>
        <p style={{ fontSize: "10px", fontFamily: "'Space Mono', monospace", letterSpacing: "2px", color: "#6b7280", textTransform: "uppercase", marginBottom: "12px" }}>Templates</p>
        <TemplateGallery selected={selectedTemplate} onSelect={setSelectedTemplate} />
      </aside>

      {/* ── Center: Live preview ────────────────────────── */}
      <main style={{ flex: 1, overflowY: "auto", padding: "16px", background: "#0a0a10" }}>
        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "11px", color: "#C9A84C", fontWeight: 600 }}>
            {TEMPLATE_MAP[selectedTemplate] ? selectedTemplate.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : "Template"}
          </span>
          <div style={{ flex: 1 }} />
          <button onClick={() => setFullPreview(true)}
            style={{ display: "flex", alignItems: "center", gap: "4px", background: "#ffffff10", border: "1px solid #ffffff20", color: "#d1d5db", borderRadius: "6px", padding: "5px 10px", fontSize: "11px", cursor: "pointer" }}>
            <Eye style={{ width: 12, height: 12 }} /> Full Preview
          </button>
          <button onClick={runAtsScore}
            style={{ display: "flex", alignItems: "center", gap: "4px", background: "#C9A84C22", border: "1px solid #C9A84C44", color: "#C9A84C", borderRadius: "6px", padding: "5px 10px", fontSize: "11px", cursor: "pointer" }}>
            <Sparkles style={{ width: 12, height: 12 }} /> ATS Score
          </button>
          <button onClick={downloadPdf}
            style={{ display: "flex", alignItems: "center", gap: "4px", background: "linear-gradient(135deg,#C9A84C,#E8C96A)", color: "#000", border: "none", borderRadius: "6px", padding: "5px 12px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}>
            <Download style={{ width: 12, height: 12 }} /> PDF
          </button>
          <button onClick={saveSession} disabled={saving}
            style={{ background: "#ffffff10", border: "1px solid #ffffff20", color: "#d1d5db", borderRadius: "6px", padding: "5px 10px", fontSize: "11px", cursor: "pointer" }}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        {/* Scaled preview */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ transform: "scale(0.65)", transformOrigin: "top center", marginBottom: "-280px" }}>
            <TemplateComponent data={resumeData} />
          </div>
        </div>
      </main>

      {/* ── Right: Edit / ATS ───────────────────────────── */}
      <aside style={{ width: "300px", borderLeft: "1px solid #ffffff10", overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #ffffff10" }}>
          {(["edit", "ats"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: "12px", fontSize: "11px", fontWeight: 600,
                background: "transparent", border: "none", cursor: "pointer",
                color: activeTab === tab ? "#C9A84C" : "#6b7280",
                borderBottom: activeTab === tab ? "2px solid #C9A84C" : "2px solid transparent",
                textTransform: "capitalize",
              }}>
              {tab === "edit" ? <><FileText style={{ display: "inline", width: 11, height: 11, marginRight: 4 }} />Edit</> : <><Sparkles style={{ display: "inline", width: 11, height: 11, marginRight: 4 }} />ATS Score</>}
            </button>
          ))}
        </div>

        {/* Edit tab */}
        {activeTab === "edit" && (
          <div style={{ padding: "16px", flex: 1 }}>
            <p style={{ fontSize: "10px", fontFamily: "'Space Mono', monospace", letterSpacing: "2px", color: "#6b7280", textTransform: "uppercase", marginBottom: "12px" }}>Personal Info</p>
            <Field label="Full Name" value={resumeData.personalInfo.name} onChange={v => updatePersonal("name", v)} />
            <Field label="Title" value={resumeData.personalInfo.title} onChange={v => updatePersonal("title", v)} />
            <Field label="Email" value={resumeData.personalInfo.email} onChange={v => updatePersonal("email", v)} />
            <Field label="Phone" value={resumeData.personalInfo.phone} onChange={v => updatePersonal("phone", v)} />
            <Field label="Location" value={resumeData.personalInfo.location} onChange={v => updatePersonal("location", v)} />
            <Field label="LinkedIn" value={resumeData.personalInfo.linkedin ?? ""} onChange={v => updatePersonal("linkedin", v)} />
            <Field label="GitHub" value={resumeData.personalInfo.github ?? ""} onChange={v => updatePersonal("github", v)} />
            <Field label="Summary" value={resumeData.personalInfo.summary} onChange={v => updatePersonal("summary", v)} multiline />

            <p style={{ fontSize: "10px", fontFamily: "'Space Mono', monospace", letterSpacing: "2px", color: "#6b7280", textTransform: "uppercase", margin: "14px 0 10px" }}>Experience</p>
            {resumeData.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: "12px", padding: "10px", borderRadius: "8px", border: "1px solid #ffffff10", background: "#0f0f1a" }}>
                <p style={{ fontSize: "11px", fontWeight: 600, color: "#C9A84C", marginBottom: "8px" }}>{exp.role} @ {exp.company}</p>
                {exp.bullets.map((b, j) => (
                  <textarea key={j} rows={2} value={b}
                    onChange={e => {
                      const updated = resumeData.experience.map((ex, ei) =>
                        ei === i ? { ...ex, bullets: ex.bullets.map((bul, bi) => bi === j ? e.target.value : bul) } : ex
                      );
                      setResumeData(d => ({ ...d, experience: updated }));
                    }}
                    style={{ width: "100%", marginBottom: "4px", borderRadius: "6px", border: "1px solid #ffffff10", background: "#ffffff05", color: "#d1d5db", padding: "5px 8px", fontSize: "10px", resize: "none", outline: "none" }}
                  />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ATS tab */}
        {activeTab === "ats" && (
          <AtsScorePanel score={atsScore} loading={atsLoading} onRescore={runAtsScore} />
        )}
      </aside>

      {/* ── Full preview modal ──────────────────────────── */}
      {fullPreview && (
        <div
          onClick={() => setFullPreview(false)}
          style={{ position: "fixed", inset: 0, background: "#000000cc", zIndex: 50, overflowY: "auto", display: "flex", justifyContent: "center", padding: "40px 20px" }}
        >
          <div onClick={e => e.stopPropagation()}>
            <TemplateComponent data={resumeData} />
          </div>
        </div>
      )}
    </div>
  );
}

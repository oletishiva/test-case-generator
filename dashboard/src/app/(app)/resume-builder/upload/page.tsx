"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, CheckCircle2, ChevronDown, ChevronUp,
  ArrowRight, Sparkles, AlertCircle, X, Plus, Trash2,
} from "lucide-react";
import type { ResumeData, Experience, Skill } from "@/types/resume";
import { SAMPLE_RESUME } from "@/lib/resume/parser";

/* ── Types ──────────────────────────────────────────────────── */
type Panel = 1 | 2 | 3;

const PARSE_STEPS = [
  "Extracting your experience...",
  "Identifying your skills...",
  "Parsing education & certifications...",
  "Almost done...",
];

/* ── Helpers ─────────────────────────────────────────────────── */
function Section({
  title, children, defaultOpen = false,
}: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-white/10 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-white hover:bg-white/5 transition-colors"
        style={{ background: "#13131f" }}
      >
        {title}
        {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
      </button>
      {open && <div className="p-4" style={{ background: "#0f0f1a" }}>{children}</div>}
    </div>
  );
}

function Field({
  label, value, onChange, multiline = false,
}: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  const cls = "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-yellow-500/50 focus:outline-none focus:ring-1 focus:ring-yellow-500/30";
  return (
    <div className="mb-3">
      <label className="mb-1 block text-xs text-slate-400">{label}</label>
      {multiline
        ? <textarea rows={3} className={cls} value={value} onChange={e => onChange(e.target.value)} />
        : <input type="text" className={cls} value={value} onChange={e => onChange(e.target.value)} />}
    </div>
  );
}

/* ── Main page ────────────────────────────────────────────────── */
export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [panel, setPanel] = useState<Panel>(1);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [pasteText, setPasteText] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parseStep, setParseStep] = useState(0);
  const [parseError, setParseError] = useState("");

  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [originalData, setOriginalData] = useState<ResumeData | null>(null);
  const [enhancing, setEnhancing] = useState(false);
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [targetRole, setTargetRole] = useState("QA Engineer");
  const [jobDesc, setJobDesc] = useState("");

  /* ── Drag handlers ──────────────────────────────────────── */
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(true);
  }, []);
  const onDragLeave = useCallback(() => setIsDragging(false), []);
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === "application/pdf") setFile(f);
  }, []);

  /* ── Parse ──────────────────────────────────────────────── */
  async function handleParse() {
    if (!file && !pasteText.trim()) return;
    setParsing(true); setParseError(""); setParseStep(0);

    const stepTimer = setInterval(() => {
      setParseStep(p => Math.min(p + 1, PARSE_STEPS.length - 1));
    }, 800);

    try {
      const formData = new FormData();
      if (file) formData.append("file", file);
      else formData.append("text", pasteText);

      const res = await fetch("/api/resume/parse", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Parse failed");

      setResumeData(json.resumeData);
      setOriginalData(json.resumeData);
      setPanel(2);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Parse failed");
    } finally {
      clearInterval(stepTimer);
      setParsing(false);
    }
  }

  /* ── Sample resume ──────────────────────────────────────── */
  function loadSample() {
    setResumeData(SAMPLE_RESUME);
    setOriginalData(SAMPLE_RESUME);
    setPanel(2);
  }

  /* ── Enhance ────────────────────────────────────────────── */
  async function handleEnhance() {
    if (!resumeData) return;
    setEnhancing(true);
    try {
      const res = await fetch("/api/resume/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData, targetRole, jobDescription: jobDesc }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Enhance failed");
      setResumeData(json.enhanced);
      setIsEnhanced(true);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Enhance failed");
    } finally {
      setEnhancing(false);
    }
  }

  /* ── Confirm → save to sessionStorage & navigate ─────────── */
  function handleConfirm() {
    if (!resumeData) return;
    sessionStorage.setItem("resumeData", JSON.stringify(resumeData));
    router.push("/resume-builder/editor");
  }

  /* ── Resume data update helpers ─────────────────────────── */
  function updatePersonal(key: string, val: string) {
    if (!resumeData) return;
    setResumeData({ ...resumeData, personalInfo: { ...resumeData.personalInfo, [key]: val } });
  }
  function updateExpBullet(expIdx: number, bulletIdx: number, val: string) {
    if (!resumeData) return;
    const exp = resumeData.experience.map((e, i) =>
      i === expIdx ? { ...e, bullets: e.bullets.map((b, j) => j === bulletIdx ? val : b) } : e
    );
    setResumeData({ ...resumeData, experience: exp });
  }
  function addExpBullet(expIdx: number) {
    if (!resumeData) return;
    const exp = resumeData.experience.map((e, i) =>
      i === expIdx ? { ...e, bullets: [...e.bullets, ""] } : e
    );
    setResumeData({ ...resumeData, experience: exp });
  }
  function removeExpBullet(expIdx: number, bulletIdx: number) {
    if (!resumeData) return;
    const exp = resumeData.experience.map((e, i) =>
      i === expIdx ? { ...e, bullets: e.bullets.filter((_, j) => j !== bulletIdx) } : e
    );
    setResumeData({ ...resumeData, experience: exp });
  }

  /* ── Diff highlight helper ──────────────────────────────── */
  function DiffBullet({ original, enhanced }: { original?: string; enhanced: string }) {
    const changed = original !== enhanced;
    return (
      <div className={`rounded-lg p-2 text-xs ${changed ? "border border-yellow-500/30 bg-yellow-500/5" : "bg-white/5"}`}>
        {changed && original && (
          <p className="mb-1 text-slate-500 line-through">{original}</p>
        )}
        <p className={changed ? "text-yellow-300" : "text-slate-300"}>{enhanced}</p>
        {changed && (
          <span className="mt-1 inline-block text-[9px] text-yellow-500 font-semibold uppercase tracking-wider">AI Enhanced</span>
        )}
      </div>
    );
  }

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="min-h-screen px-4 py-10" style={{ background: "#0d0d14", color: "#fff" }}>
      <div className="mx-auto max-w-3xl">

        {/* Stepper header */}
        <div className="mb-10 flex items-center justify-center gap-3">
          {([1, 2, 3] as Panel[]).map((n) => (
            <div key={n} className="flex items-center gap-3">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all"
                style={{
                  background: panel >= n ? "linear-gradient(135deg,#C9A84C,#E8C96A)" : "#1a1a2e",
                  color: panel >= n ? "#000" : "#666",
                  border: "1px solid",
                  borderColor: panel >= n ? "#C9A84C" : "#333",
                }}
              >
                {panel > n ? <CheckCircle2 className="h-4 w-4" /> : n}
              </div>
              <span className="hidden text-xs text-slate-400 sm:block">
                {n === 1 ? "Upload" : n === 2 ? "Review & Enhance" : "Confirm"}
              </span>
              {n < 3 && <div className="h-px w-8 bg-white/10" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── Panel 1: Upload ─────────────────────────────────── */}
          {panel === 1 && (
            <motion.div key="p1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="mb-2 text-2xl font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>Upload your resume</h2>
              <p className="mb-8 text-sm text-slate-400">PDF only, max 5MB. Or paste your resume text below.</p>

              {/* Drop zone */}
              <div
                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                onClick={() => !file && fileInputRef.current?.click()}
                className="relative mb-4 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-all cursor-pointer"
                style={{
                  borderColor: isDragging ? "#C9A84C" : file ? "#4CAF7D" : "#333",
                  background: isDragging ? "#C9A84C0a" : file ? "#4CAF7D0a" : "#0f0f1a",
                  animation: isDragging ? "none" : "borderPulse 3s infinite",
                }}
              >
                <input ref={fileInputRef} type="file" accept=".pdf" className="hidden"
                  onChange={e => e.target.files?.[0] && setFile(e.target.files[0])} />

                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle2 className="h-12 w-12 text-green-400" />
                    <p className="font-semibold text-white">{file.name}</p>
                    <p className="text-sm text-slate-400">{(file.size / 1024).toFixed(0)} KB</p>
                    <button onClick={e => { e.stopPropagation(); setFile(null); }}
                      className="mt-2 flex items-center gap-1 text-xs text-red-400 hover:text-red-300">
                      <X className="h-3 w-3" /> Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="mb-4 h-12 w-12 text-slate-500" />
                    <p className="font-semibold text-white">Drag & drop your PDF here</p>
                    <p className="mt-1 text-sm text-slate-500">or click to browse</p>
                    <p className="mt-2 text-xs text-slate-600">PDF · max 5 MB</p>
                  </>
                )}
              </div>

              {/* Paste text toggle */}
              <button onClick={() => setShowPaste(!showPaste)}
                className="mb-4 flex items-center gap-1.5 text-sm text-yellow-400 hover:text-yellow-300 transition-colors">
                <FileText className="h-4 w-4" />
                {showPaste ? "Hide text input" : "Or paste your resume text"}
              </button>

              {showPaste && (
                <textarea
                  value={pasteText} onChange={e => setPasteText(e.target.value)}
                  rows={8} placeholder="Paste your resume content here..."
                  className="mb-4 w-full rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white placeholder-slate-600 focus:border-yellow-500/40 focus:outline-none"
                />
              )}

              {/* Target role input */}
              <div className="mb-6">
                <label className="mb-1 block text-xs text-slate-400">Target Role (for AI enhancement)</label>
                <input type="text" value={targetRole} onChange={e => setTargetRole(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-yellow-500/50 focus:outline-none"
                  placeholder="e.g. Senior QA Engineer, SDET, QA Lead" />
              </div>

              {parseError && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {parseError}
                </div>
              )}

              {/* Parsing progress */}
              {parsing && (
                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                    <span>{PARSE_STEPS[parseStep]}</span>
                    <span>{Math.round(((parseStep + 1) / PARSE_STEPS.length) * 100)}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "linear-gradient(90deg,#C9A84C,#E8C96A)" }}
                      animate={{ width: `${((parseStep + 1) / PARSE_STEPS.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleParse} disabled={(!file && !pasteText.trim()) || parsing}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-bold text-black disabled:opacity-40 transition-all"
                  style={{ background: "linear-gradient(135deg,#C9A84C,#E8C96A)" }}
                >
                  {parsing ? "Parsing..." : <>Parse My Resume <ArrowRight className="h-4 w-4" /></>}
                </button>
                <button onClick={loadSample}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-6 py-3 text-sm text-slate-300 hover:bg-white/5 transition-colors">
                  Try Sample Resume
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Panel 2: Review & Enhance ────────────────────────── */}
          {panel === 2 && resumeData && (
            <motion.div key="p2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="mb-2 flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-400" />
                <h2 className="text-2xl font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>
                  Resume parsed successfully
                </h2>
              </div>
              <p className="mb-6 text-sm text-slate-400">Review and edit your data, then enhance with AI.</p>

              <div className="space-y-3">
                {/* Personal info */}
                <Section title="Personal Information" defaultOpen>
                  <div className="grid gap-x-4 sm:grid-cols-2">
                    <Field label="Full Name" value={resumeData.personalInfo.name} onChange={v => updatePersonal("name", v)} />
                    <Field label="Job Title" value={resumeData.personalInfo.title} onChange={v => updatePersonal("title", v)} />
                    <Field label="Email" value={resumeData.personalInfo.email} onChange={v => updatePersonal("email", v)} />
                    <Field label="Phone" value={resumeData.personalInfo.phone} onChange={v => updatePersonal("phone", v)} />
                    <Field label="Location" value={resumeData.personalInfo.location} onChange={v => updatePersonal("location", v)} />
                    <Field label="LinkedIn" value={resumeData.personalInfo.linkedin ?? ""} onChange={v => updatePersonal("linkedin", v)} />
                    <Field label="GitHub" value={resumeData.personalInfo.github ?? ""} onChange={v => updatePersonal("github", v)} />
                  </div>
                  <Field label="Summary" value={resumeData.personalInfo.summary} onChange={v => updatePersonal("summary", v)} multiline />
                </Section>

                {/* Experience */}
                <Section title={`Experience (${resumeData.experience.length} roles)`} defaultOpen>
                  <div className="space-y-6">
                    {resumeData.experience.map((exp, i) => (
                      <div key={i} className="rounded-lg border border-white/10 p-4">
                        <div className="mb-3 grid gap-x-3 sm:grid-cols-2">
                          <Field label="Role" value={exp.role} onChange={v => {
                            const e = resumeData.experience.map((x, j) => j === i ? { ...x, role: v } : x);
                            setResumeData({ ...resumeData, experience: e });
                          }} />
                          <Field label="Company" value={exp.company} onChange={v => {
                            const e = resumeData.experience.map((x, j) => j === i ? { ...x, company: v } : x);
                            setResumeData({ ...resumeData, experience: e });
                          }} />
                          <Field label="Start Date" value={exp.startDate} onChange={v => {
                            const e = resumeData.experience.map((x, j) => j === i ? { ...x, startDate: v } : x);
                            setResumeData({ ...resumeData, experience: e });
                          }} />
                          <Field label="End Date" value={exp.endDate} onChange={v => {
                            const e = resumeData.experience.map((x, j) => j === i ? { ...x, endDate: v } : x);
                            setResumeData({ ...resumeData, experience: e });
                          }} />
                        </div>
                        <p className="mb-2 text-xs text-slate-400">Bullets</p>
                        <div className="space-y-2">
                          {exp.bullets.map((b, j) => (
                            <div key={j} className="group">
                              {isEnhanced ? (
                                <DiffBullet
                                  original={originalData?.experience[i]?.bullets[j]}
                                  enhanced={b}
                                />
                              ) : (
                                <div className="flex gap-2">
                                  <textarea rows={2} value={b}
                                    onChange={e => updateExpBullet(i, j, e.target.value)}
                                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-yellow-500/40 focus:outline-none resize-none" />
                                  <button onClick={() => removeExpBullet(i, j)}
                                    className="self-start rounded-lg p-1.5 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 transition-all">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                          <button onClick={() => addExpBullet(i)}
                            className="flex items-center gap-1 text-xs text-yellow-400 hover:text-yellow-300 transition-colors">
                            <Plus className="h-3 w-3" /> Add bullet
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>

                {/* Skills */}
                <Section title={`Skills (${resumeData.skills.length})`}>
                  <div className="flex flex-wrap gap-2">
                    {resumeData.skills.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm">
                        <span className="text-white">{s.name}</span>
                        <span className="text-xs text-yellow-500">{"★".repeat(s.level)}</span>
                      </div>
                    ))}
                  </div>
                </Section>

                {/* Education */}
                <Section title={`Education (${resumeData.education.length})`}>
                  {resumeData.education.map((ed, i) => (
                    <div key={i} className="mb-2 text-sm">
                      <span className="font-medium text-white">{ed.degree}</span>
                      <span className="text-slate-400"> · {ed.institution} · {ed.year}</span>
                      {ed.grade && <span className="text-slate-500"> · {ed.grade}</span>}
                    </div>
                  ))}
                </Section>

                {/* Certifications */}
                {resumeData.certifications.length > 0 && (
                  <Section title={`Certifications (${resumeData.certifications.length})`}>
                    {resumeData.certifications.map((c, i) => (
                      <div key={i} className="mb-1 text-sm">
                        <span className="font-medium text-white">{c.name}</span>
                        <span className="text-slate-400"> · {c.issuer} · {c.year}</span>
                      </div>
                    ))}
                  </Section>
                )}
              </div>

              {/* Enhance section */}
              <div className="mt-6 rounded-2xl border p-5"
                style={{ background: "#0f0f1a", borderColor: "#C9A84C33" }}>
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-400" />
                  <h3 className="font-semibold text-white">Enhance with AI</h3>
                  {isEnhanced && (
                    <span className="ml-auto rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                      ✓ Enhanced
                    </span>
                  )}
                </div>
                <div className="mb-4">
                  <label className="mb-1 block text-xs text-slate-400">Job Description (optional — paste for better matching)</label>
                  <textarea rows={3} value={jobDesc} onChange={e => setJobDesc(e.target.value)}
                    placeholder="Paste the job description here for targeted enhancement..."
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-yellow-500/40 focus:outline-none resize-none" />
                </div>
                <button onClick={handleEnhance} disabled={enhancing}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3 font-bold text-black disabled:opacity-50 transition-all"
                  style={{ background: "linear-gradient(135deg,#C9A84C,#E8C96A)" }}>
                  {enhancing ? (
                    <><span className="animate-spin">⟳</span> Enhancing bullets with AI...</>
                  ) : (
                    <><Sparkles className="h-4 w-4" /> {isEnhanced ? "Re-enhance" : "Enhance with AI"} →</>
                  )}
                </button>
              </div>

              <div className="mt-4 flex gap-3">
                <button onClick={() => setPanel(1)}
                  className="rounded-xl border border-white/10 px-6 py-3 text-sm text-slate-400 hover:bg-white/5 transition-colors">
                  ← Back
                </button>
                <button onClick={() => setPanel(3)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-bold text-black"
                  style={{ background: "linear-gradient(135deg,#C9A84C,#E8C96A)" }}>
                  Choose My Template <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Panel 3: Confirm ─────────────────────────────────── */}
          {panel === 3 && resumeData && (
            <motion.div key="p3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="mb-2 flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-yellow-400" />
                <h2 className="text-2xl font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>
                  Looking good!
                </h2>
              </div>
              <p className="mb-6 text-sm text-slate-400">Your resume is ready. Choose a template and download.</p>

              {/* Summary card */}
              <div className="mb-6 rounded-2xl border border-white/10 p-5" style={{ background: "#0f0f1a" }}>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-white">{resumeData.personalInfo.name}</p>
                    <p className="text-sm text-yellow-400">{resumeData.personalInfo.title}</p>
                  </div>
                  {isEnhanced && (
                    <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs text-yellow-400">
                      ✦ AI Enhanced
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { n: resumeData.experience.length, l: "Roles" },
                    { n: resumeData.skills.length, l: "Skills" },
                    { n: resumeData.certifications.length, l: "Certs" },
                  ].map(({ n, l }) => (
                    <div key={l} className="rounded-xl border border-white/10 p-3">
                      <p className="text-2xl font-bold" style={{ color: "#C9A84C" }}>{n}</p>
                      <p className="text-xs text-slate-400">{l}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setPanel(2)}
                  className="rounded-xl border border-white/10 px-6 py-3 text-sm text-slate-400 hover:bg-white/5 transition-colors">
                  ← Edit
                </button>
                <button onClick={handleConfirm}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-4 font-bold text-black text-base"
                  style={{ background: "linear-gradient(135deg,#C9A84C,#E8C96A)" }}>
                  Choose My Template <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

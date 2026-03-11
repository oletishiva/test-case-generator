"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Play, X, Loader2, Trophy, Clock, MessageSquare, Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react";

type HRSession = {
  id: string;
  status: "in_progress" | "completed";
  score: number | null;
  question_count: number;
  started_at: string;
  completed_at: string | null;
  feedback: { verdict?: string } | null;
};

export default function HRInterviewListPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<HRSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [filePreview, setFilePreview] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState("");

  useEffect(() => {
    fetch("/api/hr-interview/list")
      .then((r) => r.json())
      .then((d) => setSessions(d.sessions ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleFileUpload(file: File) {
    setParseError("");
    setParsing(true);
    setFileName(file.name);
    setResumeText("");
    setFilePreview("");

    try {
      let text = "";

      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const pages: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          pages.push(
            content.items
              .map((item: unknown) => (item as { str?: string }).str ?? "")
              .join(" ")
          );
        }
        text = pages.join("\n\n");
      } else if (
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.name.endsWith(".docx")
      ) {
        const mammoth = await import("mammoth");
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
      } else {
        throw new Error("Unsupported file type. Please upload a PDF or DOCX.");
      }

      const cleaned = text.replace(/\s+/g, " ").trim();
      if (!cleaned) throw new Error("File appears to be empty or could not be read.");

      setResumeText(cleaned);
      setFilePreview(cleaned.slice(0, 220));
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Failed to read file");
      setFileName("");
    } finally {
      setParsing(false);
    }
  }

  function resetFile() {
    setFileName("");
    setResumeText("");
    setFilePreview("");
    setParseError("");
  }

  async function handleStart() {
    if (!resumeText.trim()) { setStartError("Please upload your resume first."); return; }
    setStarting(true);
    setStartError("");
    try {
      const res = await fetch("/api/hr-interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to start");
      router.push(`/candidate/hr-interview/${data.id}`);
    } catch (err) {
      setStartError(err instanceof Error ? err.message : "Failed to start");
      setStarting(false);
    }
  }

  const verdictColor = (v?: string) => {
    if (!v) return "text-slate-400";
    if (v === "Strong Candidate") return "text-emerald-400";
    if (v === "Good Candidate") return "text-blue-400";
    if (v === "Potential") return "text-amber-400";
    return "text-red-400";
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <Mic className="w-5 h-5 text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Technical Interview</h1>
          </div>
          <p className="text-slate-400 text-sm ml-12">
            AI voice interview. Up to 20 questions, 15 minutes. Powered by your resume.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <Play className="w-4 h-4" /> Start Interview
        </button>
      </div>

      {/* Session history */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-700 rounded-2xl">
          <Mic className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <div className="text-slate-400 font-medium mb-1">No technical interviews yet</div>
          <p className="text-slate-600 text-sm mb-4">Start your first AI-powered voice technical interview</p>
          <button onClick={() => setShowModal(true)} className="text-indigo-400 text-sm hover:underline">
            Start your first session →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:contents">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                  <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0 sm:flex-1">
                  <div className="text-white font-medium text-sm">Technical Interview</div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                    <span className="text-slate-500 text-xs">
                      {new Date(s.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="text-slate-600 text-xs flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> {s.question_count} questions
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:flex-shrink-0">
                {s.status === "completed" ? (
                  <>
                    {s.score != null && (
                      <div className="flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-amber-400 text-sm font-bold">{Math.round(s.score)}%</span>
                      </div>
                    )}
                    {s.feedback?.verdict && (
                      <span className={`text-xs font-medium ${verdictColor(s.feedback.verdict)}`}>
                        {s.feedback.verdict}
                      </span>
                    )}
                    <a
                      href={`/candidate/hr-interview/${s.id}/results`}
                      className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full px-3 py-1 hover:bg-indigo-500/20 transition-colors"
                    >
                      View Results
                    </a>
                  </>
                ) : (
                  <>
                    <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full px-2 py-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> In Progress
                    </span>
                    <a
                      href={`/candidate/hr-interview/${s.id}`}
                      className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full px-3 py-1 hover:bg-indigo-500/20 transition-colors"
                    >
                      Continue
                    </a>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Start Interview Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-indigo-400" />
                <h2 className="text-white font-semibold">Start Technical Interview</h2>
              </div>
              <button
                onClick={() => { setShowModal(false); setStartError(""); resetFile(); }}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5">
              <p className="text-slate-400 text-sm mb-4">
                Upload your resume (PDF or DOCX). The AI will use it to ask personalised voice questions.
              </p>

              <label className="block text-sm font-medium text-slate-300 mb-2">
                Resume <span className="text-red-400">*</span>
              </label>

              {!fileName ? (
                <label
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-indigo-500 transition-colors bg-slate-800/50"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file) handleFileUpload(file);
                  }}
                >
                  <input
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                  {parsing ? (
                    <>
                      <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mb-2" />
                      <span className="text-slate-400 text-sm">Reading resume…</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-slate-500 mb-2" />
                      <span className="text-slate-400 text-sm">Drop PDF or DOCX here, or click to browse</span>
                      <span className="text-slate-600 text-xs mt-1">Supports .pdf and .docx</span>
                    </>
                  )}
                </label>
              ) : (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      <span className="text-white text-sm font-medium truncate max-w-[260px]">{fileName}</span>
                    </div>
                    <button onClick={resetFile} className="text-slate-500 hover:text-red-400 transition-colors" title="Remove file">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{filePreview}…</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 text-xs">Resume extracted successfully</span>
                  </div>
                </div>
              )}

              {parseError && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {parseError}
                </div>
              )}

              <div className="mt-3 flex items-start gap-2 text-xs text-slate-500 bg-slate-800/50 rounded-lg px-3 py-2.5">
                <Mic className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-indigo-500" />
                <span>This is a <strong className="text-slate-400">voice interview</strong>. The AI will speak questions aloud and listen to your spoken answers. Make sure your microphone is ready.</span>
              </div>

              {startError && (
                <div className="mt-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {startError}
                </div>
              )}
            </div>

            <div className="flex gap-3 p-5 pt-0">
              <button
                onClick={() => { setShowModal(false); setStartError(""); resetFile(); }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStart}
                disabled={starting || !resumeText.trim() || parsing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {starting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Starting…</>
                  : <><Play className="w-4 h-4" /> Begin Interview</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

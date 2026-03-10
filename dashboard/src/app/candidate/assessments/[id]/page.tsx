"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Clock, Send, ChevronLeft, ChevronRight,
  AlertCircle, Loader2, CheckCircle2, Building2, ShieldAlert,
} from "lucide-react";

const FaceProctor = dynamic(() => import("@/components/FaceProctor"), { ssr: false });

type Question = {
  id: string;
  question: string;
  type: "mcq" | "text" | "code";
  options?: string[];
  points: number;
};

type AssessmentData = {
  id: string;
  title: string;
  description: string | null;
  questions: Question[];
  time_limit_minutes: number;
  passing_score: number;
  company: string;
};

function useCountdown(startedAt: string | null, timeLimitMinutes: number) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!startedAt) return;
    const deadline = new Date(startedAt).getTime() + timeLimitMinutes * 60 * 1000;
    const tick = () => {
      const left = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      setSecondsLeft(left);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt, timeLimitMinutes]);

  return secondsLeft;
}

export default function CandidateAssessmentSessionPage() {
  const { id: assessmentId } = useParams<{ id: string }>();
  const router = useRouter();

  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Anti-cheat
  const [warningMessage, setWarningMessage] = useState("");
  const flagCooldowns = useRef<Record<string, number>>({});

  const autoSubmittedRef = useRef(false);
  const secondsLeft = useCountdown(startedAt, assessment?.time_limit_minutes ?? 60);

  // ── Flag sender (5s cooldown per type) ──────────────────────────────────
  const sendFlag = useCallback(async (flagType: string, detail?: string) => {
    const now = Date.now();
    if (flagCooldowns.current[flagType] && now - flagCooldowns.current[flagType] < 5000) return;
    flagCooldowns.current[flagType] = now;
    try {
      await fetch("/api/candidate/assessment/flag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId, flagType, detail }),
      });
    } catch { /* non-fatal */ }
  }, [assessmentId]);

  const showWarning = useCallback((msg: string) => {
    setWarningMessage(msg);
    setTimeout(() => setWarningMessage(""), 6000);
  }, []);

  // ── Anti-cheat: fullscreen + tab + copy detection ────────────────────────
  useEffect(() => {
    if (!assessment) return;

    document.documentElement.requestFullscreen?.().catch(() => {});

    const onVisibilityChange = () => {
      if (document.hidden) {
        sendFlag("tab_switch");
        showWarning("Tab switch detected. This incident has been reported.");
      }
    };
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        sendFlag("fullscreen_exit");
        showWarning("Fullscreen exited. Please stay in fullscreen during the assessment.");
        setTimeout(() => document.documentElement.requestFullscreen?.().catch(() => {}), 1000);
      }
    };
    const onCopy = () => {
      sendFlag("copy");
      showWarning("Copying content has been flagged and reported.");
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("copy", onCopy);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("copy", onCopy);
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    };
  }, [assessment, sendFlag, showWarning]);

  // ── Auto-submit when timer hits 0 ───────────────────────────────────────
  useEffect(() => {
    if (secondsLeft === 0 && !autoSubmittedRef.current && assessment) {
      autoSubmittedRef.current = true;
      submitAnswers(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  useEffect(() => {
    fetch(`/api/candidate/assessment/${assessmentId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setLoadError(d.error); return; }
        setAssessment(d.assessment);
        setStartedAt(d.invite.started_at ?? new Date().toISOString());
        setAnswers(d.invite.savedAnswers ?? {});
      })
      .catch(() => setLoadError("Failed to load assessment"))
      .finally(() => setLoading(false));
  }, [assessmentId]);

  async function submitAnswers(auto = false) {
    if (!assessment) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/candidate/assessment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId, answers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed");
      router.push(`/candidate/assessments`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit");
      setSubmitting(false);
      autoSubmittedRef.current = false;
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-slate-950">
      <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
    </div>
  );

  if (loadError) return (
    <div className="flex items-center justify-center h-screen bg-slate-950">
      <div className="text-center max-w-sm">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <div className="text-white font-medium mb-1">{loadError}</div>
        <Link href="/candidate/assessments" className="text-violet-400 text-sm hover:underline">
          Back to Assessments
        </Link>
      </div>
    </div>
  );

  if (!assessment) return null;

  const q = assessment.questions[currentIdx];
  const totalAnswered = assessment.questions.filter((qq) => answers[qq.id] !== undefined && answers[qq.id] !== "").length;
  const progress = (totalAnswered / assessment.questions.length) * 100;

  const timerColor = secondsLeft != null && secondsLeft < 300 ? "text-red-400" : "text-emerald-400";
  const timerDisplay = secondsLeft != null
    ? `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`
    : "--:--";

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Anti-cheat warning banner */}
      {warningMessage && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-slate-900 px-4 py-3 flex items-center justify-center gap-2 text-sm font-semibold shadow-lg">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          {warningMessage}
          <button onClick={() => setWarningMessage("")} className="ml-2 text-slate-700 hover:text-slate-900 font-normal">✕</button>
        </div>
      )}

      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span className="text-slate-400 text-xs truncate">{assessment.company}</span>
          </div>
          <div className="text-white font-medium text-sm truncate">{assessment.title}</div>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-slate-500 text-xs">{totalAnswered}/{assessment.questions.length} answered</div>
          <div className={`flex items-center gap-1.5 font-mono font-bold text-sm ${timerColor}`}>
            <Clock className="w-4 h-4" />
            {timerDisplay}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        {/* Progress */}
        <div className="w-full bg-slate-800 rounded-full h-1.5 mb-6">
          <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        {/* Question nav dots */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {assessment.questions.map((qq, i) => (
            <button
              key={qq.id}
              onClick={() => setCurrentIdx(i)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                i === currentIdx ? "bg-blue-600 text-white"
                : answers[qq.id] ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-slate-800 text-slate-500 hover:bg-slate-700"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Question card — right-click disabled, text not selectable */}
        <div
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-4"
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-blue-400 font-medium">Question {currentIdx + 1} of {assessment.questions.length}</span>
            <span className="text-xs bg-slate-800 text-slate-400 rounded-full px-2 py-0.5 uppercase">{q.type} · {q.points}pts</span>
          </div>
          <p className="text-white text-base leading-relaxed mb-5 select-none">{q.question}</p>

          {/* MCQ */}
          {q.type === "mcq" && q.options && (
            <div className="space-y-2">
              {q.options.map((opt, oi) => (
                <button
                  key={oi}
                  onClick={() => setAnswers((p) => ({ ...p, [q.id]: opt }))}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors ${
                    answers[q.id] === opt
                      ? "border-blue-500 bg-blue-500/20 text-blue-200"
                      : "border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800"
                  }`}
                >
                  <span className="font-medium text-slate-500 mr-2">{String.fromCharCode(65 + oi)}.</span>
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* Text */}
          {q.type === "text" && (
            <textarea
              value={answers[q.id] ?? ""}
              onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
              onPaste={() => { sendFlag("paste"); showWarning("Paste detected. This incident has been logged."); }}
              placeholder="Type your answer here…"
              rows={5}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}

          {/* Code */}
          {q.type === "code" && (
            <textarea
              value={answers[q.id] ?? ""}
              onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
              onPaste={() => { sendFlag("paste"); showWarning("Paste detected. This incident has been logged."); }}
              placeholder="// Write your code here…"
              rows={8}
              spellCheck={false}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-emerald-300 placeholder-slate-600 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          )}
        </div>

        {submitError && (
          <div className="mb-4 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {submitError}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            disabled={currentIdx === 0}
            className="flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>

          {currentIdx < assessment.questions.length - 1 ? (
            <button
              onClick={() => setCurrentIdx((i) => i + 1)}
              className="flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => submitAnswers(false)}
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <><Send className="w-4 h-4" /> Submit Assessment</>}
            </button>
          )}

          {currentIdx < assessment.questions.length - 1 && totalAnswered === assessment.questions.length && (
            <button
              onClick={() => submitAnswers(false)}
              disabled={submitting}
              className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Submit All
            </button>
          )}
        </div>
      </div>

      {/* Face proctoring widget — fixed bottom-right */}
      <FaceProctor
        onViolation={(type, detail) => {
          sendFlag(type, detail);
          if (detail !== "looking_away") {
            showWarning(
              detail === "no_face"
                ? "No face detected. Please ensure your face is visible to the camera."
                : "Multiple faces detected. Only you should be in view."
            );
          }
        }}
      />
    </div>
  );
}

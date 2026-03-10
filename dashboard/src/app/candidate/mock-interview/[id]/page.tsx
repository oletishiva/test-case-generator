"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ChevronRight, ChevronLeft, Send, Loader2, AlertCircle, CheckCircle2,
} from "lucide-react";

type Question = { id: string; question: string; expected_points: string[] };

type Session = {
  id: string;
  topic: string;
  difficulty: string;
  questions: Question[];
  answers: Record<string, string>;
  completed: boolean;
};

export default function MockInterviewSessionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/mock-interview/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.session) {
          setSession(d.session);
          setAnswers(d.session.answers ?? {});
          // Resume from first unanswered question
          const firstUnanswered = d.session.questions.findIndex(
            (q: Question) => !d.session.answers?.[q.id]
          );
          if (firstUnanswered > 0) setCurrentIdx(firstUnanswered);
        }
      })
      .catch(() => setError("Failed to load session"))
      .finally(() => setLoading(false));
  }, [id]);

  async function submitAll() {
    if (!session) return;
    const unanswered = session.questions.filter((q) => !answers[q.id]?.trim());
    if (unanswered.length > 0) {
      setError(`Please answer all questions before submitting. ${unanswered.length} remaining.`);
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/mock-interview/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, answers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed");
      router.push(`/candidate/mock-interview/${id}/results`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
      </div>
    );
  }

  if (!session || error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <div className="text-white font-medium">{error || "Session not found"}</div>
        </div>
      </div>
    );
  }

  if (session.completed) {
    router.replace(`/candidate/mock-interview/${id}/results`);
    return null;
  }

  const questions = session.questions;
  const q = questions[currentIdx];
  const totalAnswered = questions.filter((qq) => answers[qq.id]?.trim()).length;
  const progress = (totalAnswered / questions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1 capitalize">
              {session.topic.replace("-", " ")} · {session.difficulty}
            </div>
            <h1 className="text-white font-bold text-lg">Mock Interview</h1>
          </div>
          <div className="text-sm text-slate-400">
            {totalAnswered}/{questions.length} answered
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 rounded-full h-1.5 mb-8">
          <div
            className="bg-violet-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {questions.map((qq, i) => (
            <button
              key={qq.id}
              onClick={() => setCurrentIdx(i)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                i === currentIdx
                  ? "bg-violet-600 text-white"
                  : answers[qq.id]?.trim()
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-slate-800 text-slate-500 hover:bg-slate-700"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Current question */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-4">
          <div className="text-xs text-violet-400 font-medium mb-3">Question {currentIdx + 1} of {questions.length}</div>
          <p className="text-white text-base leading-relaxed mb-5">{q.question}</p>
          <textarea
            value={answers[q.id] ?? ""}
            onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
            placeholder="Type your answer here…"
            rows={7}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            disabled={currentIdx === 0}
            className="flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          {currentIdx < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIdx((i) => i + 1)}
              className="flex items-center gap-1 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={submitAll}
              disabled={submitting || totalAnswered < questions.length}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Evaluating…</>
              ) : (
                <><Send className="w-4 h-4" /> Submit & Get Feedback</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

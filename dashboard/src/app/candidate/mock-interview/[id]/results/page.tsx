"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Trophy, CheckCircle2, TrendingUp, AlertCircle,
  ArrowRight, Loader2, ChevronDown, ChevronUp,
} from "lucide-react";

type QuestionResult = {
  id: string;
  question: string;
  answer: string;
  score: number;
  feedback: string;
  expected_points: string[];
};

type Feedback = {
  overall_score: number;
  strengths: string[];
  improvements: string[];
  next_steps: string[];
};

type ResultData = {
  topic: string;
  difficulty: string;
  score: number;
  feedback: Feedback;
  questions: Array<{ id: string; question: string; expected_points: string[] }>;
  answers: Record<string, { answer: string; score: number; feedback: string }>;
};

export default function MockInterviewResultsPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch(`/api/mock-interview/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.session) setData(d.session);
        else setError("Session not found");
      })
      .catch(() => setError("Failed to load results"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
    </div>
  );

  if (error || !data) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <div className="text-white font-medium">{error || "No results found"}</div>
        <Link href="/candidate/mock-interview" className="text-violet-400 text-sm mt-2 inline-block hover:underline">
          Back to interviews
        </Link>
      </div>
    </div>
  );

  const fb = data.feedback as Feedback | null;
  const score = data.score ?? fb?.overall_score ?? 0;
  const scoreColor = score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-red-400";
  const scoreBg = score >= 80 ? "bg-emerald-500/10 border-emerald-500/20" : score >= 60 ? "bg-amber-500/10 border-amber-500/20" : "bg-red-500/10 border-red-500/20";

  const qResults: QuestionResult[] = (data.questions ?? []).map((q) => ({
    id: q.id,
    question: q.question,
    answer: data.answers?.[q.id]?.answer ?? "",
    score: data.answers?.[q.id]?.score ?? 0,
    feedback: data.answers?.[q.id]?.feedback ?? "",
    expected_points: q.expected_points ?? [],
  }));

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center gap-2 text-5xl font-black ${scoreColor} mb-2`}>
            <Trophy className="w-10 h-10" /> {Math.round(score)}%
          </div>
          <div className="text-white font-bold text-xl mb-1">Interview Complete</div>
          <div className="text-slate-400 text-sm capitalize">
            {data.topic?.replace("-", " ")} · {data.difficulty}
          </div>
        </div>

        {/* AI Feedback summary */}
        {fb && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium mb-3">
                <CheckCircle2 className="w-4 h-4" /> Strengths
              </div>
              <ul className="space-y-1.5">
                {(fb.strengths ?? []).map((s, i) => (
                  <li key={i} className="text-slate-300 text-xs flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-3">
                <TrendingUp className="w-4 h-4" /> To Improve
              </div>
              <ul className="space-y-1.5">
                {(fb.improvements ?? []).map((s, i) => (
                  <li key={i} className="text-slate-300 text-xs flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-violet-400 text-sm font-medium mb-3">
                <ArrowRight className="w-4 h-4" /> Next Steps
              </div>
              <ul className="space-y-1.5">
                {(fb.next_steps ?? []).map((s, i) => (
                  <li key={i} className="text-slate-300 text-xs flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Per-question breakdown */}
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Question Breakdown</h2>
        <div className="space-y-3 mb-8">
          {qResults.map((q, i) => {
            const qColor = q.score >= 80 ? "text-emerald-400" : q.score >= 60 ? "text-amber-400" : "text-red-400";
            const qBg = q.score >= 80 ? "border-emerald-500/20" : q.score >= 60 ? "border-amber-500/20" : "border-red-500/20";
            const open = expanded[q.id];
            return (
              <div key={q.id} className={`bg-slate-900 border rounded-xl overflow-hidden ${qBg}`}>
                <button
                  className="w-full flex items-center gap-4 p-4 text-left"
                  onClick={() => setExpanded((prev) => ({ ...prev, [q.id]: !open }))}
                >
                  <div className={`text-lg font-black w-10 flex-shrink-0 ${qColor}`}>
                    {Math.round(q.score)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium">Q{i + 1}: {q.question.slice(0, 80)}{q.question.length > 80 ? "…" : ""}</div>
                  </div>
                  {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>
                {open && (
                  <div className="px-4 pb-4 border-t border-slate-800 pt-4 space-y-3">
                    <div>
                      <div className="text-xs text-slate-500 mb-1 font-medium">Your answer</div>
                      <p className="text-slate-300 text-sm leading-relaxed">{q.answer || <span className="text-slate-600 italic">No answer provided</span>}</p>
                    </div>
                    {q.feedback && (
                      <div>
                        <div className="text-xs text-slate-500 mb-1 font-medium">AI Feedback</div>
                        <p className="text-slate-300 text-sm leading-relaxed">{q.feedback}</p>
                      </div>
                    )}
                    {q.expected_points.length > 0 && (
                      <div>
                        <div className="text-xs text-slate-500 mb-1 font-medium">Key points to cover</div>
                        <ul className="space-y-1">
                          {q.expected_points.map((p, pi) => (
                            <li key={pi} className="text-xs text-slate-400 flex items-start gap-2">
                              <span className="text-violet-400 mt-0.5">•</span> {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href="/candidate/mock-interview"
            className="flex-1 text-center py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm transition-colors"
          >
            Back to Interviews
          </Link>
          <Link
            href="/candidate/mock-interview"
            className="flex-1 text-center py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
            onClick={() => sessionStorage.setItem("startNew", "1")}
          >
            Start Another Interview
          </Link>
        </div>
      </div>
    </div>
  );
}

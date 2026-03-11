"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Mic, Trophy, ChevronLeft, ChevronDown, ChevronUp, Loader2, AlertCircle, CheckCircle2, TrendingUp, Lightbulb } from "lucide-react";

type Message = { role: "ai" | "candidate"; content: string; timestamp: string };
type Highlight = { question: string; summary: string };

type Feedback = {
  overall_score: number;
  verdict: string;
  strengths: string[];
  improvements: string[];
  question_highlights: Highlight[];
};

type Session = {
  id: string;
  conversation: Message[];
  question_count: number;
  score: number | null;
  feedback: Feedback | null;
  started_at: string;
  completed_at: string | null;
  status: string;
};

function verdictStyle(v: string) {
  if (v === "Strong Candidate") return { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" };
  if (v === "Good Candidate") return { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" };
  if (v === "Potential") return { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" };
  return { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" };
}

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-amber-400";
  return "text-red-400";
}

export default function HRInterviewResultsPage() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [highlightsOpen, setHighlightsOpen] = useState(true);

  useEffect(() => {
    fetch(`/api/hr-interview/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); return; }
        setSession(d.session);
      })
      .catch(() => setError("Failed to load results"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
    </div>
  );

  if (error || !session) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <div className="text-white font-medium">{error || "Session not found"}</div>
        <Link href="/candidate/hr-interview" className="text-indigo-400 text-sm mt-2 inline-block hover:underline">Back to Interviews</Link>
      </div>
    </div>
  );

  const feedback = session.feedback;
  const score = session.score ?? feedback?.overall_score ?? 0;
  const verdict = feedback?.verdict ?? "—";
  const vs = verdictStyle(verdict);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link href="/candidate/hr-interview" className="flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Technical Interviews
      </Link>

      {/* Score card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
          <Mic className="w-6 h-6 text-indigo-400" />
        </div>
        <div className="text-slate-400 text-sm mb-2">Technical Interview · {session.question_count} questions</div>
        <div className={`text-6xl font-black mb-3 ${scoreColor(score)}`}>{Math.round(score)}%</div>
        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-semibold ${vs.bg} ${vs.text} ${vs.border}`}>
          <Trophy className="w-4 h-4" /> {verdict}
        </span>
        {session.completed_at && (
          <p className="text-slate-600 text-xs mt-4">
            Completed {new Date(session.completed_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        )}
      </div>

      {feedback && (
        <>
          {/* Strengths + Improvements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Strengths</span>
              </div>
              <ul className="space-y-2">
                {(feedback.strengths ?? []).map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">To Improve</span>
              </div>
              <ul className="space-y-2">
                {(feedback.improvements ?? []).map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-amber-400 mt-0.5 flex-shrink-0">→</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Question highlights */}
          {(feedback.question_highlights ?? []).length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl mb-4">
              <button
                onClick={() => setHighlightsOpen(o => !o)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-medium text-white">Question Highlights</span>
                </div>
                {highlightsOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>
              {highlightsOpen && (
                <div className="px-5 pb-5 space-y-3 border-t border-slate-800 pt-4">
                  {feedback.question_highlights.map((h, i) => (
                    <div key={i} className="bg-slate-800 rounded-xl p-4">
                      <div className="text-xs text-indigo-400 mb-1 font-medium">Q{i + 1}: {h.question}</div>
                      <div className="text-sm text-slate-300">{h.summary}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Full transcript */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl mb-6">
        <button
          onClick={() => setTranscriptOpen(o => !o)}
          className="w-full flex items-center justify-between px-5 py-4 text-left"
        >
          <span className="text-sm font-medium text-white">Full Transcript ({session.conversation.length} messages)</span>
          {transcriptOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>
        {transcriptOpen && (
          <div className="px-5 pb-5 space-y-3 border-t border-slate-800 pt-4 max-h-96 overflow-y-auto">
            {session.conversation.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "candidate" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                  msg.role === "ai" ? "bg-slate-800 text-slate-300" : "bg-indigo-600/30 text-indigo-200"
                }`}>
                  <span className={`text-xs font-medium block mb-0.5 ${msg.role === "ai" ? "text-indigo-400" : "text-indigo-300"}`}>
                    {msg.role === "ai" ? "Interviewer" : "You"}
                  </span>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          href="/candidate/hr-interview"
          className="flex-1 text-center px-4 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm transition-colors"
        >
          Back to Technical Interviews
        </Link>
        <Link
          href="/candidate/hr-interview"
          className="flex-1 text-center flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
          onClick={() => {}}
        >
          <Mic className="w-4 h-4" /> Start Another
        </Link>
      </div>
    </div>
  );
}

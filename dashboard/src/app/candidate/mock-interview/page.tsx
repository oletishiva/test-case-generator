"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare, Play, Trophy, Clock, ChevronRight,
  CheckCircle2, Loader2, AlertCircle,
} from "lucide-react";

const TOPICS = [
  { value: "playwright",   label: "Playwright",     emoji: "🎭" },
  { value: "selenium",     label: "Selenium",        emoji: "🔬" },
  { value: "cypress",      label: "Cypress",         emoji: "🌲" },
  { value: "api-testing",  label: "API Testing",     emoji: "🔌" },
  { value: "general-qa",   label: "General QA",      emoji: "🧪" },
  { value: "cicd",         label: "CI/CD",           emoji: "⚙️" },
  { value: "behavioral",   label: "Behavioral",      emoji: "💬" },
];

const DIFFICULTIES = [
  { value: "easy",   label: "Easy",   desc: "Junior / fresher level" },
  { value: "medium", label: "Medium", desc: "2–4 years experience" },
  { value: "hard",   label: "Hard",   desc: "Senior / lead level" },
  { value: "mixed",  label: "Mixed",  desc: "Variety of levels" },
];

type Session = {
  id: string;
  topic: string;
  difficulty: string;
  completed: boolean;
  score: number | null;
  created_at: string;
};

export default function MockInterviewListPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [showStart, setShowStart] = useState(false);
  const [topic, setTopic] = useState("playwright");
  const [difficulty, setDifficulty] = useState("medium");
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState("");

  useEffect(() => {
    fetch("/api/mock-interview/list")
      .then((r) => r.json())
      .then((d) => setSessions(d.sessions ?? []))
      .catch(() => {})
      .finally(() => setLoadingSessions(false));
  }, []);

  async function startInterview() {
    setStarting(true);
    setStartError("");
    try {
      const res = await fetch("/api/mock-interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to start");
      router.push(`/candidate/mock-interview/${data.id}`);
    } catch (err) {
      setStartError(err instanceof Error ? err.message : "Something went wrong");
      setStarting(false);
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Practice Assessment</h1>
          <p className="text-slate-400 text-sm mt-1">Practice with AI-generated QA questions and get instant feedback on your answers.</p>
        </div>
        <button
          onClick={() => setShowStart(true)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Play className="w-4 h-4" /> Start Interview
        </button>
      </div>

      {/* Start modal */}
      {showStart && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg">
            <h2 className="text-lg font-bold text-white mb-5">Configure your interview</h2>

            <div className="mb-5">
              <label className="text-sm font-medium text-slate-300 mb-3 block">Topic</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TOPICS.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTopic(t.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors ${
                      topic === t.value
                        ? "border-violet-500 bg-violet-500/20 text-violet-300"
                        : "border-slate-700 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    <span>{t.emoji}</span> {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="text-sm font-medium text-slate-300 mb-3 block">Difficulty</label>
              <div className="grid grid-cols-2 gap-2">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDifficulty(d.value)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      difficulty === d.value
                        ? "border-violet-500 bg-violet-500/20"
                        : "border-slate-700 hover:border-slate-600"
                    }`}
                  >
                    <div className={`text-sm font-medium ${difficulty === d.value ? "text-violet-300" : "text-white"}`}>{d.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{d.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {startError && (
              <div className="mb-4 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {startError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setShowStart(false); setStartError(""); }}
                className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={startInterview}
                disabled={starting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
              >
                {starting ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : <><Play className="w-4 h-4" /> Start now</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session history */}
      {loadingSessions ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-20">
          <MessageSquare className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <div className="text-slate-400 font-medium">No interviews yet</div>
          <p className="text-slate-600 text-sm mt-1">Start your first practice assessment to begin preparing.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Past Sessions</h2>
          {sessions.map((s) => (
            <div
              key={s.id}
              className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-slate-900 border border-slate-800 rounded-xl px-4 sm:px-5 py-4 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3 sm:contents">
                <div className="text-xl flex-shrink-0">{TOPICS.find((t) => t.value === s.topic)?.emoji ?? "🧪"}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium text-sm capitalize">
                    {TOPICS.find((t) => t.value === s.topic)?.label ?? s.topic} — {s.difficulty}
                  </div>
                  <div className="text-slate-500 text-xs mt-0.5">
                    {new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </div>
              </div>
              {s.completed ? (
                <div className="flex flex-wrap items-center gap-2 sm:flex-shrink-0">
                  {s.score != null && (
                    <div className="flex items-center gap-1 text-amber-400 text-sm font-medium">
                      <Trophy className="w-4 h-4" /> {Math.round(s.score)}%
                    </div>
                  )}
                  <span className="flex items-center gap-1 text-emerald-400 text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Done
                  </span>
                  <a
                    href={`/candidate/mock-interview/${s.id}/results`}
                    className="flex items-center gap-1 text-violet-400 text-sm hover:text-violet-300"
                  >
                    Results <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2 sm:flex-shrink-0">
                  <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> In progress
                  </span>
                  <a
                    href={`/candidate/mock-interview/${s.id}`}
                    className="flex items-center gap-1 text-violet-400 text-sm hover:text-violet-300"
                  >
                    Continue <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

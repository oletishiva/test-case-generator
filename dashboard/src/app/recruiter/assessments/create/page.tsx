"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ChevronLeft, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

const QA_TOPICS = [
  "Playwright & TypeScript", "Selenium WebDriver", "Cypress",
  "API Testing", "CI/CD & DevOps", "Test Strategy & Planning",
  "Performance Testing", "Mobile Testing", "General QA",
];

export default function CreateAssessmentPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    role: "",
    topic: "",
    questionCount: 5,
    timeLimitMinutes: 60,
    passingScore: 70,
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  function update(k: string, v: string | number) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.role.trim() || !form.topic.trim()) return;
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/recruiter/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Creation failed");
      router.push(`/recruiter/assessments/${data.id}/invite`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setCreating(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link href="/recruiter/assessments" className="flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Assessments
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Create Assessment</h1>
        <p className="text-slate-400 text-sm mt-1">
          AI will generate QA interview questions based on your role and topic.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Assessment title <span className="text-red-400">*</span></label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            required
            placeholder="e.g. Senior QA Engineer Technical Screen"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Description <span className="text-slate-500">(optional)</span></label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="What this assessment covers and what candidates should expect…"
            rows={3}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Job role <span className="text-red-400">*</span></label>
          <input
            type="text"
            value={form.role}
            onChange={(e) => update("role", e.target.value)}
            required
            placeholder="e.g. Senior QA Automation Engineer"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Topic */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Primary topic <span className="text-red-400">*</span></label>
          <div className="grid grid-cols-3 gap-2">
            {QA_TOPICS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => update("topic", t)}
                className={`px-3 py-2 rounded-lg text-xs border transition-colors text-left ${
                  form.topic === t
                    ? "border-blue-500 bg-blue-500/20 text-blue-300"
                    : "border-slate-700 text-slate-400 hover:border-slate-600"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          {!QA_TOPICS.includes(form.topic) && (
            <input
              type="text"
              value={!QA_TOPICS.includes(form.topic) && form.topic ? form.topic : ""}
              onChange={(e) => update("topic", e.target.value)}
              placeholder="Or type a custom topic…"
              className="mt-2 w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>

        {/* Config row */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Questions</label>
            <select
              value={form.questionCount}
              onChange={(e) => update("questionCount", parseInt(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[3, 5, 7, 10].map((n) => <option key={n} value={n}>{n} questions</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Time limit</label>
            <select
              value={form.timeLimitMinutes}
              onChange={(e) => update("timeLimitMinutes", parseInt(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[30, 45, 60, 90, 120].map((n) => <option key={n} value={n}>{n} min</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Passing score</label>
            <select
              value={form.passingScore}
              onChange={(e) => update("passingScore", parseInt(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[50, 60, 70, 75, 80].map((n) => <option key={n} value={n}>{n}%</option>)}
            </select>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        <button
          type="submit"
          disabled={creating || !form.title.trim() || !form.role.trim() || !form.topic.trim()}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {creating ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> AI is generating questions…</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Generate Assessment with AI</>
          )}
        </button>
      </form>
    </div>
  );
}

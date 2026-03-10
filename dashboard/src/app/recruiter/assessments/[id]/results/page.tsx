"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, Trophy, Clock, CheckCircle2, AlertCircle,
  Users, Loader2, UserCircle,
} from "lucide-react";

type CandidateResult = {
  id: string;
  candidate_clerk_id: string;
  status: "invited" | "in_progress" | "completed";
  score: number | null;
  ai_feedback: string | null;
  invited_at: string;
  completed_at: string | null;
  candidate: { full_name: string; email: string };
};

type AssessmentMeta = {
  id: string;
  title: string;
  passing_score: number;
};

export default function AssessmentResultsPage() {
  const { id } = useParams<{ id: string }>();
  const [meta, setMeta] = useState<AssessmentMeta | null>(null);
  const [results, setResults] = useState<CandidateResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/recruiter/assessments/${id}/results`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else { setMeta(d.assessment); setResults(d.results ?? []); }
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="w-6 h-6 text-blue-400 animate-spin" /></div>;
  if (error) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <div className="text-white font-medium">{error}</div>
        <Link href="/recruiter/assessments" className="text-blue-400 text-sm mt-2 inline-block hover:underline">Back to Assessments</Link>
      </div>
    </div>
  );

  const completed = results.filter((r) => r.status === "completed");
  const passing = completed.filter((r) => r.score != null && meta && r.score >= meta.passing_score);
  const avgScore = completed.length
    ? completed.filter((r) => r.score != null).reduce((sum, r) => sum + (r.score ?? 0), 0) / completed.filter((r) => r.score != null).length
    : null;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link href="/recruiter/assessments" className="flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Assessments
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">{meta?.title}</h1>
          <p className="text-slate-400 text-sm mt-1">Passing score: {meta?.passing_score}%</p>
        </div>
        <Link
          href={`/recruiter/assessments/${id}/invite`}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Users className="w-4 h-4" /> Invite More
        </Link>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Invited", value: results.length, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Completed", value: completed.length, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Avg Score", value: avgScore != null ? `${Math.round(avgScore)}%` : "—", icon: Trophy, color: "text-amber-400", bg: "bg-amber-500/10" },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div className="text-xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      {results.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <div className="text-slate-400 font-medium">No candidates invited yet</div>
          <Link href={`/recruiter/assessments/${id}/invite`} className="text-blue-400 text-sm mt-2 inline-block hover:underline">
            Invite your first candidate
          </Link>
        </div>
      ) : (
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Candidates</h2>
          <div className="space-y-3">
            {results.map((r) => {
              const passed = r.score != null && meta != null && r.score >= meta.passing_score;
              return (
                <div key={r.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <UserCircle className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium text-sm">{r.candidate.full_name}</div>
                    <div className="text-slate-500 text-xs">{r.candidate.email}</div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {r.status === "completed" && r.score != null ? (
                      <>
                        <span className={`text-sm font-bold ${passed ? "text-emerald-400" : "text-red-400"}`}>
                          {Math.round(r.score)}%
                        </span>
                        <span className={`text-xs rounded-full px-2 py-0.5 border ${
                          passed
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}>
                          {passed ? "Passed" : "Failed"}
                        </span>
                      </>
                    ) : r.status === "in_progress" ? (
                      <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full px-2 py-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> In progress
                      </span>
                    ) : (
                      <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full px-2 py-0.5">
                        Invited
                      </span>
                    )}
                    {r.completed_at && (
                      <span className="text-xs text-slate-600">
                        {new Date(r.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

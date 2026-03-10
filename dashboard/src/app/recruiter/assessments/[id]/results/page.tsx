"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, Trophy, Clock, CheckCircle2, AlertCircle,
  Users, Loader2, UserCircle, ShieldAlert, ChevronDown, ChevronUp, Mic,
} from "lucide-react";

type ProctoringFlag = { type: string; timestamp: string };

type CandidateResult = {
  id: string;
  candidate_clerk_id: string;
  status: "invited" | "in_progress" | "completed";
  score: number | null;
  ai_feedback: string | null;
  invited_at: string;
  completed_at: string | null;
  tab_switches: number;
  copy_attempts: number;
  paste_events: number;
  fullscreen_exits: number;
  proctoring_flags: ProctoringFlag[];
  candidate: { full_name: string; email: string };
};

type AssessmentMeta = { id: string; title: string; passing_score: number };

function riskLevel(r: CandidateResult): { label: string; color: string; dot: string } {
  const faceViolations = (r.proctoring_flags ?? []).filter(f => f.type !== "looking_away").length;
  const total = (r.tab_switches ?? 0) + (r.copy_attempts ?? 0) + (r.paste_events ?? 0) + (r.fullscreen_exits ?? 0) + faceViolations;
  if (faceViolations > 0 || total >= 4) return { label: "High Risk", color: "text-red-400 border-red-500/30 bg-red-500/10", dot: "bg-red-400" };
  if (total >= 1) return { label: "Low Risk", color: "text-amber-400 border-amber-500/30 bg-amber-500/10", dot: "bg-amber-400" };
  return { label: "Clean", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10", dot: "bg-emerald-400" };
}

function FlagDetail({ r }: { r: CandidateResult }) {
  const faceViolations = (r.proctoring_flags ?? []).filter(f => f.type !== "looking_away");
  const lookingAway = (r.proctoring_flags ?? []).filter(f => f.type === "looking_away").length;
  const items = [
    { label: "Tab switches", value: r.tab_switches ?? 0 },
    { label: "Copy attempts", value: r.copy_attempts ?? 0 },
    { label: "Paste events", value: r.paste_events ?? 0 },
    { label: "Fullscreen exits", value: r.fullscreen_exits ?? 0 },
    { label: "Face violations (no face / multiple)", value: faceViolations.length },
    { label: "Looking away events", value: lookingAway },
  ].filter(i => i.value > 0);

  if (items.length === 0) return (
    <div className="px-5 pb-4 text-xs text-emerald-400">No suspicious activity detected.</div>
  );

  return (
    <div className="px-5 pb-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {items.map((item) => (
          <div key={item.label} className="bg-slate-800 rounded-lg px-3 py-2">
            <div className="text-xs text-slate-500 mb-0.5">{item.label}</div>
            <div className="text-sm font-bold text-red-400">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AssessmentResultsPage() {
  const { id } = useParams<{ id: string }>();
  const [meta, setMeta] = useState<AssessmentMeta | null>(null);
  const [results, setResults] = useState<CandidateResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
  const avgScore = completed.length
    ? completed.filter((r) => r.score != null).reduce((sum, r) => sum + (r.score ?? 0), 0) / completed.filter((r) => r.score != null).length
    : null;
  const highRisk = results.filter((r) => riskLevel(r).label === "High Risk").length;

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
        <div className="flex items-center gap-2">
          <Link
            href={`/recruiter/assessments/${id}/invite`}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Users className="w-4 h-4" /> Invite More
          </Link>
          <Link
            href={`/recruiter/assessments/${id}/invite?type=hr`}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            title="Send HR Round Interview invite to a candidate"
          >
            <Mic className="w-4 h-4" /> HR Invite
          </Link>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Invited", value: results.length, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Completed", value: completed.length, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Avg Score", value: avgScore != null ? `${Math.round(avgScore)}%` : "—", icon: Trophy, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "High Risk", value: highRisk, icon: ShieldAlert, color: "text-red-400", bg: "bg-red-500/10" },
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
          <div className="space-y-2">
            {results.map((r) => {
              const passed = r.score != null && meta != null && r.score >= meta.passing_score;
              const risk = riskLevel(r);
              const isExpanded = expandedId === r.id;
              const hasFlags = (r.tab_switches ?? 0) + (r.copy_attempts ?? 0) + (r.paste_events ?? 0) + (r.fullscreen_exits ?? 0) + (r.proctoring_flags?.length ?? 0) > 0;

              return (
                <div key={r.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                  <div className="p-5 flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                      <UserCircle className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium text-sm">{r.candidate.full_name}</div>
                      <div className="text-slate-500 text-xs">{r.candidate.email}</div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {/* Risk badge */}
                      {r.status === "completed" && (
                        <span className={`text-xs rounded-full px-2 py-0.5 border flex items-center gap-1.5 ${risk.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${risk.dot}`} />
                          {risk.label}
                        </span>
                      )}

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

                      {/* Expand button if completed */}
                      {r.status === "completed" && (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : r.id)}
                          className="text-slate-500 hover:text-slate-300 transition-colors"
                          title="View proctoring report"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded proctoring detail */}
                  {isExpanded && (
                    <div className="border-t border-slate-800">
                      <div className="px-5 pt-3 pb-1 flex items-center gap-2">
                        <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Proctoring Report</span>
                      </div>
                      <FlagDetail r={r} />
                      {r.ai_feedback && (
                        <div className="px-5 pb-4">
                          <div className="text-xs text-slate-500 mb-1">AI Feedback</div>
                          <p className="text-sm text-slate-300">{r.ai_feedback}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

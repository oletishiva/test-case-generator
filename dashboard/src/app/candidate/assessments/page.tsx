"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ClipboardList, Clock, CheckCircle2, AlertCircle, ChevronRight,
  Trophy, Loader2, Building2,
} from "lucide-react";

type Assessment = {
  id: string;
  assessment_id: string;
  status: "invited" | "in_progress" | "completed";
  score: number | null;
  invited_at: string;
  started_at: string | null;
  completed_at: string | null;
  assessment: {
    title: string;
    description: string;
    time_limit_minutes: number;
    passing_score: number;
    company: { company_name: string };
  };
};

export default function CandidateAssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/candidate/assessments")
      .then((r) => r.json())
      .then((d) => setAssessments(d.assessments ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pending = assessments.filter((a) => a.status === "invited");
  const inProgress = assessments.filter((a) => a.status === "in_progress");
  const completed = assessments.filter((a) => a.status === "completed");

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
    </div>
  );

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Assessments</h1>
        <p className="text-slate-400 text-sm mt-1">Company assessments you've been invited to complete.</p>
      </div>

      {assessments.length === 0 ? (
        <div className="text-center py-20">
          <ClipboardList className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <div className="text-slate-400 font-medium">No assessments yet</div>
          <p className="text-slate-600 text-sm mt-1">You'll see company assessments here once you're invited.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {inProgress.length > 0 && (
            <Section title="In Progress" items={inProgress} color="amber" />
          )}
          {pending.length > 0 && (
            <Section title="Pending" items={pending} color="blue" />
          )}
          {completed.length > 0 && (
            <Section title="Completed" items={completed} color="emerald" />
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, items, color }: { title: string; items: Assessment[]; color: string }) {
  const colorMap: Record<string, string> = {
    amber: "text-amber-400",
    blue: "text-blue-400",
    emerald: "text-emerald-400",
  };
  return (
    <div>
      <h2 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${colorMap[color]}`}>{title}</h2>
      <div className="space-y-3">
        {items.map((a) => (
          <AssessmentCard key={a.id} a={a} />
        ))}
      </div>
    </div>
  );
}

function AssessmentCard({ a }: { a: Assessment }) {
  const statusIcon = a.status === "completed"
    ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
    : a.status === "in_progress"
    ? <Clock className="w-4 h-4 text-amber-400" />
    : <AlertCircle className="w-4 h-4 text-blue-400" />;

  const statusLabel = a.status === "completed" ? "Completed" : a.status === "in_progress" ? "In progress" : "Invited";

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-start gap-4 hover:border-slate-700 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
        <Building2 className="w-5 h-5 text-blue-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white font-medium text-sm">{a.assessment.title}</div>
        <div className="text-slate-500 text-xs mt-0.5">{a.assessment.company?.company_name}</div>
        {a.assessment.description && (
          <div className="text-slate-400 text-xs mt-1.5 line-clamp-2">{a.assessment.description}</div>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Clock className="w-3 h-3" /> {a.assessment.time_limit_minutes} min
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            Pass: {a.assessment.passing_score}%
          </div>
          <div className="flex items-center gap-1 text-xs">
            {statusIcon}
            <span className="text-slate-400">{statusLabel}</span>
          </div>
          {a.status === "completed" && a.score != null && (
            <div className="flex items-center gap-1 text-xs text-amber-400">
              <Trophy className="w-3 h-3" /> {Math.round(a.score)}%
            </div>
          )}
        </div>
      </div>
      {a.status !== "completed" && (
        <Link
          href={`/candidate/assessments/${a.assessment_id}`}
          className="flex items-center gap-1 text-violet-400 hover:text-violet-300 text-sm flex-shrink-0"
        >
          {a.status === "in_progress" ? "Continue" : "Start"} <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}

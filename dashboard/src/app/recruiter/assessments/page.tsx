"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ClipboardList, Plus, Users, Clock, ChevronRight,
  CheckCircle2, ToggleLeft, Loader2,
} from "lucide-react";

type Assessment = {
  id: string;
  title: string;
  description: string | null;
  time_limit_minutes: number;
  passing_score: number;
  is_active: boolean;
  created_at: string;
  job_posting: { title: string } | null;
  candidate_count: { count: number }[];
};

export default function RecruiterAssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/recruiter/assessments")
      .then((r) => r.json())
      .then((d) => setAssessments(d.assessments ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
    </div>
  );

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Assessments</h1>
          <p className="text-slate-400 text-sm mt-1">Create AI-powered QA assessments and invite candidates.</p>
        </div>
        <Link
          href="/recruiter/assessments/create"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Assessment
        </Link>
      </div>

      {assessments.length === 0 ? (
        <div className="text-center py-20">
          <ClipboardList className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <div className="text-slate-400 font-medium">No assessments yet</div>
          <p className="text-slate-600 text-sm mt-1 mb-6">Create your first AI-powered QA assessment.</p>
          <Link
            href="/recruiter/assessments/create"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Create Assessment
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {assessments.map((a) => {
            const candidateCount = a.candidate_count?.[0]?.count ?? 0;
            return (
              <div key={a.id} className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium text-sm">{a.title}</span>
                      {a.is_active ? (
                        <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-2 py-0.5">Active</span>
                      ) : (
                        <span className="text-xs bg-slate-700 text-slate-400 rounded-full px-2 py-0.5">Inactive</span>
                      )}
                    </div>
                    {a.description && <p className="text-slate-500 text-xs mb-2 line-clamp-1">{a.description}</p>}
                    {a.job_posting && (
                      <div className="text-xs text-blue-400 mb-2">Linked to: {a.job_posting.title}</div>
                    )}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {a.time_limit_minutes} min</span>
                      <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Pass: {a.passing_score}%</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {candidateCount} invited</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/recruiter/assessments/${a.id}/invite`}
                      className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-1.5 transition-colors"
                    >
                      <Users className="w-3 h-3" /> Invite
                    </Link>
                    <Link
                      href={`/recruiter/assessments/${a.id}/results`}
                      className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 bg-violet-500/10 border border-violet-500/20 rounded-lg px-3 py-1.5 transition-colors"
                    >
                      Results <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

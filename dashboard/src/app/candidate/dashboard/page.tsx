"use client";

import { GraduationCap } from "lucide-react";

export default function CandidateDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-violet-500/20 flex items-center justify-center mx-auto mb-4">
          <GraduationCap className="w-8 h-8 text-violet-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Candidate Dashboard</h1>
        <p className="text-slate-400 text-sm">Coming in Phase 3 — mock interviews, assessments &amp; profile.</p>
      </div>
    </div>
  );
}

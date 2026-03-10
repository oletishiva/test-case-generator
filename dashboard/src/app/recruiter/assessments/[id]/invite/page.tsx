"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Mail, Send, CheckCircle2, AlertCircle, Loader2, Users, Mic } from "lucide-react";

export default function InviteCandidatePage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const isHR = searchParams.get("type") === "hr";

  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [invited, setInvited] = useState<string[]>([]);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setError("");
    setSuccess(false);
    try {
      const body = isHR
        ? JSON.stringify({ candidateEmail: email.trim(), inviteType: "hr_interview" })
        : JSON.stringify({ candidateEmail: email.trim() });

      const res = await fetch(`/api/recruiter/assessments/${id}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Invite failed");
      setInvited((p) => [...p, email.trim()]);
      setEmail("");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to invite");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-xl mx-auto">
      <Link href={`/recruiter/assessments/${id}/results`} className="flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Results
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isHR ? "bg-indigo-500/20" : "bg-blue-500/20"}`}>
            {isHR ? <Mic className="w-4 h-4 text-indigo-400" /> : <Mail className="w-4 h-4 text-blue-400" />}
          </div>
          <h1 className="text-2xl font-bold text-white">
            {isHR ? "Invite to HR Interview" : "Invite Candidate"}
          </h1>
        </div>
        <p className="text-slate-400 text-sm">
          {isHR
            ? "Send the candidate an invitation to complete an AI-powered HR round interview."
            : "Enter the candidate's email address to invite them to this assessment."}
        </p>
      </div>

      {/* Toggle between invite types */}
      <div className="flex gap-2 mb-6">
        <Link
          href={`/recruiter/assessments/${id}/invite`}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors border ${
            !isHR ? "bg-blue-600 text-white border-blue-600" : "border-slate-700 text-slate-400 hover:text-white"
          }`}
        >
          <Users className="w-3.5 h-3.5 flex-shrink-0" /> <span className="truncate">Assessment Invite</span>
        </Link>
        <Link
          href={`/recruiter/assessments/${id}/invite?type=hr`}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors border ${
            isHR ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-700 text-slate-400 hover:text-white"
          }`}
        >
          <Mic className="w-3.5 h-3.5 flex-shrink-0" /> <span className="truncate">HR Interview Invite</span>
        </Link>
      </div>

      <form onSubmit={invite} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Candidate email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setSuccess(false); setError(""); }}
              required
              placeholder="candidate@example.com"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {isHR ? "HR interview invite sent!" : "Assessment invite sent!"}
          </div>
        )}

        <button
          type="submit"
          disabled={sending || !email.trim()}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-medium text-sm transition-colors disabled:opacity-50 ${
            isHR ? "bg-indigo-600 hover:bg-indigo-500" : "bg-blue-600 hover:bg-blue-500"
          }`}
        >
          {sending
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
            : <><Send className="w-4 h-4" /> {isHR ? "Send HR Invite" : "Send Invite"}</>}
        </button>
      </form>

      {invited.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-3">
            <Users className="w-4 h-4" /> Invited this session ({invited.length})
          </div>
          <div className="space-y-2">
            {invited.map((e) => (
              <div key={e} className="flex items-center gap-2 text-sm text-slate-300 bg-slate-800 rounded-lg px-3 py-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> <span className="truncate">{e}</span>
              </div>
            ))}
          </div>
          <Link
            href={`/recruiter/assessments/${id}/results`}
            className="mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-violet-500/30 text-violet-400 hover:bg-violet-500/10 text-sm font-medium transition-colors"
          >
            View Results
          </Link>
        </div>
      )}
    </div>
  );
}

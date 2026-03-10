"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Mail, Send, CheckCircle2, AlertCircle, Loader2, Users } from "lucide-react";

export default function InviteCandidatePage() {
  const { id } = useParams<{ id: string }>();
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
      const res = await fetch(`/api/recruiter/assessments/${id}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateEmail: email.trim() }),
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
    <div className="p-8 max-w-xl mx-auto">
      <Link href="/recruiter/assessments" className="flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Assessments
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Invite Candidate</h1>
        <p className="text-slate-400 text-sm mt-1">
          Enter the candidate&apos;s email address. They must have an AITestCraft account.
        </p>
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
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Invite sent successfully!
          </div>
        )}

        <button
          type="submit"
          disabled={sending || !email.trim()}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-colors disabled:opacity-50"
        >
          {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <><Send className="w-4 h-4" /> Send Invite</>}
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
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> {e}
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

"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Mic, Send, Loader2, Clock, MessageSquare, AlertCircle, LogOut } from "lucide-react";

type Message = { role: "ai" | "candidate"; content: string; timestamp: string };

function useCountdown(startedAt: string | null, limitMinutes = 15) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  useEffect(() => {
    if (!startedAt) return;
    const deadline = new Date(startedAt).getTime() + limitMinutes * 60 * 1000;
    const tick = () => setSecondsLeft(Math.max(0, Math.round((deadline - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt, limitMinutes]);
  return secondsLeft;
}

export default function HRInterviewSessionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [status, setStatus] = useState<"in_progress" | "completed">("in_progress");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [answer, setAnswer] = useState("");
  const [thinking, setThinking] = useState(false);
  const [ending, setEnding] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const autoEndedRef = useRef(false);

  const secondsLeft = useCountdown(startedAt, 15);

  // Load session
  useEffect(() => {
    fetch(`/api/hr-interview/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); return; }
        const s = d.session;
        setMessages(s.conversation ?? []);
        setQuestionCount(s.question_count ?? 0);
        setStartedAt(s.started_at);
        setStatus(s.status);
        if (s.status === "completed") router.replace(`/candidate/hr-interview/${id}/results`);
      })
      .catch(() => setError("Failed to load interview"))
      .finally(() => setLoading(false));
  }, [id, router]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  // Auto-end when timer hits 0
  useEffect(() => {
    if (secondsLeft === 0 && !autoEndedRef.current && status === "in_progress") {
      autoEndedRef.current = true;
      endInterview();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  async function sendAnswer() {
    if (!answer.trim() || thinking) return;
    const myAnswer = answer.trim();
    setAnswer("");

    // Optimistically add candidate message
    const candidateMsg: Message = { role: "candidate", content: myAnswer, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, candidateMsg]);
    setThinking(true);

    try {
      const res = await fetch(`/api/hr-interview/${id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: myAnswer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");

      if (data.done) {
        setThinking(false);
        await endInterview();
      } else {
        const aiMsg: Message = { role: "ai", content: data.nextQuestion, timestamp: new Date().toISOString() };
        setMessages((prev) => [...prev, aiMsg]);
        setQuestionCount((c) => c + 1);
        setThinking(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send answer");
      setThinking(false);
    }
  }

  async function endInterview() {
    if (ending) return;
    setEnding(true);
    try {
      await fetch(`/api/hr-interview/${id}/end`, { method: "POST" });
      router.push(`/candidate/hr-interview/${id}/results`);
    } catch {
      setEnding(false);
    }
  }

  const timerColor = secondsLeft != null && secondsLeft < 120 ? "text-red-400" : "text-emerald-400";
  const timerDisplay = secondsLeft != null
    ? `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`
    : "--:--";

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-slate-950">
      <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-screen bg-slate-950">
      <div className="text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <div className="text-white font-medium">{error}</div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-slate-950">
      {/* Top bar */}
      <div className="flex-shrink-0 bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Mic className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="text-white font-medium text-sm">HR Round Interview</div>
            <div className="text-slate-500 text-xs flex items-center gap-2">
              <MessageSquare className="w-3 h-3" />
              <span>Q {questionCount}/20</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-1.5 font-mono font-bold text-sm ${timerColor}`}>
            <Clock className="w-4 h-4" /> {timerDisplay}
          </div>
          <button
            onClick={endInterview}
            disabled={ending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 text-xs transition-colors disabled:opacity-50"
          >
            {ending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
            End Interview
          </button>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "candidate" ? "justify-end" : "justify-start"}`}>
            {msg.role === "ai" && (
              <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mr-3 mt-1">
                <Mic className="w-3.5 h-3.5 text-indigo-400" />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "ai"
                  ? "bg-slate-800 text-slate-100 rounded-tl-sm"
                  : "bg-indigo-600 text-white rounded-tr-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Thinking indicator */}
        {thinking && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mr-3 mt-1">
              <Mic className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
              <span className="text-slate-400 text-xs">AI is preparing your next question…</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 bg-slate-900 border-t border-slate-800 px-4 py-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendAnswer(); }
            }}
            disabled={thinking || ending}
            placeholder="Type your answer… (Enter to send, Shift+Enter for new line)"
            rows={3}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          />
          <button
            onClick={sendAnswer}
            disabled={!answer.trim() || thinking || ending}
            className="flex-shrink-0 w-12 h-12 self-end rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {thinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-center text-slate-600 text-xs mt-2">Your answers are private and only used to generate follow-up questions.</p>
      </div>
    </div>
  );
}

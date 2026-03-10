"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Mic, Send, Loader2, Clock, MessageSquare, AlertCircle, LogOut, Square, RefreshCw, MicOff } from "lucide-react";

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

// Minimal interface for cross-browser SpeechRecognition
interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}
interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: { transcript: string };
}
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: { length: number; [index: number]: SpeechRecognitionResult };
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

// Detect browser speech support
const getSpeechRecognition = (): SpeechRecognitionCtor | null => {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

function speakText(text: string) {
  if (typeof window === "undefined") return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.92;
  utter.pitch = 1.0;
  const doSpeak = () => {
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((v) => v.lang.startsWith("en") && !v.localService) ??
      voices.find((v) => v.lang.startsWith("en")) ?? null;
    if (preferred) utter.voice = preferred;
    window.speechSynthesis.speak(utter);
  };
  if (window.speechSynthesis.getVoices().length > 0) {
    doSpeak();
  } else {
    window.speechSynthesis.addEventListener("voiceschanged", doSpeak, { once: true });
  }
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
  const [thinking, setThinking] = useState(false);
  const [ending, setEnding] = useState(false);

  // Voice state
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceState, setVoiceState] = useState<"idle" | "recording">("idle");
  const [transcript, setTranscript] = useState(""); // live interim + final
  const [finalText, setFinalText] = useState("");   // committed final text
  const [speechError, setSpeechError] = useState("");
  // Fallback text (for non-speech browsers)
  const [fallbackText, setFallbackText] = useState("");

  // Grace period state (when timer hits 0 while an answer is in-progress)
  const [timedOut, setTimedOut] = useState(false);
  const [graceSecondsLeft, setGraceSecondsLeft] = useState<number | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const autoEndedRef = useRef(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalTextRef = useRef(""); // keep ref in sync for use in recognition callbacks
  const fallbackTextRef = useRef(""); // mirror of fallbackText for use in effects
  const prevMsgLenRef = useRef(0);
  const graceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const secondsLeft = useCountdown(startedAt, 15);

  // Detect speech support on mount
  useEffect(() => {
    setSpeechSupported(!!getSpeechRecognition());
  }, []);

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
        prevMsgLenRef.current = (s.conversation ?? []).length;
        if (s.status === "completed") router.replace(`/candidate/hr-interview/${id}/results`);
      })
      .catch(() => setError("Failed to load interview"))
      .finally(() => setLoading(false));
  }, [id, router]);

  // Speak new AI messages
  useEffect(() => {
    const newMsgs = messages.slice(prevMsgLenRef.current);
    prevMsgLenRef.current = messages.length;
    const lastAI = [...newMsgs].reverse().find((m) => m.role === "ai");
    if (lastAI) speakText(lastAI.content);
  }, [messages]);

  // Cancel speech and grace timer on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") window.speechSynthesis.cancel();
      if (graceTimerRef.current) clearInterval(graceTimerRef.current);
    };
  }, []);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  // When timer hits 0: if there's a pending answer give a 2-min grace period, otherwise end now
  useEffect(() => {
    if (secondsLeft !== 0 || autoEndedRef.current || status !== "in_progress") return;
    autoEndedRef.current = true;

    const hasPending = voiceState === "recording"
      || !!finalTextRef.current.trim()
      || !!fallbackTextRef.current.trim();

    if (!hasPending) {
      endInterview();
      return;
    }

    // Stop microphone if recording so candidate can review transcript
    if (voiceState === "recording") {
      recognitionRef.current?.stop();
      setVoiceState("idle");
    }

    setTimedOut(true);
    setGraceSecondsLeft(120);

    graceTimerRef.current = setInterval(() => {
      setGraceSecondsLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(graceTimerRef.current!);
          graceTimerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  // Grace period expired — auto-submit pending answer then end
  useEffect(() => {
    if (graceSecondsLeft !== 0) return;
    const pendingText = finalTextRef.current.trim() || fallbackTextRef.current.trim();
    if (pendingText && !thinking && !ending) {
      sendAnswer(); // sendAnswer checks timedOut and will end after submitting
    } else {
      endInterview();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graceSecondsLeft]);

  function startRecording() {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) return;
    setSpeechError("");
    setTranscript("");
    setFinalText("");
    finalTextRef.current = "";

    // Cancel any ongoing AI speech
    if (typeof window !== "undefined") window.speechSynthesis.cancel();

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let newFinal = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          newFinal += result[0].transcript + " ";
        } else {
          interim += result[0].transcript;
        }
      }
      finalTextRef.current += newFinal;
      setFinalText(finalTextRef.current);
      setTranscript(finalTextRef.current + interim);
    };

    recognition.onerror = (event: { error: string }) => {
      if (event.error === "not-allowed") {
        setSpeechError("Microphone access denied. Please allow microphone access in your browser settings.");
      } else if (event.error === "no-speech") {
        setSpeechError("No speech detected. Tap the mic and speak clearly.");
      } else if (event.error === "network") {
        setSpeechError("Network error with speech service. Try again.");
      } else {
        setSpeechError(`Speech error: ${event.error}`);
      }
      setVoiceState("idle");
    };

    recognition.onend = () => {
      setVoiceState("idle");
    };

    recognition.start();
    setVoiceState("recording");
  }

  function stopRecording() {
    recognitionRef.current?.stop();
    setVoiceState("idle");
  }

  const sendAnswer = useCallback(async () => {
    const text = speechSupported ? finalTextRef.current.trim() : fallbackTextRef.current.trim();
    if (!text || thinking || ending) return;

    if (typeof window !== "undefined") window.speechSynthesis.cancel();
    // Clear grace timer — answer is being submitted
    if (graceTimerRef.current) { clearInterval(graceTimerRef.current); graceTimerRef.current = null; }
    setFinalText("");
    setTranscript("");
    finalTextRef.current = "";
    setFallbackText("");
    fallbackTextRef.current = "";
    setSpeechError("");

    const candidateMsg: Message = { role: "candidate", content: text, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, candidateMsg]);
    setThinking(true);

    try {
      const res = await fetch(`/api/hr-interview/${id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");

      // If timed out, always end after submitting the last answer (don't continue)
      if (data.done || timedOut) {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, thinking, ending, speechSupported, timedOut]);

  async function endInterview() {
    if (ending) return;
    setEnding(true);
    if (typeof window !== "undefined") window.speechSynthesis.cancel();
    recognitionRef.current?.stop();
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

  const hasTranscript = (finalText.trim() || transcript.trim()).length > 0;

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
      <div className="flex-shrink-0 bg-slate-900 border-b border-slate-800 px-3 sm:px-6 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <Mic className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="min-w-0">
            <div className="text-white font-medium text-sm truncate">HR Round Interview</div>
            <div className="text-slate-500 text-xs flex items-center gap-1.5">
              <MessageSquare className="w-3 h-3 flex-shrink-0" />
              <span>Q {questionCount}/20</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <div className={`flex items-center gap-1 sm:gap-1.5 font-mono font-bold text-sm ${timerColor}`}>
            <Clock className="w-4 h-4 flex-shrink-0" /> {timerDisplay}
          </div>
          <button
            onClick={endInterview}
            disabled={ending}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 text-xs transition-colors disabled:opacity-50"
          >
            {ending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">End Interview</span>
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
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === "ai"
                ? "bg-slate-800 text-slate-100 rounded-tl-sm"
                : "bg-indigo-600 text-white rounded-tr-sm"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

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

      {/* Grace period banner */}
      {timedOut && graceSecondsLeft !== null && graceSecondsLeft > 0 && !ending && (
        <div className="flex-shrink-0 bg-amber-500/10 border-t border-amber-500/30 px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-amber-400 text-sm">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span>Time&apos;s up! Finish your answer and submit — auto-submitting in</span>
          </div>
          <span className="font-mono font-bold text-amber-400 text-sm flex-shrink-0">
            {String(Math.floor(graceSecondsLeft / 60)).padStart(2, "0")}:{String(graceSecondsLeft % 60).padStart(2, "0")}
          </span>
        </div>
      )}

      {/* Input area */}
      <div className="flex-shrink-0 bg-slate-900 border-t border-slate-800 px-4 py-5">
        <div className="max-w-3xl mx-auto">

          {speechSupported ? (
            /* ── Voice UI ── */
            <div className="flex flex-col items-center gap-4">

              {/* Live transcript display */}
              <div className="w-full min-h-[56px] bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm">
                {transcript || finalText ? (
                  <span className="text-white leading-relaxed">{transcript || finalText}</span>
                ) : (
                  <span className="text-slate-500 italic">
                    {voiceState === "recording" ? "Listening…" : thinking ? "Processing your answer…" : "Tap the mic to speak your answer"}
                  </span>
                )}
              </div>

              {/* Controls row */}
              <div className="flex items-center gap-5">
                {/* Large mic / stop button */}
                <button
                  onClick={voiceState === "recording" ? stopRecording : startRecording}
                  disabled={thinking || ending}
                  className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed ${
                    voiceState === "recording"
                      ? "bg-red-500 hover:bg-red-400 shadow-red-500/40"
                      : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/30"
                  }`}
                >
                  {/* Pulse rings when recording */}
                  {voiceState === "recording" && (
                    <>
                      <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-25" />
                      <span className="absolute inset-[-6px] rounded-full border-2 border-red-400/30 animate-pulse" />
                    </>
                  )}
                  {voiceState === "recording"
                    ? <Square className="w-6 h-6 text-white fill-white" />
                    : <Mic className="w-7 h-7 text-white" />}
                </button>

                {/* Send / Re-record — shown once there's something to send */}
                {hasTranscript && voiceState !== "recording" && (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={sendAnswer}
                      disabled={thinking || ending || !finalText.trim()}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {thinking
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                        : <><Send className="w-4 h-4" /> Send Answer</>}
                    </button>
                    <button
                      onClick={() => { setFinalText(""); setTranscript(""); finalTextRef.current = ""; setSpeechError(""); }}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" /> Re-record
                    </button>
                  </div>
                )}
              </div>

              {/* State hint */}
              <p className="text-slate-600 text-xs">
                {voiceState === "recording"
                  ? "Recording — tap the button to stop"
                  : finalText
                  ? "Review your answer above, then send or re-record"
                  : "Tap the mic to speak. Your answer will appear above."}
              </p>

              {speechError && (
                <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 w-full">
                  <MicOff className="w-4 h-4 flex-shrink-0" /> {speechError}
                </div>
              )}
            </div>

          ) : (
            /* ── Fallback text input (Firefox / unsupported) ── */
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                Voice input is not supported in this browser. Type your answer below.
              </div>
              <div className="flex gap-3">
                <textarea
                  value={fallbackText}
                  onChange={(e) => { setFallbackText(e.target.value); fallbackTextRef.current = e.target.value; }}
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
                  disabled={!fallbackText.trim() || thinking || ending}
                  className="flex-shrink-0 w-12 h-12 self-end rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {thinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-slate-600 text-xs mt-3">Your answers are private and only used to generate follow-up questions.</p>
      </div>
    </div>
  );
}

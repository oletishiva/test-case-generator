"use client";

import { useEffect, useRef, useState } from "react";
import type { AtsScore } from "@/types/resume";

interface Props {
  score: AtsScore | null;
  loading?: boolean;
  onRescore: () => void;
}

function useCountUp(target: number, active: boolean) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active || target === 0) return;
    let cur = 0;
    const steps = 40;
    const inc = target / steps;
    const iv = setInterval(() => {
      cur += inc;
      if (cur >= target) { setVal(target); clearInterval(iv); }
      else setVal(Math.floor(cur));
    }, 30);
    return () => clearInterval(iv);
  }, [target, active]);
  return val;
}

function ScoreRing({ score }: { score: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const color = score >= 80 ? "#4CAF7D" : score >= 60 ? "#C9A84C" : "#FF4D6D";
  const dashLen = (score / 100) * circ;
  const animated = useCountUp(score, true);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "20px" }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#ffffff10" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${dashLen} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
        <text x="70" y="64" textAnchor="middle" fill={color} fontSize="30" fontWeight="700" fontFamily="'Space Mono', monospace">{animated}</text>
        <text x="70" y="82" textAnchor="middle" fill="#6b7280" fontSize="11" fontFamily="'DM Sans', sans-serif">ATS Score</text>
      </svg>

      {/* Grade badges */}
      <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
        <GradeBadge label="Keywords" value={`${score?.toFixed(0)}%`} color="#4A90D9" />
        <GradeBadge label="Criteria" value="—/23" color="#C9A84C" />
        <GradeBadge label="Impact" value="—" color="#4CAF7D" />
      </div>
    </div>
  );
}

function GradeBadge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ textAlign: "center", padding: "5px 10px", borderRadius: "6px", background: `${color}15`, border: `1px solid ${color}44` }}>
      <p style={{ fontSize: "12px", fontWeight: 700, color, margin: 0 }}>{value}</p>
      <p style={{ fontSize: "9px", color: "#6b7280", margin: "1px 0 0" }}>{label}</p>
    </div>
  );
}

export default function AtsScorePanel({ score, loading = false, onRescore }: Props) {
  if (loading) {
    return (
      <div style={{ padding: "16px" }}>
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <div style={{ width: "120px", height: "120px", borderRadius: "50%", background: "#ffffff08", margin: "0 auto 12px" }} />
          {[80, 60, 90].map((w, i) => (
            <div key={i} style={{ height: "8px", width: `${w}%`, background: "#ffffff08", borderRadius: "4px", margin: "6px auto" }} />
          ))}
        </div>
        <p style={{ textAlign: "center", fontSize: "12px", color: "#6b7280" }}>Scoring your resume...</p>
      </div>
    );
  }

  if (!score) {
    return (
      <div style={{ padding: "16px", textAlign: "center" }}>
        <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "12px" }}>Run ATS scoring to see your resume quality analysis.</p>
        <button onClick={onRescore} style={{
          background: "linear-gradient(135deg,#C9A84C,#E8C96A)", color: "#000",
          border: "none", borderRadius: "8px", padding: "10px 20px",
          fontSize: "12px", fontWeight: 700, cursor: "pointer", width: "100%",
        }}>Score My Resume</button>
      </div>
    );
  }

  const color = score.total >= 80 ? "#4CAF7D" : score.total >= 60 ? "#C9A84C" : "#FF4D6D";

  return (
    <div style={{ padding: "12px" }}>

      {/* Score ring */}
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <svg width="120" height="120" viewBox="0 0 120 120" style={{ display: "block", margin: "0 auto" }}>
          <circle cx="60" cy="60" r="48" fill="none" stroke="#ffffff10" strokeWidth="9" />
          <circle cx="60" cy="60" r="48" fill="none" stroke={color} strokeWidth="9"
            strokeDasharray={`${(score.total / 100) * (2 * Math.PI * 48)} ${2 * Math.PI * 48}`}
            strokeLinecap="round" transform="rotate(-90 60 60)"
            style={{ transition: "stroke-dasharray 1s ease" }} />
          <text x="60" y="55" textAnchor="middle" fill={color} fontSize="26" fontWeight="700" fontFamily="'Space Mono', monospace">{score.total}</text>
          <text x="60" y="70" textAnchor="middle" fill="#6b7280" fontSize="9" fontFamily="'DM Sans', sans-serif">ATS Score</text>
        </svg>
      </div>

      {/* Grade row */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
        <div style={{ flex: 1, textAlign: "center", padding: "6px 4px", borderRadius: "6px", background: "#4A90D922", border: "1px solid #4A90D944" }}>
          <p style={{ fontSize: "13px", fontWeight: 700, color: "#4A90D9", margin: 0 }}>{score.keywordMatch}%</p>
          <p style={{ fontSize: "9px", color: "#6b7280", margin: "1px 0 0" }}>Keywords</p>
        </div>
        <div style={{ flex: 1, textAlign: "center", padding: "6px 4px", borderRadius: "6px", background: "#C9A84C22", border: "1px solid #C9A84C44" }}>
          <p style={{ fontSize: "13px", fontWeight: 700, color: "#C9A84C", margin: 0 }}>{score.criteriaScore}/23</p>
          <p style={{ fontSize: "9px", color: "#6b7280", margin: "1px 0 0" }}>Criteria</p>
        </div>
        <div style={{ flex: 1, textAlign: "center", padding: "6px 4px", borderRadius: "6px", background: "#4CAF7D22", border: "1px solid #4CAF7D44" }}>
          <p style={{ fontSize: "13px", fontWeight: 700, color: "#4CAF7D", margin: 0 }}>{score.impactScore}</p>
          <p style={{ fontSize: "9px", color: "#6b7280", margin: "1px 0 0" }}>Impact</p>
        </div>
      </div>

      {/* Missing keywords */}
      {score.missingKeywords.length > 0 && (
        <div style={{ marginBottom: "14px" }}>
          <p style={{ fontSize: "10px", fontFamily: "'Space Mono', monospace", letterSpacing: "2px", textTransform: "uppercase", color: "#FF4D6D", marginBottom: "8px" }}>
            Missing Keywords
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {score.missingKeywords.slice(0, 10).map((kw, i) => (
              <span key={i} style={{
                fontSize: "10px", border: "1px solid #FF4D6D44", background: "#FF4D6D0a",
                color: "#FF4D6D", borderRadius: "4px", padding: "3px 7px",
              }}>+ {kw}</span>
            ))}
          </div>
        </div>
      )}

      {/* 23 criteria checklist */}
      <div style={{ marginBottom: "14px" }}>
        <p style={{ fontSize: "10px", fontFamily: "'Space Mono', monospace", letterSpacing: "2px", textTransform: "uppercase", color: "#8B9BB4", marginBottom: "8px" }}>
          23 Criteria
        </p>
        <div style={{ maxHeight: "220px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px" }}>
          {score.breakdown.map((item, i) => (
            <div key={i} style={{
              display: "flex", gap: "8px", padding: "6px 8px",
              borderRadius: "6px", background: item.passed ? "#4CAF7D0a" : "#FF4D6D0a",
              border: `1px solid ${item.passed ? "#4CAF7D22" : "#FF4D6D22"}`,
            }}>
              <span style={{ fontSize: "11px", flexShrink: 0 }}>{item.passed ? "✓" : "✗"}</span>
              <div>
                <p style={{ fontSize: "10px", color: item.passed ? "#d1d5db" : "#fca5a5", margin: 0 }}>{item.criterion}</p>
                {!item.passed && item.suggestion && (
                  <p style={{ fontSize: "9px", color: "#C9A84C", margin: "2px 0 0" }}>{item.suggestion}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      {score.suggestions.length > 0 && (
        <div style={{ marginBottom: "14px" }}>
          <p style={{ fontSize: "10px", fontFamily: "'Space Mono', monospace", letterSpacing: "2px", textTransform: "uppercase", color: "#8B9BB4", marginBottom: "8px" }}>
            Top Suggestions
          </p>
          {score.suggestions.slice(0, 3).map((s, i) => (
            <div key={i} style={{ display: "flex", gap: "6px", marginBottom: "5px" }}>
              <span style={{ fontSize: "11px", color: "#C9A84C", flexShrink: 0 }}>→</span>
              <p style={{ fontSize: "10px", color: "#9ca3af", margin: 0, lineHeight: 1.5 }}>{s}</p>
            </div>
          ))}
        </div>
      )}

      <button onClick={onRescore} style={{
        background: "transparent", border: "1px solid #C9A84C66",
        color: "#C9A84C", borderRadius: "8px", padding: "9px",
        fontSize: "11px", fontWeight: 600, cursor: "pointer", width: "100%",
      }}>↺ Re-score After Edits</button>
    </div>
  );
}

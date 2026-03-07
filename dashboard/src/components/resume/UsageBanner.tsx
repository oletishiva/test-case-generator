"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

interface ActionUsage {
  used: number;
  limit: number;
}

interface UsageSummary {
  parse: ActionUsage;
  enhance: ActionUsage;
  "ats-score": ActionUsage;
}

export default function UsageBanner() {
  const { user } = useUser();
  const [usage, setUsage] = useState<UsageSummary | null>(null);

  const plan = user?.publicMetadata?.plan as string | undefined;

  useEffect(() => {
    if (!user || (plan && plan !== "free")) return;
    fetch("/api/resume/usage")
      .then((r) => r.json())
      .then((data) => setUsage(data.usage ?? null))
      .catch(() => {});
  }, [user, plan]);

  if (!usage || (plan && plan !== "free")) return null;

  const items: { label: string; key: keyof UsageSummary }[] = [
    { label: "Parses", key: "parse" },
    { label: "Enhances", key: "enhance" },
    { label: "ATS Scores", key: "ats-score" },
  ];

  const anyExhausted = items.some(({ key }) => usage[key].used >= usage[key].limit);

  return (
    <div style={{
      margin: "0 0 16px",
      padding: "10px 14px",
      borderRadius: "10px",
      background: anyExhausted ? "#FF4D6D0a" : "#C9A84C0a",
      border: `1px solid ${anyExhausted ? "#FF4D6D44" : "#C9A84C44"}`,
      display: "flex",
      alignItems: "center",
      gap: "16px",
      flexWrap: "wrap",
    }}>
      <span style={{ fontSize: "11px", color: "#9ca3af", flexShrink: 0 }}>
        Free plan usage:
      </span>

      {items.map(({ label, key }) => {
        const { used, limit } = usage[key];
        const pct = used / limit;
        const color = pct >= 1 ? "#FF4D6D" : pct >= 0.66 ? "#C9A84C" : "#4CAF7D";
        return (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "10px", color: "#6b7280" }}>{label}</span>
            <div style={{ width: "48px", height: "4px", background: "#ffffff10", borderRadius: "99px" }}>
              <div style={{ width: `${Math.min(pct * 100, 100)}%`, height: "100%", background: color, borderRadius: "99px", transition: "width 0.4s ease" }} />
            </div>
            <span style={{ fontSize: "10px", color, fontWeight: 600 }}>{used}/{limit}</span>
          </div>
        );
      })}

      {anyExhausted && (
        <span style={{ fontSize: "10px", color: "#FF4D6D", marginLeft: "auto" }}>
          Limit reached — upgrade to Pro for unlimited access
        </span>
      )}
    </div>
  );
}

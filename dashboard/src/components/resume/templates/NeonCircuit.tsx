import type { ResumeData } from "@/types/resume";

const LEVEL_WIDTH = ["20%", "40%", "60%", "80%", "100%"];

export default function NeonCircuit({ data }: { data: ResumeData }) {
  const p = data.personalInfo;

  return (
    <div id="resume-preview" style={{
      fontFamily: "'DM Sans', sans-serif",
      background: "#050510",
      color: "#ffffff",
      width: "794px",
      minHeight: "1123px",
    }}>

      {/* Header */}
      <header style={{ padding: "36px 48px 28px", borderBottom: "1px solid #00F5FF33" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "24px" }}>
          {/* Avatar placeholder with pulse ring */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              width: "80px", height: "80px", borderRadius: "50%",
              background: "linear-gradient(135deg,#00F5FF22,#FF4D6D22)",
              border: "2px solid #00F5FF",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "28px", fontWeight: 700, color: "#00F5FF",
            }}>
              {p.name.charAt(0)}
            </div>
            <div style={{
              position: "absolute", inset: "-4px", borderRadius: "50%",
              border: "1px solid #00F5FF44",
            }} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00F5FF" }} />
              <span style={{ fontSize: "10px", color: "#00F5FF", fontFamily: "'Space Mono', monospace", letterSpacing: "2px" }}>AVAILABLE</span>
            </div>
            <h1 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "40px", fontWeight: 800, margin: 0, lineHeight: 1.1,
              background: "linear-gradient(135deg,#00F5FF,#4A90D9)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>{p.name}</h1>
            <p style={{ fontSize: "12px", color: "#FF4D6D", fontFamily: "'Space Mono', monospace", letterSpacing: "2px", textTransform: "uppercase", marginTop: "6px" }}>
              {p.title}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "10px" }}>
              {[p.email, p.phone, p.location].filter(Boolean).map((item, i) => (
                <span key={i} style={{ fontSize: "11px", color: "#6b7280" }}>{item}</span>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <div style={{ display: "flex" }}>

        {/* Left column */}
        <div style={{ width: "55%", padding: "24px 28px", borderRight: "1px solid #ffffff08" }}>

          {/* Summary */}
          {p.summary && (
            <section style={{ marginBottom: "24px" }}>
              <NeonHeading>Profile</NeonHeading>
              <p style={{ fontSize: "11.5px", color: "#9ca3af", lineHeight: 1.7 }}>{p.summary}</p>
            </section>
          )}

          {/* Experience */}
          {data.experience.length > 0 && (
            <section>
              <NeonHeading>Experience</NeonHeading>
              {data.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: "20px", paddingLeft: "14px", borderLeft: "2px solid #00F5FF44" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "13px", color: "#fff", fontWeight: 700, margin: 0 }}>{exp.role}</h3>
                    <span style={{
                      fontSize: "10px", fontFamily: "'Space Mono', monospace",
                      background: "#FF4D6D22", color: "#FF4D6D",
                      border: "1px solid #FF4D6D44", borderRadius: "4px", padding: "2px 6px",
                    }}>{exp.startDate} – {exp.endDate}</span>
                  </div>
                  <p style={{ fontSize: "11px", color: "#00F5FF", margin: "4px 0 8px" }}>{exp.company}</p>
                  <ul style={{ margin: 0, paddingLeft: "0", listStyle: "none" }}>
                    {exp.bullets.map((b, j) => (
                      <li key={j} style={{ fontSize: "11px", color: "#d1d5db", marginBottom: "4px", lineHeight: 1.6, display: "flex", gap: "6px" }}>
                        <span style={{ color: "#00F5FF", flexShrink: 0 }}>&gt;</span> {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          )}
        </div>

        {/* Right column */}
        <div style={{ flex: 1, padding: "24px 20px" }}>

          {/* ATS Score ring */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#00F5FF22" strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="url(#neonGrad)" strokeWidth="8"
                strokeDasharray={`${0.88 * 264} 264`} strokeLinecap="round"
                transform="rotate(-90 50 50)" />
              <defs>
                <linearGradient id="neonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00F5FF" />
                  <stop offset="100%" stopColor="#FF4D6D" />
                </linearGradient>
              </defs>
              <text x="50" y="46" textAnchor="middle" fill="#00F5FF" fontSize="18" fontWeight="700" fontFamily="'Space Mono', monospace">88</text>
              <text x="50" y="60" textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="'DM Sans', sans-serif">ATS Score</text>
            </svg>
          </div>

          {/* Skills */}
          {data.skills.length > 0 && (
            <section style={{ marginBottom: "20px" }}>
              <NeonHeading>Skills</NeonHeading>
              {data.skills.map((s, i) => (
                <div key={i} style={{ marginBottom: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                    <span style={{ fontSize: "11px", color: "#d1d5db" }}>{s.name}</span>
                    <span style={{ fontSize: "9px", color: "#6b7280" }}>{s.level}/5</span>
                  </div>
                  <div style={{ height: "2px", background: "#ffffff10", borderRadius: "99px" }}>
                    <div style={{
                      height: "100%", width: LEVEL_WIDTH[s.level - 1], borderRadius: "99px",
                      background: "linear-gradient(90deg,#00F5FF,#FF4D6D)",
                      boxShadow: "0 0 6px #00F5FF88",
                    }} />
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Tools */}
          {data.tools.length > 0 && (
            <section style={{ marginBottom: "20px" }}>
              <NeonHeading>Tools</NeonHeading>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {data.tools.map((t, i) => (
                  <span key={i} style={{
                    fontSize: "9px", border: "1px solid #00F5FF44",
                    color: "#00F5FF", borderRadius: "4px", padding: "3px 7px",
                    background: "#00F5FF0a",
                  }}>{t}</span>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {data.education.length > 0 && (
            <section style={{ marginBottom: "20px" }}>
              <NeonHeading>Education</NeonHeading>
              {data.education.map((ed, i) => (
                <div key={i} style={{ marginBottom: "8px" }}>
                  <p style={{ fontSize: "11px", color: "#fff", fontWeight: 600, margin: 0 }}>{ed.degree}</p>
                  <p style={{ fontSize: "10px", color: "#6b7280", margin: "2px 0 0" }}>{ed.institution} · {ed.year}</p>
                </div>
              ))}
            </section>
          )}

          {/* Certifications */}
          {data.certifications.length > 0 && (
            <section>
              <NeonHeading>Certifications</NeonHeading>
              {data.certifications.map((c, i) => (
                <div key={i} style={{ marginBottom: "6px" }}>
                  <p style={{ fontSize: "10px", color: "#d1d5db", margin: 0 }}>{c.name}</p>
                  <p style={{ fontSize: "9px", color: "#FF4D6D", margin: "1px 0 0" }}>{c.issuer} · {c.year}</p>
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function NeonHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: "'Space Mono', monospace", fontSize: "9px", letterSpacing: "3px",
      textTransform: "uppercase", color: "#00F5FF", borderBottom: "1px solid #00F5FF22",
      paddingBottom: "5px", marginBottom: "12px", marginTop: 0,
    }}>{children}</h2>
  );
}

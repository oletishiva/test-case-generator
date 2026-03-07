import type { ResumeData } from "@/types/resume";

/** Two Column Clean — white background, two-column body, professional.
 *  Inspired by enhancv's two-column template (screenshot 2).
 *  Font sizes scaled for A4 print quality (≈10-11pt body text in PDF).
 */
export default function TwoColumnClean({ data }: { data: ResumeData }) {
  const p = data.personalInfo;

  return (
    <div style={{
      fontFamily: "Arial, Helvetica, sans-serif",
      background: "#ffffff",
      color: "#1a1a1a",
      width: "794px",
      minHeight: "1123px",
      boxSizing: "border-box",
    }}>

      {/* ── Header ─────────────────────────────────────── */}
      <header style={{ padding: "40px 48px 24px", borderBottom: "2px solid #111111" }}>
        <h1 style={{
          fontSize: "36px", fontWeight: 700, margin: "0 0 4px",
          color: "#111111", letterSpacing: "-0.5px",
        }}>{p.name}</h1>

        <p style={{ fontSize: "16px", color: "#2563eb", margin: "0 0 12px" }}>
          {p.title}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0", fontSize: "13px", color: "#555555" }}>
          {[p.phone, p.email, p.linkedin, p.location].filter(Boolean).map((item, i, arr) => (
            <span key={i}>
              {item}
              {i < arr.length - 1 && <span style={{ margin: "0 10px", color: "#cccccc" }}>|</span>}
            </span>
          ))}
        </div>
      </header>

      {/* ── Two-column body ─────────────────────────────── */}
      <div style={{ display: "flex" }}>

        {/* Left sidebar 32% */}
        <aside style={{ width: "254px", padding: "28px 24px 28px 48px", borderRight: "1px solid #e5e7eb", flexShrink: 0 }}>

          {/* Skills */}
          {data.skills.length > 0 && (
            <section style={{ marginBottom: "24px" }}>
              <SideHeading>Skills</SideHeading>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {data.skills.map((s, i) => (
                  <span key={i} style={{
                    fontSize: "12px", color: "#374151", background: "#f3f4f6",
                    border: "1px solid #e5e7eb", borderRadius: "3px", padding: "3px 8px",
                  }}>{s.name}</span>
                ))}
              </div>
            </section>
          )}

          {/* Tools */}
          {data.tools.length > 0 && (
            <section style={{ marginBottom: "24px" }}>
              <SideHeading>Tools</SideHeading>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {data.tools.slice(0, 8).map((t, i) => (
                  <span key={i} style={{
                    fontSize: "12px", color: "#374151", background: "#eff6ff",
                    border: "1px solid #bfdbfe", borderRadius: "3px", padding: "3px 8px",
                  }}>{t}</span>
                ))}
              </div>
            </section>
          )}

          {/* Key Achievements */}
          {data.achievements.length > 0 && (
            <section style={{ marginBottom: "24px" }}>
              <SideHeading>Key Achievements</SideHeading>
              {data.achievements.map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "10px" }}>
                  <span style={{ fontSize: "15px", color: "#2563eb", lineHeight: "1.2", flexShrink: 0 }}>◆</span>
                  <div>
                    <p style={{ fontSize: "15px", fontWeight: 700, color: "#111111", margin: 0 }}>{a.metric}</p>
                    <p style={{ fontSize: "12px", color: "#6b7280", margin: "1px 0 0", lineHeight: 1.4 }}>{a.label}</p>
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Certifications */}
          {data.certifications.length > 0 && (
            <section style={{ marginBottom: "24px" }}>
              <SideHeading>Certifications</SideHeading>
              {data.certifications.map((c, i) => (
                <div key={i} style={{ marginBottom: "8px", borderLeft: "2px solid #2563eb", paddingLeft: "8px" }}>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: "#111111", margin: 0, lineHeight: 1.4 }}>{c.name}</p>
                  <p style={{ fontSize: "11px", color: "#9ca3af", margin: "2px 0 0" }}>{c.issuer} · {c.year}</p>
                </div>
              ))}
            </section>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <section>
              <SideHeading>Languages</SideHeading>
              {data.languages.map((l, i) => (
                <p key={i} style={{ fontSize: "13px", color: "#333333", margin: "4px 0" }}>• {l}</p>
              ))}
            </section>
          )}
        </aside>

        {/* Right main 68% */}
        <main style={{ flex: 1, padding: "28px 40px 28px 28px" }}>

          {/* Summary */}
          {p.summary && (
            <section style={{ marginBottom: "22px" }}>
              <MainHeading>Summary</MainHeading>
              <p style={{ fontSize: "14px", color: "#333333", lineHeight: 1.75, margin: 0 }}>
                {p.summary}
              </p>
            </section>
          )}

          {/* Experience */}
          {data.experience.length > 0 && (
            <section style={{ marginBottom: "22px" }}>
              <MainHeading>Experience</MainHeading>
              {data.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: "18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "#111111" }}>
                      {exp.role}
                    </h3>
                    <span style={{ fontSize: "12px", color: "#888888", whiteSpace: "nowrap", marginLeft: 8 }}>
                      {exp.startDate} – {exp.endDate}
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", color: "#2563eb", margin: "2px 0 6px" }}>
                    {exp.company}{exp.location ? ` · ${exp.location}` : ""}
                  </p>
                  <ul style={{ margin: 0, paddingLeft: "15px" }}>
                    {exp.bullets.map((b, j) => (
                      <li key={j} style={{ fontSize: "13px", color: "#333333", marginBottom: "4px", lineHeight: 1.65 }}>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          )}

          {/* Education */}
          {data.education.length > 0 && (
            <section style={{ marginBottom: "22px" }}>
              <MainHeading>Education</MainHeading>
              {data.education.map((ed, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <div>
                    <p style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "#111111" }}>{ed.degree}</p>
                    <p style={{ fontSize: "13px", color: "#2563eb", margin: "2px 0 0" }}>{ed.institution}</p>
                    {ed.grade && <p style={{ fontSize: "12px", color: "#888888", margin: "1px 0 0" }}>{ed.grade}</p>}
                  </div>
                  <span style={{ fontSize: "13px", color: "#888888" }}>{ed.year}</span>
                </div>
              ))}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

function MainHeading({ children }: { children: React.ReactNode }) {
  return (
    <>
      <h2 style={{
        fontSize: "13px", fontWeight: 700, letterSpacing: "1.5px",
        textTransform: "uppercase", color: "#111111",
        margin: "0 0 2px",
      }}>{children}</h2>
      <div style={{ height: "1px", background: "#d1d5db", marginBottom: "12px" }} />
    </>
  );
}

function SideHeading({ children }: { children: React.ReactNode }) {
  return (
    <>
      <h2 style={{
        fontSize: "12px", fontWeight: 700, letterSpacing: "1.5px",
        textTransform: "uppercase", color: "#111111",
        margin: "0 0 2px",
      }}>{children}</h2>
      <div style={{ height: "1px", background: "#d1d5db", marginBottom: "10px" }} />
    </>
  );
}

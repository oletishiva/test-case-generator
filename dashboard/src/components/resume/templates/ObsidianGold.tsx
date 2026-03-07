import type { ResumeData } from "@/types/resume";

const LEVEL_WIDTH = ["20%", "40%", "60%", "80%", "100%"];

export default function ObsidianGold({ data }: { data: ResumeData }) {
  const p = data.personalInfo;

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      background: "#0e0e16",
      color: "#ffffff",
      width: "794px",
      minHeight: "1123px",
      display: "flex",
      flexDirection: "column",
    }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <header style={{ background: "#0a0a12", padding: "36px 48px 28px", borderBottom: "2px solid #C9A84C" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "46px", fontWeight: 700, margin: 0, lineHeight: 1.1,
              background: "linear-gradient(135deg,#C9A84C,#E8C96A)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>{p.name}</h1>
            <p style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase",
              color: "#8B9BB4", marginTop: "8px",
            }}>{p.title}</p>
            <div style={{ display: "flex", gap: "16px", marginTop: "14px", flexWrap: "wrap" }}>
              {[p.email, p.phone, p.location, p.linkedin, p.github].filter(Boolean).map((item, i) => (
                <span key={i} style={{ fontSize: "11px", color: "#8B9BB4" }}>
                  {i > 0 && <span style={{ marginRight: "16px", color: "#C9A84C44" }}>◆</span>}
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── Body (sidebar + main) ───────────────────────────── */}
      <div style={{ display: "flex", flex: 1 }}>

        {/* Sidebar 35% */}
        <aside style={{ width: "35%", background: "#0c0c18", padding: "28px 24px", borderRight: "1px solid #ffffff10" }}>

          {/* Summary */}
          {p.summary && (
            <section style={{ marginBottom: "28px" }}>
              <SidebarHeading>Summary</SidebarHeading>
              <p style={{ fontSize: "11.5px", color: "#9ca3af", lineHeight: 1.7 }}>{p.summary}</p>
            </section>
          )}

          {/* Skills */}
          {data.skills.length > 0 && (
            <section style={{ marginBottom: "28px" }}>
              <SidebarHeading>Skills</SidebarHeading>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {data.skills.map((s, i) => (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontSize: "11px", color: "#d1d5db" }}>{s.name}</span>
                      <span style={{ fontSize: "10px", color: "#C9A84C" }}>{"●".repeat(s.level)}{"○".repeat(5 - s.level)}</span>
                    </div>
                    <div style={{ height: "3px", background: "#ffffff15", borderRadius: "99px" }}>
                      <div style={{ height: "100%", width: LEVEL_WIDTH[s.level - 1], background: "linear-gradient(90deg,#C9A84C,#E8C96A)", borderRadius: "99px", transition: "width 1s" }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          {data.certifications.length > 0 && (
            <section style={{ marginBottom: "28px" }}>
              <SidebarHeading>Certifications</SidebarHeading>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {data.certifications.map((c, i) => (
                  <div key={i} style={{ border: "1px solid #C9A84C33", borderRadius: "8px", padding: "8px 10px" }}>
                    <p style={{ fontSize: "11px", color: "#ffffff", fontWeight: 600, margin: 0 }}>{c.name}</p>
                    <p style={{ fontSize: "10px", color: "#C9A84C", margin: "2px 0 0" }}>{c.issuer} · {c.year}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Tools */}
          {data.tools.length > 0 && (
            <section style={{ marginBottom: "28px" }}>
              <SidebarHeading>Tools</SidebarHeading>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {data.tools.map((t, i) => (
                  <span key={i} style={{
                    fontSize: "10px", background: "#C9A84C22", border: "1px solid #C9A84C44",
                    color: "#C9A84C", borderRadius: "4px", padding: "3px 8px",
                  }}>{t}</span>
                ))}
              </div>
            </section>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <section>
              <SidebarHeading>Languages</SidebarHeading>
              {data.languages.map((l, i) => (
                <p key={i} style={{ fontSize: "11px", color: "#9ca3af", margin: "2px 0" }}>• {l}</p>
              ))}
            </section>
          )}
        </aside>

        {/* Main 65% */}
        <main style={{ flex: 1, padding: "28px 32px" }}>

          {/* Achievements */}
          {data.achievements.length > 0 && (
            <section style={{ marginBottom: "24px" }}>
              <MainHeading>Key Achievements</MainHeading>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {data.achievements.map((a, i) => (
                  <div key={i} style={{
                    border: "1px solid #C9A84C33", borderRadius: "8px", padding: "10px 14px", textAlign: "center",
                  }}>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", color: "#C9A84C", margin: 0 }}>{a.metric}</p>
                    <p style={{ fontSize: "10px", color: "#9ca3af", margin: "2px 0 0" }}>{a.label}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Experience */}
          {data.experience.length > 0 && (
            <section style={{ marginBottom: "24px" }}>
              <MainHeading>Experience</MainHeading>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {data.experience.map((exp, i) => (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", color: "#fff", margin: 0 }}>{exp.role}</h3>
                      <span style={{
                        fontFamily: "'Space Mono', monospace", fontSize: "10px",
                        background: "#C9A84C22", border: "1px solid #C9A84C44",
                        color: "#C9A84C", borderRadius: "4px", padding: "2px 8px",
                      }}>{exp.startDate} – {exp.endDate}</span>
                    </div>
                    <p style={{ fontSize: "11px", color: "#C9A84C", marginBottom: "8px" }}>{exp.company} · {exp.location}</p>
                    <ul style={{ margin: 0, paddingLeft: "14px" }}>
                      {exp.bullets.map((b, j) => (
                        <li key={j} style={{ fontSize: "11.5px", color: "#d1d5db", marginBottom: "4px", lineHeight: 1.6 }}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {data.education.length > 0 && (
            <section>
              <MainHeading>Education</MainHeading>
              {data.education.map((ed, i) => (
                <div key={i} style={{ marginBottom: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "12px", color: "#fff", fontWeight: 600 }}>{ed.degree}</span>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", color: "#C9A84C" }}>{ed.year}</span>
                  </div>
                  <p style={{ fontSize: "11px", color: "#9ca3af", margin: "2px 0 0" }}>{ed.institution}{ed.grade ? ` · ${ed.grade}` : ""}</p>
                </div>
              ))}
            </section>
          )}
        </main>
      </div>

      <style>{`@media print { #resume-preview { -webkit-print-color-adjust: exact; } }`}</style>
    </div>
  );
}

function SidebarHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: "'Space Mono', monospace", fontSize: "9px", letterSpacing: "3px",
      textTransform: "uppercase", color: "#C9A84C", borderBottom: "1px solid #C9A84C44",
      paddingBottom: "6px", marginBottom: "12px", marginTop: 0,
    }}>{children}</h2>
  );
}

function MainHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: "'Space Mono', monospace", fontSize: "9px", letterSpacing: "3px",
      textTransform: "uppercase", color: "#C9A84C",
      borderBottom: "1px solid #C9A84C44", paddingBottom: "6px", marginBottom: "14px", marginTop: 0,
    }}>{children}</h2>
  );
}

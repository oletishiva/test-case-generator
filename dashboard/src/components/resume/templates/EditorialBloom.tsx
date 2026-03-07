import type { ResumeData } from "@/types/resume";

const LEVEL_WIDTH = ["20%", "40%", "60%", "80%", "100%"];

export default function EditorialBloom({ data }: { data: ResumeData }) {
  const p = data.personalInfo;

  return (
    <div id="resume-preview" style={{
      fontFamily: "'DM Sans', sans-serif",
      background: "#faf8f4",
      color: "#1a1a1a",
      width: "794px",
      minHeight: "1123px",
    }}>

      {/* Header band */}
      <header style={{ background: "#1a1a1a", padding: "32px 48px 24px", position: "relative" }}>
        {/* Accent bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "linear-gradient(90deg,#FF4D6D,#C9A84C)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "44px", fontWeight: 700, margin: 0, lineHeight: 1.1, color: "#ffffff",
            }}>{p.name}</h1>
            <p style={{ fontSize: "13px", color: "#FF4D6D", letterSpacing: "1px", marginTop: "6px" }}>{p.title}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginTop: "10px" }}>
              {[p.email, p.phone, p.location, p.linkedin].filter(Boolean).map((item, i) => (
                <span key={i} style={{ fontSize: "11px", color: "#9ca3af" }}>{item}</span>
              ))}
            </div>
          </div>
          {/* Avatar circle */}
          <div style={{
            width: "80px", height: "80px", borderRadius: "50%",
            background: "linear-gradient(135deg,#FF4D6D,#C9A84C)",
            border: "3px solid #FF4D6D",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "28px", fontWeight: 700, color: "#fff",
            flexShrink: 0,
          }}>{p.name.charAt(0)}</div>
        </div>
      </header>

      {/* Body */}
      <div style={{ display: "flex" }}>

        {/* Main 65% */}
        <main style={{ flex: 1, padding: "28px 32px" }}>

          {/* Summary */}
          {p.summary && (
            <section style={{ marginBottom: "22px" }}>
              <BloomHeading>Professional Summary</BloomHeading>
              <p style={{ fontSize: "12px", color: "#4b5563", lineHeight: 1.8 }}>{p.summary}</p>
            </section>
          )}

          {/* Impact stats */}
          {data.achievements.length > 0 && (
            <section style={{ marginBottom: "22px" }}>
              <BloomHeading>Impact</BloomHeading>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                {data.achievements.map((a, i) => (
                  <div key={i} style={{
                    background: "#fff", borderRadius: "8px", padding: "10px",
                    border: "1px solid #f0e8e8", textAlign: "center",
                  }}>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", color: "#FF4D6D", margin: 0, fontWeight: 700 }}>{a.metric}</p>
                    <p style={{ fontSize: "9px", color: "#9ca3af", margin: "3px 0 0", lineHeight: 1.3 }}>{a.label}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Experience */}
          {data.experience.length > 0 && (
            <section style={{ marginBottom: "22px" }}>
              <BloomHeading>Experience</BloomHeading>
              {data.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: "18px", paddingLeft: "14px", borderLeft: "3px solid #FF4D6D44" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "14px", color: "#1a1a1a", fontWeight: 700, margin: 0 }}>{exp.role}</h3>
                    <span style={{ fontSize: "10px", color: "#9ca3af", fontFamily: "'Space Mono', monospace" }}>{exp.startDate} – {exp.endDate}</span>
                  </div>
                  <p style={{ fontSize: "11px", color: "#FF4D6D", margin: "3px 0 7px" }}>{exp.company} · {exp.location}</p>
                  <ul style={{ margin: 0, paddingLeft: "14px" }}>
                    {exp.bullets.map((b, j) => (
                      <li key={j} style={{ fontSize: "11.5px", color: "#4b5563", marginBottom: "3px", lineHeight: 1.6 }}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          )}

          {/* Education */}
          {data.education.length > 0 && (
            <section>
              <BloomHeading>Education</BloomHeading>
              {data.education.map((ed, i) => (
                <div key={i} style={{ marginBottom: "8px", display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: "12px", fontWeight: 600, color: "#1a1a1a", margin: 0 }}>{ed.degree}</p>
                    <p style={{ fontSize: "11px", color: "#6b7280", margin: "2px 0 0" }}>{ed.institution}{ed.grade ? ` · ${ed.grade}` : ""}</p>
                  </div>
                  <span style={{ fontSize: "11px", color: "#C9A84C", fontFamily: "'Space Mono', monospace" }}>{ed.year}</span>
                </div>
              ))}
            </section>
          )}
        </main>

        {/* Sidebar 35% */}
        <aside style={{ width: "35%", background: "#f3ede8", padding: "28px 20px", borderLeft: "1px solid #e5ddd5" }}>

          {/* Skills */}
          {data.skills.length > 0 && (
            <section style={{ marginBottom: "24px" }}>
              <BloomSideHeading>Skills</BloomSideHeading>
              {data.skills.map((s, i) => (
                <div key={i} style={{ marginBottom: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                    <span style={{ fontSize: "11px", color: "#374151" }}>{s.name}</span>
                  </div>
                  <div style={{ height: "6px", background: "#e5e7eb", borderRadius: "99px" }}>
                    <div style={{ height: "100%", width: LEVEL_WIDTH[s.level - 1], borderRadius: "99px", background: "linear-gradient(90deg,#FF4D6D,#C9A84C)" }} />
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Certifications */}
          {data.certifications.length > 0 && (
            <section style={{ marginBottom: "24px" }}>
              <BloomSideHeading>Certifications</BloomSideHeading>
              {data.certifications.map((c, i) => (
                <div key={i} style={{ marginBottom: "8px", padding: "8px", background: "#fff", borderRadius: "6px", borderLeft: "3px solid #FF4D6D" }}>
                  <p style={{ fontSize: "10px", color: "#1a1a1a", fontWeight: 600, margin: 0 }}>{c.name}</p>
                  <p style={{ fontSize: "9px", color: "#9ca3af", margin: "2px 0 0" }}>{c.issuer} · {c.year}</p>
                </div>
              ))}
            </section>
          )}

          {/* Tools */}
          {data.tools.length > 0 && (
            <section style={{ marginBottom: "24px" }}>
              <BloomSideHeading>Tools</BloomSideHeading>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {data.tools.map((t, i) => (
                  <span key={i} style={{ fontSize: "10px", background: "#fff", border: "1px solid #e5e7eb", color: "#374151", borderRadius: "4px", padding: "3px 7px" }}>{t}</span>
                ))}
              </div>
            </section>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <section>
              <BloomSideHeading>Languages</BloomSideHeading>
              {data.languages.map((l, i) => (
                <p key={i} style={{ fontSize: "11px", color: "#4b5563", margin: "3px 0" }}>• {l}</p>
              ))}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

function BloomHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontSize: "10px", fontFamily: "'Space Mono', monospace", letterSpacing: "3px",
      textTransform: "uppercase", color: "#FF4D6D",
      borderBottom: "1px solid #FF4D6D33", paddingBottom: "5px", marginBottom: "12px", marginTop: 0,
    }}>{children}</h2>
  );
}
function BloomSideHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontSize: "9px", fontFamily: "'Space Mono', monospace", letterSpacing: "3px",
      textTransform: "uppercase", color: "#C9A84C",
      borderBottom: "1px solid #C9A84C44", paddingBottom: "5px", marginBottom: "10px", marginTop: 0,
    }}>{children}</h2>
  );
}

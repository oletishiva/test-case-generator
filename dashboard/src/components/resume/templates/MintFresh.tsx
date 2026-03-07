import type { ResumeData } from "@/types/resume";

const LEVEL_WIDTH = ["20%", "40%", "60%", "80%", "100%"];

export default function MintFresh({ data }: { data: ResumeData }) {
  const p = data.personalInfo;

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      background: "#f6fef9",
      color: "#1a2e23",
      width: "794px", minHeight: "1123px",
    }}>

      {/* Header */}
      <header style={{ background: "#1a2e23", padding: "32px 48px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "40px", fontWeight: 800, margin: 0, color: "#4CAF7D" }}>{p.name}</h1>
            <p style={{ fontSize: "12px", color: "#a7f3d0", letterSpacing: "2px", marginTop: "5px", textTransform: "uppercase" }}>{p.title}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            {[p.email, p.phone, p.location].filter(Boolean).map((item, i) => (
              <p key={i} style={{ fontSize: "11px", color: "#6b7280", margin: "3px 0" }}>{item}</p>
            ))}
          </div>
        </div>
        <div style={{ height: "2px", background: "linear-gradient(90deg,#4CAF7D,transparent)", marginTop: "20px" }} />
      </header>

      {/* Summary */}
      {p.summary && (
        <div style={{ padding: "20px 48px", background: "#e6f7ef", borderBottom: "1px solid #c6e8d5" }}>
          <p style={{ fontSize: "12px", color: "#374151", lineHeight: 1.7, margin: 0 }}>{p.summary}</p>
        </div>
      )}

      {/* Body */}
      <div style={{ display: "flex", padding: "24px 48px", gap: "32px" }}>

        {/* Main */}
        <main style={{ flex: 1 }}>
          {data.experience.length > 0 && (
            <section style={{ marginBottom: "24px" }}>
              <MintHeading color="#4CAF7D">Experience</MintHeading>
              {data.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: "18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "13px", fontWeight: 700, color: "#1a2e23", margin: 0 }}>{exp.role}</h3>
                    <span style={{ fontSize: "10px", color: "#4CAF7D", fontFamily: "'Space Mono', monospace", background: "#4CAF7D22", padding: "2px 8px", borderRadius: "4px" }}>
                      {exp.startDate} – {exp.endDate}
                    </span>
                  </div>
                  <p style={{ fontSize: "11px", color: "#4CAF7D", margin: "3px 0 7px" }}>{exp.company}</p>
                  <ul style={{ margin: 0, paddingLeft: "14px" }}>
                    {exp.bullets.map((b, j) => (
                      <li key={j} style={{ fontSize: "11.5px", color: "#374151", marginBottom: "4px", lineHeight: 1.6 }}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          )}

          {data.education.length > 0 && (
            <section>
              <MintHeading color="#4CAF7D">Education</MintHeading>
              {data.education.map((ed, i) => (
                <div key={i} style={{ marginBottom: "8px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#1a2e23" }}>{ed.degree}</span>
                  <span style={{ fontSize: "11px", color: "#6b7280" }}> · {ed.institution} · {ed.year}</span>
                </div>
              ))}
            </section>
          )}
        </main>

        {/* Sidebar */}
        <aside style={{ width: "220px" }}>
          {data.skills.length > 0 && (
            <section style={{ marginBottom: "20px" }}>
              <MintHeading color="#2d7a50">Skills</MintHeading>
              {data.skills.map((s, i) => (
                <div key={i} style={{ marginBottom: "7px" }}>
                  <span style={{ fontSize: "11px", color: "#374151" }}>{s.name}</span>
                  <div style={{ height: "4px", background: "#c6e8d5", borderRadius: "99px", marginTop: "3px" }}>
                    <div style={{ height: "100%", width: LEVEL_WIDTH[s.level - 1], background: "#4CAF7D", borderRadius: "99px" }} />
                  </div>
                </div>
              ))}
            </section>
          )}

          {data.tools.length > 0 && (
            <section style={{ marginBottom: "20px" }}>
              <MintHeading color="#2d7a50">Tools</MintHeading>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {data.tools.map((t, i) => (
                  <span key={i} style={{ fontSize: "10px", background: "#e6f7ef", border: "1px solid #c6e8d5", color: "#2d7a50", borderRadius: "4px", padding: "3px 7px" }}>{t}</span>
                ))}
              </div>
            </section>
          )}

          {data.certifications.length > 0 && (
            <section style={{ marginBottom: "20px" }}>
              <MintHeading color="#2d7a50">Certifications</MintHeading>
              {data.certifications.map((c, i) => (
                <div key={i} style={{ marginBottom: "6px", padding: "6px 8px", background: "#e6f7ef", borderRadius: "6px", borderLeft: "3px solid #4CAF7D" }}>
                  <p style={{ fontSize: "10px", color: "#1a2e23", fontWeight: 600, margin: 0 }}>{c.name}</p>
                  <p style={{ fontSize: "9px", color: "#6b7280", margin: "2px 0 0" }}>{c.issuer} · {c.year}</p>
                </div>
              ))}
            </section>
          )}

          {data.achievements.length > 0 && (
            <section>
              <MintHeading color="#2d7a50">Key Wins</MintHeading>
              {data.achievements.map((a, i) => (
                <div key={i} style={{ marginBottom: "6px", textAlign: "center", padding: "8px", background: "#e6f7ef", borderRadius: "6px" }}>
                  <p style={{ fontSize: "18px", fontWeight: 700, color: "#4CAF7D", margin: 0 }}>{a.metric}</p>
                  <p style={{ fontSize: "9px", color: "#6b7280", margin: "2px 0 0" }}>{a.label}</p>
                </div>
              ))}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

function MintHeading({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <h2 style={{
      fontSize: "9px", fontFamily: "'Space Mono', monospace", letterSpacing: "3px",
      textTransform: "uppercase", color,
      borderBottom: `1px solid ${color}44`, paddingBottom: "5px", marginBottom: "10px", marginTop: 0,
    }}>{children}</h2>
  );
}

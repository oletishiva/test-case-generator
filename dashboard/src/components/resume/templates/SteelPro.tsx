import type { ResumeData } from "@/types/resume";

const LEVEL_WIDTH = ["20%", "40%", "60%", "80%", "100%"];

export default function SteelPro({ data }: { data: ResumeData }) {
  const p = data.personalInfo;

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      background: "#111827",
      color: "#f9fafb",
      width: "794px", minHeight: "1123px",
    }}>

      {/* Top bar */}
      <div style={{ height: "3px", background: "linear-gradient(90deg,#8B9BB4,#4A5568,#8B9BB4)" }} />

      {/* Header */}
      <header style={{ padding: "32px 48px 24px", borderBottom: "1px solid #1f2937" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "38px", fontWeight: 800, margin: 0, color: "#f9fafb" }}>{p.name}</h1>
            <p style={{ fontSize: "12px", color: "#8B9BB4", letterSpacing: "3px", textTransform: "uppercase", marginTop: "6px", fontFamily: "'Space Mono', monospace" }}>{p.title}</p>
          </div>
          <div style={{ textAlign: "right", marginTop: "4px" }}>
            {[p.email, p.phone, p.location, p.linkedin].filter(Boolean).map((item, i) => (
              <p key={i} style={{ fontSize: "11px", color: "#6b7280", margin: "3px 0" }}>{item}</p>
            ))}
          </div>
        </div>
      </header>

      {/* Body */}
      <div style={{ display: "flex" }}>

        {/* Main */}
        <main style={{ flex: 1, padding: "24px 32px" }}>
          {p.summary && (
            <section style={{ marginBottom: "22px" }}>
              <SteelHeading>Summary</SteelHeading>
              <p style={{ fontSize: "12px", color: "#9ca3af", lineHeight: 1.7 }}>{p.summary}</p>
            </section>
          )}

          {data.experience.length > 0 && (
            <section style={{ marginBottom: "22px" }}>
              <SteelHeading>Experience</SteelHeading>
              {data.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: "18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "13px", fontWeight: 700, color: "#f9fafb", margin: 0 }}>{exp.role}</h3>
                    <span style={{ fontSize: "10px", fontFamily: "'Space Mono', monospace", color: "#8B9BB4", background: "#1f2937", padding: "2px 8px", borderRadius: "4px" }}>
                      {exp.startDate} – {exp.endDate}
                    </span>
                  </div>
                  <p style={{ fontSize: "11px", color: "#8B9BB4", margin: "3px 0 7px" }}>{exp.company} · {exp.location}</p>
                  <ul style={{ margin: 0, paddingLeft: "14px" }}>
                    {exp.bullets.map((b, j) => (
                      <li key={j} style={{ fontSize: "11.5px", color: "#d1d5db", marginBottom: "4px", lineHeight: 1.6 }}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          )}

          {data.education.length > 0 && (
            <section>
              <SteelHeading>Education</SteelHeading>
              {data.education.map((ed, i) => (
                <div key={i} style={{ marginBottom: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#f9fafb" }}>{ed.degree}</span>
                    <span style={{ fontSize: "10px", color: "#8B9BB4", fontFamily: "'Space Mono', monospace" }}>{ed.year}</span>
                  </div>
                  <p style={{ fontSize: "11px", color: "#6b7280", margin: "2px 0 0" }}>{ed.institution}{ed.grade ? ` · ${ed.grade}` : ""}</p>
                </div>
              ))}
            </section>
          )}
        </main>

        {/* Sidebar */}
        <aside style={{ width: "240px", background: "#0d1117", padding: "24px 20px", borderLeft: "1px solid #1f2937" }}>
          {data.skills.length > 0 && (
            <section style={{ marginBottom: "22px" }}>
              <SteelHeading>Skills</SteelHeading>
              {data.skills.map((s, i) => (
                <div key={i} style={{ marginBottom: "8px" }}>
                  <span style={{ fontSize: "11px", color: "#d1d5db" }}>{s.name}</span>
                  <div style={{ height: "3px", background: "#1f2937", borderRadius: "99px", marginTop: "3px" }}>
                    <div style={{ height: "100%", width: LEVEL_WIDTH[s.level - 1], background: "#8B9BB4", borderRadius: "99px" }} />
                  </div>
                </div>
              ))}
            </section>
          )}

          {data.tools.length > 0 && (
            <section style={{ marginBottom: "22px" }}>
              <SteelHeading>Tools</SteelHeading>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {data.tools.map((t, i) => (
                  <span key={i} style={{ fontSize: "10px", border: "1px solid #374151", color: "#9ca3af", borderRadius: "4px", padding: "3px 7px" }}>{t}</span>
                ))}
              </div>
            </section>
          )}

          {data.achievements.length > 0 && (
            <section style={{ marginBottom: "22px" }}>
              <SteelHeading>Achievements</SteelHeading>
              {data.achievements.map((a, i) => (
                <div key={i} style={{ marginBottom: "8px", padding: "8px", border: "1px solid #1f2937", borderRadius: "6px" }}>
                  <p style={{ fontSize: "18px", fontWeight: 700, color: "#8B9BB4", margin: 0, fontFamily: "'Syne', sans-serif" }}>{a.metric}</p>
                  <p style={{ fontSize: "9px", color: "#6b7280", margin: "2px 0 0" }}>{a.label}</p>
                </div>
              ))}
            </section>
          )}

          {data.certifications.length > 0 && (
            <section>
              <SteelHeading>Certifications</SteelHeading>
              {data.certifications.map((c, i) => (
                <div key={i} style={{ marginBottom: "6px" }}>
                  <p style={{ fontSize: "10px", color: "#d1d5db", fontWeight: 600, margin: 0 }}>{c.name}</p>
                  <p style={{ fontSize: "9px", color: "#6b7280", margin: "2px 0 0" }}>{c.issuer} · {c.year}</p>
                </div>
              ))}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

function SteelHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontSize: "9px", fontFamily: "'Space Mono', monospace", letterSpacing: "3px",
      textTransform: "uppercase", color: "#8B9BB4",
      borderBottom: "1px solid #1f2937", paddingBottom: "5px", marginBottom: "12px", marginTop: 0,
    }}>{children}</h2>
  );
}

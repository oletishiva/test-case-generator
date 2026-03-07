import type { ResumeData } from "@/types/resume";

/**
 * Navy Pro — Dark navy sidebar (left 34%) + white main (right 66%).
 * ATS-focused, two-column, professional layout.
 * Inspired by the user's own resume style.
 */
export default function NavyPro({ data }: { data: ResumeData }) {
  const p = data.personalInfo;

  return (
    <div style={{
      fontFamily: "Arial, Helvetica, sans-serif",
      background: "#ffffff",
      color: "#1a1a1a",
      width: "794px",
      minHeight: "1123px",
      display: "flex",
      boxSizing: "border-box",
    }}>

      {/* ── LEFT SIDEBAR (navy) ─────────────────────────────── */}
      <aside style={{
        width: "268px",
        background: "#1e2d4a",
        color: "#ffffff",
        padding: "36px 22px",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: "22px",
      }}>

        {/* Avatar placeholder */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "linear-gradient(135deg,#3b6cb7,#2d9cdb)",
            border: "3px solid #3b6cb7",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, fontWeight: 700, color: "#fff",
          }}>
            {p.name.charAt(0)}
          </div>
        </div>

        {/* Personal Details */}
        <SideSection title="Personal Details">
          {[
            { icon: "✉", val: p.email },
            { icon: "📱", val: p.phone },
            { icon: "🔗", val: p.linkedin },
            { icon: "📍", val: p.location },
          ].filter(x => x.val).map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 11, minWidth: 14, marginTop: 1 }}>{item.icon}</span>
              <span style={{ fontSize: 10, color: "#c8d8f0", lineHeight: 1.4, wordBreak: "break-all" }}>{item.val}</span>
            </div>
          ))}
        </SideSection>

        {/* Education */}
        {data.education.length > 0 && (
          <SideSection title="Education">
            {data.education.map((ed, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#ffffff", margin: 0, lineHeight: 1.4 }}>{ed.degree}</p>
                <p style={{ fontSize: 10, color: "#3b9dd4", margin: "2px 0 1px" }}>{ed.institution}</p>
                <p style={{ fontSize: 9, color: "#94b4d4", margin: 0 }}>{ed.year}{ed.grade ? ` · ${ed.grade}` : ""}</p>
              </div>
            ))}
          </SideSection>
        )}

        {/* Core Competencies / Skills */}
        {data.skills.length > 0 && (
          <SideSection title="Core Competencies">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 4px" }}>
              {data.skills.map((s, i) => (
                <span key={i} style={{
                  fontSize: 9.5, color: "#c8d8f0", background: "#28406e",
                  borderRadius: 3, padding: "2px 7px", border: "1px solid #3b5a8c",
                }}>{s.name}</span>
              ))}
            </div>
          </SideSection>
        )}

        {/* Certifications */}
        {data.certifications.length > 0 && (
          <SideSection title="Certifications">
            {data.certifications.map((c, i) => (
              <div key={i} style={{ marginBottom: 8, borderLeft: "2px solid #3b9dd4", paddingLeft: 7 }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: "#ffffff", margin: 0, lineHeight: 1.4 }}>{c.name}</p>
                <p style={{ fontSize: 9, color: "#94b4d4", margin: "1px 0 0" }}>{c.issuer} · {c.year}</p>
              </div>
            ))}
          </SideSection>
        )}

        {/* Languages */}
        {data.languages && data.languages.length > 0 && (
          <SideSection title="Languages">
            {data.languages.map((l, i) => (
              <p key={i} style={{ fontSize: 10, color: "#c8d8f0", margin: "3px 0" }}>• {l}</p>
            ))}
          </SideSection>
        )}

        {/* Tools */}
        {data.tools.length > 0 && (
          <SideSection title="Tools">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 4px" }}>
              {data.tools.map((t, i) => (
                <span key={i} style={{
                  fontSize: 9, color: "#94b4d4", background: "#162238",
                  borderRadius: 3, padding: "1px 6px", border: "1px solid #28406e",
                }}>{t}</span>
              ))}
            </div>
          </SideSection>
        )}
      </aside>

      {/* ── MAIN CONTENT (white) ────────────────────────────── */}
      <main style={{ flex: 1, padding: "32px 32px 32px 28px", display: "flex", flexDirection: "column", gap: "18px" }}>

        {/* Header: name + title centered */}
        <header style={{ textAlign: "center", borderBottom: "2px solid #1e2d4a", paddingBottom: 16 }}>
          <h1 style={{ fontSize: "26px", fontWeight: 700, margin: "0 0 4px", color: "#1e2d4a", letterSpacing: "0.02em", textTransform: "uppercase" }}>
            {p.name}
          </h1>
          <p style={{ fontSize: "12px", color: "#3b6cb7", margin: "0 0 6px", fontWeight: 600 }}>
            {p.title}
          </p>
          {p.summary && (
            <p style={{ fontSize: "11px", color: "#374151", lineHeight: 1.65, margin: 0, textAlign: "justify" }}>
              {p.summary}
            </p>
          )}
        </header>

        {/* Key Achievements */}
        {data.achievements.length > 0 && (
          <MainSection title="Key Achievements">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {data.achievements.map((a, i) => (
                <div key={i} style={{
                  background: "#f0f4ff", borderRadius: 6,
                  padding: "8px 10px", borderLeft: "3px solid #3b6cb7",
                }}>
                  <p style={{ fontSize: 14, fontWeight: 800, color: "#1e2d4a", margin: 0 }}>{a.metric}</p>
                  <p style={{ fontSize: 9, color: "#6b7280", margin: "2px 0 0", lineHeight: 1.3 }}>{a.label}</p>
                </div>
              ))}
            </div>
          </MainSection>
        )}

        {/* Work Experience */}
        {data.experience.length > 0 && (
          <MainSection title="Work Experience">
            {data.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
                  <h3 style={{ fontSize: "12px", fontWeight: 700, color: "#1e2d4a", margin: 0 }}>
                    {exp.role} — <span style={{ color: "#3b6cb7" }}>{exp.company}</span>
                    {exp.location ? <span style={{ color: "#9ca3af", fontWeight: 400 }}> · {exp.location}</span> : null}
                  </h3>
                  <span style={{ fontSize: "10px", color: "#6b7280", whiteSpace: "nowrap", marginLeft: 8, background: "#f3f4f6", padding: "1px 7px", borderRadius: 4, flexShrink: 0 }}>
                    {exp.startDate} – {exp.endDate}
                  </span>
                </div>
                <ul style={{ margin: "4px 0 0", paddingLeft: "15px" }}>
                  {exp.bullets.map((b, j) => (
                    <li key={j} style={{ fontSize: "11px", color: "#374151", marginBottom: "3px", lineHeight: 1.6 }}>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </MainSection>
        )}
      </main>
    </div>
  );
}

/* ── Sidebar section ────────────────────────────────────────── */
function SideSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <div style={{ flex: 1, height: 1, background: "#3b5a8c" }} />
        <h2 style={{
          fontSize: "9px", fontWeight: 800, letterSpacing: "1.8px",
          textTransform: "uppercase", color: "#94b4d4", margin: 0, whiteSpace: "nowrap",
        }}>{title}</h2>
        <div style={{ flex: 1, height: 1, background: "#3b5a8c" }} />
      </div>
      {children}
    </div>
  );
}

/* ── Main section ───────────────────────────────────────────── */
function MainSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 14, color: "#3b6cb7" }}>👤</span>
        <h2 style={{
          fontSize: "11px", fontWeight: 800, letterSpacing: "1.5px",
          textTransform: "uppercase", color: "#1e2d4a", margin: 0,
        }}>{title}</h2>
      </div>
      <div style={{ height: 2, background: "#e5e7eb", marginBottom: 10 }} />
      {children}
    </section>
  );
}

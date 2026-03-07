import type { ResumeData } from "@/types/resume";

/**
 * Two Column Clean — premium print-ready layout.
 * Font sizes target ~11-12pt in A4 PDF at 200mm content width.
 */
export default function TwoColumnClean({ data }: { data: ResumeData }) {
  const p = data.personalInfo;
  const ACCENT = "#2563eb";
  const SIDEBAR_BG = "#f8faff";

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
      <header style={{
        background: "#0f172a",
        padding: "36px 48px 28px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}>
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontSize: "40px", fontWeight: 800, margin: "0 0 6px",
            color: "#ffffff", letterSpacing: "-0.5px", lineHeight: 1.1,
          }}>{p.name}</h1>
          <p style={{ fontSize: "17px", color: "#60a5fa", margin: "0 0 14px", fontWeight: 500 }}>
            {p.title}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0", fontSize: "13px", color: "#94a3b8" }}>
            {[p.email, p.phone, p.location, p.linkedin].filter(Boolean).map((item, i, arr) => (
              <span key={i}>
                {item}
                {i < arr.length - 1 && <span style={{ margin: "0 12px", color: "#334155" }}>·</span>}
              </span>
            ))}
          </div>
        </div>
        {/* Avatar circle */}
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, marginLeft: 24,
        }}>
          <span style={{ fontSize: "28px", fontWeight: 700, color: "#fff" }}>
            {p.name.charAt(0).toUpperCase()}
          </span>
        </div>
      </header>

      {/* ── Two-column body ─────────────────────────────── */}
      <div style={{ display: "flex" }}>

        {/* ── LEFT SIDEBAR ── */}
        <aside style={{
          width: "260px", flexShrink: 0,
          background: SIDEBAR_BG,
          padding: "28px 20px 28px 28px",
          borderRight: "1px solid #e2e8f0",
        }}>

          {/* Skills */}
          {data.skills.length > 0 && (
            <SideSection title="Skills" accent={ACCENT}>
              {data.skills.map((s, i) => (
                <div key={i} style={{ marginBottom: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                    <span style={{ fontSize: "13px", color: "#1e293b", fontWeight: 500 }}>{s.name}</span>
                  </div>
                  <div style={{ height: "4px", background: "#e2e8f0", borderRadius: "2px" }}>
                    <div style={{
                      height: "4px", borderRadius: "2px",
                      background: ACCENT,
                      width: `${(s.level / 5) * 100}%`,
                    }} />
                  </div>
                </div>
              ))}
            </SideSection>
          )}

          {/* Tools */}
          {data.tools.length > 0 && (
            <SideSection title="Tools" accent={ACCENT}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {data.tools.map((t, i) => (
                  <span key={i} style={{
                    fontSize: "12px", color: "#1e40af", background: "#dbeafe",
                    borderRadius: "4px", padding: "3px 8px", fontWeight: 500,
                  }}>{t}</span>
                ))}
              </div>
            </SideSection>
          )}

          {/* Key Achievements */}
          {data.achievements.length > 0 && (
            <SideSection title="Impact" accent={ACCENT}>
              {data.achievements.map((a, i) => (
                <div key={i} style={{
                  marginBottom: "10px", padding: "8px 10px",
                  background: "#ffffff", borderRadius: "6px",
                  borderLeft: `3px solid ${ACCENT}`,
                }}>
                  <p style={{ fontSize: "18px", fontWeight: 800, color: ACCENT, margin: 0, lineHeight: 1 }}>{a.metric}</p>
                  <p style={{ fontSize: "11px", color: "#64748b", margin: "3px 0 0", lineHeight: 1.3 }}>{a.label}</p>
                </div>
              ))}
            </SideSection>
          )}

          {/* Certifications */}
          {data.certifications.length > 0 && (
            <SideSection title="Certifications" accent={ACCENT}>
              {data.certifications.map((c, i) => (
                <div key={i} style={{ marginBottom: "10px" }}>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: "#1e293b", margin: 0, lineHeight: 1.4 }}>{c.name}</p>
                  <p style={{ fontSize: "11px", color: "#64748b", margin: "2px 0 0" }}>{c.issuer}{c.year ? ` · ${c.year}` : ""}</p>
                </div>
              ))}
            </SideSection>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <SideSection title="Languages" accent={ACCENT}>
              {data.languages.map((l, i) => (
                <p key={i} style={{ fontSize: "13px", color: "#334155", margin: "4px 0", fontWeight: 500 }}>• {l}</p>
              ))}
            </SideSection>
          )}
        </aside>

        {/* ── RIGHT MAIN ── */}
        <main style={{ flex: 1, padding: "28px 36px 28px 28px" }}>

          {/* Summary */}
          {p.summary && (
            <MainSection title="Professional Summary" accent={ACCENT}>
              <p style={{ fontSize: "14px", color: "#334155", lineHeight: 1.85, margin: 0 }}>
                {p.summary}
              </p>
            </MainSection>
          )}

          {/* Experience */}
          {data.experience.length > 0 && (
            <MainSection title="Experience" accent={ACCENT}>
              {data.experience.map((exp, i) => (
                <div key={i} style={{
                  marginBottom: "20px",
                  paddingBottom: "18px",
                  borderBottom: i < data.experience.length - 1 ? "1px solid #f1f5f9" : "none",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "#0f172a" }}>
                      {exp.role}
                    </h3>
                    <span style={{
                      fontSize: "12px", color: "#fff", whiteSpace: "nowrap", marginLeft: 8,
                      background: "#64748b", borderRadius: "4px", padding: "2px 8px",
                    }}>
                      {exp.startDate} – {exp.endDate}
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", color: ACCENT, margin: "3px 0 8px", fontWeight: 600 }}>
                    {exp.company}{exp.location ? ` · ${exp.location}` : ""}
                  </p>
                  <ul style={{ margin: 0, paddingLeft: "16px" }}>
                    {exp.bullets.map((b, j) => (
                      <li key={j} style={{ fontSize: "13px", color: "#334155", marginBottom: "5px", lineHeight: 1.7 }}>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </MainSection>
          )}

          {/* Education */}
          {data.education.length > 0 && (
            <MainSection title="Education" accent={ACCENT}>
              {data.education.map((ed, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div>
                    <p style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "#0f172a" }}>{ed.degree}</p>
                    <p style={{ fontSize: "13px", color: ACCENT, margin: "2px 0 0", fontWeight: 500 }}>{ed.institution}</p>
                    {ed.grade && <p style={{ fontSize: "12px", color: "#64748b", margin: "1px 0 0" }}>{ed.grade}</p>}
                  </div>
                  <span style={{
                    fontSize: "13px", color: ACCENT, fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}>{ed.year}</span>
                </div>
              ))}
            </MainSection>
          )}
        </main>
      </div>
    </div>
  );
}

/* ── Section heading helpers ─────────────────────────────── */

function MainSection({ title, accent, children }: {
  title: string; accent: string; children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
        <div style={{ width: "4px", height: "18px", background: accent, borderRadius: "2px", flexShrink: 0 }} />
        <h2 style={{
          fontSize: "13px", fontWeight: 800, letterSpacing: "1.8px",
          textTransform: "uppercase", color: "#0f172a", margin: 0,
        }}>{title}</h2>
        <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
      </div>
      {children}
    </section>
  );
}

function SideSection({ title, accent, children }: {
  title: string; accent: string; children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: "22px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <div style={{ width: "3px", height: "14px", background: accent, borderRadius: "2px", flexShrink: 0 }} />
        <h2 style={{
          fontSize: "11px", fontWeight: 800, letterSpacing: "1.5px",
          textTransform: "uppercase", color: "#475569", margin: 0,
        }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

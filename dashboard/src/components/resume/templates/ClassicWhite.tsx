import type { ResumeData } from "@/types/resume";

/** Classic White — clean single-column, white background, professional.
 *  Inspired by enhancv's default clean template.
 */
export default function ClassicWhite({ data }: { data: ResumeData }) {
  const p = data.personalInfo;

  return (
    <div id="resume-preview" style={{
      fontFamily: "Georgia, 'Times New Roman', serif",
      background: "#ffffff",
      color: "#1a1a1a",
      width: "794px",
      minHeight: "1123px",
      padding: "52px 56px",
      boxSizing: "border-box",
    }}>

      {/* ── Header ─────────────────────────────────────── */}
      <header style={{ marginBottom: "24px" }}>
        <h1 style={{
          fontSize: "36px", fontWeight: 700, margin: "0 0 4px",
          color: "#111111", letterSpacing: "-0.5px",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}>{p.name}</h1>

        <p style={{ fontSize: "14px", color: "#2563eb", margin: "0 0 12px", fontFamily: "Arial, sans-serif" }}>
          {p.title}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0", fontSize: "11px", color: "#555555", fontFamily: "Arial, sans-serif" }}>
          {[p.phone, p.email, p.linkedin, p.location].filter(Boolean).map((item, i, arr) => (
            <span key={i}>
              {item}
              {i < arr.length - 1 && <span style={{ margin: "0 10px", color: "#cccccc" }}>|</span>}
            </span>
          ))}
        </div>
      </header>

      <div style={{ height: "2px", background: "#111111", marginBottom: "20px" }} />

      {/* ── Summary ─────────────────────────────────────── */}
      {p.summary && (
        <section style={{ marginBottom: "22px" }}>
          <SectionHeading>Summary</SectionHeading>
          <p style={{ fontSize: "12px", color: "#333333", lineHeight: 1.75, margin: 0, fontFamily: "Arial, sans-serif" }}>
            {p.summary}
          </p>
        </section>
      )}

      {/* ── Experience ──────────────────────────────────── */}
      {data.experience.length > 0 && (
        <section style={{ marginBottom: "22px" }}>
          <SectionHeading>Experience</SectionHeading>
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <h3 style={{ fontSize: "13px", fontWeight: 700, margin: 0, color: "#111111", fontFamily: "Arial, sans-serif" }}>
                  {exp.role}
                </h3>
                <span style={{ fontSize: "11px", color: "#888888", fontFamily: "Arial, sans-serif", whiteSpace: "nowrap", marginLeft: 12 }}>
                  {exp.startDate} – {exp.endDate}
                </span>
              </div>
              <p style={{ fontSize: "12px", color: "#2563eb", margin: "2px 0 6px", fontFamily: "Arial, sans-serif" }}>
                {exp.company}{exp.location ? ` · ${exp.location}` : ""}
              </p>
              <ul style={{ margin: 0, paddingLeft: "16px" }}>
                {exp.bullets.map((b, j) => (
                  <li key={j} style={{ fontSize: "12px", color: "#333333", marginBottom: "4px", lineHeight: 1.65, fontFamily: "Arial, sans-serif" }}>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* ── Education ───────────────────────────────────── */}
      {data.education.length > 0 && (
        <section style={{ marginBottom: "22px" }}>
          <SectionHeading>Education</SectionHeading>
          {data.education.map((ed, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 700, margin: 0, color: "#111111", fontFamily: "Arial, sans-serif" }}>{ed.degree}</p>
                <p style={{ fontSize: "12px", color: "#555555", margin: "2px 0 0", fontFamily: "Arial, sans-serif" }}>
                  {ed.institution}{ed.grade ? ` · ${ed.grade}` : ""}
                </p>
              </div>
              <span style={{ fontSize: "11px", color: "#888888", fontFamily: "Arial, sans-serif" }}>{ed.year}</span>
            </div>
          ))}
        </section>
      )}

      {/* ── Key Achievements ─────────────────────────────── */}
      {data.achievements.length > 0 && (
        <section style={{ marginBottom: "22px" }}>
          <SectionHeading>Key Achievements</SectionHeading>
          {data.achievements.map((a, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "8px" }}>
              <span style={{ fontSize: "16px", color: "#2563eb", lineHeight: 1 }}>◆</span>
              <div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#111111", fontFamily: "Arial, sans-serif" }}>{a.metric} </span>
                <span style={{ fontSize: "12px", color: "#555555", fontFamily: "Arial, sans-serif" }}>{a.label}</span>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ── Skills ──────────────────────────────────────── */}
      {data.skills.length > 0 && (
        <section style={{ marginBottom: "22px" }}>
          <SectionHeading>Skills</SectionHeading>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {data.skills.map((s, i) => (
              <span key={i} style={{
                fontSize: "11px", color: "#374151", background: "#f3f4f6",
                border: "1px solid #e5e7eb", borderRadius: "4px", padding: "3px 10px",
                fontFamily: "Arial, sans-serif",
              }}>{s.name}</span>
            ))}
          </div>
        </section>
      )}

      {/* ── Languages ───────────────────────────────────── */}
      {data.languages && data.languages.length > 0 && (
        <section>
          <SectionHeading>Languages</SectionHeading>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {data.languages.map((l, i) => (
              <span key={i} style={{ fontSize: "12px", color: "#333333", fontFamily: "Arial, sans-serif" }}>• {l}</span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <>
      <h2 style={{
        fontSize: "12px", fontWeight: 700, letterSpacing: "1.5px",
        textTransform: "uppercase", color: "#111111",
        margin: "0 0 2px", fontFamily: "Arial, Helvetica, sans-serif",
      }}>{children}</h2>
      <div style={{ height: "1px", background: "#cccccc", marginBottom: "12px" }} />
    </>
  );
}

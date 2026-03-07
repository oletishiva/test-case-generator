"use client";

import { motion } from "framer-motion";
import { RESUME_TEMPLATES, type ResumeTemplate } from "@/types/resume";

interface Props {
  selected: string;
  onSelect: (id: string) => void;
}

const TEMPLATE_COLORS: Record<string, string> = {
  "obsidian-gold": "#0e0e16",
  "neon-circuit": "#050510",
  "editorial-bloom": "#faf8f4",
  "mint-fresh": "#f6fef9",
  "steel-pro": "#111827",
  "sunset-gradient": "#1a0a0a",
  "blueprint-tech": "#0a1628",
  "aurora-soft": "#f8f5ff",
  "executive-black": "#0a0a0a",
  "desi-bold": "#fff7ed",
};

function TemplateMockup({ template }: { template: ResumeTemplate }) {
  const bg = TEMPLATE_COLORS[template.id] ?? "#1a1a2e";
  const isLight = template.theme === "light";

  return (
    <div style={{ width: "100%", height: "100%", background: bg, padding: "10px", display: "flex", flexDirection: "column", gap: "4px" }}>
      {/* Name line */}
      <div style={{ height: "8px", width: "70%", borderRadius: "3px", background: template.accentColor, opacity: 0.9 }} />
      {/* Title line */}
      <div style={{ height: "4px", width: "45%", borderRadius: "2px", background: isLight ? "#33333344" : "#ffffff33" }} />
      <div style={{ height: "1px", width: "100%", background: `${template.accentColor}55`, margin: "3px 0" }} />
      {/* Content lines */}
      {[75, 55, 85, 45, 65, 70, 40].map((w, i) => (
        <div key={i} style={{ height: "3px", width: `${w}%`, borderRadius: "2px", background: isLight ? "#33333322" : "#ffffff18" }} />
      ))}
      <div style={{ height: "5px", width: "55%", borderRadius: "2px", background: `${template.accentColor}55`, margin: "2px 0" }} />
      {[60, 80, 50, 70].map((w, i) => (
        <div key={i} style={{ height: "3px", width: `${w}%`, borderRadius: "2px", background: isLight ? "#33333318" : "#ffffff12" }} />
      ))}
    </div>
  );
}

export default function TemplateGallery({ selected, onSelect }: Props) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
      {RESUME_TEMPLATES.map((t, index) => (
        <motion.div
          key={t.id}
          whileHover={{ y: -4, scale: 1.02 }}
          transition={{ duration: 0.15 }}
          onClick={() => onSelect(t.id)}
          style={{
            position: "relative",
            cursor: "pointer",
            borderRadius: "10px",
            overflow: "hidden",
            border: `2px solid ${selected === t.id ? t.accentColor : "#ffffff15"}`,
            boxShadow: selected === t.id ? `0 0 16px ${t.accentColor}44` : "none",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
        >
          {/* Mockup */}
          <div style={{ width: "100%", height: "140px", overflow: "hidden" }}>
            <TemplateMockup template={t} />
          </div>

          {/* Badges */}
          {index === 0 && (
            <div style={{
              position: "absolute", top: "6px", left: "6px",
              background: "#C9A84C", color: "#000", fontSize: "8px",
              fontWeight: 700, borderRadius: "3px", padding: "2px 6px",
            }}>Popular</div>
          )}
          {index === 1 && (
            <div style={{
              position: "absolute", top: "6px", left: "6px",
              background: "#FF4D6D", color: "#fff", fontSize: "8px",
              fontWeight: 700, borderRadius: "3px", padding: "2px 6px",
            }}>New</div>
          )}

          {/* ATS badge */}
          <div style={{
            position: "absolute", top: "6px", right: "6px",
            background: "#4CAF7D22", border: "1px solid #4CAF7D66",
            color: "#4CAF7D", fontSize: "8px", fontWeight: 600,
            borderRadius: "3px", padding: "2px 5px",
          }}>ATS ✓</div>

          {/* Selected indicator */}
          {selected === t.id && (
            <div style={{
              position: "absolute", bottom: "6px", right: "6px",
              width: "16px", height: "16px", borderRadius: "50%",
              background: t.accentColor, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "10px", color: "#000",
            }}>✓</div>
          )}

          {/* Footer */}
          <div style={{
            padding: "6px 8px",
            background: TEMPLATE_COLORS[t.id] ?? "#0f0f1a",
            borderTop: `1px solid ${t.accentColor}22`,
          }}>
            <p style={{ fontSize: "10px", fontWeight: 700, margin: 0, color: t.theme === "light" ? "#1a1a1a" : "#fff" }}>{t.name}</p>
            <p style={{ fontSize: "9px", margin: "1px 0 0", color: t.accentColor }}>{t.targetRole}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

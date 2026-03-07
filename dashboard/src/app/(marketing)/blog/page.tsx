import Link from "next/link";
import { BLOG_POSTS, CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/blog/posts";
import { Clock, ArrowRight, BookOpen } from "lucide-react";

export const metadata = { title: "Blog | AITestCraft", description: "QA testing tips, interview prep, and automation guides from AITestCraft." };

export default function BlogPage() {
  const sorted = [...BLOG_POSTS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const [featured, ...rest] = sorted;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui, sans-serif" }}>

      {/* ── Nav ─────────────────────────────────────────── */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 32px", display: "flex", alignItems: "center", height: 60, gap: 24 }}>
        <Link href="/" style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", textDecoration: "none" }}>
          AI<span style={{ color: "#2563eb" }}>TestCraft</span>
        </Link>
        <div style={{ flex: 1 }} />
        <Link href="/blog" style={{ fontSize: 14, fontWeight: 600, color: "#2563eb", textDecoration: "none" }}>Blog</Link>
        <Link href="/resume-builder" style={{ fontSize: 14, color: "#475569", textDecoration: "none" }}>Resume Builder</Link>
        <Link href="/dashboard" style={{
          fontSize: 13, fontWeight: 600, color: "#fff", background: "#2563eb",
          borderRadius: 8, padding: "8px 18px", textDecoration: "none",
        }}>Get Started →</Link>
      </nav>

      {/* ── Hero ────────────────────────────────────────── */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)", padding: "64px 32px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(96,165,250,0.15)", borderRadius: 20, padding: "6px 14px", marginBottom: 20 }}>
          <BookOpen style={{ width: 14, height: 14, color: "#60a5fa" }} />
          <span style={{ fontSize: 13, color: "#60a5fa", fontWeight: 600 }}>QA Knowledge Base</span>
        </div>
        <h1 style={{ fontSize: 42, fontWeight: 800, color: "#fff", margin: "0 0 16px", lineHeight: 1.2 }}>
          The AITestCraft Blog
        </h1>
        <p style={{ fontSize: 18, color: "#94a3b8", margin: 0, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
          Testing strategies, interview prep, and automation guides — written for QA engineers by QA engineers.
        </p>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }}>

        {/* ── Featured post ───────────────────────────── */}
        <Link href={`/blog/${featured.slug}`} style={{ textDecoration: "none", display: "block", marginBottom: 48 }}>
          <div style={{
            background: "#fff", borderRadius: 16, overflow: "hidden",
            border: "1px solid #e2e8f0", display: "flex", gap: 0,
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            transition: "box-shadow 0.2s",
          }}>
            <div style={{ background: "linear-gradient(135deg, #1e40af, #7c3aed)", width: 280, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 72 }}>📝</span>
            </div>
            <div style={{ padding: "36px 40px", flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <CategoryBadge cat={featured.category} />
                <span style={{ fontSize: 12, color: "#94a3b8" }}>Featured</span>
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 700, color: "#0f172a", margin: "0 0 12px", lineHeight: 1.3 }}>
                {featured.title}
              </h2>
              <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.7, margin: "0 0 20px" }}>
                {featured.excerpt}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontSize: 13, color: "#94a3b8" }}>{formatDate(featured.date)}</span>
                <span style={{ fontSize: 13, color: "#94a3b8", display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock style={{ width: 12, height: 12 }} /> {featured.readTime} min read
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#2563eb", display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }}>
                  Read article <ArrowRight style={{ width: 14, height: 14 }} />
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* ── Category filter tabs ─────────────────────── */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
          {(["all", "testing", "interview", "tools", "agile"] as const).map(cat => (
            <span key={cat} style={{
              padding: "6px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer",
              background: cat === "all" ? "#0f172a" : "#f1f5f9",
              color: cat === "all" ? "#fff" : "#475569",
            }}>
              {cat === "all" ? "All Posts" : CATEGORY_LABELS[cat]}
            </span>
          ))}
        </div>

        {/* ── Post grid ───────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {rest.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
              <article style={{
                background: "#fff", borderRadius: 12, overflow: "hidden",
                border: "1px solid #e2e8f0", height: "100%",
                display: "flex", flexDirection: "column",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}>
                {/* Card accent bar */}
                <div style={{ height: 4, background: "linear-gradient(90deg, #2563eb, #7c3aed)" }} />
                <div style={{ padding: "20px 24px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <CategoryBadge cat={post.category} />
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "12px 0 8px", lineHeight: 1.4, flex: 1 }}>
                    {post.title}
                  </h3>
                  <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.65, margin: "0 0 16px" }}>
                    {post.excerpt.slice(0, 110)}…
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>{formatDate(post.date)}</span>
                    <span style={{ fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", gap: 3 }}>
                      <Clock style={{ width: 10, height: 10 }} /> {post.readTime}m
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Footer CTA ─��────────────────────────────────── */}
      <div style={{ background: "#0f172a", padding: "48px 32px", textAlign: "center", marginTop: 64 }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: "#fff", margin: "0 0 12px" }}>
          Ready to generate test cases with AI?
        </h2>
        <p style={{ fontSize: 16, color: "#94a3b8", margin: "0 0 24px" }}>
          Join thousands of QA engineers using AITestCraft to write better tests, faster.
        </p>
        <Link href="/dashboard" style={{
          display: "inline-block", background: "#2563eb", color: "#fff",
          fontWeight: 700, fontSize: 15, padding: "14px 32px", borderRadius: 10,
          textDecoration: "none",
        }}>
          Start for Free →
        </Link>
      </div>
    </div>
  );
}

function CategoryBadge({ cat }: { cat: string }) {
  const colors = CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS] ?? { bg: "#f1f5f9", text: "#475569" };
  const label = CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat;
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: colors.bg, color: colors.text, textTransform: "uppercase", letterSpacing: "0.5px",
    }}>{label}</span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

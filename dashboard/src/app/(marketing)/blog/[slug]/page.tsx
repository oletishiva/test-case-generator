import { notFound } from "next/navigation";
import Link from "next/link";
import { BLOG_POSTS, getPostBySlug, CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/blog/posts";
import { Clock, ArrowLeft, ArrowRight, BookOpen } from "lucide-react";

export async function generateStaticParams() {
  return BLOG_POSTS.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return { title: `${post.title} | AITestCraft Blog`, description: post.excerpt };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const idx = BLOG_POSTS.findIndex(p => p.slug === slug);
  const prev = BLOG_POSTS[idx + 1] ?? null;
  const next = BLOG_POSTS[idx - 1] ?? null;
  const related = BLOG_POSTS.filter(p => p.slug !== slug && p.category === post.category).slice(0, 3);

  const catColors = CATEGORY_COLORS[post.category];
  const catLabel = CATEGORY_LABELS[post.category];

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

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>

        {/* ── Breadcrumb ───────────────────────────────── */}
        <Link href="/blog" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 14, color: "#64748b", textDecoration: "none", marginBottom: 32,
        }}>
          <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Blog
        </Link>

        {/* ── Post header ─────────────────────────────── */}
        <header style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{
              display: "inline-block", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
              background: catColors.bg, color: catColors.text, textTransform: "uppercase", letterSpacing: "0.5px",
            }}>{catLabel}</span>
            <span style={{ fontSize: 13, color: "#94a3b8", display: "flex", alignItems: "center", gap: 4 }}>
              <Clock style={{ width: 12, height: 12 }} /> {post.readTime} min read
            </span>
            <span style={{ fontSize: 13, color: "#94a3b8" }}>{formatDate(post.date)}</span>
          </div>

          <h1 style={{
            fontSize: 34, fontWeight: 800, color: "#0f172a", margin: "0 0 16px", lineHeight: 1.25,
          }}>
            {post.title}
          </h1>

          <p style={{ fontSize: 18, color: "#475569", lineHeight: 1.7, margin: 0, borderLeft: "3px solid #2563eb", paddingLeft: 16 }}>
            {post.excerpt}
          </p>
        </header>

        {/* ── Post body ───────────────────────────────── */}
        <article style={{ background: "#fff", borderRadius: 16, padding: "40px 48px", border: "1px solid #e2e8f0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <div
            style={{ fontSize: 16, lineHeight: 1.85, color: "#334155" }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* ── Prev / Next ──────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 40 }}>
          {prev ? (
            <Link href={`/blog/${prev.slug}`} style={{ textDecoration: "none" }}>
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 20px" }}>
                <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 4 }}>
                  <ArrowLeft style={{ width: 10, height: 10 }} /> Previous
                </p>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", margin: 0, lineHeight: 1.4 }}>{prev.title}</p>
              </div>
            </Link>
          ) : <div />}
          {next ? (
            <Link href={`/blog/${next.slug}`} style={{ textDecoration: "none" }}>
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 20px", textAlign: "right" }}>
                <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                  Next <ArrowRight style={{ width: 10, height: 10 }} />
                </p>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", margin: 0, lineHeight: 1.4 }}>{next.title}</p>
              </div>
            </Link>
          ) : <div />}
        </div>

        {/* ── Related posts ────────────────────────────── */}
        {related.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: "0 0 20px", display: "flex", alignItems: "center", gap: 8 }}>
              <BookOpen style={{ width: 18, height: 18, color: "#2563eb" }} /> Related Articles
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
              {related.map(r => (
                <Link key={r.slug} href={`/blog/${r.slug}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 20px" }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", margin: "0 0 8px", lineHeight: 1.4 }}>{r.title}</p>
                    <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, display: "flex", alignItems: "center", gap: 4 }}>
                      <Clock style={{ width: 10, height: 10 }} /> {r.readTime} min read
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── CTA ───────────────────��─────────────────── */}
        <div style={{ marginTop: 48, background: "linear-gradient(135deg, #0f172a, #1e3a5f)", borderRadius: 16, padding: "36px 40px", textAlign: "center" }}>
          <h3 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 10px" }}>
            Generate test cases with AI — in seconds
          </h3>
          <p style={{ fontSize: 15, color: "#94a3b8", margin: "0 0 20px" }}>
            Put these testing concepts into practice with AITestCraft's AI-powered test generator.
          </p>
          <Link href="/dashboard" style={{
            display: "inline-block", background: "#2563eb", color: "#fff",
            fontWeight: 700, fontSize: 14, padding: "12px 28px", borderRadius: 8,
            textDecoration: "none",
          }}>
            Try AITestCraft Free →
          </Link>
        </div>
      </div>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

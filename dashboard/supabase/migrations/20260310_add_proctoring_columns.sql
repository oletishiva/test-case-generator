-- ── Add anti-cheat + proctoring columns to candidate_assessments ──────────
ALTER TABLE candidate_assessments
  ADD COLUMN IF NOT EXISTS tab_switches       int     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS copy_attempts      int     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS paste_events       int     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fullscreen_exits   int     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS proctoring_flags   jsonb   DEFAULT '[]';

-- ── HR Round Interview table ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hr_interviews (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_clerk_id  text NOT NULL REFERENCES profiles(clerk_user_id) ON DELETE CASCADE,
  assessment_id       uuid REFERENCES assessments(id) ON DELETE SET NULL,
  resume_text         text,
  conversation        jsonb DEFAULT '[]',
  question_count      int DEFAULT 0,
  status              text DEFAULT 'in_progress'
                        CHECK (status IN ('in_progress', 'completed')),
  score               numeric(5,2),
  feedback            jsonb,
  started_at          timestamptz DEFAULT now(),
  completed_at        timestamptz
);

-- RLS
ALTER TABLE hr_interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hr_interviews_service_role_access" ON hr_interviews
  FOR ALL USING (true) WITH CHECK (true);

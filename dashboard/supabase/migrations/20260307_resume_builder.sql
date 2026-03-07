-- Resume Builder Sessions table
CREATE TABLE IF NOT EXISTS resume_builder_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  resume_data JSONB NOT NULL,
  ats_score JSONB,
  selected_template TEXT DEFAULT 'obsidian-gold',
  is_enhanced BOOLEAN DEFAULT FALSE,
  share_token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resume_sessions_user_id ON resume_builder_sessions(user_id);

ALTER TABLE resume_builder_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users own their sessions" ON resume_builder_sessions;
CREATE POLICY "Users own their sessions" ON resume_builder_sessions
  FOR ALL USING (true) WITH CHECK (true);

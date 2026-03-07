-- Resume API usage tracking (free plan rate limiting)
CREATE TABLE IF NOT EXISTS resume_api_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('parse', 'enhance', 'ats-score')),
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, action)
);

CREATE INDEX IF NOT EXISTS idx_resume_usage_user_id ON resume_api_usage(user_id);

ALTER TABLE resume_api_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access" ON resume_api_usage;
CREATE POLICY "Service role full access" ON resume_api_usage
  FOR ALL USING (true) WITH CHECK (true);

-- Cache table for JSearch API results
-- Avoids hitting the API on every page load (free tier: 200 req/month)
CREATE TABLE IF NOT EXISTS cached_jobs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key     text NOT NULL UNIQUE,   -- e.g. "qa automation engineer|us|month"
  jobs          jsonb NOT NULL DEFAULT '[]',
  fetched_at    timestamptz NOT NULL DEFAULT now(),
  expires_at    timestamptz NOT NULL DEFAULT now() + interval '6 hours'
);

CREATE INDEX IF NOT EXISTS cached_jobs_cache_key ON cached_jobs (cache_key);
CREATE INDEX IF NOT EXISTS cached_jobs_expires_at ON cached_jobs (expires_at);

-- Allow server-side access (uses service role key, no RLS needed)
ALTER TABLE cached_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON cached_jobs FOR ALL USING (true) WITH CHECK (true);

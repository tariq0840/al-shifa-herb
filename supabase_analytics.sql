-- Analytics tracking table
CREATE TABLE IF NOT EXISTS analytics (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  session_id TEXT,
  path TEXT,
  referrer TEXT,
  page_title TEXT,
  duration_ms INTEGER,
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_session ON analytics(session_id);

-- Allow anon to insert analytics
CREATE POLICY "anon can insert analytics"
ON public.analytics
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow anon to select analytics (for admin dashboard)
CREATE POLICY "anon can select analytics"
ON public.analytics
FOR SELECT
TO anon
USING (true);

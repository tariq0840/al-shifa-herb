-- Run this SQL in Supabase Dashboard > SQL Editor
-- to create the OTP table for phone verification.

CREATE TABLE IF NOT EXISTS otps (
  phone TEXT PRIMARY KEY,
  otp TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE otps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert_otps" ON otps FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_select_otps" ON otps FOR SELECT TO anon USING (true);
CREATE POLICY "anon_update_otps" ON otps FOR UPDATE TO anon USING (true);

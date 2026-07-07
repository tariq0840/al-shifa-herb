-- Run this SQL in Supabase Dashboard > SQL Editor
-- to create the OTP table for phone verification.

CREATE TABLE IF NOT EXISTS otps (
  phone TEXT PRIMARY KEY,
  otp TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow anonymous INSERT into otps
CREATE POLICY "anon_insert_otps" ON otps FOR INSERT TO anon WITH CHECK (true);

-- Allow anonymous SELECT of their own OTP
CREATE POLICY "anon_select_otps" ON otps FOR SELECT TO anon USING (true);

-- Allow anonymous UPDATE of their own OTP
CREATE POLICY "anon_update_otps" ON otps FOR UPDATE TO anon USING (true);

-- Create visitor_logs table for tracking website visits
-- Run this SQL in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS visitor_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address VARCHAR(45),
  user_agent TEXT,
  referrer TEXT,
  page_url VARCHAR(500) NOT NULL,
  country VARCHAR(100),
  city VARCHAR(100),
  device_type VARCHAR(20),
  browser VARCHAR(50),
  os VARCHAR(50),
  session_id VARCHAR(100),
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_visitor_logs_visited_at ON visitor_logs(visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_page_url ON visitor_logs(page_url);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_session_id ON visitor_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_ip_address ON visitor_logs(ip_address);

-- Enable Row Level Security (RLS)
ALTER TABLE visitor_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public to insert (for logging visits)
CREATE POLICY "Allow public insert" ON visitor_logs
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Allow authenticated users to select (for admin viewing)
CREATE POLICY "Allow authenticated select" ON visitor_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow anon to insert (for anonymous visitors)
CREATE POLICY "Allow anon insert" ON visitor_logs
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Allow anon to select (for API calls)
CREATE POLICY "Allow anon select" ON visitor_logs
  FOR SELECT
  TO anon
  USING (true);

-- Comment on table
COMMENT ON TABLE visitor_logs IS 'Stores visitor access logs for analytics';

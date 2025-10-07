-- IPN Configuration Table
CREATE TABLE IF NOT EXISTS ipn_config (
  id SERIAL PRIMARY KEY,
  webhook_url TEXT NOT NULL,
  webhook_secret TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  retry_attempts INTEGER DEFAULT 3,
  retry_delay_seconds INTEGER DEFAULT 60,
  timeout_seconds INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- IPN Logs Table
CREATE TABLE IF NOT EXISTS ipn_logs (
  id SERIAL PRIMARY KEY,
  transaction_ref TEXT NOT NULL,
  payment_id INTEGER REFERENCES payments(id),
  request_payload JSONB NOT NULL,
  response_payload JSONB,
  signature TEXT,
  signature_valid BOOLEAN,
  status TEXT NOT NULL CHECK (status IN ('received', 'processing', 'success', 'failed', 'retry')),
  error_message TEXT,
  response_time_ms INTEGER,
  retry_count INTEGER DEFAULT 0,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- IPN Statistics Table
CREATE TABLE IF NOT EXISTS ipn_statistics (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_received INTEGER DEFAULT 0,
  total_success INTEGER DEFAULT 0,
  total_failed INTEGER DEFAULT 0,
  total_retries INTEGER DEFAULT 0,
  avg_response_time_ms NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- IPN Test Logs Table
CREATE TABLE IF NOT EXISTS ipn_test_logs (
  id SERIAL PRIMARY KEY,
  test_type TEXT NOT NULL,
  test_payload JSONB NOT NULL,
  expected_result TEXT,
  actual_result TEXT,
  passed BOOLEAN,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ipn_logs_transaction_ref ON ipn_logs(transaction_ref);
CREATE INDEX IF NOT EXISTS idx_ipn_logs_status ON ipn_logs(status);
CREATE INDEX IF NOT EXISTS idx_ipn_logs_created_at ON ipn_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ipn_logs_payment_id ON ipn_logs(payment_id);
CREATE INDEX IF NOT EXISTS idx_ipn_statistics_date ON ipn_statistics(date DESC);

-- Function to update statistics
CREATE OR REPLACE FUNCTION update_ipn_statistics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO ipn_statistics (date, total_received, total_success, total_failed, total_retries, avg_response_time_ms)
  VALUES (
    CURRENT_DATE,
    1,
    CASE WHEN NEW.status = 'success' THEN 1 ELSE 0 END,
    CASE WHEN NEW.status = 'failed' THEN 1 ELSE 0 END,
    NEW.retry_count,
    NEW.response_time_ms
  )
  ON CONFLICT (date) DO UPDATE SET
    total_received = ipn_statistics.total_received + 1,
    total_success = ipn_statistics.total_success + CASE WHEN NEW.status = 'success' THEN 1 ELSE 0 END,
    total_failed = ipn_statistics.total_failed + CASE WHEN NEW.status = 'failed' THEN 1 ELSE 0 END,
    total_retries = ipn_statistics.total_retries + NEW.retry_count,
    avg_response_time_ms = (
      (ipn_statistics.avg_response_time_ms * ipn_statistics.total_received + COALESCE(NEW.response_time_ms, 0)) / 
      (ipn_statistics.total_received + 1)
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for statistics
DROP TRIGGER IF EXISTS trigger_update_ipn_statistics ON ipn_logs;
CREATE TRIGGER trigger_update_ipn_statistics
  AFTER INSERT ON ipn_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_ipn_statistics();

-- Insert default configuration
INSERT INTO ipn_config (webhook_url, webhook_secret, is_active)
VALUES (
  'unhonoured-carisa-pseudodiphtheric.ngrok-free.dev',
  'your-webhook-secret-key-change-this',
  true
)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE ipn_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipn_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipn_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipn_test_logs ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now, adjust based on your auth setup)
CREATE POLICY "Allow all operations on ipn_config" ON ipn_config FOR ALL USING (true);
CREATE POLICY "Allow all operations on ipn_logs" ON ipn_logs FOR ALL USING (true);
CREATE POLICY "Allow all operations on ipn_statistics" ON ipn_statistics FOR ALL USING (true);
CREATE POLICY "Allow all operations on ipn_test_logs" ON ipn_test_logs FOR ALL USING (true);

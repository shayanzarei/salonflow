CREATE TABLE IF NOT EXISTS demo_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  focus_area TEXT NOT NULL,
  duration_mins INTEGER NOT NULL DEFAULT 30,
  scheduled_for TIMESTAMPTZ NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  work_email TEXT NOT NULL,
  company_role TEXT,
  goals TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS demo_bookings_scheduled_for_idx
  ON demo_bookings (scheduled_for);

CREATE INDEX IF NOT EXISTS demo_bookings_status_idx
  ON demo_bookings (status);


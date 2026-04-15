ALTER TABLE demo_bookings
  ADD COLUMN IF NOT EXISTS current_tools TEXT,
  ADD COLUMN IF NOT EXISTS biggest_challenge TEXT;


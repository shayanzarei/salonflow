-- Track when a booking was manually finalized (completed / no_show) by the owner.
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS finalized_at TIMESTAMPTZ;

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import pool from "@/lib/db";
import { redirect } from "next/navigation";
import StaffCalendarGrid from "@/components/staff/StaffCalendarGrid";

export default async function StaffCalendarPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const staffId = (session as { staffId?: string }).staffId;
  if (!staffId) redirect("/dashboard");

  const [staffResult, bookingsResult] = await Promise.all([
    pool.query(
      `SELECT s.*, t.primary_color, t.name AS salon_name
       FROM staff s
       JOIN tenants t ON s.tenant_id = t.id
       WHERE s.id = $1`,
      [staffId]
    ),
    pool.query(
      `SELECT
         b.id,
         b.client_name,
         b.client_email,
         b.booked_at,
         b.status,
         s.name AS service_name,
         s.duration_mins,
         s.price,
         st.name AS staff_name,
         st.id AS staff_id
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       JOIN staff st ON b.staff_id = st.id
       WHERE b.staff_id = $1
         AND b.booked_at >= NOW() - INTERVAL '7 days'
         AND b.booked_at <= NOW() + INTERVAL '60 days'
         AND b.status IN ('confirmed', 'pending')
       ORDER BY b.booked_at ASC`,
      [staffId]
    ),
  ]);

  const staffMember = staffResult.rows[0];
  if (!staffMember) redirect("/login");

  const bookings = bookingsResult.rows;
  const brand = staffMember.primary_color ?? "#7C3AED";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <p className="text-gray-500 mt-1">Your upcoming appointments for the next 60 days</p>
      </div>

      <StaffCalendarGrid bookings={bookings} brandColor={brand} />
    </div>
  );
}

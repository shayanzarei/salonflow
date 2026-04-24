import pool from "@/lib/db";
import { sendEmail } from "@/lib/emails/send";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const booking_id = formData.get("booking_id") as string;
    const tenant_id = formData.get("tenant_id") as string;
    const status = formData.get("status") as string;
    const redirect = formData.get("redirect") as string;

    await pool.query(
      `UPDATE bookings SET status = $1 WHERE id = $2 AND tenant_id = $3`,
      [status, booking_id, tenant_id]
    );

    if (status === "cancelled") {
      const detailsResult = await pool.query(
        `SELECT
           b.client_name,
           b.client_email,
           b.client_phone,
           b.booked_at,
           s.name AS service_name,
           st.name AS staff_name,
           st.email AS staff_email,
           t.name AS salon_name,
           t.owner_email
         FROM bookings b
         JOIN services s ON s.id = b.service_id
         JOIN staff st ON st.id = b.staff_id
         JOIN tenants t ON t.id = b.tenant_id
         WHERE b.id = $1 AND b.tenant_id = $2`,
        [booking_id, tenant_id]
      );
      const details = detailsResult.rows[0];
      if (details?.client_email) {
        void sendEmail({
          to: details.client_email,
          subject: `Appointment cancelled — ${details.service_name} at ${details.salon_name}`,
          html: `<p>Hi ${details.client_name}, your appointment for ${details.service_name} has been cancelled.</p>`,
        }).catch((error) =>
          console.error("[update-status] client cancellation email failed", error)
        );
      }
      const appointmentAt = new Date(details.booked_at).toLocaleString("nl-NL", {
        timeZone: "Europe/Amsterdam",
        dateStyle: "full",
        timeStyle: "short",
      });
      const internalSubject = `Appointment cancelled: ${details.service_name} — ${appointmentAt}`;
      const internalHtml = `
        <p>${details.client_name} cancelled their appointment.</p>
        <ul>
          <li><strong>Service:</strong> ${details.service_name}</li>
          <li><strong>Staff:</strong> ${details.staff_name}</li>
          <li><strong>When:</strong> ${appointmentAt}</li>
          <li><strong>Client email:</strong> ${details.client_email}</li>
          ${details.client_phone ? `<li><strong>Client phone:</strong> ${details.client_phone}</li>` : ""}
        </ul>
      `;
      if (details.owner_email) {
        void sendEmail({
          to: details.owner_email,
          subject: internalSubject,
          html: internalHtml,
        }).catch((error) =>
          console.error("[update-status] owner cancellation email failed", error)
        );
      }
      if (
        details.staff_email &&
        details.staff_email.toLowerCase() !== details.owner_email?.toLowerCase()
      ) {
        void sendEmail({
          to: details.staff_email,
          subject: internalSubject,
          html: internalHtml,
        }).catch((error) =>
          console.error("[update-status] staff cancellation email failed", error)
        );
      }
    }

    return NextResponse.redirect(new URL(redirect || "/bookings", req.url));
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

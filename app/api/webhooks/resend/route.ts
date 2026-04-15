import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

function parseFromAddress(from: string) {
  const match = from.match(/<([^>]+)>/);
  return (match?.[1] ?? from).trim().toLowerCase();
}

export async function POST(req: NextRequest) {
  try {
    const event = await req.json();

    if (event?.type !== "email.received") {
      return NextResponse.json({ ok: true });
    }

    const data = event.data ?? {};
    const from = String(data.from ?? "");
    const email = parseFromAddress(from);
    const subject = String(data.subject ?? "");
    const to = Array.isArray(data.to) ? data.to : [];
    const emailId = String(data.email_id ?? "");

    await pool.query(
      `INSERT INTO contact_messages (
        source, email, subject, status, resend_email_id, to_emails, raw_event
      )
      VALUES ('resend_inbound', $1, $2, 'new', $3, $4::jsonb, $5::jsonb)`,
      [email || null, subject || null, emailId || null, JSON.stringify(to), JSON.stringify(event)]
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error handling Resend webhook", error);
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
  }
}


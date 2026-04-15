import pool from "@/lib/db";
import {
  contactReceivedAdminEmail,
  contactReceivedUserEmail,
} from "@/lib/emails/templates";
import { sendEmail } from "@/lib/emails/send";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_TOPICS = new Set(["sales", "support", "billing", "other"]);

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      firstName?: string;
      lastName?: string;
      workEmail?: string;
      topic?: string;
      message?: string;
    };

    const firstName = body.firstName?.trim() ?? "";
    const lastName = body.lastName?.trim() ?? "";
    const workEmail = body.workEmail?.trim().toLowerCase() ?? "";
    const topic = body.topic?.trim().toLowerCase() ?? "";
    const message = body.message?.trim() ?? "";

    if (!firstName || !lastName || !workEmail || !topic || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!ALLOWED_TOPICS.has(topic)) {
      return NextResponse.json({ error: "Invalid topic" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(workEmail)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const insertResult = await pool.query(
      `INSERT INTO contact_messages (
        source, first_name, last_name, email, topic, message, status
      )
      VALUES ('contact_form', $1, $2, $3, $4, $5, 'new')
      RETURNING id`,
      [firstName, lastName, workEmail, topic, message]
    );

    const supportInbox =
      process.env.CONTACT_INBOX_EMAIL ?? process.env.RESEND_FROM_EMAIL ?? "hello@solohub.nl";

    const userEmail = contactReceivedUserEmail({
      firstName,
      topic,
      message,
    });
    const adminEmail = contactReceivedAdminEmail({
      firstName,
      lastName,
      email: workEmail,
      topic,
      message,
    });

    await Promise.all([
      sendEmail({
        to: workEmail,
        subject: userEmail.subject,
        html: userEmail.html,
        from: "SoloHub <hello@solohub.nl>",
      }),
      sendEmail({
        to: supportInbox,
        subject: adminEmail.subject,
        html: adminEmail.html,
        from: "SoloHub <hello@solohub.nl>",
      }),
    ]);

    return NextResponse.json({ ok: true, id: insertResult.rows[0].id });
  } catch (error) {
    console.error("Error handling contact submission", error);
    return NextResponse.json({ error: "Failed to submit contact form" }, { status: 500 });
  }
}


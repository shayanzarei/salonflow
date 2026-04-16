import pool from "@/lib/db";
import { contactReceivedUserEmail } from "@/lib/emails/contact-received-user";
import { sendEmail } from "@/lib/emails/send";
import { sendWhatsAppNotification } from "@/lib/notify/whatsapp";
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

    const userEmail = contactReceivedUserEmail({
      firstName,
      topic,
      message,
    });

    const TOPIC_LABELS: Record<string, string> = {
      sales: "Sales",
      support: "Support",
      billing: "Billing",
      other: "Other",
    };

    await Promise.all([
      sendEmail({
        to: workEmail,
        subject: userEmail.subject,
        html: userEmail.html,
        from: "SoloHub <hello@solohub.nl>",
      }),
      sendWhatsAppNotification(
        `📬 New contact on SoloHub\n\n` +
        `👤 ${firstName} ${lastName}\n` +
        `📧 ${workEmail}\n` +
        `🏷️ ${TOPIC_LABELS[topic] ?? topic}\n\n` +
        `💬 ${message.slice(0, 300)}${message.length > 300 ? "…" : ""}`
      ),
    ]);

    return NextResponse.json({ ok: true, id: insertResult.rows[0].id });
  } catch (error) {
    console.error("Error handling contact submission", error);
    return NextResponse.json({ error: "Failed to submit contact form" }, { status: 500 });
  }
}


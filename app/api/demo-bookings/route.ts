import pool from "@/lib/db";
import { generateDemoMeetingLink } from "@/lib/demo-meeting-links";
import { demoBookingConfirmationEmail } from "@/lib/emails/templates/demo-booking-confirmation";
import { sendEmail } from "@/lib/emails/send";
import { NextRequest, NextResponse } from "next/server";

const SLOT_OPTIONS = [
  { value: "09:00", label: "9:00 AM" },
  { value: "09:30", label: "9:30 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "11:30", label: "11:30 AM" },
  { value: "13:00", label: "1:00 PM" },
  { value: "14:30", label: "2:30 PM" },
  { value: "16:00", label: "4:00 PM" },
] as const;
const DEMO_TIMEZONE = "Europe/Amsterdam";

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidTime(value: string) {
  return /^\d{2}:\d{2}$/.test(value);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  if (!date || !isValidDate(date)) {
    return NextResponse.json({ error: "date (YYYY-MM-DD) is required" }, { status: 400 });
  }

  const reservedResult = await pool.query(
    `SELECT to_char(scheduled_for AT TIME ZONE '${DEMO_TIMEZONE}', 'HH24:MI') AS slot
     FROM demo_bookings
     WHERE status IN ('scheduled', 'confirmed')
       AND (scheduled_for AT TIME ZONE '${DEMO_TIMEZONE}')::date = $1::date`,
    [date]
  );

  const reserved = new Set<string>(reservedResult.rows.map((row) => row.slot as string));
  const slots = SLOT_OPTIONS.map((slot) => ({
    value: slot.value,
    label: slot.label,
    isAvailable: !reserved.has(slot.value),
  }));

  return NextResponse.json({ date, slots });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      focusArea,
      scheduledDate,
      scheduledTime,
      firstName,
      lastName,
      workEmail,
      companyRole,
      goals,
    } = body as {
      focusArea?: string;
      scheduledDate?: string;
      scheduledTime?: string;
      firstName?: string;
      lastName?: string;
      workEmail?: string;
      companyRole?: string;
      goals?: string;
    };

    if (!focusArea || !scheduledDate || !scheduledTime || !firstName || !lastName || !workEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!isValidDate(scheduledDate) || !isValidTime(scheduledTime)) {
      return NextResponse.json({ error: "Invalid date or time format" }, { status: 400 });
    }
    if (!SLOT_OPTIONS.some((slot) => slot.value === scheduledTime)) {
      return NextResponse.json({ error: "Selected time is not offered" }, { status: 400 });
    }

    const conflictResult = await pool.query(
      `SELECT id
       FROM demo_bookings
       WHERE status IN ('scheduled', 'confirmed')
         AND scheduled_for = (($1::date + $2::time) AT TIME ZONE '${DEMO_TIMEZONE}')
       LIMIT 1`,
      [scheduledDate, scheduledTime]
    );

    if (conflictResult.rows.length > 0) {
      return NextResponse.json(
        { error: "This slot is no longer available. Please pick another time." },
        { status: 409 }
      );
    }

    const insertResult = await pool.query(
      `INSERT INTO demo_bookings (
        focus_area,
        duration_mins,
        scheduled_for,
        meeting_link,
        first_name,
        last_name,
        work_email,
        company_role,
        goals,
        status
      )
      VALUES (
        $1,
        CASE WHEN $1 = 'billing_invoicing' THEN 15 ELSE 30 END,
        (($2::date + $3::time) AT TIME ZONE '${DEMO_TIMEZONE}'),
        $4, $5, $6, $7, $8, $9, 'scheduled'
      )
      RETURNING id, scheduled_for, meeting_link, duration_mins`,
      [
        focusArea,
        scheduledDate,
        scheduledTime,
        generateDemoMeetingLink(),
        firstName.trim(),
        lastName.trim(),
        workEmail.trim().toLowerCase(),
        companyRole?.trim() ?? null,
        goals?.trim() ?? null,
      ]
    );

    const booking = insertResult.rows[0] as {
      id: string;
      scheduled_for: string;
      meeting_link: string;
      duration_mins: number;
    };

    const { subject, html } = demoBookingConfirmationEmail({
      firstName: firstName.trim(),
      focusArea,
      scheduledFor: new Date(booking.scheduled_for),
      meetingLink: booking.meeting_link,
      durationMins: booking.duration_mins,
    });

    await sendEmail({
      to: workEmail.trim().toLowerCase(),
      subject,
      html,
      from: "SoloHub <bookings@solohub.nl>",
    });

    return NextResponse.json({ id: booking.id }, { status: 201 });
  } catch (error) {
    console.error("Error creating demo booking", error);
    return NextResponse.json({ error: "Failed to create demo booking" }, { status: 500 });
  }
}


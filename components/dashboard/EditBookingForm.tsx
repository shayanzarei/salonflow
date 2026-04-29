"use client";

import { Button } from "@/components/ds/Button";
import { Card } from "@/components/ds/Card";
import { Select } from "@/components/ds/Select";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

/**
 * EditBookingForm
 * ─────────────────────────────────────────────────────────────────────────────
 * Drop-in replacement for the inline server-rendered <form> on
 * `app/(dashboard)/bookings/[id]/page.tsx`.
 *
 * Why this is a client component
 *   The previous form used `<input type="time">` and seeded its default with
 *   `new Date(booking.booked_at).toTimeString().slice(0, 5)`. That call uses
 *   the *server's* local zone (Vercel = UTC), so a 14:00 CEST booking was
 *   showing as "12:00" in the input — and was being saved back as 12:00,
 *   silently corrupting the booking. There is no zone-safe way to seed a
 *   native time input without doing the work on the client.
 *
 *   Switching to a <Select> backed by /api/bookings/availability gives us:
 *     • A single source of truth for valid slots (matches AddBookingForm).
 *     • A consistent UX with "Add Booking" — the user complaint that
 *       prompted this change.
 *     • A salon-local 24h `wallClockTime` value posted as `time`, which
 *       /api/bookings/update converts via wallClockToUtc(date, time, tenantZone).
 *
 * The currently-booked slot is pre-selected. When the user picks a new
 * service/staff/date the slot list re-fetches and the time clears — same as
 * AddBookingForm — to prevent submitting a stale or now-conflicting time.
 */

interface AvailabilitySlot {
  isoTime: string;
  wallClockTime: string;
  label: string;
  available: boolean;
}

interface Service {
  id: string;
  name: string;
  duration_mins: number;
}

interface Staff {
  id: string;
  name: string;
}

export default function EditBookingForm({
  bookingId,
  tenantId,
  services,
  staffList,
  initialServiceId,
  initialStaffId,
  initialDate,
  initialTime,
  initialStatus,
  brand,
}: {
  bookingId: string;
  tenantId: string;
  services: Service[];
  staffList: Staff[];
  initialServiceId: string;
  initialStaffId: string;
  /** YYYY-MM-DD in the salon's local calendar. */
  initialDate: string;
  /** HH:MM (24h) in the salon's local clock. */
  initialTime: string;
  initialStatus: string;
  brand: string;
}) {
  const router = useRouter();

  const [serviceId, setServiceId] = useState(initialServiceId);
  const [staffId, setStaffId] = useState(initialStaffId);
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [status, setStatus] = useState(initialStatus);

  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const canLoadAvailability = Boolean(serviceId && staffId && date);
  const todayDate = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Detect whether the inputs still match the row we loaded. While they do,
  // keep the original `time` selected even if it isn't in `availableSlots`
  // (e.g. it falls outside the staff's current working hours, or it's the
  // "past" — we still want to let the owner save other fields).
  const inputsMatchInitial =
    serviceId === initialServiceId &&
    staffId === initialStaffId &&
    date === initialDate;

  useEffect(() => {
    let active = true;
    async function loadAvailability() {
      if (!canLoadAvailability) {
        setAvailableSlots([]);
        setAvailabilityError("");
        return;
      }

      setAvailabilityLoading(true);
      setAvailabilityError("");
      try {
        const res = await fetch(
          `/api/bookings/availability?serviceId=${serviceId}&staffId=${staffId}&date=${date}`,
          { cache: "no-store" }
        );
        if (!res.ok) {
          const payload = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(payload.error ?? "Failed to load availability.");
        }
        const payload = (await res.json()) as { slots: AvailabilitySlot[] };
        if (!active) return;
        const openSlots = payload.slots.filter((slot) => slot.available);
        setAvailableSlots(openSlots);

        // If the inputs were changed (different staff/service/date) and the
        // currently-selected time isn't a valid slot any more, clear it so the
        // user has to actively pick a new one.
        if (!inputsMatchInitial && !openSlots.some((s) => s.wallClockTime === time)) {
          setTime("");
        }
      } catch (error) {
        if (!active) return;
        setAvailableSlots([]);
        setAvailabilityError(
          error instanceof Error ? error.message : "Failed to load availability."
        );
      } finally {
        if (active) {
          setAvailabilityLoading(false);
        }
      }
    }

    void loadAvailability();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canLoadAvailability, date, serviceId, staffId]);

  // Build the list of options. If we're still on the original row and the
  // initial time isn't in the freshly-fetched slots (booked-itself excluded
  // from "available"), surface it as a disabled-but-selected fallback so the
  // dropdown doesn't appear empty.
  const renderableSlots = useMemo(() => {
    const slots = [...availableSlots];
    if (
      inputsMatchInitial &&
      initialTime &&
      !slots.some((s) => s.wallClockTime === initialTime)
    ) {
      slots.unshift({
        // We don't have a real isoTime for the original here — the server-side
        // booked_at is the source of truth, and we only need this entry to
        // render. The submit path uses the salon-local wallClockTime anyway.
        isoTime: `__current__:${initialTime}`,
        wallClockTime: initialTime,
        label: `${initialTime} (current)`,
        available: true,
      });
    }
    return slots;
  }, [availableSlots, inputsMatchInitial, initialTime]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError("");

    if (!serviceId || !staffId || !date || !time) {
      setSubmitError("Please fill in service, staff, date, and time.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("booking_id", bookingId);
      formData.append("tenant_id", tenantId);
      formData.append("service_id", serviceId);
      formData.append("staff_id", staffId);
      formData.append("date", date);
      formData.append("time", time);
      formData.append("status", status);

      const res = await fetch("/api/bookings/update", {
        method: "POST",
        body: formData,
        // Keep this consistent with AddBookingForm — server returns a redirect
        // we'll handle ourselves rather than letting the browser follow it.
        redirect: "manual",
      });

      // Status 0 (opaqueredirect) is the success path because we passed
      // redirect: "manual"; any other 4xx/5xx surfaces a JSON error.
      if (res.status !== 0 && !res.ok) {
        const payload = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(payload.error ?? "Failed to update booking.");
      }

      // Force a fresh server render so the detail page reflects the new time.
      router.refresh();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to update booking."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card variant="outlined">
      <div className="mb-5 flex items-center gap-2">
        <span className="text-base">✏️</span>
        <h2 className="text-body font-semibold text-ink-900">Edit Booking</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Select
          id="booking-edit-service"
          label="Service"
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
        >
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>

        <Select
          id="booking-edit-staff"
          label="Staff"
          value={staffId}
          onChange={(e) => setStaffId(e.target.value)}
        >
          {staffList.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="booking-edit-date"
              className="mb-2 block text-caption font-semibold uppercase tracking-wider text-ink-400"
            >
              Date
            </label>
            <input
              id="booking-edit-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={todayDate}
              className="min-h-10 w-full rounded-sm border border-ink-200 bg-ink-0 px-4 py-2.5 text-body-sm text-ink-900 outline-none hover:border-ink-300 focus-visible:border-brand-600 focus-visible:shadow-focus"
            />
          </div>
          <div>
            <Select
              id="booking-edit-time"
              label="Time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              disabled={
                !canLoadAvailability ||
                availabilityLoading ||
                renderableSlots.length === 0
              }
            >
              <option value="">
                {availabilityLoading
                  ? "Loading availability..."
                  : "Select available time..."}
              </option>
              {/*
                value MUST be the salon-local 24h wall clock. The server
                converts via wallClockToUtc(date, time, tenantZone).
              */}
              {renderableSlots.map((slot) => (
                <option key={slot.isoTime} value={slot.wallClockTime}>
                  {slot.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {availabilityError ? (
          <p className="text-caption text-danger-600">{availabilityError}</p>
        ) : null}
        {!availabilityLoading &&
        canLoadAvailability &&
        !availabilityError &&
        renderableSlots.length === 0 ? (
          <p className="text-caption text-warning-700">
            No available times for this staff on the selected date.
          </p>
        ) : null}

        <Select
          id="booking-edit-status"
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="confirmed">● Confirmed</option>
          <option value="pending">● Pending</option>
          <option value="cancelled">● Cancelled</option>
        </Select>

        {submitError ? (
          <p className="text-caption text-danger-600">{submitError}</p>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="mt-1 w-full"
          style={{ backgroundColor: brand }}
          disabled={submitting}
        >
          {submitting ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Card>
  );
}

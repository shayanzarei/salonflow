"use client";

import { Button } from "@/components/ds/Button";
import { Input } from "@/components/ds/Input";
import { PHONE_INPUT_PATTERN } from "@/lib/phone";
import { useState, type FormEvent } from "react";

/**
 * Client island for the customer-details form on /book/confirm.
 *
 * Why this exists at all: previously the page used a native
 * `<form action="/api/bookings" method="POST">`. On the happy path the API
 * 302s to /book/success and the browser follows the redirect — fine. On any
 * 4xx/5xx the API returns `{"error": "..."}` JSON, the browser navigates to
 * that response, and the customer sees raw JSON in the address bar with no
 * way to retry. The most common failure (lost-the-race conflict, returned as
 * 409) is exactly the case where surfacing a clear error is most important —
 * the customer's existing time-slot selection is now invalid and they need to
 * be told before they re-pick.
 *
 * What this client component does:
 *  1. Submits via fetch with `redirect: "manual"`. The browser does NOT auto-
 *     follow the 302; we detect it by `response.type === "opaqueredirect"`
 *     (or a 0 status, depending on browser) and navigate via window.location.
 *  2. On any non-redirect response, parse the error body and render an inline
 *     red banner at the top of the form. Re-enables the submit button so the
 *     customer can edit + retry without losing their inputs.
 *  3. While the request is in flight: disable the button, swap its label, and
 *     prevent double-submit at the form level (`isSubmitting` short-circuits
 *     the handler).
 *
 * The fields and styling mirror the previous server-rendered form 1:1. We
 * keep the hidden inputs the API expects (`tenant_id`, `service_id`, etc.)
 * rather than building a JSON payload, because the API already accepts
 * `formData` and there's no reason to fork the contract.
 */

type Props = {
  tenantId: string;
  serviceId: string;
  staffId: string;
  bookedAt: string; // UTC ISO with explicit zone — passed through from the URL
  brand: string;
  labels: {
    fullName: string;
    placeholderName: string;
    emailAddress: string;
    placeholderEmail: string;
    phoneNumber: string;
    phoneOptional: string;
    placeholderPhone: string;
    confirmPolicyNotice: string;
    confirmBookingCta: string;
    submittingCta: string;
    genericError: string;
    phoneTitle: string;
  };
};

export default function BookingConfirmForm({
  tenantId,
  serviceId,
  staffId,
  bookedAt,
  brand,
  labels,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        body: formData,
        // Don't auto-follow the API's 302 — we want to know the redirect
        // happened so we can navigate to it ourselves with a clean URL.
        redirect: "manual",
      });

      // `redirect: "manual"` produces an opaque-redirect response on success.
      // Different browsers expose it slightly differently:
      //   - Chrome/Edge: res.type === "opaqueredirect", status === 0
      //   - Safari/Firefox: same shape
      // The Location header is intentionally hidden by the spec, so we can't
      // read it. The API's success URL is deterministic (/book/success?
      // booking=<id>) but we don't have the id client-side. So we fall back
      // to a redirect to /book/success WITHOUT the booking id query param —
      // the success page already handles a missing id gracefully (renders a
      // generic "you're booked" view).
      if (res.type === "opaqueredirect" || res.status === 0) {
        window.location.assign("/book/success");
        return;
      }

      // Non-redirect response → an error. Try to extract the API's message.
      let apiMessage: string | null = null;
      try {
        const body = (await res.json()) as { error?: string };
        if (body && typeof body.error === "string") {
          apiMessage = body.error;
        }
      } catch {
        // Body wasn't JSON (or empty) — fall through to the generic error.
      }

      setErrorMessage(apiMessage ?? labels.genericError);
      setIsSubmitting(false);
    } catch {
      // Network failure, request aborted, etc.
      setErrorMessage(labels.genericError);
      setIsSubmitting(false);
    }
  }

  return (
    <form
      action="/api/bookings"
      method="POST"
      onSubmit={handleSubmit}
      noValidate={false}
      className="flex flex-col gap-5"
    >
      <input type="hidden" name="tenant_id" value={tenantId} />
      <input type="hidden" name="service_id" value={serviceId} />
      <input type="hidden" name="staff_id" value={staffId} />
      <input type="hidden" name="booked_at" value={bookedAt} />

      {errorMessage ? (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700"
        >
          {errorMessage}
        </div>
      ) : null}

      <Input
        id="confirm-client-name"
        name="client_name"
        type="text"
        required
        label={labels.fullName}
        placeholder={labels.placeholderName}
        disabled={isSubmitting}
      />

      <Input
        id="confirm-client-email"
        name="client_email"
        type="email"
        required
        label={labels.emailAddress}
        placeholder={labels.placeholderEmail}
        disabled={isSubmitting}
      />

      <Input
        id="confirm-client-phone"
        name="client_phone"
        type="tel"
        pattern={PHONE_INPUT_PATTERN}
        title={labels.phoneTitle}
        label={labels.phoneNumber}
        optionalLabel={labels.phoneOptional}
        placeholder={labels.placeholderPhone}
        disabled={isSubmitting}
      />

      {/* Cancellation policy */}
      <div className="rounded-xl bg-ink-50 px-4 py-3.5">
        <p className="m-0 text-xs leading-relaxed text-ink-500">
          {labels.confirmPolicyNotice}
        </p>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="mt-1 w-full rounded-full"
        style={{ backgroundColor: brand }}
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? labels.submittingCta : labels.confirmBookingCta}
      </Button>
    </form>
  );
}

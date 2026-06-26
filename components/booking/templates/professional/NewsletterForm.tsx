"use client";

import { useState } from "react";

/**
 * Newsletter sign-up block. Labels arrive pre-resolved for the active locale.
 *
 * NOTE: there is no newsletter backend yet — submission is validated and
 * acknowledged client-side only. Wiring this to an email provider (or a
 * `newsletter_subscribers` table) is a deliberate follow-up; the design calls
 * for the block, so it's rendered and functional from the visitor's side.
 */
export function NewsletterForm({
  placeholder,
  buttonLabel,
  successMessage,
}: {
  placeholder: string;
  buttonLabel: string;
  successMessage: string;
}) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setDone(true);
  }

  if (done) {
    return (
      <p className="text-[15px] tracking-wide text-[var(--pro-ink)]">{successMessage}</p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="min-h-[48px] flex-1 border-b border-[var(--pro-taupe)] bg-transparent px-1 py-3 text-[15px] text-[var(--pro-ink)] placeholder:text-[var(--pro-muted)] focus:border-[var(--pro-gold)] focus:outline-none"
      />
      <button
        type="submit"
        className="min-h-[48px] shrink-0 px-8 text-[11px] uppercase tracking-[0.16em] text-white transition-opacity hover:opacity-90"
        style={{ background: "var(--pro-taupe)" }}
      >
        {buttonLabel}
      </button>
    </form>
  );
}

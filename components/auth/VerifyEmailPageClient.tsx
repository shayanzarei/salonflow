"use client";

import { Button } from "@/components/ds/Button";
import { Input } from "@/components/ds/Input";
import type { AuthFlowSection } from "@/lib/i18n/catalog/auth-flow";
import { useLocale } from "@/lib/i18n/context";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";

function VerifyEmailContent() {
  const { t } = useLocale();
  const f = t.authFlow;
  const params = useSearchParams();
  const verified = params.get("verified") === "1";
  const errorCode = params.get("error");
  const emailParam = params.get("email") ?? "";

  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState(emailParam);
  const [resendState, setResendState] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [resendError, setResendError] = useState("");

  const trialPerks = useMemo(
    () => [
      { icon: "🌐", label: f.verifyPerk1Label, sub: f.verifyPerk1Sub },
      { icon: "📅", label: f.verifyPerk2Label, sub: f.verifyPerk2Sub },
      { icon: "💳", label: f.verifyPerk3Label, sub: f.verifyPerk3Sub },
    ],
    [f]
  );

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    if (!resendEmail.trim()) return;
    setResendState("sending");
    setResendError("");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        setResendError(json.error ?? f.verifyResendErrorGeneric);
        setResendState("error");
      } else {
        setResendState("sent");
      }
    } catch {
      setResendError(f.verifyResendErrorUnknown);
      setResendState("error");
    }
  }

  if (verified) {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-3xl border border-ink-100 bg-white/90 p-8 text-center shadow-[0_25px_80px_-35px_rgba(15,23,42,0.25)] backdrop-blur-sm">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full text-4xl">
            ✅
          </div>
          <h1 className="mb-2 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
            {f.verifyAllSetTitle}
          </h1>
          <p className="mb-8 text-sm leading-relaxed text-ink-500">
            {f.verifyAllSetBody}
          </p>
          <Button asChild variant="accent" size="lg" className="w-full">
            <Link href="/login">{f.verifyGoWorkspace}</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (errorCode) {
    const errorMessages: Record<string, { title: string; body: string }> = {
      expired: { title: f.verifyErrExpiredTitle, body: f.verifyErrExpiredBody },
      already_used: {
        title: f.verifyErrAlreadyUsedTitle,
        body: f.verifyErrAlreadyUsedBody,
      },
      invalid_token: {
        title: f.verifyErrInvalidTokenTitle,
        body: f.verifyErrInvalidTokenBody,
      },
      missing_token: {
        title: f.verifyErrMissingTokenTitle,
        body: f.verifyErrMissingTokenBody,
      },
      server_error: {
        title: f.verifyErrServerTitle,
        body: f.verifyErrServerBody,
      },
    };
    const msg = errorMessages[errorCode] ?? {
      title: f.verifyErrDefaultTitle,
      body: f.verifyErrDefaultBody,
    };

    return (
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-3xl border border-ink-100 bg-white/90 p-8 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.25)] backdrop-blur-sm">
          <h1 className="mb-2 text-2xl font-bold text-ink-900">
            {msg.title}
          </h1>
          <p className="mb-7 text-sm leading-relaxed text-ink-500">
            {msg.body}
          </p>
          <ResendForm
            authFlow={f}
            email={resendEmail}
            setEmail={setResendEmail}
            state={resendState}
            error={resendError}
            onSubmit={handleResend}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <div className="rounded-3xl border border-ink-100 bg-white/90 p-8 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.25)] backdrop-blur-sm">
        <h1 className="mb-2 text-center text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
          {f.verifyCheckInbox}
        </h1>
        <p className="my-5 truncate rounded-xl border border-ink-200 bg-ink-50 px-4 py-3 text-center text-sm font-semibold text-ink-700">
          {emailParam || f.verifyYourEmailFallback}
        </p>
        <p className="mb-6 text-center text-sm leading-relaxed text-ink-500">
          {f.verifyInboxBody}
        </p>
        {resendState === "sent" ? (
          <div className="rounded-xl border border-success-50 bg-success-50 px-4 py-3 text-center text-sm font-semibold text-success-700">
            {f.verifyResendSent}
          </div>
        ) : showResend ? (
          <ResendForm
            authFlow={f}
            email={resendEmail}
            setEmail={setResendEmail}
            state={resendState}
            error={resendError}
            onSubmit={handleResend}
          />
        ) : (
          <p className="text-center text-sm text-ink-400">
            {f.verifyResendPrompt}{" "}
            <Button
              type="button"
              variant="link"
              onClick={() => setShowResend(true)}
              className="text-accent-600"
            >
              {f.verifyResendLink}
            </Button>{" "}
            {f.verifySpamHint}
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white/70 px-6 py-5 backdrop-blur-sm">
        <p className="mb-4 text-xs font-bold uppercase tracking-widest text-ink-400">
          {f.verifyWhatsWaiting}
        </p>
        <div className="space-y-3">
          {trialPerks.map((perk) => (
            <div key={perk.label} className="flex items-center gap-3">
              <span className="text-lg">{perk.icon}</span>
              <div>
                <p className="text-sm font-semibold text-ink-700">
                  {perk.label}
                </p>
                <p className="text-xs text-ink-400">{perk.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResendForm({
  authFlow: af,
  email,
  setEmail,
  state,
  error,
  onSubmit,
}: {
  authFlow: AuthFlowSection;
  email: string;
  setEmail: (v: string) => void;
  state: "idle" | "sending" | "sent" | "error";
  error: string;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Input
        id="verify-resend-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={af.verifyResendPlaceholder}
      />
      {error ? (
        <p className="text-sm font-medium text-danger-600">{error}</p>
      ) : null}
      <Button
        type="submit"
        variant="accent"
        size="lg"
        disabled={state === "sending"}
        className="w-full"
      >
        {state === "sending" ? af.verifyResending : af.verifyResendSend}
      </Button>
    </form>
  );
}

export default function VerifyEmailPageClient() {
  const { t } = useLocale();
  const f = t.authFlow;

  return (
    <div
      className="min-h-screen bg-[#f8fcff] px-4 py-10 sm:px-6"
      style={{
        backgroundImage:
          "radial-gradient(at 25% 10%, hsla(262, 90%, 95%, 0.7) 0px, transparent 45%), radial-gradient(at 90% 0%, hsla(280, 90%, 92%, 0.4) 0px, transparent 50%)",
      }}
    >
      <div className="mb-10 flex justify-center">
        <Link href="/" aria-label={f.verifyHomeAria}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://6vgmy5o5gznqt4ax.public.blob.vercel-storage.com/uploads/solohub%20logo2%20%281%29.png"
            alt="SoloHub"
            className="h-12 w-auto"
          />
        </Link>
      </div>

      <Suspense fallback={null}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}

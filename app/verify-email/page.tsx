"use client";

import { useLocale } from "@/lib/i18n/context";
import type { AuthFlowSection } from "@/lib/i18n/catalog/auth-flow";
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
        <div className="rounded-3xl border border-slate-100 bg-white/90 p-8 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.25)] backdrop-blur-sm text-center">
          <div
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full text-4xl"
            style={{
              background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
              boxShadow: "0 0 0 8px #ecfdf5",
            }}
          >
            ✅
          </div>

          <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {f.verifyAllSetTitle}
          </h1>
          <p className="mb-8 text-sm leading-relaxed text-slate-500">
            {f.verifyAllSetBody}
          </p>

          <Link
            href="/login"
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #11C4B6 0%, #0EA5B7 100%)",
            }}
          >
            {f.verifyGoWorkspace}
          </Link>
        </div>
      </div>
    );
  }

  if (errorCode) {
    const errorMessages: Record<string, { title: string; body: string }> = {
      expired: {
        title: f.verifyErrExpiredTitle,
        body: f.verifyErrExpiredBody,
      },
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
        <div className="rounded-3xl border border-slate-100 bg-white/90 p-8 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.25)] backdrop-blur-sm">
          <div
            className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
            style={{
              background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
            }}
          >
            ⚠️
          </div>
          <h1 className="mb-2 text-2xl font-bold text-slate-900">{msg.title}</h1>
          <p className="mb-7 text-sm leading-relaxed text-slate-500">{msg.body}</p>
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
      <div className="rounded-3xl border border-slate-100 bg-white/90 p-8 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.25)] backdrop-blur-sm">
        <div className="mb-8 flex items-center justify-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 font-semibold text-[#0ea5b7]">
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full text-white text-[10px] font-bold"
              style={{
                background: "linear-gradient(135deg, #11C4B6, #0EA5B7)",
              }}
            >
              ✓
            </span>
            {f.verifyStepCreate}
          </span>
          <span className="h-px w-6 bg-slate-200" />
          <span className="flex items-center gap-1.5 font-semibold text-slate-900">
            <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#11C4B6] text-[10px] font-bold text-[#0ea5b7]">
              2
            </span>
            {f.verifyStepVerify}
          </span>
          <span className="h-px w-6 bg-slate-200" />
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-200 text-[10px] font-bold text-slate-400">
              3
            </span>
            {f.verifyStepTrial}
          </span>
        </div>

        <div
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
          style={{
            background: "linear-gradient(135deg, #11C4B6 0%, #0EA5B7 100%)",
            boxShadow: "0 8px 24px -4px rgba(17,196,182,0.4)",
          }}
        >
          ✉️
        </div>

        <h1 className="mb-2 text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {f.verifyCheckInbox}
        </h1>

        <div className="my-5 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <svg
            className="h-4 w-4 shrink-0 text-slate-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
          <span className="truncate text-sm font-semibold text-slate-700">
            {emailParam || f.verifyYourEmailFallback}
          </span>
        </div>

        <p className="mb-6 text-center text-sm leading-relaxed text-slate-500">
          {f.verifyInboxBody}
        </p>

        {resendState === "sent" ? (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-semibold text-green-800">
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
          <p className="text-center text-sm text-slate-400">
            {f.verifyResendPrompt}{" "}
            <button
              type="button"
              onClick={() => setShowResend(true)}
              className="font-semibold text-[#0ea5b7] underline decoration-[#99f6e4] underline-offset-2 hover:opacity-80"
            >
              {f.verifyResendLink}
            </button>{" "}
            {f.verifySpamHint}
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white/70 px-6 py-5 backdrop-blur-sm">
        <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
          {f.verifyWhatsWaiting}
        </p>
        <div className="space-y-3">
          {trialPerks.map((perk) => (
            <div key={perk.label} className="flex items-center gap-3">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg"
                style={{
                  background:
                    "linear-gradient(135deg, #f0fdfc 0%, #ccfbf1 100%)",
                }}
              >
                {perk.icon}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {perk.label}
                </p>
                <p className="text-xs text-slate-400">{perk.sub}</p>
              </div>
              <span
                className="ml-auto flex h-5 w-5 items-center justify-center rounded-full text-white text-[10px] font-bold"
                style={{
                  background: "linear-gradient(135deg, #11C4B6, #0EA5B7)",
                }}
              >
                ✓
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-slate-400">
          {f.verifyTrialFooter}
        </p>
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
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={af.verifyResendPlaceholder}
        className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#11c4b6]"
      />
      {error ? (
        <p className="text-sm font-medium text-rose-600">{error}</p>
      ) : null}
      <button
        type="submit"
        disabled={state === "sending"}
        className="w-full rounded-xl py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{
          background: "linear-gradient(135deg, #11C4B6 0%, #0EA5B7 100%)",
        }}
      >
        {state === "sending" ? af.verifyResending : af.verifyResendSend}
      </button>
    </form>
  );
}

export default function VerifyEmailPage() {
  const { t } = useLocale();
  const f = t.authFlow;

  return (
    <div
      className="min-h-screen px-4 py-10 sm:px-6"
      style={{
        backgroundImage:
          "radial-gradient(at 25% 10%, hsla(186,100%,93%,0.7) 0px, transparent 45%), radial-gradient(at 90% 0%, hsla(173,100%,90%,0.4) 0px, transparent 50%)",
        backgroundColor: "#f8fcff",
      }}
    >
      <div className="mb-10 flex justify-center">
        <Link href="/" aria-label={f.verifyHomeAria}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://6vgmy5o5gznqt4ax.public.blob.vercel-storage.com/uploads/SoloHub%20logo%20png.png"
            alt="SoloHub"
            className="h-12 w-auto"
          />
        </Link>
      </div>

      <Suspense fallback={null}>
        <VerifyEmailContent />
      </Suspense>

      <p className="mt-10 text-center text-xs text-slate-400">
        {f.verifyAlreadyFooter}{" "}
        <Link href="/login" className="text-[#0ea5b7] hover:underline">
          {f.verifySignIn}
        </Link>
        {" · "}
        <Link href="/contact" className="text-[#0ea5b7] hover:underline">
          {f.verifyContactSupport}
        </Link>
      </p>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

// ── What's included in the trial ─────────────────────────────────────────────
const TRIAL_PERKS = [
  { icon: "🌐", label: "Professional website", sub: "Live in minutes" },
  { icon: "📅", label: "Smart booking calendar", sub: "24/7 self-service" },
  { icon: "💳", label: "Automated invoicing", sub: "Get paid faster" },
];

// ── Inner component (needs useSearchParams — must be inside Suspense) ─────────
function VerifyEmailContent() {
  const params = useSearchParams();
  const verified = params.get("verified") === "1";
  const errorCode = params.get("error");
  const emailParam = params.get("email") ?? "";

  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState(emailParam);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [resendError, setResendError] = useState("");

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
        setResendError(json.error ?? "Could not resend email.");
        setResendState("error");
      } else {
        setResendState("sent");
      }
    } catch {
      setResendError("Something went wrong. Please try again.");
      setResendState("error");
    }
  }

  // ── ✅ Email verified — account active ────────────────────────────────────
  if (verified) {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-3xl border border-slate-100 bg-white/90 p-8 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.25)] backdrop-blur-sm text-center">
          {/* Animated checkmark ring */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full text-4xl"
            style={{ background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)", boxShadow: "0 0 0 8px #ecfdf5" }}
          >
            ✅
          </div>

          <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            You&apos;re all set!
          </h1>
          <p className="mb-8 text-sm leading-relaxed text-slate-500">
            Your email is confirmed and your 14-day free trial has started.
            Everything is ready — just sign in.
          </p>

          <Link
            href="/login"
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #11C4B6 0%, #0EA5B7 100%)" }}
          >
            Go to my workspace →
          </Link>
        </div>
      </div>
    );
  }

  // ── ⚠️ Error states ───────────────────────────────────────────────────────
  if (errorCode) {
    const errorMessages: Record<string, { title: string; body: string }> = {
      expired: {
        title: "Link expired",
        body: "Verification links expire after 24 hours. Enter your email below and we'll send a fresh one.",
      },
      already_used: {
        title: "Already used",
        body: "This link has already been used. If your account isn't active yet, request a new link.",
      },
      invalid_token: {
        title: "Invalid link",
        body: "This link doesn't look right — it may have been copied incorrectly. Request a new one below.",
      },
      missing_token: {
        title: "Missing token",
        body: "The link is incomplete. Try clicking the button in your email again, or request a new one.",
      },
      server_error: {
        title: "Something went wrong",
        body: "A server error occurred. Please try again or contact support.",
      },
    };

    const msg = errorMessages[errorCode] ?? {
      title: "Verification failed",
      body: "Something went wrong with your verification link.",
    };

    return (
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-3xl border border-slate-100 bg-white/90 p-8 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.25)] backdrop-blur-sm">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
            style={{ background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)" }}
          >
            ⚠️
          </div>
          <h1 className="mb-2 text-2xl font-bold text-slate-900">{msg.title}</h1>
          <p className="mb-7 text-sm leading-relaxed text-slate-500">{msg.body}</p>
          <ResendForm
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

  // ── 📬 Default: check your inbox ─────────────────────────────────────────
  return (
    <div className="mx-auto w-full max-w-md space-y-4">

      {/* Main card */}
      <div className="rounded-3xl border border-slate-100 bg-white/90 p-8 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.25)] backdrop-blur-sm">

        {/* Progress steps */}
        <div className="mb-8 flex items-center justify-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 font-semibold text-[#0ea5b7]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full text-white text-[10px] font-bold"
              style={{ background: "linear-gradient(135deg, #11C4B6, #0EA5B7)" }}>✓</span>
            Create account
          </span>
          <span className="h-px w-6 bg-slate-200" />
          <span className="flex items-center gap-1.5 font-semibold text-slate-900">
            <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#11C4B6] text-[10px] font-bold text-[#0ea5b7]">2</span>
            Verify email
          </span>
          <span className="h-px w-6 bg-slate-200" />
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-200 text-[10px] font-bold text-slate-400">3</span>
            Start trial
          </span>
        </div>

        {/* Icon */}
        <div
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
          style={{ background: "linear-gradient(135deg, #11C4B6 0%, #0EA5B7 100%)", boxShadow: "0 8px 24px -4px rgba(17,196,182,0.4)" }}
        >
          ✉️
        </div>

        <h1 className="mb-2 text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Check your inbox
        </h1>

        {/* Email address pill */}
        <div className="my-5 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <svg className="h-4 w-4 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
          <span className="truncate text-sm font-semibold text-slate-700">
            {emailParam || "your email address"}
          </span>
        </div>

        <p className="mb-6 text-center text-sm leading-relaxed text-slate-500">
          We sent a verification link to that address. Click it to activate your account and start your free trial.
        </p>

        {/* Resend toggle / form */}
        {resendState === "sent" ? (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-semibold text-green-800">
            ✓ New link sent — check your inbox (and spam folder).
          </div>
        ) : showResend ? (
          <ResendForm
            email={resendEmail}
            setEmail={setResendEmail}
            state={resendState}
            error={resendError}
            onSubmit={handleResend}
          />
        ) : (
          <p className="text-center text-sm text-slate-400">
            Didn&apos;t receive it?{" "}
            <button
              onClick={() => setShowResend(true)}
              className="font-semibold text-[#0ea5b7] underline decoration-[#99f6e4] underline-offset-2 hover:opacity-80"
            >
              Resend the email
            </button>
            {" "}or check your spam folder.
          </p>
        )}
      </div>

      {/* "What's waiting for you" card */}
      <div className="rounded-2xl border border-slate-100 bg-white/70 px-6 py-5 backdrop-blur-sm">
        <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
          What&apos;s waiting for you
        </p>
        <div className="space-y-3">
          {TRIAL_PERKS.map((perk) => (
            <div key={perk.label} className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg"
                style={{ background: "linear-gradient(135deg, #f0fdfc 0%, #ccfbf1 100%)" }}
              >
                {perk.icon}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-800">{perk.label}</p>
                <p className="text-xs text-slate-400">{perk.sub}</p>
              </div>
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full text-white text-[10px] font-bold"
                style={{ background: "linear-gradient(135deg, #11C4B6, #0EA5B7)" }}
              >
                ✓
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-slate-400">
          All included in your 14-day free trial · No credit card needed
        </p>
      </div>

    </div>
  );
}

// ── Reusable resend form ──────────────────────────────────────────────────────
function ResendForm({
  email,
  setEmail,
  state,
  error,
  onSubmit,
}: {
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
        placeholder="your@email.com"
        className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#11c4b6]"
      />
      {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
      <button
        type="submit"
        disabled={state === "sending"}
        className="w-full rounded-xl py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ background: "linear-gradient(135deg, #11C4B6 0%, #0EA5B7 100%)" }}
      >
        {state === "sending" ? "Sending…" : "Resend verification email"}
      </button>
    </form>
  );
}

// ── Page shell ────────────────────────────────────────────────────────────────
export default function VerifyEmailPage() {
  return (
    <div
      className="min-h-screen px-4 py-10 sm:px-6"
      style={{
        backgroundImage:
          "radial-gradient(at 25% 10%, hsla(186,100%,93%,0.7) 0px, transparent 45%), radial-gradient(at 90% 0%, hsla(173,100%,90%,0.4) 0px, transparent 50%)",
        backgroundColor: "#f8fcff",
      }}
    >
      {/* Logo */}
      <div className="mb-10 flex justify-center">
        <Link href="/" aria-label="Go to SoloHub home">
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
        Already verified?{" "}
        <Link href="/login" className="text-[#0ea5b7] hover:underline">
          Sign in
        </Link>
        {" · "}
        <Link href="/contact" className="text-[#0ea5b7] hover:underline">
          Contact support
        </Link>
      </p>
    </div>
  );
}

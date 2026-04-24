"use client";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  KeyIcon,
  MailIcon,
  ShieldIcon,
} from "@/components/ui/Icons";
import { Button } from "@/components/ds/Button";
import { useLocale } from "@/lib/i18n/context";
import Link from "next/link";
import { useState } from "react";

export default function MainSiteForgotPasswordPage() {
  const { t } = useLocale();
  const a = t.auth;
  const f = t.authFlow;
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to send reset link.");
      }
      setDone(true);
    } catch (submitError: unknown) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : f.forgotSendErrorFallback
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen bg-[#f8fcff] px-4 py-10 sm:px-6 lg:px-8"
      style={{
        backgroundImage:
          "radial-gradient(at 25% 10%, hsla(262, 90%, 95%, 0.7) 0px, transparent 45%), radial-gradient(at 90% 0%, hsla(280, 90%, 92%, 0.4) 0px, transparent 50%)",
      }}
    >
      <div className="mx-auto w-full max-w-xl rounded-3xl border border-slate-100 bg-white/85 p-6 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.35)] backdrop-blur-sm sm:p-8">
        <Link
          href="/login"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
        >
          <ArrowLeftIcon size={14} />
          {f.backToLogin}
        </Link>
        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
          <KeyIcon className="h-5 w-5" />
        </div>

        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
          {f.forgotTitle}
        </h1>
        <p className="mt-2 text-base text-slate-600 sm:text-lg">
          {f.forgotSubtitle}
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              {a.email}
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <MailIcon />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={f.forgotEmailPlaceholder}
                className="w-full rounded-xl border-2 border-slate-200 py-3 pl-11 pr-4 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-600"
              />
            </div>
            <p className="mt-2 text-sm text-slate-500">{f.forgotEmailHint}</p>
          </div>

          {done ? (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              If an account exists for this email, a reset link has been sent.
            </p>
          ) : null}
          {error ? (
            <p className="text-sm font-medium text-rose-600">{error}</p>
          ) : null}

          <Button
            type="submit"
            variant="dark"
            size="lg"
            disabled={loading}
            className="group w-full"
          >
            <span>{loading ? f.forgotSending : f.forgotSendLink}</span>
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </form>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button asChild variant="secondary" size="lg" className="w-full">
            <Link href="/login">
              <span>{a.signIn}</span>
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="w-full">
            <Link href="/signup">
              <span>{a.createAccount}</span>
            </Link>
          </Button>
        </div>

        <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white">
              <ShieldIcon className="h-4 w-4" />
            </div>
            <div>
              <h4 className="mb-1 text-sm font-semibold text-slate-900">
                {f.forgotSecurityTitle}
              </h4>
              <p className="text-sm leading-relaxed text-slate-600">
                {f.forgotSecurityBody}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

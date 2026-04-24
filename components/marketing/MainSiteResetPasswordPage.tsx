"use client";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  EyeIcon,
  LockIcon,
} from "@/components/ui/Icons";
import { Button } from "@/components/ds/Button";
import { useLocale } from "@/lib/i18n/context";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function MainSiteResetPasswordPage() {
  const { t } = useLocale();
  const a = t.auth;
  const f = t.authFlow;
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? f.resetErrorFallback);
      }
      setDone(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch (submitError: unknown) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : f.resetErrorFallback
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
        <Link href="/login" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900">
          <ArrowLeftIcon size={14} />
          {f.backToLogin}
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
          {f.resetTitle}
        </h1>
        <p className="mt-2 text-base text-slate-600 sm:text-lg">
          {f.resetSubtitle}
        </p>

        {!token ? (
          <p className="mt-8 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {f.resetInvalidToken}
          </p>
        ) : (
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                {f.resetNewPassword}
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <LockIcon size={16} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder={f.resetPlaceholderNew}
                  className="w-full rounded-xl border-2 border-slate-200 py-3 pl-11 pr-12 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-600"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword ? a.hidePassword : a.showPassword
                  }
                >
                  <EyeIcon size={16} />
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                {f.resetConfirmPassword}
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <LockIcon size={16} />
                </span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder={f.resetPlaceholderConfirm}
                  className="w-full rounded-xl border-2 border-slate-200 py-3 pl-11 pr-12 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-600"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={
                    showConfirmPassword
                      ? f.hideConfirmPassword
                      : f.showConfirmPassword
                  }
                >
                  <EyeIcon size={16} />
                </button>
              </div>
            </div>

            {done ? (
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {f.resetDoneRedirecting}
              </p>
            ) : null}
            {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

            <Button
              type="submit"
              variant="dark"
              size="lg"
              disabled={loading}
              className="group w-full"
            >
              <span>{loading ? f.resetSaving : f.resetUpdatePassword}</span>
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

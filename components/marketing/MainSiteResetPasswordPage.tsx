"use client";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  EyeIcon,
  LockIcon,
} from "@/components/ui/Icons";
import { Button } from "@/components/ds/Button";
import { Input } from "@/components/ds/Input";
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
      <div className="mx-auto w-full max-w-xl rounded-3xl border border-ink-100 bg-white/85 p-6 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.35)] backdrop-blur-sm sm:p-8">
        <Link href="/login" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-ink-700 hover:text-ink-900">
          <ArrowLeftIcon size={14} />
          {f.backToLogin}
        </Link>

        <h1 className="text-3xl font-bold text-ink-900 sm:text-4xl">
          {f.resetTitle}
        </h1>
        <p className="mt-2 text-base text-ink-500 sm:text-lg">
          {f.resetSubtitle}
        </p>

        {!token ? (
          <p className="mt-8 rounded-xl border border-danger-50 bg-danger-50 px-4 py-3 text-sm text-danger-700">
            {f.resetInvalidToken}
          </p>
        ) : (
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <Input
              id="reset-new-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              label={f.resetNewPassword}
              placeholder={f.resetPlaceholderNew}
              leading={<LockIcon size={16} />}
              trailing={
                <button
                  type="button"
                  className="text-ink-400 transition-colors hover:text-ink-500"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? a.hidePassword : a.showPassword}
                >
                  <EyeIcon size={16} />
                </button>
              }
            />

            <Input
              id="reset-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              label={f.resetConfirmPassword}
              placeholder={f.resetPlaceholderConfirm}
              leading={<LockIcon size={16} />}
              trailing={
                <button
                  type="button"
                  className="text-ink-400 transition-colors hover:text-ink-500"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={
                    showConfirmPassword
                      ? f.hideConfirmPassword
                      : f.showConfirmPassword
                  }
                >
                  <EyeIcon size={16} />
                </button>
              }
            />

            {done ? (
              <p className="rounded-xl border border-success-50 bg-success-50 px-4 py-3 text-sm text-success-700">
                {f.resetDoneRedirecting}
              </p>
            ) : null}
            {error ? <p className="text-sm font-medium text-danger-600">{error}</p> : null}

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

"use client";

import { Button } from "@/components/ds/Button";
import { Input } from "@/components/ds/Input";
import {
  ArrowRightIcon,
  EyeIcon,
  InfoIcon,
  LockIcon,
  MailIcon,
  ShieldIcon,
  SparkleIcon,
} from "@/components/ui/Icons";
import { useLocale } from "@/lib/i18n/context";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPageClient() {
  const { t } = useLocale();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (result?.error) {
      setError(t.auth.invalidCredentials);
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/session");
    const session = (await res.json()) as {
      isAdmin?: boolean;
      isStaff?: boolean;
    };

    if (session?.isAdmin) {
      router.push("/admin");
    } else if (session?.isStaff) {
      router.push("/staff-portal");
    } else {
      router.push("/dashboard");
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
        <div className="mb-8">
          <Link href="/" className="mx-auto flex w-fit items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://6vgmy5o5gznqt4ax.public.blob.vercel-storage.com/uploads/solohub%20logo2%20%281%29.png"
              alt="SoloHub"
              className="h-12 w-auto"
            />
          </Link>
        </div>

        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-ink-900 sm:text-4xl">
            {t.auth.signInTitle}
          </h1>
          <p className="mt-2 text-base text-ink-500 sm:text-lg">
            {t.auth.signInSubtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="login-email"
            type="email"
            name="email"
            required
            label={t.auth.email}
            placeholder="you@company.com"
            leading={<MailIcon />}
          />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="login-password"
                className="block text-sm font-semibold text-ink-700"
              >
                {t.auth.password}
              </label>
              <Link
                href="/forgot-password"
                className="text-sm font-semibold text-brand-700 transition-colors hover:text-brand-600"
              >
                {t.auth.forgotPassword}
              </Link>
            </div>
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              name="password"
              required
              placeholder="Enter your password"
              leading={<LockIcon size={16} />}
              trailing={
                <button
                  type="button"
                  className="text-ink-400 transition-colors hover:text-ink-500"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword ? t.auth.hidePassword : t.auth.showPassword
                  }
                >
                  <EyeIcon size={16} />
                </button>
              }
            />
          </div>

          {error ? (
            <p className="text-sm font-medium text-danger-600">{error}</p>
          ) : null}

          <Button
            type="submit"
            variant="dark"
            size="xl"
            disabled={loading}
            className="group w-full gap-2"
          >
            <span>{loading ? t.auth.signingIn : t.auth.signIn}</span>
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </form>

        <div className="mt-8 space-y-4">
          <Button
            asChild
            variant="outlineDark"
            size="xl"
            className="group w-full gap-2"
          >
            <Link href="/signup">
              <span>{t.auth.createAccount}</span>
              <SparkleIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
            </Link>
          </Button>
        </div>

        <div className="mt-8 rounded-xl border border-info-50 bg-info-50 p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-info-600 text-white">
              <InfoIcon className="h-4 w-4" />
            </div>
            <div>
              <h4 className="mb-1 text-sm font-semibold text-ink-900">
                {t.auth.needHelpTitle}
              </h4>
              <p className="mb-3 text-sm text-ink-500">
                {t.auth.needHelpBody}
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-sm font-semibold text-info-600 transition-colors hover:text-info-600"
              >
                <span>{t.auth.contactSupportLink}</span>
                <ArrowRightIcon className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-ink-200 pt-6">
          <div className="flex flex-wrap items-center justify-center gap-6 opacity-70">
            <div className="flex items-center gap-2">
              <ShieldIcon className="h-4 w-4 text-ink-500" />
              <span className="text-xs font-medium uppercase tracking-wider text-ink-500">
                {t.auth.sslBadge}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <LockIcon size={16} />
              <span className="text-xs font-medium uppercase tracking-wider text-ink-500">
                {t.auth.encryptedBadge}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldIcon className="h-4 w-4 text-ink-500" />
              <span className="text-xs font-medium uppercase tracking-wider text-ink-500">
                {t.auth.twoFactorBadge}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Button } from "@/components/ds/Button";
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
    const session = (await res.json()) as { isAdmin?: boolean; isStaff?: boolean };

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
          "radial-gradient(at 25% 10%, hsla(186, 100%, 93%, 0.7) 0px, transparent 45%), radial-gradient(at 90% 0%, hsla(173, 100%, 90%, 0.4) 0px, transparent 50%)",
      }}
    >
      <div className="mx-auto w-full max-w-xl rounded-3xl border border-slate-100 bg-white/85 p-6 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.35)] backdrop-blur-sm sm:p-8">
        <div className="mb-8">
          <Link href="/" className="mx-auto flex w-fit items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://6vgmy5o5gznqt4ax.public.blob.vercel-storage.com/uploads/SoloHub%20logo%20png.png"
              alt="SoloHub"
              className="h-12 w-auto"
            />
          </Link>
        </div>

        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            {t.auth.signInTitle}
          </h1>
          <p className="mt-2 text-base text-slate-600 sm:text-lg">
            {t.auth.signInSubtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              {t.auth.email}
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <MailIcon />
              </span>
              <input
                type="email"
                name="email"
                required
                placeholder="you@company.com"
                className="w-full rounded-xl border-2 border-slate-200 py-3 pl-11 pr-4 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#11c4b6]"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-semibold text-slate-700">
                {t.auth.password}
              </label>
              <Link
                href="/forgot-password"
                className="text-sm font-semibold text-[#0ea5b7] transition-colors hover:text-[#0891b2]"
              >
                {t.auth.forgotPassword}
              </Link>
            </div>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <LockIcon size={16} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                placeholder="Enter your password"
                className="w-full rounded-xl border-2 border-slate-200 py-3 pl-11 pr-12 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#11c4b6]"
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? t.auth.hidePassword : t.auth.showPassword}
              >
                <EyeIcon size={16} />
              </button>
            </div>
          </div>

          {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

          <Button type="submit" variant="dark" size="xl" disabled={loading} className="group w-full gap-2">
            <span>{loading ? t.auth.signingIn : t.auth.signIn}</span>
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </form>

        <div className="mt-8 space-y-4">
          <Button asChild variant="outlineDark" size="xl" className="group w-full gap-2">
            <Link href="/signup">
              <span>{t.auth.createAccount}</span>
              <SparkleIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
            </Link>
          </Button>
        </div>

        <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white">
              <InfoIcon className="h-4 w-4" />
            </div>
            <div>
              <h4 className="mb-1 text-sm font-semibold text-slate-900">
                {t.auth.needHelpTitle}
              </h4>
              <p className="mb-3 text-sm text-slate-600">{t.auth.needHelpBody}</p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
              >
                <span>{t.auth.contactSupportLink}</span>
                <ArrowRightIcon className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6">
          <div className="flex flex-wrap items-center justify-center gap-6 opacity-70">
            <div className="flex items-center gap-2">
              <ShieldIcon className="h-4 w-4 text-slate-600" />
              <span className="text-xs font-medium uppercase tracking-wider text-slate-600">
                {t.auth.sslBadge}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <LockIcon size={16} />
              <span className="text-xs font-medium uppercase tracking-wider text-slate-600">
                {t.auth.encryptedBadge}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldIcon className="h-4 w-4 text-slate-600" />
              <span className="text-xs font-medium uppercase tracking-wider text-slate-600">
                {t.auth.twoFactorBadge}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { ArrowRightIcon, EyeIcon, ShieldIcon } from "@/components/ui/Icons";
import {
  MARKETING_BUTTON_DARK,
  MARKETING_BUTTON_OUTLINE_DARK,
} from "@/components/marketing/buttonStyles";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function LockMiniIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
    </svg>
  );
}

export default function LoginPage() {
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
      setError("Invalid email or password");
      setLoading(false);
    } else {
      // fetch session to check isAdmin
      const res = await fetch("/api/auth/session");
      const session = await res.json();

      if (session?.isAdmin) {
        router.push("/admin");
      } else if (Boolean((session as { isStaff?: boolean })?.isStaff)) {
        router.push("/staff-portal");
      } else {
        router.push("/dashboard");
      }
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
            <img
              src="https://6vgmy5o5gznqt4ax.public.blob.vercel-storage.com/uploads/SoloHub%20logo%20png.png"
              alt="SoloHub"
              className="h-12 w-auto"
            />
          </Link>
        </div>

        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Sign in to your account
          </h1>
          <p className="mt-2 text-base text-slate-600 sm:text-lg">
            Welcome back! Please enter your details.
          </p>
        </div>

        <div className="mb-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-3 font-medium text-slate-500"></span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Email
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
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-sm font-semibold text-[#0ea5b7] transition-colors hover:text-[#0891b2]"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <LockMiniIcon />
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
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <EyeIcon size={16} />
              </button>
            </div>
          </div>

          {error ? (
            <p className="text-sm font-medium text-rose-600">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className={`group w-full gap-2 ${MARKETING_BUTTON_DARK} disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <span>{loading ? "Signing in..." : "Sign In"}</span>
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </form>

        <div className="mt-8 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-3 text-slate-500">
                New to SoloHub?
              </span>
            </div>
          </div>

          <Link
            href="/signup"
            className={`group w-full gap-2 ${MARKETING_BUTTON_OUTLINE_DARK}`}
          >
            <span>Create an account</span>
            <span className="transition-transform group-hover:scale-110">
              ✦
            </span>
          </Link>
        </div>

        <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white">
              i
            </div>
            <div>
              <h4 className="mb-1 text-sm font-semibold text-slate-900">
                Need help signing in?
              </h4>
              <p className="mb-3 text-sm text-slate-600">
                Our support team is available 24/7 to assist you.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
              >
                <span>Contact Support</span>
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
                256-bit SSL
              </span>
            </div>
            <div className="flex items-center gap-2">
              <LockMiniIcon />
              <span className="text-xs font-medium uppercase tracking-wider text-slate-600">
                Encrypted
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldIcon className="h-4 w-4 text-slate-600" />
              <span className="text-xs font-medium uppercase tracking-wider text-slate-600">
                2FA Ready
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

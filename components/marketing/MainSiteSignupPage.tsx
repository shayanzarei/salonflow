"use client";

import { ArrowRightIcon, EyeIcon, ShieldIcon } from "@/components/ui/Icons";
import { MARKETING_BUTTON_DARK } from "@/components/marketing/buttonStyles";
import Link from "next/link";
import { signIn } from "next-auth/react";
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

function BuildingIcon() {
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
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 9h.01M15 9h.01M9 13h.01M15 13h.01M9 17h.01M15 17h.01" />
    </svg>
  );
}

export default function MainSiteSignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const termsAccepted = formData.get("terms") === "on";

    if (!termsAccepted) {
      setError("Please accept Terms of Service and Privacy Policy.");
      setLoading(false);
      return;
    }

    const firstName = String(formData.get("first-name") ?? "").trim();
    const lastName = String(formData.get("last-name") ?? "").trim();
    const workEmail = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const company = String(formData.get("company") ?? "").trim();
    const role = String(formData.get("role") ?? "").trim();
    const marketingOptIn = formData.get("marketing") === "on";

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          workEmail,
          password,
          company,
          role,
          marketingOptIn,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to create account.");
      }

      const signInResult = await signIn("credentials", {
        email: workEmail,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push("/login");
        return;
      }

      router.push("/dashboard");
    } catch (submitError: unknown) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to create account."
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
          "radial-gradient(at 25% 10%, hsla(186, 100%, 93%, 0.7) 0px, transparent 45%), radial-gradient(at 90% 0%, hsla(173, 100%, 90%, 0.4) 0px, transparent 50%)",
      }}
    >
      <div className="mx-auto w-full max-w-2xl rounded-3xl border border-slate-100 bg-white/85 p-6 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.35)] backdrop-blur-sm sm:p-8">
        <div className="mb-8 ">
          <Link href="/" className="mx-auto flex w-fit items-center gap-3">
            <img
              src="https://6vgmy5o5gznqt4ax.public.blob.vercel-storage.com/uploads/SoloHub%20logo%20png.png"
              alt="SoloHub"
              className="h-12 w-auto"
            />
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Create your account
          </h1>
          <p className="mt-2 text-base text-slate-600 sm:text-lg">
            Start your 1-month free trial. No credit card required.
          </p>
        </div>

        <div className="mb-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm"></div>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="first-name"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                First Name
              </label>
              <input
                id="first-name"
                name="first-name"
                type="text"
                required
                placeholder="John"
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#11c4b6]"
              />
            </div>
            <div>
              <label
                htmlFor="last-name"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Last Name
              </label>
              <input
                id="last-name"
                name="last-name"
                type="text"
                required
                placeholder="Doe"
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#11c4b6]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Work Email
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <MailIcon />
              </span>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@company.com"
                className="w-full rounded-xl border-2 border-slate-200 py-3 pl-11 pr-4 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#11c4b6]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Password
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <LockMiniIcon />
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                placeholder="Create a strong password"
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
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full w-[18%] bg-[#11c4b6]" />
              </div>
              <span className="text-xs font-medium text-slate-500">Weak</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Must be at least 8 characters with numbers and symbols
            </p>
          </div>

          <div>
            <label
              htmlFor="company"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Company Name{" "}
              <span className="font-normal text-slate-400">(Optional)</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <BuildingIcon />
              </span>
              <input
                id="company"
                name="company"
                type="text"
                placeholder="Your company"
                className="w-full rounded-xl border-2 border-slate-200 py-3 pl-11 pr-4 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#11c4b6]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="role"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              What best describes you?
            </label>
            <div className="relative">
              <select
                id="role"
                name="role"
                defaultValue=""
                required
                className="w-full appearance-none rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition-colors focus:border-[#11c4b6]"
              >
                <option value="" disabled>
                  Select your role
                </option>
                <option value="freelancer">Freelancer</option>
                <option value="consultant">Consultant</option>
                <option value="agency-owner">Agency Owner</option>
                <option value="entrepreneur">Entrepreneur</option>
                <option value="small-business">Small Business Owner</option>
                <option value="other">Other</option>
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                ▾
              </span>
            </div>
          </div>

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="terms"
              required
              className="mt-0.5 h-5 w-5 rounded border-2 border-slate-300 text-[#11c4b6] focus:ring-[#11c4b6]"
            />
            <span className="text-sm leading-relaxed text-slate-600">
              I agree to SoloHub&apos;s{" "}
              <Link
                href="/privacy"
                className="font-semibold text-[#0ea5b7] underline decoration-[#99f6e4] underline-offset-2"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="font-semibold text-[#0ea5b7] underline decoration-[#99f6e4] underline-offset-2"
              >
                Privacy Policy
              </Link>
            </span>
          </label>

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="marketing"
              className="mt-0.5 h-5 w-5 rounded border-2 border-slate-300 text-[#11c4b6] focus:ring-[#11c4b6]"
            />
            <span className="text-sm leading-relaxed text-slate-600">
              Send me product updates, tips, and exclusive offers
            </span>
          </label>

          {error ? (
            <p className="text-sm font-medium text-rose-600">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className={`group w-full gap-2 ${MARKETING_BUTTON_DARK} disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <span>{loading ? "Creating account..." : "Create Account"}</span>
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#0ea5b7] underline decoration-[#99f6e4] underline-offset-2"
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-8">
          <div className="flex flex-wrap items-center justify-center gap-6 opacity-70">
            <div className="flex items-center gap-2">
              <ShieldIcon className="h-4 w-4 text-slate-600" />
              <span className="text-xs font-medium uppercase tracking-wider text-slate-600">
                SSL Secure
              </span>
            </div>
            <div className="flex items-center gap-2">
              <LockMiniIcon />
              <span className="text-xs font-medium uppercase tracking-wider text-slate-600">
                GDPR Compliant
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldIcon className="h-4 w-4 text-slate-600" />
              <span className="text-xs font-medium uppercase tracking-wider text-slate-600">
                SOC 2 Type II
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

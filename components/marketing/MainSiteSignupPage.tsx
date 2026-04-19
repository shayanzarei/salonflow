"use client";

import {
  ArrowRightIcon,
  BuildingIcon,
  ChevronDownIcon,
  EyeIcon,
  LockIcon,
  MailIcon,
  ShieldIcon,
} from "@/components/ui/Icons";
import { MARKETING_BUTTON_DARK } from "@/components/marketing/buttonStyles";
import { useLocale } from "@/lib/i18n/context";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MainSiteSignupPage() {
  const { t } = useLocale();
  const a = t.auth;
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false); // hides form, shows loading screen
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const termsAccepted = formData.get("terms") === "on";

    if (!termsAccepted) {
      setError(t.authFlow.signupTermsError);
      setLoading(false);
      return;
    }

    // Switch to loading screen immediately — don't leave the user staring at the form
    setSubmitted(true);

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

      // Account created — redirect to email verification page.
      // The user cannot sign in until they click the link in their inbox.
      if (payload.pendingVerification) {
        const dest = `/verify-email${payload.email ? `?email=${encodeURIComponent(payload.email)}` : ""}`;
        router.push(dest);
        return;
      }

      // Fallback: try to sign in immediately (should not normally reach here)
      const signInResult = await signIn("credentials", {
        email: workEmail,
        password,
        redirect: false,
      });

      if (signInResult?.error === "VerifyEmail") {
        router.push(`/verify-email?email=${encodeURIComponent(workEmail)}`);
        return;
      }

      if (signInResult?.error) {
        router.push("/login");
        return;
      }

      router.push("/dashboard");
    } catch (submitError: unknown) {
      // Revert to the form so the user can see and fix the error
      setSubmitted(false);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to create account."
      );
    } finally {
      setLoading(false);
    }
  }

  // ── Loading screen — shown immediately after form submit ──────────────────
  if (submitted) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center px-4 py-10"
        style={{
          backgroundImage:
            "radial-gradient(at 25% 10%, hsla(186,100%,93%,0.7) 0px, transparent 45%), radial-gradient(at 90% 0%, hsla(173,100%,90%,0.4) 0px, transparent 50%)",
          backgroundColor: "#f8fcff",
        }}
      >
        <div className="mx-auto w-full max-w-sm rounded-3xl border border-slate-100 bg-white/90 p-10 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.25)] backdrop-blur-sm text-center">

          {/* Spinner */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center">
            <svg
              className="h-16 w-16 animate-spin"
              viewBox="0 0 64 64"
              fill="none"
            >
              <circle
                cx="32" cy="32" r="28"
                stroke="#e2e8f0"
                strokeWidth="5"
              />
              <path
                d="M32 4a28 28 0 0 1 28 28"
                stroke="url(#spin-grad)"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="spin-grad" x1="32" y1="4" x2="60" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#11C4B6" />
                  <stop offset="1" stopColor="#0EA5B7" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <h2 className="mb-2 text-xl font-bold text-slate-900">
            {a.signupCreateWorkspace}
          </h2>
          <p className="mb-8 text-sm leading-relaxed text-slate-500">
            {a.signupCreateWorkspaceBody}
          </p>

          {/* Animated steps */}
          <div className="space-y-3 text-left">
            {[
              a.signupStep1,
              a.signupStep2,
              a.signupStep3,
            ].map((step, i) => (
              <div key={step} className="flex items-center gap-3">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{
                    background: "linear-gradient(135deg, #11C4B6 0%, #0EA5B7 100%)",
                    animationDelay: `${i * 0.4}s`,
                  }}
                >
                  ✓
                </span>
                <span className="text-sm text-slate-600">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
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
            {a.signupTitle}
          </h1>
          <p className="mt-2 text-base text-slate-600 sm:text-lg">
            {a.signupSubtitle}
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
                {a.signupFirstName}
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
                {a.signupLastName}
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
              {a.signupWorkEmail}
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
              {a.signupCreatePassword}
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <LockIcon size={16} />
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
                aria-label={showPassword ? a.hidePassword : a.showPassword}
              >
                <EyeIcon size={16} />
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full w-[18%] bg-[#11c4b6]" />
              </div>
              <span className="text-xs font-medium text-slate-500">{a.signupPasswordHint}</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {a.signupPasswordRule}
            </p>
          </div>

          <div>
            <label
              htmlFor="company"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              {a.signupCompany}{" "}
              <span className="font-normal text-slate-400">{a.signupOptional}</span>
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
              {a.signupRoleLabel}
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
                  {a.signupRolePlaceholder}
                </option>
                <option value="freelancer">{a.signupRoleFreelancer}</option>
                <option value="consultant">{a.signupRoleConsultant}</option>
                <option value="agency-owner">{a.signupRoleAgencyOwner}</option>
                <option value="entrepreneur">{a.signupRoleEntrepreneur}</option>
                <option value="small-business">{a.signupRoleSmallBusiness}</option>
                <option value="other">{a.signupRoleOther}</option>
              </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <ChevronDownIcon size={16} />
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
              {a.signupAgreePrefix}{" "}
              <Link
                href="/privacy"
                className="font-semibold text-[#0ea5b7] underline decoration-[#99f6e4] underline-offset-2"
              >
                {a.signupTerms}
              </Link>{" "}
              {a.signupAnd}{" "}
              <Link
                href="/privacy"
                className="font-semibold text-[#0ea5b7] underline decoration-[#99f6e4] underline-offset-2"
              >
                {a.signupPrivacy}
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
              {a.signupMarketingOptIn}
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
            <span>{loading ? a.signupCreating : a.signupCreateAccount}</span>
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-600">
            {a.signupAlreadyAccount}{" "}
            <Link
              href="/login"
              className="font-semibold text-[#0ea5b7] underline decoration-[#99f6e4] underline-offset-2"
            >
              {a.signupSignIn}
            </Link>
          </p>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-8">
          <div className="flex flex-wrap items-center justify-center gap-6 opacity-70">
            <div className="flex items-center gap-2">
              <ShieldIcon className="h-4 w-4 text-slate-600" />
              <span className="text-xs font-medium uppercase tracking-wider text-slate-600">
                {a.signupSsl}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <LockIcon size={16} />
              <span className="text-xs font-medium uppercase tracking-wider text-slate-600">
                {a.signupGdpr}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldIcon className="h-4 w-4 text-slate-600" />
              <span className="text-xs font-medium uppercase tracking-wider text-slate-600">
                {a.signupSoc2}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

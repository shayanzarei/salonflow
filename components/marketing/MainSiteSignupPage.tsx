"use client";

import {
  ArrowRightIcon,
  BuildingIcon,
  EyeIcon,
  LockIcon,
  MailIcon,
  ShieldIcon,
} from "@/components/ui/Icons";
import { useLocale } from "@/lib/i18n/context";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../ds/Button";
import { Input } from "../ds/Input";
import { Select } from "../ds/Select";

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
            "radial-gradient(at 25% 10%, hsla(262, 90%, 95%, 0.7) 0px, transparent 45%), radial-gradient(at 90% 0%, hsla(280, 90%, 92%, 0.4) 0px, transparent 50%)",
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
              <circle cx="32" cy="32" r="28" stroke="#e2e8f0" strokeWidth="5" />
              <path
                d="M32 4a28 28 0 0 1 28 28"
                stroke="url(#spin-grad)"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient
                  id="spin-grad"
                  x1="32"
                  y1="4"
                  x2="60"
                  y2="32"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="var(--color-brand-600)" />
                  <stop offset="1" stopColor="var(--color-brand-700)" />
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
            {[a.signupStep1, a.signupStep2, a.signupStep3].map((step, i) => (
              <div key={step} className="flex items-center gap-3">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--color-brand-600) 0%, var(--color-brand-700) 100%)",
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
          "radial-gradient(at 25% 10%, hsla(262, 90%, 95%, 0.7) 0px, transparent 45%), radial-gradient(at 90% 0%, hsla(280, 90%, 92%, 0.4) 0px, transparent 50%)",
      }}
    >
      <div className="mx-auto w-full max-w-2xl rounded-3xl border border-slate-100 bg-white/85 p-6 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.35)] backdrop-blur-sm sm:p-8">
        <div className="mb-8 ">
          <Link href="/" className="mx-auto flex w-fit items-center gap-3">
            <img
              src="https://6vgmy5o5gznqt4ax.public.blob.vercel-storage.com/uploads/solohub%20logo2%20%281%29.png"
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
            <Input
              id="first-name"
              name="first-name"
              type="text"
              required
              label={a.signupFirstName}
              placeholder="John"
            />
            <Input
              id="last-name"
              name="last-name"
              type="text"
              required
              label={a.signupLastName}
              placeholder="Doe"
            />
          </div>

          <Input
            id="email"
            name="email"
            type="email"
            required
            label={a.signupWorkEmail}
            placeholder="you@company.com"
            leading={<MailIcon />}
          />

          <div>
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              label={a.signupCreatePassword}
              placeholder="Create a strong password"
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
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-200">
                <div className="h-full w-[18%] bg-brand-600" />
              </div>
              <span className="text-xs font-medium text-ink-500">
                {a.signupPasswordHint}
              </span>
            </div>
            <p className="mt-2 text-xs text-ink-500">
              {a.signupPasswordRule}
            </p>
          </div>

          <Input
            id="company"
            name="company"
            type="text"
            label={a.signupCompany}
            optionalLabel={a.signupOptional}
            placeholder="Your company"
            leading={<BuildingIcon />}
          />

          <div>
            <label
              htmlFor="role"
              className="mb-2 block text-sm font-semibold text-ink-700"
            >
              {a.signupRoleLabel}
            </label>
            <Select
              id="role"
              name="role"
              defaultValue=""
              required
            >
              <option value="" disabled>
                {a.signupRolePlaceholder}
              </option>
              <option value="freelancer">{a.signupRoleFreelancer}</option>
              <option value="consultant">{a.signupRoleConsultant}</option>
              <option value="agency-owner">{a.signupRoleAgencyOwner}</option>
              <option value="entrepreneur">{a.signupRoleEntrepreneur}</option>
              <option value="small-business">
                {a.signupRoleSmallBusiness}
              </option>
              <option value="other">{a.signupRoleOther}</option>
            </Select>
          </div>

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="terms"
              required
              className="mt-0.5 h-5 w-5 rounded border-2 border-ink-300 text-brand-600 focus:ring-brand-600"
            />
            <span className="text-sm leading-relaxed text-ink-500">
              {a.signupAgreePrefix}{" "}
              <Link
                href="/privacy"
                className="font-semibold text-brand-700 underline decoration-brand-200 underline-offset-2"
              >
                {a.signupTerms}
              </Link>{" "}
              {a.signupAnd}{" "}
              <Link
                href="/privacy"
                className="font-semibold text-brand-700 underline decoration-brand-200 underline-offset-2"
              >
                {a.signupPrivacy}
              </Link>
            </span>
          </label>

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="marketing"
              className="mt-0.5 h-5 w-5 rounded border-2 border-ink-300 text-brand-600 focus:ring-brand-600"
            />
            <span className="text-sm leading-relaxed text-ink-500">
              {a.signupMarketingOptIn}
            </span>
          </label>

          {error ? (
            <p className="text-sm font-medium text-danger-600">{error}</p>
          ) : null}

          <Button
            type="submit"
            variant="dark"
            size="xl"
            className="group w-full gap-2"
            disabled={loading}
          >
            <span>{loading ? a.signupCreating : a.signupCreateAccount}</span>
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-600">
            {a.signupAlreadyAccount}{" "}
            <Link
              href="/login"
              className="font-semibold text-brand-700 underline decoration-brand-200 underline-offset-2"
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

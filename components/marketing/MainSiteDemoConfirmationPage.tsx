"use client";

import MainSiteFooter from "@/components/marketing/MainSiteFooter";
import MainSiteHeader from "@/components/marketing/MainSiteHeader";
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircleIcon,
  CircleIcon,
  ClockIcon,
  ListCheckIcon,
  VideoIcon,
} from "@/components/ui/Icons";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function MainSiteDemoConfirmationPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id");
  const [currentTools, setCurrentTools] = useState("");
  const [biggestChallenge, setBiggestChallenge] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [hasPrepDetails, setHasPrepDetails] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadExistingPrepDetails() {
      if (!bookingId) return;
      const res = await fetch(`/api/demo-bookings/${bookingId}`, { cache: "no-store" });
      if (!res.ok) return;
      const json = (await res.json()) as {
        current_tools?: string | null;
        biggest_challenge?: string | null;
      };
      if (!cancelled) {
        const tools = json.current_tools ?? "";
        const challenge = json.biggest_challenge ?? "";
        setCurrentTools(tools);
        setBiggestChallenge(challenge);
        setHasPrepDetails(Boolean(tools.trim() || challenge.trim()));
      }
    }
    loadExistingPrepDetails();
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  async function handlePrepSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaveMessage(null);

    if (!bookingId) {
      setSaveMessage("Booking reference is missing. Please schedule again.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/demo-bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentTools,
          biggestChallenge,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Failed to save details");
      setSaveMessage("Details saved successfully.");
      setHasPrepDetails(Boolean(currentTools.trim() || biggestChallenge.trim()));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save details";
      setSaveMessage(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      className="min-h-screen bg-[#f8fafc] text-slate-900"
      style={{
        backgroundImage:
          "radial-gradient(at 40% 20%, hsla(262, 90%, 76%, 0.18) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(280, 90%, 65%, 0.15) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(38, 100%, 90%, 0.12) 0px, transparent 50%)",
      }}
    >
      <MainSiteHeader active="demo" />

      <main
        id="main-content"
        className="mx-auto flex min-h-[80vh] w-full max-w-7xl flex-grow flex-col items-center justify-center px-8 pb-24 pt-32"
      >
        <div className="flex w-full max-w-4xl flex-col items-center">
          <div className="mb-12 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-brand-100 bg-brand-50 shadow-sm">
              <CheckCircleIcon className="h-10 w-10 text-brand-600" />
            </div>
            <h1 className="mb-4 text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 lg:text-5xl">
              Meeting Confirmed!
            </h1>
            <p className="mx-auto max-w-xl text-lg text-slate-600">
              You&apos;re all set. A calendar invitation has been sent to your email address.
            </p>
          </div>

          <section
            className="relative mb-12 w-full overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl md:p-12"
            style={{
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
              <div>
                <h2 className="mb-6 text-2xl font-bold text-slate-900">Demo Details</h2>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                      <CalendarIcon className="h-5 w-5 text-slate-600" />
                    </div>
                    <div className="ml-4">
                      <p className="mb-1 text-sm text-slate-500">Date</p>
                      <p className="font-semibold text-slate-900">Monday, October 16, 2023</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                      <ClockIcon className="h-5 w-5 text-slate-600" />
                    </div>
                    <div className="ml-4">
                      <p className="mb-1 text-sm text-slate-500">Time</p>
                      <p className="font-semibold text-slate-900">11:30 AM - 12:00 PM (CET/CEST)</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                      <VideoIcon className="h-5 w-5 text-slate-600" />
                    </div>
                    <div className="ml-4">
                      <p className="mb-1 text-sm text-slate-500">Location</p>
                      <p className="font-semibold text-slate-900">Google Meet link provided in email</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-slate-100 pt-8">
                  <h3 className="mb-4 font-semibold text-slate-900">Add to Calendar</h3>
                  <div className="flex flex-wrap gap-3">
                    <button className="flex items-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
                      <span className="mr-2 text-slate-500">G</span>
                      Google
                    </button>
                    <button className="flex items-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
                      <span className="mr-2 text-slate-500">◧</span>
                      Outlook
                    </button>
                    <button className="flex items-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
                      <span className="mr-2 text-slate-500">◍</span>
                      Apple
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                  <h3 className="mb-4 flex items-center font-bold text-slate-900">
                    <ListCheckIcon className="mr-2 h-4 w-4 text-brand-600" />
                    Next Steps
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start text-sm text-slate-600">
                      <CircleIcon filled className="mr-3 mt-1 h-3.5 w-3.5 text-brand-600" />
                      Check your email for calendar invite
                    </li>
                    <li className="flex items-start text-sm text-slate-600">
                      <CircleIcon className="mr-3 mt-1 h-3.5 w-3.5 text-slate-400" />
                      Prepare any questions you have
                    </li>
                    <li className="flex items-start text-sm text-slate-600">
                      <CircleIcon className="mr-3 mt-1 h-3.5 w-3.5 text-slate-400" />
                      Join the link 5 minutes early
                    </li>
                  </ul>
                </div>

                {!hasPrepDetails ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-2 font-bold text-slate-900">Help us prepare</h3>
                    <p className="mb-4 text-sm text-slate-500">Optional: Tell us more so we can tailor the demo.</p>

                    <form className="space-y-4" onSubmit={handlePrepSubmit}>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-700">
                          What tools are you currently using?
                        </label>
                        <input
                          type="text"
                          value={currentTools}
                          onChange={(e) => setCurrentTools(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
                          placeholder="e.g. QuickBooks, Calendly"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-700">
                          Biggest challenge right now?
                        </label>
                        <textarea
                          rows={2}
                          value={biggestChallenge}
                          onChange={(e) => setBiggestChallenge(e.target.value)}
                          className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
                          placeholder="e.g. Too much manual admin work"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSaving ? "Saving..." : "Submit Details"}
                      </button>
                      {saveMessage ? (
                        <p className="text-xs text-slate-500">{saveMessage}</p>
                      ) : null}
                    </form>
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <div className="flex space-x-6 text-sm font-medium">
            <Link href="/" className="flex items-center text-brand-700 hover:text-brand-700">
              <ArrowLeftIcon className="mr-2 h-4 w-4" /> Return to Home
            </Link>
            <span className="text-slate-300">|</span>
            <Link href="/pricing" className="text-slate-600 hover:text-slate-900">
              View Pricing Plans
            </Link>
          </div>
        </div>
      </main>

      <MainSiteFooter />
    </div>
  );
}

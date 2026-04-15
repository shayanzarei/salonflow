 "use client";

import MainSiteCta from "@/components/marketing/MainSiteCta";
import MainSiteFooter from "@/components/marketing/MainSiteFooter";
import MainSiteHeader from "@/components/marketing/MainSiteHeader";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Slot = {
  value: string;
  label: string;
  isAvailable: boolean;
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatLongDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function MainSiteBookDemoPage() {
  const router = useRouter();
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => toDateInputValue(new Date()));
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [focusArea, setFocusArea] = useState<"general_overview" | "billing_invoicing">("general_overview");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [companyRole, setCompanyRole] = useState("");
  const [goals, setGoals] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedDateObj = useMemo(() => {
    const [year, month, day] = selectedDate.split("-").map(Number);
    return new Date(year, month - 1, day);
  }, [selectedDate]);

  const calendarDays = useMemo(() => {
    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayStr = toDateInputValue(new Date());

    const days: Array<{
      value: string;
      day: number;
      inMonth: boolean;
      isPast: boolean;
      isWeekend: boolean;
      isSelected: boolean;
    }> = [];

    for (let i = 0; i < firstDay; i += 1) {
      days.push({
        value: "",
        day: 0,
        inMonth: false,
        isPast: false,
        isWeekend: false,
        isSelected: false,
      });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const value = toDateInputValue(new Date(year, month, day));
      const d = new Date(year, month, day);
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      const isPast = value < todayStr;
      days.push({
        value,
        day,
        inMonth: true,
        isPast,
        isWeekend,
        isSelected: value === selectedDate,
      });
    }

    return days;
  }, [monthCursor, selectedDate]);

  useEffect(() => {
    let cancelled = false;
    async function loadSlots() {
      setIsLoadingSlots(true);
      setError(null);
      try {
        const res = await fetch(`/api/demo-bookings?date=${selectedDate}`, { cache: "no-store" });
        const json = (await res.json()) as { slots?: Slot[]; error?: string };
        if (!res.ok) throw new Error(json.error ?? "Failed to load availability");
        if (!cancelled) {
          setSlots(json.slots ?? []);
          setSelectedTime((prev) => {
            if (!prev) return json.slots?.find((slot) => slot.isAvailable)?.value ?? null;
            const stillAvailable = json.slots?.some((slot) => slot.value === prev && slot.isAvailable);
            return stillAvailable ? prev : (json.slots?.find((slot) => slot.isAvailable)?.value ?? null);
          });
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to load availability";
          setError(message);
          setSlots([]);
          setSelectedTime(null);
        }
      } finally {
        if (!cancelled) setIsLoadingSlots(false);
      }
    }
    loadSlots();
    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!selectedTime) {
      setError("Please choose an available time slot.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/demo-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          focusArea,
          scheduledDate: selectedDate,
          scheduledTime: selectedTime,
          firstName,
          lastName,
          workEmail,
          companyRole,
          goals,
        }),
      });
      const json = (await res.json()) as { id?: string; error?: string };
      if (!res.ok) throw new Error(json.error ?? "Failed to schedule demo");
      router.push(`/book-demo/confirmation${json.id ? `?id=${json.id}` : ""}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to schedule demo";
      setError(message);
      if (message.toLowerCase().includes("no longer available")) {
        const refreshRes = await fetch(`/api/demo-bookings?date=${selectedDate}`, { cache: "no-store" });
        const refreshJson = (await refreshRes.json()) as { slots?: Slot[] };
        if (refreshRes.ok && refreshJson.slots) {
          setSlots(refreshJson.slots);
          setSelectedTime(refreshJson.slots.find((slot) => slot.isAvailable)?.value ?? null);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen bg-[#f8fafc] text-slate-900"
      style={{
        backgroundImage:
          "radial-gradient(at 40% 20%, hsla(173, 100%, 76%, 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189, 100%, 56%, 0.15) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355, 100%, 93%, 0.1) 0px, transparent 50%)",
      }}
    >
      <MainSiteHeader active="demo" />

      <main id="main-content" className="mx-auto flex w-full max-w-7xl flex-grow px-8 pb-24 pt-32">
        <div className="flex w-full flex-col gap-12 lg:flex-row lg:gap-20">
          <div id="booking-info" className="flex w-full flex-col pt-8 lg:w-5/12">
            <div className="mb-8 inline-flex w-fit items-center space-x-2 rounded-full border border-slate-200 bg-white/60 px-4 py-2 shadow-sm backdrop-blur-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#14b8a6]" />
              <span className="text-sm font-medium text-slate-700">15-30 min demo</span>
            </div>

            <h1 className="mb-6 text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 lg:text-5xl">
              See SoloHub in
              <br />
              action
            </h1>

            <p className="mb-10 text-lg leading-relaxed text-slate-600">
              Get a personalized walkthrough of how SoloHub can streamline your independent business.
              No hard sell, just a focused look at the features that matter to you.
            </p>

            <div className="mb-12 space-y-6">
              <div className="flex items-start">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ecfdfb]">
                  <span className="text-[#0ea5b7]">◎</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-slate-900">Tailored to your workflow</h3>
                  <p className="mt-1 text-slate-600">
                    We&apos;ll focus on the tools you need: invoicing, scheduling, or client management.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ecfdfb]">
                  <span className="text-[#0ea5b7]">✉</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-slate-900">Direct answers</h3>
                  <p className="mt-1 text-slate-600">
                    Ask questions and get immediate answers from our product experts.
                  </p>
                </div>
              </div>
            </div>

            <div
              className="rounded-2xl border border-slate-200 p-6"
              style={{
                background: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              <div className="mb-4 flex items-center">
                <div className="flex -space-x-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg" alt="Team member" className="h-10 w-10 rounded-full border-2 border-white" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg" alt="Team member" className="h-10 w-10 rounded-full border-2 border-white" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg" alt="Team member" className="h-10 w-10 rounded-full border-2 border-white" />
                </div>
                <div className="ml-4 text-sm text-slate-600">
                  Chat with <span className="font-semibold text-slate-900">Sarah, Mike, or Elena</span>
                </div>
              </div>
              <p className="text-sm italic text-slate-500">
                &quot;We&apos;re here to help you figure out if SoloHub is the right fit. If it&apos;s not,
                we&apos;ll tell you.&quot;
              </p>
            </div>
          </div>

          <div id="booking-interface" className="w-full lg:w-7/12">
            <div
              className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl"
              style={{
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              <form className="space-y-8" onSubmit={handleSubmit}>
                <div>
                  <h3 className="mb-4 text-xl font-bold text-slate-900">1. What would you like to focus on?</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label
                      className={`flex cursor-pointer items-center rounded-xl border p-4 ${
                        focusArea === "general_overview"
                          ? "border-[#14b8a6] bg-[#f0fdfa]"
                          : "border-slate-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="focusArea"
                        value="general_overview"
                        checked={focusArea === "general_overview"}
                        onChange={() => setFocusArea("general_overview")}
                        className="sr-only"
                      />
                      <span
                        className={`relative mr-3 h-5 w-5 shrink-0 rounded-full border-2 ${
                          focusArea === "general_overview" ? "border-[#14b8a6]" : "border-slate-300"
                        }`}
                      >
                        {focusArea === "general_overview" ? (
                          <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#14b8a6]" />
                        ) : null}
                      </span>
                      <span>
                        <span className="block font-semibold text-slate-900">General Overview</span>
                        <span className="mt-0.5 block text-sm text-slate-500">30 min full tour</span>
                      </span>
                    </label>
                    <label
                      className={`flex cursor-pointer items-center rounded-xl border p-4 ${
                        focusArea === "billing_invoicing"
                          ? "border-[#14b8a6] bg-[#f0fdfa]"
                          : "border-slate-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="focusArea"
                        value="billing_invoicing"
                        checked={focusArea === "billing_invoicing"}
                        onChange={() => setFocusArea("billing_invoicing")}
                        className="sr-only"
                      />
                      <span
                        className={`relative mr-3 h-5 w-5 shrink-0 rounded-full border-2 ${
                          focusArea === "billing_invoicing" ? "border-[#14b8a6]" : "border-slate-300"
                        }`}
                      >
                        {focusArea === "billing_invoicing" ? (
                          <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#14b8a6]" />
                        ) : null}
                      </span>
                      <span>
                        <span className="block font-semibold text-slate-900">Billing &amp; Invoicing</span>
                        <span className="mt-0.5 block text-sm text-slate-500">15 min focused demo</span>
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-xl font-bold text-slate-900">2. Select a Date &amp; Time</h3>
                  <div className="flex flex-col gap-6 md:flex-row">
                    <div className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:w-1/2">
                      <div className="mb-4 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                        >
                          ‹
                        </button>
                        <span className="font-semibold text-slate-900">
                          {MONTH_NAMES[monthCursor.getMonth()]} {monthCursor.getFullYear()}
                        </span>
                        <button
                          type="button"
                          onClick={() => setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                        >
                          ›
                        </button>
                      </div>
                      <div className="mb-2 grid grid-cols-7 gap-1 text-center">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                          <div key={d} className="py-1 text-xs font-medium text-slate-400">{d}</div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center text-sm">
                        {calendarDays.map((day, idx) => {
                          const disabled = !day.inMonth || day.isPast || day.isWeekend;
                          return (
                            <button
                              type="button"
                              key={day.value || `empty-${idx}`}
                              onClick={() => {
                                if (!disabled) setSelectedDate(day.value);
                              }}
                              className={`py-2 ${
                                day.isSelected
                                  ? "rounded-full bg-[#14b8a6] font-semibold text-white"
                                  : disabled
                                    ? "cursor-not-allowed text-slate-300"
                                    : "cursor-pointer rounded-full hover:bg-slate-100"
                              }`}
                            >
                              {day.inMonth ? day.day : ""}
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-4 flex items-center justify-center text-xs text-slate-500">
                        🌐 Amsterdam Time (CET/CEST)
                      </div>
                    </div>

                    <div className="flex h-[320px] w-full flex-col md:w-1/2">
                      <div className="mb-4 text-center md:text-left">
                        <span className="font-semibold text-slate-900">{formatLongDate(selectedDateObj)}</span>
                      </div>
                      <div className="flex-grow space-y-2 overflow-y-auto pr-2">
                        {isLoadingSlots ? (
                          <p className="text-sm text-slate-500">Loading available slots...</p>
                        ) : (
                          slots.map((slot) => {
                            const selected = slot.value === selectedTime;
                          return (
                            <button
                              type="button"
                              key={slot.value}
                              disabled={!slot.isAvailable}
                              onClick={() => setSelectedTime(slot.value)}
                              className={`w-full rounded-xl border px-4 py-3 text-center font-medium transition-colors ${
                                selected
                                  ? "flex items-center justify-between border-[#14b8a6] bg-[#f0fdfa] px-6 font-semibold text-[#0d9488]"
                                  : slot.isAvailable
                                    ? "border-slate-200 text-slate-700 hover:bg-slate-50"
                                    : "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                              }`}
                            >
                              <span>{slot.label}</span>
                              {selected ? <span>✓</span> : !slot.isAvailable ? <span className="text-xs">Not available</span> : null}
                            </button>
                          );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-xl font-bold text-slate-900">3. Your Details</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">First Name *</label>
                        <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} type="text" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition-all focus:border-[#14b8a6] focus:ring-2 focus:ring-[#14b8a6]/20" placeholder="Jane" />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Last Name *</label>
                        <input required value={lastName} onChange={(e) => setLastName(e.target.value)} type="text" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition-all focus:border-[#14b8a6] focus:ring-2 focus:ring-[#14b8a6]/20" placeholder="Doe" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Work Email *</label>
                      <input required value={workEmail} onChange={(e) => setWorkEmail(e.target.value)} type="email" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition-all focus:border-[#14b8a6] focus:ring-2 focus:ring-[#14b8a6]/20" placeholder="jane@company.com" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Company / Role</label>
                      <input value={companyRole} onChange={(e) => setCompanyRole(e.target.value)} type="text" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition-all focus:border-[#14b8a6] focus:ring-2 focus:ring-[#14b8a6]/20" placeholder="Independent Consultant" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">What are your main goals for SoloHub?</label>
                      <textarea value={goals} onChange={(e) => setGoals(e.target.value)} rows={3} className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition-all focus:border-[#14b8a6] focus:ring-2 focus:ring-[#14b8a6]/20" placeholder="e.g., I want to automate my invoicing and client onboarding..." />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-4 sm:flex-row">
                  <div className="flex items-center text-sm text-slate-500">
                    <span className="mr-2">🔒</span>
                    Your information is secure.
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedTime}
                    className="flex w-full items-center justify-center space-x-2 rounded-xl bg-[#14b8a6] px-8 py-3.5 font-bold text-white shadow-lg shadow-[#14b8a6]/20 transition-colors hover:bg-[#0ea5b7] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    <span>Schedule Demo</span>
                    <span aria-hidden>→</span>
                  </button>
                </div>
                {error ? <p className="text-sm text-red-600">{error}</p> : null}
              </form>
            </div>
          </div>
        </div>
      </main>

      <MainSiteCta />
      <MainSiteFooter />
    </div>
  );
}

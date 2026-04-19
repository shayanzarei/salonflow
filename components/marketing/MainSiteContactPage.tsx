"use client";

import MainSiteFooter from "@/components/marketing/MainSiteFooter";
import MainSiteHeader from "@/components/marketing/MainSiteHeader";
import {
  ArrowRightIcon,
  BookIcon,
  ClockIcon,
  CommentsIcon,
  PaperPlaneIcon,
  ShieldIcon,
} from "@/components/ui/Icons";
import { useLocale } from "@/lib/i18n/context";
import { FormEvent, useState } from "react";

export default function MainSiteContactPage() {
  const { t } = useLocale();
  const m = t.marketing;
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(
    null
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitMessage(null);
    setSubmitStatus(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          workEmail,
          topic,
          message,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(json.error ?? m.contactFailedSend);
      }

      setSubmitMessage(m.contactThanksSent);
      setSubmitStatus("success");
      setFirstName("");
      setLastName("");
      setWorkEmail("");
      setTopic("");
      setMessage("");
    } catch (error) {
      const errMessage =
        error instanceof Error ? error.message : m.contactFailedSend;
      setSubmitMessage(errMessage);
      setSubmitStatus("error");
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
      <MainSiteHeader active="contact" />

      <main
        id="main-content"
        className="mx-auto flex min-h-[100vh] w-full max-w-7xl flex-grow flex-col items-center justify-center px-4 pb-24 pt-32 sm:px-8"
      >
        <div className="mx-auto w-full max-w-6xl">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
              {m.contactHeroTitle}
            </h1>
            <p className="text-lg text-slate-600">{m.contactHeroSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="space-y-8 lg:col-span-5">
              <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-sm">
                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#14b8a6] to-[#9ceee5]" />
                <h3 className="mb-4 text-xl font-bold text-white">
                  {m.contactPromiseTitle}
                </h3>
                <p className="mb-6 text-sm text-slate-300">
                  {m.contactPromiseBody}
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-[#9ceee5]">
                  <ClockIcon className="h-4 w-4 text-[#14b8a6]" />
                  <span>{m.contactAvgResponseLabel}</span>
                  <span className="text-white">{m.contactAvgResponseValue}</span>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <h3 className="mb-6 text-lg font-bold text-slate-900">
                  {m.contactDirectTitle}
                </h3>
                <div className="space-y-6">
                  {/* TODO: Add email contact */}
                  {/* <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ecfdfb] text-[#0ea5b7]">
                      <IconEnvelope className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">
                        Email Us
                      </h4>
                      <p className="mb-1 text-sm text-slate-500">
                        For general inquiries and support.
                      </p>
                      <a
                        href="mailto:hello@solohub.com"
                        className="text-sm font-medium text-[#0ea5b7] hover:underline"
                      >
                        hello@solohub.com
                      </a>
                    </div>
                  </div> */}

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
                      <CommentsIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">
                        {m.contactWhatsAppTitle}
                      </h4>
                      <p className="mb-2 text-sm text-slate-500">
                        {m.contactWhatsAppBody}
                      </p>
                      <a
                        href="https://wa.me/31683103485"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 mt-2"
                      >
                        {m.contactStartChat}{" "}
                        <ArrowRightIcon className="ml-1 h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </section>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <a
                  href="/faq"
                  className="flex items-center gap-2 transition-colors hover:text-[#0ea5b7]"
                >
                  <BookIcon className="h-4 w-4" /> {m.contactReadFaqs}
                </a>
                <span className="text-slate-300">•</span>
                <a
                  href="/privacy"
                  className="flex items-center gap-2 transition-colors hover:text-[#0ea5b7]"
                >
                  <ShieldIcon className="h-4 w-4" /> {m.contactPrivacyLink}
                </a>
              </div>
            </div>

            <div className="lg:col-span-7">
              <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <h2 className="mb-6 text-2xl font-bold text-slate-900">
                  {m.contactFormTitle}
                </h2>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label
                        className="mb-2 block text-sm font-medium text-slate-700"
                        htmlFor="firstName"
                      >
                        {m.contactFirstName}
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        placeholder={m.phFirstName}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition-all focus:border-[#14b8a6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/20"
                      />
                    </div>
                    <div>
                      <label
                        className="mb-2 block text-sm font-medium text-slate-700"
                        htmlFor="lastName"
                      >
                        {m.contactLastName}
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        placeholder={m.phLastName}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition-all focus:border-[#14b8a6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="mb-2 block text-sm font-medium text-slate-700"
                      htmlFor="workEmail"
                    >
                      {m.contactWorkEmail}
                    </label>
                    <input
                      id="workEmail"
                      type="email"
                      value={workEmail}
                      onChange={(e) => setWorkEmail(e.target.value)}
                      required
                      placeholder={m.phWorkEmail}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition-all focus:border-[#14b8a6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/20"
                    />
                  </div>

                  <div>
                    <label
                      className="mb-2 block text-sm font-medium text-slate-700"
                      htmlFor="topic"
                    >
                      {m.contactTopicLabel}
                    </label>
                    <select
                      id="topic"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      required
                      className="w-full cursor-pointer appearance-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition-all focus:border-[#14b8a6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/20"
                    >
                      <option value="" disabled>
                        {m.contactTopicPlaceholder}
                      </option>
                      <option value="sales">{m.contactTopicSales}</option>
                      <option value="support">{m.contactTopicSupport}</option>
                      <option value="billing">{m.contactTopicBilling}</option>
                      <option value="other">{m.contactTopicOther}</option>
                    </select>
                  </div>

                  <div>
                    <label
                      className="mb-2 block text-sm font-medium text-slate-700"
                      htmlFor="message"
                    >
                      {m.contactMessageLabel}
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      placeholder={m.contactMessagePlaceholder}
                      className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition-all focus:border-[#14b8a6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#14b8a6] py-3.5 text-base font-bold text-white shadow-lg shadow-[#14b8a6]/20 transition-colors hover:bg-[#0ea5b7] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? m.contactSending : m.contactSend}
                    <PaperPlaneIcon className="h-4 w-4" />
                  </button>
                  {submitMessage ? (
                    <div
                      role="status"
                      aria-live="polite"
                      className={`rounded-xl border px-4 py-3 text-sm ${
                        submitStatus === "success"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-rose-200 bg-rose-50 text-rose-700"
                      }`}
                    >
                      <p className="font-semibold">
                        {submitStatus === "success"
                          ? m.contactSuccessTitle
                          : m.contactErrorTitle}
                      </p>
                      <p className="mt-1 text-xs opacity-90">{submitMessage}</p>
                    </div>
                  ) : null}

                  <p className="mt-4 text-center text-xs text-slate-500">
                    {m.contactFormDisclaimerPrefix}{" "}
                    <a
                      href="/privacy"
                      className="text-[#0ea5b7] hover:underline"
                    >
                      {m.contactPrivacyLink}
                    </a>
                    .
                  </p>
                </form>
              </section>
            </div>
          </div>
        </div>
      </main>

      <MainSiteFooter />
    </div>
  );
}

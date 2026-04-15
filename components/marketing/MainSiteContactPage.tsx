"use client";

import MainSiteFooter from "@/components/marketing/MainSiteFooter";
import MainSiteHeader from "@/components/marketing/MainSiteHeader";
import { FormEvent, useState } from "react";

function IconClock({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconEnvelope({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function IconComments({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M7 16l-3 3V7a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v9H7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M17 10h1a2 2 0 0 1 2 2v7l-3-3h-5a2 2 0 0 1-2-2v-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconArrowRight({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconBook({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M4 6a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2V6z" stroke="currentColor" strokeWidth="2" />
      <path d="M18 20v-4H6a2 2 0 0 0-2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconShield({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 3l7 3v6c0 5-3 8-7 9-4-1-7-4-7-9V6l7-3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function IconPaperPlane({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M21 3L3 11l7 2 2 7 9-17z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export default function MainSiteContactPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitMessage(null);
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
        throw new Error(json.error ?? "Failed to send message");
      }

      setSubmitMessage("Thanks! Your message has been sent.");
      setFirstName("");
      setLastName("");
      setWorkEmail("");
      setTopic("");
      setMessage("");
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : "Failed to send message";
      setSubmitMessage(errMessage);
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
              Get in touch with us
            </h1>
            <p className="text-lg text-slate-600">
              Whether you have a question about features, pricing, or anything else, our team is ready
              to answer all your questions.
            </p>
          </div>

          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="space-y-8 lg:col-span-5">
              <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-sm">
                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#14b8a6] to-[#9ceee5]" />
                <h3 className="mb-4 text-xl font-bold text-white">Our Promise</h3>
                <p className="mb-6 text-sm text-slate-300">
                  We aim to respond to all inquiries within 2 hours during regular business hours.
                  Your success is our priority.
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-[#9ceee5]">
                  <IconClock className="h-4 w-4 text-[#14b8a6]" />
                  <span>Average response time:</span>
                  <span className="text-white">Under 2 hours</span>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <h3 className="mb-6 text-lg font-bold text-slate-900">Direct Contact</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ecfdfb] text-[#0ea5b7]">
                      <IconEnvelope className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Email Us</h4>
                      <p className="mb-1 text-sm text-slate-500">For general inquiries and support.</p>
                      <a href="mailto:hello@solohub.com" className="text-sm font-medium text-[#0ea5b7] hover:underline">
                        hello@solohub.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
                      <IconComments className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Live Chat</h4>
                      <p className="mb-2 text-sm text-slate-500">Chat with our support team in real-time.</p>
                      <button className="inline-flex items-center rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200">
                        Start Chat <IconArrowRight className="ml-1 h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <a href="#faqs" className="flex items-center gap-2 transition-colors hover:text-[#0ea5b7]">
                  <IconBook className="h-4 w-4" /> Read FAQs
                </a>
                <span className="text-slate-300">•</span>
                <a href="#footer" className="flex items-center gap-2 transition-colors hover:text-[#0ea5b7]">
                  <IconShield className="h-4 w-4" /> Privacy Policy
                </a>
              </div>
            </div>

            <div className="lg:col-span-7">
              <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <h2 className="mb-6 text-2xl font-bold text-slate-900">Send us a message</h2>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="firstName">
                        First Name
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        placeholder="Jane"
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition-all focus:border-[#14b8a6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/20"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="lastName">
                        Last Name
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        placeholder="Doe"
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition-all focus:border-[#14b8a6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="workEmail">
                      Work Email
                    </label>
                    <input
                      id="workEmail"
                      type="email"
                      value={workEmail}
                      onChange={(e) => setWorkEmail(e.target.value)}
                      required
                      placeholder="jane@company.com"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition-all focus:border-[#14b8a6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="topic">
                      How can we help?
                    </label>
                    <select
                      id="topic"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      required
                      className="w-full cursor-pointer appearance-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition-all focus:border-[#14b8a6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/20"
                    >
                      <option value="" disabled>
                        Select a topic...
                      </option>
                      <option value="sales">Sales Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="billing">Billing Question</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="message">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      placeholder="Tell us more about your inquiry..."
                      className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition-all focus:border-[#14b8a6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#14b8a6] py-3.5 text-base font-bold text-white shadow-lg shadow-[#14b8a6]/20 transition-colors hover:bg-[#0ea5b7] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                    <IconPaperPlane className="h-4 w-4" />
                  </button>
                  {submitMessage ? (
                    <p className="text-center text-xs text-slate-600">{submitMessage}</p>
                  ) : null}

                  <p className="mt-4 text-center text-xs text-slate-500">
                    By submitting this form, you agree to our{" "}
                    <a href="#footer" className="text-[#0ea5b7] hover:underline">
                      Privacy Policy
                    </a>.
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

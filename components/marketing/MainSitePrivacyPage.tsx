 "use client";

import MainSiteFooter from "@/components/marketing/MainSiteFooter";
import MainSiteHeader from "@/components/marketing/MainSiteHeader";
import { SearchIcon, ShieldIcon } from "@/components/ui/Icons";
import { useEffect, useRef, useState } from "react";

export default function MainSitePrivacyPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const articleRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = articleRef.current;
    if (!root) return;

    const clearHighlights = () => {
      const marks = root.querySelectorAll("mark[data-policy-highlight='true']");
      marks.forEach((mark) => {
        const parent = mark.parentNode;
        if (!parent) return;
        parent.replaceChild(document.createTextNode(mark.textContent ?? ""), mark);
        parent.normalize();
      });
    };

    clearHighlights();

    const query = searchQuery.trim();
    if (!query) {
      return;
    }

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedQuery, "gi");

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue?.trim()) return NodeFilter.FILTER_REJECT;
        const parentEl = node.parentElement;
        if (!parentEl) return NodeFilter.FILTER_REJECT;
        if (parentEl.closest("mark")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const textNodes: Text[] = [];
    let current = walker.nextNode();
    while (current) {
      textNodes.push(current as Text);
      current = walker.nextNode();
    }

    textNodes.forEach((textNode) => {
      const value = textNode.nodeValue ?? "";
      regex.lastIndex = 0;
      if (!regex.test(value)) return;

      const frag = document.createDocumentFragment();
      let lastIndex = 0;
      value.replace(regex, (match, offset: number) => {
        if (offset > lastIndex) {
          frag.appendChild(document.createTextNode(value.slice(lastIndex, offset)));
        }
        const mark = document.createElement("mark");
        mark.dataset.policyHighlight = "true";
        mark.className = "rounded bg-yellow-200 px-0.5";
        mark.textContent = match;
        frag.appendChild(mark);
        lastIndex = offset + match.length;
        return match;
      });
      if (lastIndex < value.length) {
        frag.appendChild(document.createTextNode(value.slice(lastIndex)));
      }
      textNode.parentNode?.replaceChild(frag, textNode);
    });

  }, [searchQuery]);

  return (
    <div
      className="min-h-screen bg-[#f8fafc] text-slate-900"
      style={{
        backgroundImage:
          "radial-gradient(at 40% 20%, hsla(173, 100%, 76%, 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189, 100%, 56%, 0.15) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355, 100%, 93%, 0.1) 0px, transparent 50%)",
      }}
    >
      <MainSiteHeader active="privacy" />

      <main
        id="main-content"
        className="flex min-h-[100vh] w-full flex-col items-center px-4 pb-24 pt-32"
      >
        <section
          id="legal-header"
          className="mx-auto mb-16 w-full max-w-4xl px-4 text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#ccfbf1] bg-[#ecfdfb] px-4 py-2 text-sm font-medium text-[#0ea5b7] shadow-sm">
            <ShieldIcon className="h-4 w-4" />
            Last Updated: April 15, 2026
          </div>
          <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-6xl lg:text-7xl">
            Privacy &amp; Terms
          </h1>
          <p className="mx-auto max-w-2xl text-xl leading-relaxed text-slate-600">
            We believe in transparency and protecting your data. Here
            you&apos;ll find our complete privacy policy, terms of service, and
            cookie guidelines.
          </p>
        </section>

        <section id="doc-nav" className="mx-auto mb-16 w-full max-w-4xl px-4">
          <div className="sticky top-24 z-40 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur-md md:flex-row md:p-6">
            <div className="flex w-full flex-wrap gap-2 md:w-auto">
              <a
                href="#privacy"
                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
              >
                Privacy Policy
              </a>
              <a
                href="#terms"
                className="rounded-lg border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
              >
                Terms of Service
              </a>
              <a
                href="#cookies"
                className="rounded-lg border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
              >
                Cookie Policy
              </a>
            </div>
            <div className="relative w-full md:w-64">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search policies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 transition-all focus:border-[#14b8a6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/20"
              />
            </div>
          </div>
        </section>

        <section
          id="legal-content"
          className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-12 px-4 md:grid-cols-12"
        >
          <aside className="relative hidden md:col-span-3 md:block">
            <div className="sticky top-48 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                Contents
              </h4>
              <nav className="space-y-3">
                <a
                  href="#privacy"
                  className="block border-l-2 border-[#14b8a6] pl-3 text-sm font-medium text-[#0ea5b7]"
                >
                  1. Privacy Policy
                </a>
                <a
                  href="#data-collection"
                  className="block pl-4 text-sm text-slate-500 hover:text-slate-800"
                >
                  1.1 Information We Collect
                </a>
                <a
                  href="#data-usage"
                  className="block pl-4 text-sm text-slate-500 hover:text-slate-800"
                >
                  1.2 Data Usage
                </a>
                <a
                  href="#gdpr"
                  className="block pl-4 text-sm text-slate-500 hover:text-slate-800"
                >
                  1.3 AVG (GDPR) Compliance
                </a>
                <a
                  href="#terms"
                  className="mt-4 block border-l-2 border-transparent pl-3 text-sm font-medium text-slate-700 hover:border-slate-300 hover:text-slate-900"
                >
                  2. Terms of Service
                </a>
                <a
                  href="#account"
                  className="block pl-4 text-sm text-slate-500 hover:text-slate-800"
                >
                  2.1 Account Terms
                </a>
                <a
                  href="#payment"
                  className="block pl-4 text-sm text-slate-500 hover:text-slate-800"
                >
                  2.2 Payment &amp; Refunds
                </a>
                <a
                  href="#cookies"
                  className="mt-4 block border-l-2 border-transparent pl-3 text-sm font-medium text-slate-700 hover:border-slate-300 hover:text-slate-900"
                >
                  3. Cookie Policy
                </a>
              </nav>
            </div>
          </aside>

          <article
            ref={articleRef}
            className="prose prose-slate max-w-none rounded-2xl border border-slate-200 bg-white p-8 shadow-sm md:col-span-9 md:p-12"
          >
            <div id="privacy" className="mb-16">
              <h2 className="!mt-0 mb-6 text-3xl font-extrabold text-slate-900">
                1. Privacy Policy
              </h2>
              <p className="mb-6 text-lg text-slate-600">
                At SoloHub, your privacy isn’t an afterthought—it’s built into
                the code. We collect the minimum information necessary to help
                you run your business. We are fully committed to ensuring that
                your information is secure and protected according to the
                highest industry and EU standards.
              </p>

              <h3
                id="data-collection"
                className="mb-4 mt-10 text-xl font-bold text-slate-800"
              >
                1.1 Information We Collect
              </h3>
              <p className="mb-4 text-slate-600">
                We only collect data that helps us provide a better, more stable
                service.
              </p>
              <ul className="mb-8 list-disc space-y-2 pl-6 text-slate-600">
                <li>
                  <strong>Account Information:</strong> Name, business email
                  address, and profile details you provide when you register.
                  (If your partner’s information is added, that is collected as
                  well).
                </li>
                <li>
                  <strong>Business Data:</strong> Information about how you
                  interact with our platform, including your uploaded website
                  content (images, text) and client appointment data. This data
                  belongs exclusively to you.
                </li>
                <li>
                  <strong>Usage Data:</strong> Anonymized information about how
                  you interact with our platform (features used, time logged)
                  so we can fix bugs and improve stability.
                </li>
                <li>
                  <strong>Payment Information:</strong> Processed securely
                  through our third-party provider (e.g., Stripe/iDEAL).
                  SoloHub does not store your full credit card details.
                </li>
              </ul>

              <h3
                id="data-usage"
                className="mb-4 mt-10 text-xl font-bold text-slate-800"
              >
                1.2 How We Use Your Data
              </h3>
              <p className="mb-4 text-slate-600">
                We use data to keep SoloHub running and to improve it. We will
                never sell your data to third parties.
              </p>
              <ul className="mb-8 list-disc space-y-2 pl-6 text-slate-600">
                <li>To maintain your website and booking system.</li>
                <li>To send you essential service updates.</li>
                <li>To provide direct 1-on-1 support from the founders.</li>
                <li>
                  To gather anonymized analysis so we can make SoloHub simpler.
                </li>
              </ul>

              <h3 id="gdpr" className="mb-4 mt-10 text-xl font-bold text-slate-800">
                1.3 AVG (GDPR) Compliance (The Netherlands)
              </h3>
              <p className="mb-4 text-slate-600">
                Because we are based in the Netherlands, we fully adhere to the
                AVG (Algemene Verordening Gegevensbescherming). If you are a
                resident of the European Economic Area (EEA), you have complete
                control over your data.
              </p>
              <p className="mb-2 font-semibold text-slate-900">Your Rights Include:</p>
              <ul className="mb-8 list-disc space-y-2 pl-6 text-slate-600">
                <li>
                  <strong>The Right to be Forgotten:</strong> You can ask us to
                  permanently delete your personal data.
                </li>
                <li>
                  <strong>The Right to Portability:</strong> You can request a
                  copy of the client and booking data you uploaded.
                </li>
                <li>
                  <strong>The Right to Correction:</strong> You can update
                  inaccurate information in your account settings.
                </li>
              </ul>
            </div>

            <hr className="my-12 border-slate-200" />

            <div id="terms" className="mb-16">
              <h2 className="mb-6 text-3xl font-extrabold text-slate-900">
                2. Terms of Service
              </h2>
              <p className="mb-6 text-lg text-slate-600">
                By using SoloHub, you agree to these Terms. If you disagree,
                you are unable to use the service. Our goal is to keep these
                terms as &quot;No-Nonsense&quot; as possible, matching the values
                of our platform.
              </p>

              <h3
                id="account"
                className="mb-4 mt-10 text-xl font-bold text-slate-800"
              >
                2.1 Account Terms &amp; Our Commitment
              </h3>
              <p className="mb-4 text-slate-600">
                You must provide accurate information when creating your account.
                Accuracy is critical, especially since this data is used for your
                public website and client communications.
              </p>
              <p className="mb-8 text-slate-600">
                You are responsible for keeping your password secure. Our
                guarantee: SoloHub commits to a 99.9% uptime goal, because when
                your website is down, you are not getting bookings. We reserve
                the right to modify or terminate the Service for any reason,
                without notice, at any time.
              </p>

              <h3
                id="payment"
                className="mb-4 mt-10 text-xl font-bold text-slate-800"
              >
                2.2 Payment, Pricing &amp; Refunds
              </h3>
              <p className="mb-4 text-slate-600">
                <strong>EUR15 Lifetime Promise:</strong> If you are part of our
                Founding Member cohort and locked in our launch price, that
                price is your monthly rate for life, as long as your account
                remains active.
              </p>
              <ul className="mb-8 list-disc space-y-2 pl-6 text-slate-600">
                <li>We require a valid payment method (e.g., SEPA, credit card).</li>
                <li>
                  14-Day Money-Back Guarantee: if SoloHub is not the right fit,
                  we refund your first month&apos;s subscription within 14 days of
                  sign-up.
                </li>
              </ul>
            </div>

            <hr className="my-12 border-slate-200" />

            <div id="cookies" className="mb-8">
              <h2 className="mb-6 text-3xl font-extrabold text-slate-900">
                3. Cookie Policy
              </h2>
              <p className="mb-6 text-lg text-slate-600">
                Like almost all modern platforms, we use cookies to make your
                experience smoother. Cookies are small files stored on your
                device that hold certain information (e.g., keeping you logged
                in).
              </p>
              <ul className="mb-8 list-disc space-y-2 pl-6 text-slate-600">
                <li>
                  <strong>Essential Cookies:</strong> Required for basic
                  SoloHub functions (session and login).
                </li>
                <li>
                  <strong>Performance Cookies:</strong> Help us understand
                  feature usage in anonymized form.
                </li>
                <li>
                  You can instruct your browser to refuse all cookies. If you
                  do, some parts of the SoloHub Dashboard may not function.
                </li>
              </ul>
            </div>
          </article>
        </section>
      </main>

      <MainSiteFooter />
    </div>
  );
}

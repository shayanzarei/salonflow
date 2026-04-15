import MainSiteFooter from "@/components/marketing/MainSiteFooter";
import MainSiteHeader from "@/components/marketing/MainSiteHeader";
import { SearchIcon, ShieldIcon } from "@/components/ui/Icons";

function FileExportIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M14 3v6h6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M12 11v6M9.5 14.5 12 17l2.5-2.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function MainSitePrivacyPage() {
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
            Last Updated: October 15, 2024
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
                  1.1 Data Collection
                </a>
                <a
                  href="#data-usage"
                  className="block pl-4 text-sm text-slate-500 hover:text-slate-800"
                >
                  1.2 Data Usage
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

          <article className="prose prose-slate max-w-none rounded-2xl border border-slate-200 bg-white p-8 shadow-sm md:col-span-9 md:p-12">
            <div id="privacy" className="mb-16">
              <h2 className="!mt-0 mb-6 text-3xl font-extrabold text-slate-900">
                1. Privacy Policy
              </h2>
              <p className="mb-6 text-lg text-slate-600">
                At SoloHub, we take your privacy seriously. This policy
                describes what personal information we collect and how we use
                it. We are committed to ensuring that your information is secure
                and protected according to industry standards.
              </p>

              <h3
                id="data-collection"
                className="mb-4 mt-10 text-xl font-bold text-slate-800"
              >
                1.1 Information We Collect
              </h3>
              <p className="mb-4 text-slate-600">
                We collect information to provide better services to all our
                users. The types of information we collect include:
              </p>
              <ul className="mb-8 list-disc space-y-2 pl-6 text-slate-600">
                <li>
                  <strong>Account Information:</strong> Name, email address,
                  password, and profile details when you register.
                </li>
                <li>
                  <strong>Usage Data:</strong> Information about how you
                  interact with our platform, including features used and time
                  spent.
                </li>
                <li>
                  <strong>Device Information:</strong> IP address, browser type,
                  operating system, and device identifiers.
                </li>
                <li>
                  <strong>Payment Information:</strong> Processed securely
                  through our third-party payment providers (we do not store
                  full credit card details).
                </li>
              </ul>

              <div className="my-8 rounded-r-xl border-l-4 border-[#14b8a6] bg-slate-50 p-6">
                <h4 className="mb-2 flex items-center gap-2 font-bold text-slate-900">
                  <ShieldIcon className="h-4 w-4 text-[#14b8a6]" />
                  GDPR Compliance
                </h4>
                <p className="text-sm text-slate-600">
                  If you are a resident of the European Economic Area (EEA), you
                  have certain data protection rights. SoloHub aims to take
                  reasonable steps to allow you to correct, amend, delete, or
                  limit the use of your Personal Data.
                </p>
              </div>

              <h3
                id="data-usage"
                className="mb-4 mt-10 text-xl font-bold text-slate-800"
              >
                1.2 How We Use Your Data
              </h3>
              <p className="mb-4 text-slate-600">
                We use the collected data for various purposes, including:
              </p>
              <ul className="mb-8 list-disc space-y-2 pl-6 text-slate-600">
                <li>To provide and maintain our Service.</li>
                <li>To notify you about changes to our Service.</li>
                <li>To provide customer support and respond to inquiries.</li>
                <li>
                  To gather analysis or valuable information so that we can
                  improve our Service.
                </li>
                <li>
                  To monitor the usage of our Service and detect technical
                  issues.
                </li>
              </ul>
            </div>

            <hr className="my-12 border-slate-200" />

            <div id="terms" className="mb-16">
              <h2 className="mb-6 text-3xl font-extrabold text-slate-900">
                2. Terms of Service
              </h2>
              <p className="mb-6 text-lg text-slate-600">
                By accessing or using SoloHub, you agree to be bound by these
                Terms. If you disagree with any part of the terms, then you may
                not access the Service.
              </p>

              <h3
                id="account"
                className="mb-4 mt-10 text-xl font-bold text-slate-800"
              >
                2.1 Account Terms
              </h3>
              <p className="mb-4 text-slate-600">
                When you create an account with us, you must provide information
                that is accurate, complete, and current at all times. Failure to
                do so constitutes a breach of the Terms, which may result in
                immediate termination of your account on our Service.
              </p>
              <p className="mb-8 text-slate-600">
                You are responsible for safeguarding the password that you use
                to access the Service and for any activities or actions under
                your password.
              </p>

              <h3
                id="payment"
                className="mb-4 mt-10 text-xl font-bold text-slate-800"
              >
                2.2 Payment &amp; Refunds
              </h3>
              <p className="mb-4 text-slate-600">
                A valid payment method is required to process the payment for
                your subscription. You shall provide SoloHub with accurate and
                complete billing information. By submitting such payment
                information, you automatically authorize SoloHub to charge all
                subscription fees incurred through your account to any such
                payment instruments.
              </p>
              <p className="mb-8 text-slate-600">
                Refunds are processed according to our specific refund policy
                outlined on our Pricing page. Generally, we offer a 14-day
                money-back guarantee for new subscriptions.
              </p>
            </div>

            <hr className="my-12 border-slate-200" />

            <div id="cookies" className="mb-8">
              <h2 className="mb-6 text-3xl font-extrabold text-slate-900">
                3. Cookie Policy
              </h2>
              <p className="mb-6 text-lg text-slate-600">
                We use cookies and similar tracking technologies to track the
                activity on our Service and hold certain information.
              </p>
              <p className="mb-4 text-slate-600">
                Cookies are files with small amount of data which may include an
                anonymous unique identifier. Cookies are sent to your browser
                from a website and stored on your device. Tracking technologies
                also used are beacons, tags, and scripts to collect and track
                information and to improve and analyze our Service.
              </p>
              <p className="mb-8 text-slate-600">
                You can instruct your browser to refuse all cookies or to
                indicate when a cookie is being sent. However, if you do not
                accept cookies, you may not be able to use some portions of our
                Service.
              </p>
            </div>
          </article>
        </section>
      </main>

      <MainSiteFooter />
    </div>
  );
}

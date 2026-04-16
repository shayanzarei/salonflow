import {
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
} from "@/components/ui/Icons";
import Link from "next/link";

export default function MainSiteFooter() {
  return (
    <footer
      id="footer"
      className="border-t border-slate-100 bg-white px-8 pb-10 pt-20"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 md:grid-cols-4 md:gap-12">
        <div className="col-span-1 md:col-span-1">
          <Link
            href="/"
            className="mb-6 inline-flex items-center"
            aria-label="Go to SoloHub home"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://6vgmy5o5gznqt4ax.public.blob.vercel-storage.com/uploads/SoloHub%20logo%20png.png"
              alt="SoloHub"
              className="h-14 w-auto"
            />
          </Link>
          <p className="mb-6 text-sm text-slate-500">
            The operating system for independent professionals.
          </p>
          <div className="flex space-x-4 text-slate-400">
            <a href="#" className="transition-colors hover:text-[#11c4b6]">
              <InstagramIcon className="h-5 w-5" />
            </a>
            <a href="#" className="transition-colors hover:text-[#11c4b6]">
              <FacebookIcon className="h-5 w-5" />
            </a>
            <a href="#" className="transition-colors hover:text-[#11c4b6]">
              <YoutubeIcon className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-bold text-slate-900">Product</h4>
          <ul className="space-y-3 text-sm text-slate-500">
            <li>
              <a
                href="/pricing"
                className="transition-colors hover:text-[#0ea5b7]"
              >
                Pricing
              </a>
            </li>
            <li>
              <a
                href="/book-demo"
                className="transition-colors hover:text-[#0ea5b7]"
              >
                Book a Demo
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-bold text-slate-900">Resources</h4>
          <ul className="space-y-3 text-sm text-slate-500">
            <li>
              <a
                href="/blog"
                className="transition-colors hover:text-[#0ea5b7]"
              >
                Blog
              </a>
            </li>
            <li>
              <a href="/faq" className="transition-colors hover:text-[#0ea5b7]">
                FAQs
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-bold text-slate-900">Company</h4>
          <ul className="space-y-3 text-sm text-slate-500">
            <li>
              <a
                href="/about"
                className="transition-colors hover:text-[#0ea5b7]"
              >
                About Us
              </a>
            </li>
            <li>
              <a
                href="/contact"
                className="transition-colors hover:text-[#0ea5b7]"
              >
                Contact
              </a>
            </li>
            <li>
              <a
                href="/privacy"
                className="transition-colors hover:text-[#0ea5b7]"
              >
                Privacy &amp; Terms
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-16 flex max-w-7xl flex-col items-center justify-between border-t border-slate-100 pt-8 text-sm text-slate-400 md:flex-row">
        <p>© 2024 SoloHub Inc. All rights reserved.</p>
        <div className="mt-4 flex space-x-6 md:mt-0">
          <a href="/privacy" className="hover:text-slate-600">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:text-slate-600">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}

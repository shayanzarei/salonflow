import MainSiteFooter from "@/components/marketing/MainSiteFooter";
import MainSiteHeader from "@/components/marketing/MainSiteHeader";
import {
  ArrowRightIcon,
  EyeIcon,
  HandIcon,
  ShieldIcon,
  SparkleIcon,
  TrendingUpIcon,
  TrophyIcon,
  UsersIcon,
} from "@/components/ui/Icons";
import Link from "next/link";

const TEAM = [
  {
    name: "Shayan Zarei",
    role: "Founder & CTO",
    bio: "The technical heart of SoloHub. Dedicated to building clean, fast, and reliable tools for the Dutch market.",
    avatar:
      "https://lh3.googleusercontent.com/a/ACg8ocIdY9K-5grmtCyN542fzz2HWDPJeIvL6NvpMs8k7aUqJOwGnKA=s288-c-no",
  },
  {
    name: "Aryana nayeri",
    role: "Co-Founder & Industry Lead",
    bio: 'The "Real World" voice. A Physiotherapist who ensures every feature solves a real problem for service-based businesses.',
    avatar:
      "https://media.licdn.com/dms/image/v2/D4E03AQFWxq6hTS1UPA/profile-displayphoto-shrink_200_200/B4EZTIfdajGYAc-/0/1738530478335?e=1778112000&v=beta&t=uD8lxGIibO7-XFicbe3s46vwTYfValY04mWA2S5hnL8",
  },
];

const VALUES = [
  {
    title: "Empathy First",
    desc: "We built this for our own family practice. We understand the stress of a busy schedule because we live it every day.",
    Icon: HandIcon,
    bg: "bg-[#ecfdfb]",
    color: "text-[#0ea5b7]",
  },
  {
    title: "Simplicity Over Everything",
    desc: "If it's not easy enough to use between clients, it’s not in SoloHub.",
    Icon: SparkleIcon,
    bg: "bg-blue-100",
    color: "text-blue-600",
  },
  {
    title: "Local Support",
    desc: "No call centers. You have a direct line to the founders who actually built the code.",
    Icon: TrendingUpIcon,
    bg: "bg-green-100",
    color: "text-green-600",
  },
  {
    title: "Professionalism for All:",
    desc: "We believe a solo-entrepreneur deserves a website that looks as high-end as a major clinic.",
    Icon: ShieldIcon,
    bg: "bg-purple-100",
    color: "text-purple-600",
  },
];

export default function MainSiteAboutPage() {
  return (
    <div
      className="min-h-screen bg-[#f8fafc] text-slate-900"
      style={{
        backgroundImage:
          "radial-gradient(at 40% 20%, hsla(173, 100%, 76%, 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189, 100%, 56%, 0.15) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355, 100%, 93%, 0.1) 0px, transparent 50%)",
      }}
    >
      <MainSiteHeader active="home" />

      <main>
        <section id="hero-about" className="px-8 py-32">
          <div className="mx-auto max-w-7xl text-center">
            <div className="mb-8 inline-flex items-center rounded-full bg-[#ccfbf1] px-5 py-2 text-sm font-semibold text-[#0ea5b7]">
              <UsersIcon className="mr-2 h-4 w-4" />
              About SoloHub
            </div>
            <h1 className="mx-auto mb-8 max-w-4xl text-6xl font-bold leading-tight tracking-tight text-slate-900 lg:text-7xl">
              Built by specialists, for specialists.
            </h1>
            <p className="mx-auto mb-12 max-w-3xl text-2xl leading-relaxed text-slate-600">
              We’re on a mission to give independent professionals their time
              back—so you can focus on your craft, not your admin.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="flex items-center justify-center space-x-2 rounded-full bg-[#14b8a6] px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-[#14b8a6]/30 transition-colors hover:bg-[#0ea5b7]"
              >
                <span>Get Started</span>
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="flex items-center justify-center space-x-2 rounded-full border border-slate-200 bg-white px-8 py-4 text-lg font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-50"
              >
                <span>Contact Us</span>
              </Link>
            </div>
          </div>
        </section>

        <section id="story-section" className="bg-white px-8 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
              <div>
                <div className="mb-6 inline-block rounded-full bg-[#ecfdfb] px-4 py-2 text-sm font-semibold text-[#0ea5b7]">
                  Our Story
                </div>
                <h2 className="mb-6 text-5xl font-bold tracking-tight text-slate-900">
                  It started with a kitchen table conversation.
                </h2>
                <div className="space-y-6 text-lg leading-relaxed text-slate-600">
                  <p>
                    In 2025, my partner was running her own Physiotherapy
                    practice. She was a master of her craft, but success brought
                    a hidden cost: administrative chaos.
                  </p>
                  <p>
                    Every evening was spent chasing appointments via WhatsApp,
                    manually updating a messy calendar, and trying to make a
                    basic social media profile look like a professional
                    business. One Sunday night, after hours of trying to fix a
                    scheduling conflict instead of relaxing, we realized there
                    had to be a better way.
                  </p>
                  <p>
                    We combined her &apos;on-the-ground&apos; industry
                    experience with my technical background as a developer. We
                    didn&apos;t want a complex corporate tool; we wanted a
                    &apos;Digital Partner&apos; that makes you look professional
                    in minutes. That frustration became SoloHub.
                  </p>
                  <p className="font-semibold text-slate-900">
                    That frustration became SoloHub.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div
                  className="rounded-2xl p-4"
                  style={{
                    background: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: "1px solid rgba(255, 255, 255, 0.5)",
                    boxShadow:
                      "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03), 0 20px 25px -5px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="h-auto w-full rounded-xl object-cover"
                    src="https://6vgmy5o5gznqt4ax.public.blob.vercel-storage.com/uploads/Gemini_Generated_Image_au2zjnau2zjnau2z%20%281%29.png"
                    alt="frustrated freelancer at messy desk with multiple screens and papers, late night work, realistic photography"
                  />
                </div>
                <div className="absolute -bottom-30 right-3 max-w-[220px] rounded-2xl border border-slate-100 bg-white p-4 shadow-2xl sm:-bottom-10 sm:right-4 sm:max-w-xs sm:p-6 lg:-bottom-20 lg:-right-20">
                  <div className="mb-3 flex items-center space-x-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                      <TrophyIcon className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-slate-900">
                        10+ hrs
                      </div>
                      <div className="text-sm text-slate-500">
                        Our Weekly Goal for You
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">
                    We designed SoloHub to automate up to 10 hours of manual
                    admin work every week
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="mission-vision" className="bg-white px-8 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
              <div
                className="rounded-3xl border border-[#ccfbf1] p-12 shadow-lg"
                style={{
                  background: "rgba(255, 255, 255, 0.8)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
              >
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ccfbf1]">
                  <TrendingUpIcon className="h-8 w-8 text-[#0ea5b7]" />
                </div>
                <h3 className="mb-6 text-4xl font-bold text-slate-900">
                  Our Mission
                </h3>
                <p className="mb-6 text-xl leading-relaxed text-slate-600">
                  To eliminate the digital hurdles that stop specialists from
                  doing their best work. We believe you shouldn&apos;t have to
                  be a tech expert to run a beautiful, professional business.
                </p>
              </div>
              <div
                className="rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-12 shadow-lg"
                style={{
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
              >
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100">
                  <EyeIcon className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="mb-6 text-4xl font-bold text-slate-900">
                  Our Vision
                </h3>
                <p className="mb-6 text-xl leading-relaxed text-slate-600">
                  A world where every solo professional in the Netherlands has a
                  digital home that works as hard as they do. Simple, powerful,
                  and built for humans.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="values-section"
          className="bg-gradient-to-br from-slate-50 to-white px-8 py-24"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-20 text-center">
              <h2 className="mb-6 text-5xl font-bold tracking-tight text-slate-900">
                Our Core Values
              </h2>
              <p className="mx-auto max-w-3xl text-xl text-slate-600">
                These principles guide every decision we make, from product
                features to customer support.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
              {VALUES.map((value) => (
                <article
                  key={value.title}
                  className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-lg"
                >
                  <div
                    className={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl ${value.bg}`}
                  >
                    <value.Icon className={`h-7 w-7 ${value.color}`} />
                  </div>
                  <h4 className="mb-4 text-2xl font-bold text-slate-900">
                    {value.title}
                  </h4>
                  <p className="leading-relaxed text-slate-600">{value.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="team-section"
          className="px-8 py-24"
          style={{
            backgroundImage:
              "radial-gradient(at 40% 20%, hsla(173, 100%, 76%, 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189, 100%, 56%, 0.15) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355, 100%, 93%, 0.1) 0px, transparent 50%)",
          }}
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-20 text-center">
              <h2 className="mb-6 text-5xl font-bold tracking-tight text-slate-900">
                Meet the Team
              </h2>
              <p className="mx-auto max-w-3xl text-xl text-slate-600">
                A small, passionate team of builders who care deeply about
                making your work life better.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {TEAM.map((member) => (
                <article
                  key={member.name}
                  className="group rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-lg sm:p-5"
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-[160px_1fr] sm:gap-5">
                    <div className="relative overflow-hidden rounded-xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={member.avatar}
                        className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-full sm:min-h-[180px]"
                        alt={member.name}
                      />
                    </div>
                    <div className="flex flex-col justify-center text-left">
                      <h4 className="mb-1 text-xl font-bold text-slate-900">
                        {member.name}
                      </h4>
                      <p className="mb-3 text-sm font-semibold text-[#0ea5b7]">
                        {member.role}
                      </p>
                      <p className="text-sm leading-relaxed text-slate-600">
                        {member.bio}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <MainSiteFooter />
    </div>
  );
}

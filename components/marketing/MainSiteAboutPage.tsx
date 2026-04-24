"use client";

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
import { useLocale } from "@/lib/i18n/context";
import Link from "next/link";
import { Button } from "../ds/Button";

const TEAM_AVATARS = [
  "https://lh3.googleusercontent.com/a/ACg8ocIdY9K-5grmtCyN542fzz2HWDPJeIvL6NvpMs8k7aUqJOwGnKA=s288-c-no",
  "https://media.licdn.com/dms/image/v2/D4E03AQFWxq6hTS1UPA/profile-displayphoto-shrink_200_200/B4EZTIfdajGYAc-/0/1738530478335?e=1778112000&v=beta&t=uD8lxGIibO7-XFicbe3s46vwTYfValY04mWA2S5hnL8",
] as const;

const VALUE_STYLES = [
  { Icon: HandIcon, bg: "bg-brand-50", color: "text-brand-700" },
  { Icon: SparkleIcon, bg: "bg-blue-100", color: "text-blue-600" },
  { Icon: TrendingUpIcon, bg: "bg-green-100", color: "text-green-600" },
  { Icon: ShieldIcon, bg: "bg-purple-100", color: "text-purple-600" },
] as const;

export default function MainSiteAboutPage() {
  const { t } = useLocale();
  const m = t.marketing;

  return (
    <div
      className="min-h-screen bg-[#f8fafc] text-slate-900"
      style={{
        backgroundImage:
          "radial-gradient(at 40% 20%, hsla(262, 90%, 76%, 0.18) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(280, 90%, 65%, 0.15) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(38, 100%, 90%, 0.12) 0px, transparent 50%)",
      }}
    >
      <MainSiteHeader active="about" />

      <main>
        <section id="hero-about" className="px-8 py-32">
          <div className="mx-auto max-w-7xl text-center">
            <div className="mb-8 inline-flex items-center rounded-full bg-brand-100 px-5 py-2 text-sm font-semibold text-brand-700">
              <UsersIcon className="mr-2 h-4 w-4" />
              {m.aboutHeroBadge}
            </div>
            <h1 className="mx-auto mb-8 max-w-4xl text-6xl font-bold leading-tight tracking-tight text-slate-900 lg:text-7xl">
              {m.aboutHeroTitle}
            </h1>
            <p className="mx-auto mb-12 max-w-3xl text-2xl leading-relaxed text-slate-600">
              {m.aboutHeroLead}
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild>
                <Link href="/signup">
                  <span>{t.nav.getStarted}</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="secondary" asChild className="space-x-2">
                <Link href="/contact">
                  <span>{m.aboutHeroSecondaryCta}</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="story-section" className="bg-white px-8 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
              <div>
                <div className="mb-6 inline-block rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
                  {t.nav.about}
                </div>
                <h2 className="mb-6 text-5xl font-bold tracking-tight text-slate-900">
                  {m.aboutStoryTitle}
                </h2>
                <div className="space-y-6 text-lg leading-relaxed text-slate-600">
                  <p>{m.aboutStoryParagraph1}</p>
                  <p>{m.aboutStoryParagraph2}</p>
                  <p>{m.aboutStoryParagraph3}</p>
                  <p className="font-semibold text-slate-900">
                    {m.aboutStoryClosing}
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
                    alt={m.aboutStoryImageAlt}
                  />
                </div>
                <div className="absolute -bottom-30 right-3 max-w-[220px] rounded-2xl border border-slate-100 bg-white p-4 shadow-2xl sm:-bottom-10 sm:right-4 sm:max-w-xs sm:p-6 lg:-bottom-20 lg:-right-20">
                  <div className="mb-3 flex items-center space-x-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                      <TrophyIcon className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-slate-900">
                        {m.aboutStatHeadline}
                      </div>
                      <div className="text-sm text-slate-500">
                        {m.aboutStatSub}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">{m.aboutStatBlurb}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="mission-vision" className="bg-white px-8 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
              <div
                className="rounded-3xl border border-brand-100 p-12 shadow-lg"
                style={{
                  background: "rgba(255, 255, 255, 0.8)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
              >
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100">
                  <TrendingUpIcon className="h-8 w-8 text-brand-700" />
                </div>
                <h3 className="mb-6 text-4xl font-bold text-slate-900">
                  {m.aboutMissionTitle}
                </h3>
                <p className="mb-6 text-xl leading-relaxed text-slate-600">
                  {m.aboutMissionBody}
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
                  {m.aboutVisionTitle}
                </h3>
                <p className="mb-6 text-xl leading-relaxed text-slate-600">
                  {m.aboutVisionBody}
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
                {m.aboutValuesTitle}
              </h2>
              <p className="mx-auto max-w-3xl text-xl text-slate-600">
                {m.aboutValuesSubtitle}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
              {m.aboutValuesItems.map((value, index) => {
                const style = VALUE_STYLES[index];
                if (!style) return null;
                const Icon = style.Icon;
                return (
                  <article
                    key={`${value.title}-${index}`}
                    className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-lg"
                  >
                    <div
                      className={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl ${style.bg}`}
                    >
                      <Icon className={`h-7 w-7 ${style.color}`} />
                    </div>
                    <h4 className="mb-4 text-2xl font-bold text-slate-900">
                      {value.title}
                    </h4>
                    <p className="leading-relaxed text-slate-600">{value.desc}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="team-section"
          className="px-8 py-24"
          style={{
            backgroundImage:
              "radial-gradient(at 40% 20%, hsla(262, 90%, 76%, 0.18) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(280, 90%, 65%, 0.15) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(38, 100%, 90%, 0.12) 0px, transparent 50%)",
          }}
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-20 text-center">
              <h2 className="mb-6 text-5xl font-bold tracking-tight text-slate-900">
                {m.aboutTeamTitle}
              </h2>
              <p className="mx-auto max-w-3xl text-xl text-slate-600">
                {m.aboutTeamSubtitle}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {m.aboutTeamMembers.map((member, index) => (
                <article
                  key={member.name}
                  className="group rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-lg sm:p-5"
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-[160px_1fr] sm:gap-5">
                    <div className="relative overflow-hidden rounded-xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={TEAM_AVATARS[index] ?? TEAM_AVATARS[0]}
                        className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-full sm:min-h-[180px]"
                        alt={member.name}
                      />
                    </div>
                    <div className="flex flex-col justify-center text-left">
                      <h4 className="mb-1 text-xl font-bold text-slate-900">
                        {member.name}
                      </h4>
                      <p className="mb-3 text-sm font-semibold text-brand-700">
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

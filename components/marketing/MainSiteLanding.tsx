import MainSiteAbout from "@/components/marketing/MainSiteAbout";
import MainSiteCta from "@/components/marketing/MainSiteCta";
import MainSiteFeatures from "@/components/marketing/MainSiteFeatures";
import MainSiteFooter from "@/components/marketing/MainSiteFooter";
import MainSiteHeader from "@/components/marketing/MainSiteHeader";
import MainSiteHero from "@/components/marketing/MainSiteHero";
import MainSitePainPoints from "@/components/marketing/MainSitePainPoints";

export default function MainSiteLanding() {
  return (
    <div
      className="min-h-screen bg-[#f8fafc] text-[#0f172a]"
      style={{
        backgroundImage:
          "radial-gradient(at 40% 20%, hsla(173, 100%, 76%, 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189, 100%, 56%, 0.15) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355, 100%, 93%, 0.1) 0px, transparent 50%)",
      }}
    >
      <MainSiteHeader active="home" />
      <MainSiteHero />
      <MainSitePainPoints />
      <MainSiteFeatures />
      <MainSiteAbout />
      <MainSiteCta />
      <MainSiteFooter />
    </div>
  );
}

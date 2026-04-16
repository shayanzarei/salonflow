import MainSiteFooter from "@/components/marketing/MainSiteFooter";
import MainSiteHeader from "@/components/marketing/MainSiteHeader";

type NavKey = "home" | "pricing" | "demo" | "faq" | "contact" | "privacy";

export function CheckoutResultLayout({
  headerActive = "pricing",
  children,
}: {
  headerActive?: NavKey;
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen bg-[#f8fafc] text-slate-900"
      style={{
        backgroundImage:
          "radial-gradient(at 40% 20%, hsla(173, 100%, 76%, 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189, 100%, 56%, 0.15) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355, 100%, 93%, 0.1) 0px, transparent 50%)",
      }}
    >
      <MainSiteHeader active={headerActive} />
      <main
        id="main-content"
        className="mx-auto flex min-h-[100vh] w-full max-w-7xl flex-col px-4 pb-24 pt-28 sm:px-8 sm:pt-32"
      >
        {children}
      </main>
      <MainSiteFooter />
    </div>
  );
}

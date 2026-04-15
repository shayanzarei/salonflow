import Link from "next/link";

export default function MainSiteMobileStickyCta() {
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
      <Link
        href="/login"
        className="flex w-full items-center justify-center space-x-2 rounded-full bg-[#11c4b6] py-4 font-bold text-white shadow-xl"
      >
        <span>Get My Setup</span>
        <span aria-hidden>→</span>
      </Link>
    </div>
  );
}

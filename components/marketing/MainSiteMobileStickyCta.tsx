import Link from "next/link";
import { MARKETING_BUTTON_PRIMARY } from "@/components/marketing/buttonStyles";
import { ArrowRightIcon } from "@/components/ui/Icons";

export default function MainSiteMobileStickyCta() {
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
      <Link
        href="/signup"
        className={`${MARKETING_BUTTON_PRIMARY} w-full space-x-2 shadow-xl`}
      >
        <span>Get My Setup</span>
        <ArrowRightIcon className="h-4 w-4" />
      </Link>
    </div>
  );
}

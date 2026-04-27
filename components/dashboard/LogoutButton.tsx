"use client";

import { Button } from "@/components/ds/Button";
import { LogoutIcon } from "@/components/ui/Icons";
import { useLocale } from "@/lib/i18n/context";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  const { t } = useLocale();

  return (
    <Button
      variant="ghost"
      size="md"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="w-full justify-start text-ink-500"
    >
      <LogoutIcon size={16} />
      <span>{t.common.logout}</span>
    </Button>
  );
}

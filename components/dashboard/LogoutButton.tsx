"use client";

import { LogoutIcon } from "@/components/ui/Icons";
import { useLocale } from "@/lib/i18n/context";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  const { t } = useLocale();

  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        minHeight: 44,
        padding: "10px 12px",
        borderRadius: 10,
        color: "#666",
        fontSize: 14,
        background: "none",
        border: "none",
        cursor: "pointer",
        width: "100%",
        textAlign: "left",
      }}
    >
      <LogoutIcon size={16} />
      <span>{t.common.logout}</span>
    </button>
  );
}

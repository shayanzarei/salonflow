import { BrushIcon, HandIcon, ScissorsIcon, SparkleIcon, StarIcon, TagIcon } from "@/components/ui/Icons";
import type { ReactNode } from "react";

export const SERVICE_CATEGORIES = [
  "Hair Care",
  "Nail Care",
  "Massage",
  "Skin Care",
  "Makeup",
  "Other",
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

const CATEGORY_STYLES: Record<
  string,
  { icon: ReactNode; color: string; bg: string; label: string }
> = {
  "Hair Care": {
    icon: <ScissorsIcon size={18} />,
    color: "#7C3AED",
    bg: "#F5F3FF",
    label: "Hair Care",
  },
  "Nail Care": {
    icon: <StarIcon size={18} />,
    color: "#EC4899",
    bg: "#FDF2F8",
    label: "Nail Care",
  },
  Massage: {
    icon: <HandIcon size={18} />,
    color: "#10B981",
    bg: "#ECFDF5",
    label: "Massage",
  },
  "Skin Care": {
    icon: <SparkleIcon size={18} />,
    color: "#3B82F6",
    bg: "#EFF6FF",
    label: "Skin Care",
  },
  Makeup: {
    icon: <BrushIcon size={18} />,
    color: "#EF4444",
    bg: "#FEF2F2",
    label: "Makeup",
  },
  Other: {
    icon: <TagIcon size={18} />,
    color: "#888",
    bg: "#F5F5F5",
    label: "Other",
  },
};

/** Infer style from free-text service name when category is missing or unknown. */
export function getCategoryStyleFromName(name: string) {
  const lower = name.toLowerCase();
  if (
    lower.includes("hair") ||
    lower.includes("cut") ||
    lower.includes("color") ||
    lower.includes("blowout") ||
    lower.includes("highlight")
  )
    return CATEGORY_STYLES["Hair Care"];
  if (
    lower.includes("nail") ||
    lower.includes("manicure") ||
    lower.includes("pedicure")
  )
    return CATEGORY_STYLES["Nail Care"];
  if (lower.includes("massage") || lower.includes("tissue"))
    return CATEGORY_STYLES.Massage;
  if (
    lower.includes("facial") ||
    lower.includes("skin") ||
    lower.includes("dermabrasion")
  )
    return CATEGORY_STYLES["Skin Care"];
  if (lower.includes("makeup") || lower.includes("bridal"))
    return CATEGORY_STYLES.Makeup;
  return CATEGORY_STYLES.Other;
}

export function getCategoryStyle(category: string | null | undefined, name: string) {
  if (category && CATEGORY_STYLES[category]) {
    return CATEGORY_STYLES[category];
  }
  return getCategoryStyleFromName(name);
}

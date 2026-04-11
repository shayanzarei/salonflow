import type { ReactNode } from "react";
import type { FeatureKey } from "@/types/features";
import { planIncludesFeature } from "@/config/plans";

type FeatureGateProps = {
  planId: string;
  feature: FeatureKey;
  children: ReactNode;
  fallback?: ReactNode;
};

export function FeatureGate({
  planId,
  feature,
  children,
  fallback = null,
}: FeatureGateProps) {
  if (!planIncludesFeature(planId, feature)) {
    return fallback;
  }
  return children;
}

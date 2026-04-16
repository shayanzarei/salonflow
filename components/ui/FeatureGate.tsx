import type { ReactNode } from "react";
import type { FeatureKey } from "@/types/features";
import {
  DEFAULT_PACKAGE_DEFINITIONS,
  PACKAGE_ENTITLEMENTS,
  type PackageId,
} from "@/config/packages";

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
  const packageId = planId as PackageId;
  const packageDef = DEFAULT_PACKAGE_DEFINITIONS.find((item) => item.id === packageId);
  const entitlement = PACKAGE_ENTITLEMENTS.find((item) => item.key === feature);
  const enabled =
    packageDef &&
    entitlement?.type === "boolean" &&
    entitlement.defaultValues[packageId] === true;

  if (!enabled) {
    return fallback;
  }
  return children;
}

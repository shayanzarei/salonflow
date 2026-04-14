import type { Tenant } from "@/types/tenant";
import { TemplatePlaceholder } from "./TemplatePlaceholder";

export function UrbanTemplate({ tenant }: { tenant: Tenant }) {
  return (
    <TemplatePlaceholder
      title={`${tenant.name} — Urban`}
      description="Urban template is connected and ready. You can now style this template independently."
    />
  );
}

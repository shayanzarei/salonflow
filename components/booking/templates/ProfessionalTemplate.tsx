import type { Tenant } from "@/types/tenant";
import { TemplatePlaceholder } from "./TemplatePlaceholder";

export function ProfessionalTemplate({ tenant }: { tenant: Tenant }) {
  return (
    <TemplatePlaceholder
      title={`${tenant.name} — Professional`}
      description="Professional template is connected and ready. You can now style this template independently."
    />
  );
}

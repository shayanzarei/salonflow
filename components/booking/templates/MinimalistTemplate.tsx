import type { Tenant } from "@/types/tenant";
import { TemplatePlaceholder } from "./TemplatePlaceholder";

export function MinimalistTemplate({ tenant }: { tenant: Tenant }) {
  return (
    <TemplatePlaceholder
      title={`${tenant.name} — Minimalist`}
      description="Minimalist template is connected and ready. You can now style this template independently."
    />
  );
}

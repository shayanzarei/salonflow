
import type { Tenant } from "@/types/tenant";
import { TemplatePlaceholder } from "./TemplatePlaceholder";

export function LuxeTemplate({ tenant }: { tenant: Tenant }) {
  return (
    <TemplatePlaceholder
      title={`${tenant.name} — Luxe Template`}
      description="Luxe template is connected and ready. You can now style this template independently."
    />
  );
}

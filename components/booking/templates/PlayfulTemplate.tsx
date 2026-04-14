import type { Tenant } from "@/types/tenant";
import { TemplatePlaceholder } from "./TemplatePlaceholder";

export function PlayfulTemplate({ tenant }: { tenant: Tenant }) {
  return (
    <TemplatePlaceholder
      title={`${tenant.name} — Playful`}
      description="Playful template is connected and ready. You can now style this template independently."
    />
  );
}

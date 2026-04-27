import { Card } from "@/components/ds/Card";

export default function AdminSettingsPage() {
  return (
    <div className="min-w-0">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-h2 font-bold text-ink-900">
          Settings
        </h1>
        <p className="mt-1 text-body-sm text-ink-500 sm:text-body">
          Platform-wide configuration (coming soon).
        </p>
      </div>
      <Card variant="outlined" className="text-body-sm text-ink-500">
        This section is a placeholder for super-admin settings.
      </Card>
    </div>
  );
}

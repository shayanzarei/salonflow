import { LeadsExplorer } from "@/components/admin/LeadsExplorer";
import { COMMON_PLACE_TYPES } from "@/lib/google-places";

export default function AdminLeadsPage() {
  return (
    <div className="min-w-0">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-h2 font-bold text-ink-900">Lead finder</h1>
        <p className="mt-1 text-body-sm text-ink-500 sm:text-body">
          Search Google Places for prospect businesses, filter by website
          presence, ratings and reviews, then export the list to CSV.
        </p>
      </div>
      <LeadsExplorer placeTypes={COMMON_PLACE_TYPES} />
    </div>
  );
}

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import {
  currentUserQueryOptions,
  storageUsageQueryOptions,
} from "@/features/auth/queries";
import { ProfileClient } from "./_components/ProfileClient";

export default async function ProfilePage() {
  const qc = getQueryClient();

  // Prefetch user and storage stats
  await Promise.all([
    qc.prefetchQuery(currentUserQueryOptions),
    qc.prefetchQuery(storageUsageQueryOptions),
  ]);

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <div className="p-8 pb-32 w-full h-full overflow-y-auto">
        <ProfileClient />
      </div>
    </HydrationBoundary>
  );
}

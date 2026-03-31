import {
  useQuery,
  useSuspenseQuery,
  queryOptions,
} from "@tanstack/react-query";
import { getMe, getStorageUsage } from "./api";

// ─── Query Key Factory ───────────────────────────────────────────────────────
export const authKeys = {
  all: () => ["auth"] as const,
  me: () => [...authKeys.all(), "me"] as const,
  storageUsage: () => [...authKeys.all(), "storage-usage"] as const,
};

// ─── queryOptions ────────────────────────────────────────────────────────────
export const currentUserQueryOptions = queryOptions({
  queryKey: authKeys.me(),
  queryFn: getMe,
  staleTime: 5 * 60 * 1000, // 5 min — user data rarely changes
  retry: false,
});

export const storageUsageQueryOptions = queryOptions({
  queryKey: authKeys.storageUsage(),
  queryFn: getStorageUsage,
  staleTime: 30 * 1000, // 30s
});

// ─── Hooks ───────────────────────────────────────────────────────────────────
export function useCurrentUser() {
  return useQuery(currentUserQueryOptions);
}

export function useSuspenseCurrentUser() {
  return useSuspenseQuery(currentUserQueryOptions);
}

export function useStorageUsage() {
  return useQuery(storageUsageQueryOptions);
}

export function useSuspenseStorageUsage() {
  return useSuspenseQuery(storageUsageQueryOptions);
}

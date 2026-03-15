"use client";

import { useQuery, queryOptions } from "@tanstack/react-query";
import { getTrashItems } from "./api";

export const trashKeys = {
  all:   () => ["trash"] as const,
  items: () => [...trashKeys.all(), "items"] as const,
};

export const trashItemsQueryOptions = queryOptions({
  queryKey: trashKeys.items(),
  queryFn: getTrashItems,
  staleTime: 30 * 1000,
});

export function useTrashItems() {
  return useQuery(trashItemsQueryOptions);
}

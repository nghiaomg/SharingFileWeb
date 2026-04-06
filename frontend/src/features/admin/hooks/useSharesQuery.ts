import { useQuery } from "@tanstack/react-query";
import { getAllShareLinks, adminSharesKeys } from "../api/shares.api";

export function useAdminShares(page: number = 0, size: number = 15) {
  return useQuery({
    queryKey: [...adminSharesKeys.lists(), page, size],
    queryFn: () => getAllShareLinks(page, size),
  });
}

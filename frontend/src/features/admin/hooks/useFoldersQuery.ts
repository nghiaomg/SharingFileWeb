import { useQuery } from "@tanstack/react-query";
import { getAllFolders, adminFoldersKeys } from "../api/folders.api";

export function useAdminFolders(page: number = 0, size: number = 15) {
  return useQuery({
    queryKey: [...adminFoldersKeys.lists(), page, size],
    queryFn: () => getAllFolders(page, size),
  });
}

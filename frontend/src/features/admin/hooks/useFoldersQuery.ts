import { useQuery } from "@tanstack/react-query";
import { getAllFolders, adminFoldersKeys } from "../api/folders.api";

export function useAdminFolders(folderId?: string | null, page: number = 0, size: number = 15) {
  return useQuery({
    queryKey: [...adminFoldersKeys.list(folderId), page, size],
    queryFn: () => getAllFolders(folderId, page, size),
  });
}

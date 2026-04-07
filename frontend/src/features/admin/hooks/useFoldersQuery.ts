import { useQuery } from "@tanstack/react-query";
import { getAllFolders, adminFoldersKeys } from "../api/folders.api";

export function useAdminFolders(
  folderId?: string | null,
  keyword?: string | null,
  isBanned?: boolean | null,
  page: number = 0,
  size: number = 15,
) {
  return useQuery({
    queryKey: [
      ...adminFoldersKeys.list(folderId, keyword, isBanned),
      page,
      size,
    ],
    queryFn: () => getAllFolders(folderId, keyword, isBanned, page, size),
  });
}

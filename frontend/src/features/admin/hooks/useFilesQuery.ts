import { useQuery } from "@tanstack/react-query";
import { getAllStorageFiles, adminFilesKeys } from "../api/files.api";

export function useAdminFiles(
  folderId?: string | null,
  keyword?: string | null,
  isBanned?: boolean | null,
  page: number = 0,
  size: number = 15,
) {
  return useQuery({
    queryKey: [...adminFilesKeys.list(folderId, keyword, isBanned), page, size],
    queryFn: () => getAllStorageFiles(folderId, keyword, isBanned, page, size),
  });
}

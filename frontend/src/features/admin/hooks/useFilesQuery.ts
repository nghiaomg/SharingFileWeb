import { useQuery } from "@tanstack/react-query";
import { getAllStorageFiles, adminFilesKeys } from "../api/files.api";

export function useAdminFiles(page: number = 0, size: number = 15) {
  return useQuery({
    queryKey: [...adminFilesKeys.lists(), page, size],
    queryFn: () => getAllStorageFiles(page, size),
  });
}

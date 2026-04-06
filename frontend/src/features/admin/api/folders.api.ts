import apiClient from "@/lib/api-client";
import { AdminPaginatedFoldersResponse } from "../types/folders.types";

export const adminFoldersKeys = {
  all: ["admin-folders"] as const,
  lists: () => [...adminFoldersKeys.all, "list"] as const,
  list: (folderId?: string | null) => [...adminFoldersKeys.lists(), folderId] as const,
};

export async function getAllFolders(
  folderId?: string | null,
  page: number = 0,
  size: number = 15,
): Promise<AdminPaginatedFoldersResponse> {
  let url = `/folders/all?page=${page}&size=${size}`;
  if (folderId) url += `&folderId=${folderId}`;
  const response = await apiClient.get(url);
  return response.data as AdminPaginatedFoldersResponse;
}

export async function deleteFolderPermanently(id: string): Promise<void> {
  await apiClient.delete(`/folders/${id}/permanent`);
}

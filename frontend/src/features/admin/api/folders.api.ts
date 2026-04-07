import apiClient from "@/lib/api-client";
import { AdminPaginatedFoldersResponse } from "../types/folders.types";

export const adminFoldersKeys = {
  all: ["admin-folders"] as const,
  lists: () => [...adminFoldersKeys.all, "list"] as const,
  list: (
    folderId?: string | null,
    keyword?: string | null,
    isBanned?: boolean | null,
  ) => [...adminFoldersKeys.lists(), folderId, keyword, isBanned] as const,
};

export async function getAllFolders(
  folderId?: string | null,
  keyword?: string | null,
  isBanned?: boolean | null,
  page: number = 0,
  size: number = 15,
): Promise<AdminPaginatedFoldersResponse> {
  let url = `/folders/all?page=${page}&size=${size}`;
  if (folderId) url += `&folderId=${folderId}`;
  if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
  if (isBanned !== undefined && isBanned !== null)
    url += `&isBanned=${isBanned}`;
  const response = await apiClient.get(url);
  return response.data as AdminPaginatedFoldersResponse;
}

export async function deleteFolderPermanently(id: string): Promise<void> {
  await apiClient.delete(`/folders/${id}/permanent`);
}

export async function adminRevokeFolder(id: string): Promise<void> {
  await apiClient.put(`/folders/admin/${id}/revoke`);
}

export async function adminUpdateFolder(
  id: string,
  name: string,
): Promise<void> {
  await apiClient.put(`/folders/admin/${id}`, { name });
}

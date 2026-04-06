import apiClient from "@/lib/api-client";
import {
  AdminStorageFile,
  AdminPaginatedFilesResponse,
} from "../types/files.types";

export const adminFilesKeys = {
  all: ["admin-files"] as const,
  lists: () => [...adminFilesKeys.all, "list"] as const,
  list: (folderId?: string | null) =>
    [...adminFilesKeys.lists(), folderId] as const,
};

export async function getAllStorageFiles(
  folderId?: string | null,
  page: number = 0,
  size: number = 15,
): Promise<AdminPaginatedFilesResponse> {
  let url = `/files/all?page=${page}&size=${size}`;
  if (folderId) url += `&folderId=${folderId}`;
  const response = await apiClient.get(url);
  return response.data as AdminPaginatedFilesResponse;
}

export async function deleteStorageFilePermanently(id: string): Promise<void> {
  await apiClient.delete(`/files/${id}/permanent`);
}

export async function adminRevokeFile(id: string): Promise<void> {
  await apiClient.put(`/files/admin/${id}/revoke`);
}

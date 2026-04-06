import apiClient from "@/lib/api-client";
import { AdminStorageFile, AdminPaginatedFilesResponse } from "../types/files.types";

export const adminFilesKeys = {
  all: ["admin-files"] as const,
  lists: () => [...adminFilesKeys.all, "list"] as const,
};

export async function getAllStorageFiles(
  page: number = 0,
  size: number = 15,
): Promise<AdminPaginatedFilesResponse> {
  const response = await apiClient.get(`/files/all?page=${page}&size=${size}`);
  return response.data as AdminPaginatedFilesResponse;
}

export async function deleteStorageFilePermanently(id: string): Promise<void> {
  await apiClient.delete(`/files/${id}/permanent`);
}

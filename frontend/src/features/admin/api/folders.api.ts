import apiClient from "@/lib/api-client";
import { AdminPaginatedFoldersResponse } from "../types/folders.types";

export const adminFoldersKeys = {
  all: ["admin-folders"] as const,
  lists: () => [...adminFoldersKeys.all, "list"] as const,
};

export async function getAllFolders(
  page: number = 0,
  size: number = 15,
): Promise<AdminPaginatedFoldersResponse> {
  const response = await apiClient.get(`/folders/all?page=${page}&size=${size}`);
  return response.data as AdminPaginatedFoldersResponse;
}

export async function deleteFolderPermanently(id: string): Promise<void> {
  await apiClient.delete(`/folders/${id}/permanent`);
}

import apiClient from "@/lib/api-client";
import type { TrashData } from "./schemas";

export async function getTrashItems(): Promise<TrashData> {
  const res = await apiClient.get<TrashData>("/trash");
  return res.data;
}

export async function restoreItem(type: "folder" | "file", id: string): Promise<void> {
  await apiClient.post(`/trash/restore/${type}/${id}`);
}

export async function deletePermanent(type: "folder" | "file", id: string): Promise<void> {
  await apiClient.delete(`/trash/${type}/${id}`);
}

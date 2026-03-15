import apiClient from "@/lib/api-client";
import type { FileItem, FolderItem, FolderChildren, CreateFolderInput, UpdateFolderInput } from "./schemas";

// ─── Folder APIs ─────────────────────────────────────────────────────────────
export async function getRootFolder(): Promise<FolderItem> {
  const res = await apiClient.get<FolderItem>("/folders/root");
  return res.data;
}

export async function getFolderById(folderId: string): Promise<FolderItem> {
  const res = await apiClient.get<FolderItem>(`/folders/${folderId}`);
  return res.data;
}

export async function getFolderChildren(folderId: string): Promise<FolderChildren> {
  const res = await apiClient.get<FolderChildren>(`/folders/${folderId}/children`);
  return res.data;
}

export async function createFolder(data: CreateFolderInput): Promise<FolderItem> {
  const res = await apiClient.post<FolderItem>("/folders", data);
  return res.data;
}

export async function updateFolder(folderId: string, data: UpdateFolderInput): Promise<FolderItem> {
  const res = await apiClient.put<FolderItem>(`/folders/${folderId}`, data);
  return res.data;
}

export async function deleteFolder(folderId: string): Promise<void> {
  await apiClient.delete(`/folders/${folderId}`);
}

// ─── File APIs ───────────────────────────────────────────────────────────────
export async function getFiles(folderId: string): Promise<FileItem[]> {
  const res = await apiClient.get<FileItem[]>("/files/store", {
    params: { folderId },
  });
  return res.data;
}

export async function getRecentFiles(): Promise<FileItem[]> {
  const res = await apiClient.get<FileItem[]>("/files/store/recent");
  return res.data;
}

export async function getSharedFiles(): Promise<FileItem[]> {
  const res = await apiClient.get<FileItem[]>("/files/store/shared");
  return res.data;
}

export async function deleteFile(fileId: string): Promise<void> {
  await apiClient.delete(`/files/store/${fileId}`);
}

export async function shareFile(fileId: string, isPublic: boolean): Promise<FileItem> {
  const res = await apiClient.patch<FileItem>(`/files/store/${fileId}/share`, null, {
    params: { isPublic },
  });
  return res.data;
}

export async function downloadFile(fileId: string, fileName: string): Promise<void> {
  const response = await apiClient.get(`/files/store/download/${fileId}`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

// ─── Chunked Upload ──────────────────────────────────────────────────────────
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadFileChunked(
  file: File,
  folderId: string,
  onProgress?: (progress: number) => void
): Promise<FileItem> {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const uploadId = crypto.randomUUID();

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    const formData = new FormData();
    formData.append("file", chunk, file.name);
    formData.append("chunkIndex", chunkIndex.toString());
    formData.append("totalChunks", totalChunks.toString());
    formData.append("uploadId", uploadId);
    formData.append("folderId", folderId);
    formData.append("totalFileSize", file.size.toString());

    await apiClient.post("/files/store/upload/chunk", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (onProgress) {
      onProgress(Math.round(((chunkIndex + 1) / totalChunks) * 100));
    }
  }

  const completeRes = await apiClient.post<FileItem>("/files/store/upload/complete", {
    uploadId,
    fileName: file.name,
    folderId,
    mimeType: file.type,
    totalSize: file.size,
  });

  return completeRes.data;
}

import apiClient from "@/lib/api-client";
import type { FileItem, FolderItem, FolderChildren, CreateFolderInput, UpdateFolderInput, ShareFileInput } from "./schemas";

export interface ResolvePathInput {
  path: string;
  parentId?: string;
}

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
  const [foldersRes, filesRes] = await Promise.all([
    apiClient.get<FolderItem[]>(`/folders/${folderId}/children`),
    getFiles(folderId) // reusing the function below
  ]);
  
  return {
    folders: foldersRes.data || [],
    files: filesRes || []
  };
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

export async function resolveFolderPath(data: ResolvePathInput): Promise<FolderItem> {
  const res = await apiClient.post<FolderItem>("/folders/resolve-path", data);
  return res.data;
}

// ─── File APIs ───────────────────────────────────────────────────────────────
export async function getFiles(folderId: string): Promise<FileItem[]> {
  const res = await apiClient.get<FileItem[]>("/files", {
    params: { folderId },
  });
  return res.data;
}

export async function getRecentFiles(): Promise<FileItem[]> {
  const res = await apiClient.get<FileItem[]>("/files/recent");
  return res.data;
}

export async function getSharedFiles(): Promise<FileItem[]> {
  const res = await apiClient.get<FileItem[]>("/files/shared");
  return res.data;
}

export async function deleteFile(fileId: string): Promise<void> {
  await apiClient.delete(`/files/${fileId}`);
}

export async function shareFile(fileId: string, payload: ShareFileInput): Promise<FileItem> {
  const res = await apiClient.put<FileItem>(`/files/${fileId}/share`, payload);
  return res.data;
}

export async function downloadFile(fileId: string, fileName: string): Promise<void> {
  const response = await apiClient.get(`/files/download/${fileId}`, {
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

export async function getFileBlobUrl(fileId: string): Promise<string> {
  const response = await apiClient.get(`/files/download/${fileId}`, {
    responseType: "blob",
  });
  return window.URL.createObjectURL(new Blob([response.data]));
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

    await apiClient.post("/files/upload/chunk", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (onProgress) {
      onProgress(Math.round(((chunkIndex + 1) / totalChunks) * 100));
    }
  }

  const completeFormData = new FormData();
  completeFormData.append("uploadId", uploadId);
  completeFormData.append("fileName", file.name);
  completeFormData.append("totalChunks", totalChunks.toString());
  completeFormData.append("fileType", file.type);
  completeFormData.append("fileSize", file.size.toString());
  if (folderId) {
    completeFormData.append("folderId", folderId);
  }

  const completeRes = await apiClient.post<FileItem>("/files/upload/complete", completeFormData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return completeRes.data;
}

// ─── Share APIs ──────────────────────────────────────────────────────────────
import type { ShareLinkItem, SharedAccessItem, NotificationItem, CreateShareLinkInput, InternalShareInput } from "./schemas";

export async function shareInternal(data: InternalShareInput): Promise<SharedAccessItem[]> {
  const res = await apiClient.post<SharedAccessItem[]>("/share/internal", data);
  return res.data;
}

export async function getSharedWithMe(): Promise<SharedAccessItem[]> {
  const res = await apiClient.get<SharedAccessItem[]>("/share/with-me");
  return res.data;
}

export async function getSharedByMe(): Promise<SharedAccessItem[]> {
  const res = await apiClient.get<SharedAccessItem[]>("/share/by-me");
  return res.data;
}

export async function getAccessesForFile(fileId: string): Promise<SharedAccessItem[]> {
  const res = await apiClient.get<SharedAccessItem[]>(`/share/access/file/${fileId}`);
  return res.data;
}

export async function updateAccessPermission(accessId: string, permission: string): Promise<SharedAccessItem> {
  const res = await apiClient.put<SharedAccessItem>(`/share/access/${accessId}`, { permission });
  return res.data;
}

export async function getSharedFolderContent(accessId: string): Promise<FileItem[]> {
  const res = await apiClient.get<FileItem[]>(`/share/access/folder/${accessId}`);
  return res.data;
}

export async function revokeAccess(accessId: string): Promise<void> {
  await apiClient.delete(`/share/access/${accessId}`);
}

export async function revokeAllFileAccess(fileId: string): Promise<void> {
  await apiClient.delete(`/share/access/file/${fileId}`);
}

export async function createShareLink(data: CreateShareLinkInput): Promise<ShareLinkItem> {
  const res = await apiClient.post<ShareLinkItem>("/share/link", data);
  return res.data;
}

export async function getShareLinksForFile(fileId: string): Promise<ShareLinkItem[]> {
  const res = await apiClient.get<ShareLinkItem[]>(`/share/link/file/${fileId}`);
  return res.data;
}

export async function updateShareLink(linkId: string, data: Partial<CreateShareLinkInput>): Promise<ShareLinkItem> {
  const res = await apiClient.put<ShareLinkItem>(`/share/link/${linkId}`, data);
  return res.data;
}

export async function revokeShareLink(linkId: string): Promise<void> {
  await apiClient.delete(`/share/link/${linkId}`);
}

// ─── Notification APIs ───────────────────────────────────────────────────────
export async function getNotifications(): Promise<NotificationItem[]> {
  const res = await apiClient.get<NotificationItem[]>("/notifications");
  return res.data;
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await apiClient.put(`/notifications/${notificationId}/read`);
}

export async function getUnreadNotificationCount(): Promise<number> {
  const res = await apiClient.get<number>("/notifications/unread-count");
  return res.data;
}

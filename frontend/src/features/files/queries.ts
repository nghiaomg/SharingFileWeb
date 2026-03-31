"use client";

import { useQuery, queryOptions } from "@tanstack/react-query";
import {
  getRootFolder,
  getFolderById,
  getFolderChildren,
  getFiles,
  getRecentFiles,
  getSharedFiles,
} from "./api";

// ─── Query Key Factory ───────────────────────────────────────────────────────
export const fileKeys = {
  all: () => ["files"] as const,
  folders: () => [...fileKeys.all(), "folders"] as const,
  folder: (id: string) => [...fileKeys.folders(), id] as const,
  folderChildren: (id: string) => [...fileKeys.folder(id), "children"] as const,
  rootFolder: () => [...fileKeys.folders(), "root"] as const,
  fileList: (folderId: string) =>
    [...fileKeys.all(), "list", folderId] as const,
  recent: () => [...fileKeys.all(), "recent"] as const,
  shared: () => [...fileKeys.all(), "shared"] as const,
};

// ─── queryOptions ────────────────────────────────────────────────────────────
export const rootFolderQueryOptions = queryOptions({
  queryKey: fileKeys.rootFolder(),
  queryFn: getRootFolder,
  staleTime: 5 * 60 * 1000,
});

export function folderQueryOptions(folderId: string) {
  return queryOptions({
    queryKey: fileKeys.folder(folderId),
    queryFn: () => getFolderById(folderId),
    enabled: !!folderId,
  });
}

export function folderChildrenQueryOptions(folderId: string) {
  return queryOptions({
    queryKey: fileKeys.folderChildren(folderId),
    queryFn: () => getFolderChildren(folderId),
    enabled: !!folderId,
  });
}

export function filesQueryOptions(folderId: string) {
  return queryOptions({
    queryKey: fileKeys.fileList(folderId),
    queryFn: () => getFiles(folderId),
    enabled: !!folderId,
  });
}

export const recentFilesQueryOptions = queryOptions({
  queryKey: fileKeys.recent(),
  queryFn: getRecentFiles,
});

export const sharedFilesQueryOptions = queryOptions({
  queryKey: fileKeys.shared(),
  queryFn: getSharedFiles,
});

// ─── Hooks ───────────────────────────────────────────────────────────────────
export function useRootFolder() {
  return useQuery(rootFolderQueryOptions);
}

export function useFolder(folderId: string) {
  return useQuery(folderQueryOptions(folderId));
}

export function useFolderChildren(folderId: string) {
  return useQuery(folderChildrenQueryOptions(folderId));
}

export function useFiles(folderId: string) {
  return useQuery(filesQueryOptions(folderId));
}

export function useRecentFiles() {
  return useQuery(recentFilesQueryOptions);
}

export function useSharedFiles() {
  return useQuery(sharedFilesQueryOptions);
}

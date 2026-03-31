"use client";

import { useQuery, queryOptions } from "@tanstack/react-query";
import {
  getSharedWithMe,
  getSharedByMe,
  getAccessesForFile,
  getShareLinksForFile,
  getNotifications,
  getUnreadNotificationCount,
  getSharedFolderContent,
} from "./api";

// ─── Query Key Factory ───────────────────────────────────────────────────────
export const shareKeys = {
  all: () => ["share"] as const,
  withMe: () => [...shareKeys.all(), "with-me"] as const,
  byMe: () => [...shareKeys.all(), "by-me"] as const,
  fileAccesses: (fileId: string) =>
    [...shareKeys.all(), "accesses", fileId] as const,
  fileLinks: (fileId: string) => [...shareKeys.all(), "links", fileId] as const,
  sharedFolderContent: (accessId: string) =>
    [...shareKeys.all(), "folder-content", accessId] as const,
  notifications: () => ["notifications"] as const,
  unreadCount: () => ["notifications", "unread-count"] as const,
};

// ─── queryOptions ────────────────────────────────────────────────────────────
export const sharedWithMeQueryOptions = queryOptions({
  queryKey: shareKeys.withMe(),
  queryFn: getSharedWithMe,
});

export const sharedByMeQueryOptions = queryOptions({
  queryKey: shareKeys.byMe(),
  queryFn: getSharedByMe,
});

export function fileAccessesQueryOptions(fileId: string) {
  return queryOptions({
    queryKey: shareKeys.fileAccesses(fileId),
    queryFn: () => getAccessesForFile(fileId),
    enabled: !!fileId,
  });
}

export function fileLinksQueryOptions(fileId: string) {
  return queryOptions({
    queryKey: shareKeys.fileLinks(fileId),
    queryFn: () => getShareLinksForFile(fileId),
    enabled: !!fileId,
  });
}

export const notificationsQueryOptions = queryOptions({
  queryKey: shareKeys.notifications(),
  queryFn: getNotifications,
});

export const unreadCountQueryOptions = queryOptions({
  queryKey: shareKeys.unreadCount(),
  queryFn: getUnreadNotificationCount,
  refetchInterval: 30000, // Poll every 30s
});

// ─── Hooks ───────────────────────────────────────────────────────────────────
export function useSharedWithMe() {
  return useQuery(sharedWithMeQueryOptions);
}

export function useSharedByMe() {
  return useQuery(sharedByMeQueryOptions);
}

export function useFileAccesses(fileId: string) {
  return useQuery(fileAccessesQueryOptions(fileId));
}

export function useFileLinks(fileId: string) {
  return useQuery(fileLinksQueryOptions(fileId));
}

export function useNotifications() {
  return useQuery(notificationsQueryOptions);
}

export function useUnreadCount() {
  return useQuery(unreadCountQueryOptions);
}

export function useSharedFolderContent(accessId: string | null) {
  return useQuery({
    queryKey: shareKeys.sharedFolderContent(accessId || ""),
    queryFn: () => getSharedFolderContent(accessId!),
    enabled: !!accessId,
  });
}

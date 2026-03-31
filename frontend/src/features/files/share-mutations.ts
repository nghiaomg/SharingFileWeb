"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  shareInternal,
  createShareLink,
  revokeShareLink,
  updateShareLink,
  updateAccessPermission,
  revokeAccess,
  revokeAllFileAccess,
  markNotificationRead,
} from "./api";
import { shareKeys } from "./share-queries";
import type { InternalShareInput, CreateShareLinkInput } from "./schemas";

// ─── Share Internal ──────────────────────────────────────────────────────────
export function useShareInternal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InternalShareInput) => shareInternal(data),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: shareKeys.all() });
    },
  });
}

// ─── Create Share Link ───────────────────────────────────────────────────────
export function useCreateShareLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateShareLinkInput) => createShareLink(data),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: shareKeys.all() });
    },
  });
}

// ─── Update Share Link ───────────────────────────────────────────────────────
export function useUpdateShareLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      linkId,
      data,
    }: {
      linkId: string;
      data: Partial<CreateShareLinkInput>;
    }) => updateShareLink(linkId, data),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: shareKeys.all() });
    },
  });
}

// ─── Revoke Share Link ───────────────────────────────────────────────────────
export function useRevokeShareLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (linkId: string) => revokeShareLink(linkId),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: shareKeys.all() });
    },
  });
}

// ─── Update Permission ──────────────────────────────────────────────────────
export function useUpdatePermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      accessId,
      permission,
    }: {
      accessId: string;
      permission: string;
    }) => updateAccessPermission(accessId, permission),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: shareKeys.all() });
    },
  });
}

// ─── Revoke Access ───────────────────────────────────────────────────────────
export function useRevokeAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (accessId: string) => revokeAccess(accessId),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: shareKeys.all() });
    },
  });
}

// ─── Revoke All File Access ──────────────────────────────────────────────────
export function useRevokeAllFileAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fileId: string) => revokeAllFileAccess(fileId),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: shareKeys.all() });
    },
  });
}

// ─── Mark Notification Read ──────────────────────────────────────────────────
export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) =>
      markNotificationRead(notificationId),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: shareKeys.notifications() });
      qc.invalidateQueries({ queryKey: shareKeys.unreadCount() });
    },
  });
}

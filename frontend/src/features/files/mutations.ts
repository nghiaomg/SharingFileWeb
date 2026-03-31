"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createFolder,
  updateFolder,
  deleteFolder,
  deleteFile,
  shareFile,
  uploadFileChunked,
  downloadFile,
  renameFile,
} from "./api";
import { fileKeys } from "./queries";
import { authKeys } from "../auth/queries";
import type {
  CreateFolderInput,
  UpdateFolderInput,
  ShareFileInput,
} from "./schemas";

// ─── Create Folder ───────────────────────────────────────────────────────────
export function useCreateFolder() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateFolderInput) => createFolder(input),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: fileKeys.folders() });
      qc.invalidateQueries({ queryKey: fileKeys.all() });
    },
  });
}

// ─── Update Folder ───────────────────────────────────────────────────────────
export function useUpdateFolder() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFolderInput }) =>
      updateFolder(id, data),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: fileKeys.folders() });
      qc.invalidateQueries({ queryKey: fileKeys.all() });
    },
  });
}

// ─── Delete Folder ───────────────────────────────────────────────────────────
export function useDeleteFolder() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (folderId: string) => deleteFolder(folderId),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: fileKeys.folders() });
      qc.invalidateQueries({ queryKey: fileKeys.all() });
      qc.invalidateQueries({ queryKey: authKeys.storageUsage() });
    },
  });
}

// ─── Upload File ─────────────────────────────────────────────────────────────
export function useUploadFile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      folderId,
      onProgress,
    }: {
      file: File;
      folderId: string;
      onProgress?: (p: number) => void;
    }) => {
      const { fileItem } = await uploadFileChunked(file, folderId, {
        onProgress,
      });
      return fileItem;
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: fileKeys.all() });
      qc.invalidateQueries({ queryKey: authKeys.storageUsage() });
    },
  });
}

// ─── Delete File ─────────────────────────────────────────────────────────────
export function useDeleteFile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => deleteFile(fileId),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: fileKeys.all() });
      qc.invalidateQueries({ queryKey: authKeys.storageUsage() });
    },
  });
}

// ─── Rename File ─────────────────────────────────────────────────────────────
export function useRenameFile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ fileId, newName }: { fileId: string; newName: string }) =>
      renameFile(fileId, newName),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: fileKeys.all() });
    },
  });
}

// ─── Share File ──────────────────────────────────────────────────────────────
export function useShareFile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      fileId,
      payload,
    }: {
      fileId: string;
      payload: ShareFileInput;
    }) => shareFile(fileId, payload),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: fileKeys.all() });
    },
  });
}

// ─── Download File ───────────────────────────────────────────────────────────
export function useDownloadFile() {
  return useMutation({
    mutationFn: ({ fileId, fileName }: { fileId: string; fileName: string }) =>
      downloadFile(fileId, fileName),
  });
}

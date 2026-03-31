"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { restoreItem, deletePermanent, emptyTrash } from "./api";
import { trashKeys } from "./queries";
import { fileKeys } from "../files/queries";
import { authKeys } from "../auth/queries";

export function useRestoreItem() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ type, id }: { type: "folder" | "file"; id: string }) =>
      restoreItem(type, id),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: trashKeys.items() });
      qc.invalidateQueries({ queryKey: fileKeys.all() });
      qc.invalidateQueries({ queryKey: authKeys.storageUsage() });
    },
  });
}

export function useDeletePermanent() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ type, id }: { type: "folder" | "file"; id: string }) =>
      deletePermanent(type, id),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: trashKeys.items() });
      qc.invalidateQueries({ queryKey: authKeys.storageUsage() });
    },
  });
}

export function useEmptyTrash() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: emptyTrash,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: trashKeys.items() });
      qc.invalidateQueries({ queryKey: authKeys.storageUsage() });
    },
  });
}

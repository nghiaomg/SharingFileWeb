"use client";

import { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { format, isToday, isYesterday, differenceInDays } from "date-fns";
import { vi } from "date-fns/locale";
import { Flex } from "@radix-ui/themes";
import { useRecentFiles } from "@/features/files/queries";
import { useDownloadFile, useDeleteFile } from "@/features/files/mutations";
import { DeleteConfirmModal } from "@/features/dashboard/components/DeleteConfirmModal";
import { ShareModal } from "@/features/dashboard/components/ShareModal";
import { RecentPageHeader } from "@/features/dashboard/components/RecentPageHeader";
import { RecentPageEmptyState } from "@/features/dashboard/components/RecentPageEmptyState";
import { RecentPageGroup } from "@/features/dashboard/components/RecentPageGroup";
import type { FileItem } from "@/features/files/schemas";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/types/api";

// ============================================================================
// Types
// ============================================================================

interface GroupedFilesItem {
  file: {
    id: string;
    name: string;
    type: string | null;
    size: number;
    createdAt: string;
  };
  timeStr: string;
}

// ============================================================================
// Hooks / Logic
// ============================================================================

function useRecentFileGroups(files: ReturnType<typeof useRecentFiles>["data"]) {
  return useMemo(() => {
    if (!files) return [];

    const groupsMap = new Map<string, GroupedFilesItem[]>();

    files.forEach((file) => {
      const date = new Date(file.createdAt);
      let label = "";
      let timeStr = format(date, "HH:mm");

      if (isToday(date)) {
        label = "Hôm nay";
      } else if (isYesterday(date)) {
        label = "Hôm qua";
      } else {
        const diff = differenceInDays(new Date(), date);
        if (diff <= 7) {
          label = "Tuần trước";
          timeStr = format(date, "EEEE HH:mm", { locale: vi });
        } else {
          label = "Cũ hơn";
          timeStr = format(date, "dd MMM, yyyy HH:mm", { locale: vi });
        }
      }

      if (!groupsMap.has(label)) {
        groupsMap.set(label, []);
      }

      groupsMap.get(label)!.push({ file, timeStr });
    });

    const orderedLabels = ["Hôm nay", "Hôm qua", "Tuần trước", "Cũ hơn"];
    return orderedLabels
      .filter((label) => groupsMap.has(label))
      .map((label) => ({ label, items: groupsMap.get(label)! }));
  }, [files]);
}

// ============================================================================
// Page Component
// ============================================================================

export default function RecentFilesPage() {
  const { data: files, isLoading } = useRecentFiles();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const recentGroups = useRecentFileGroups(files);

  const downloadFileMutation = useDownloadFile();
  const deleteFileMutation = useDeleteFile();

  const [shareTarget, setShareTarget] = useState<FileItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "file";
    id: string;
    name: string;
  } | null>(null);

  const handleDownload = (fileId: string, fileName: string) => {
    downloadFileMutation.mutate(
      { fileId, fileName },
      {
        onSuccess: () => toast.success("Đang tải xuống..."),
        onError: (err) =>
          toast.error(getApiErrorMessage(err, "Lỗi khi tải xuống")),
      },
    );
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteFileMutation.mutateAsync(deleteTarget.id);
      toast.success("Đã xóa tệp khỏi gần đây");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  if (isLoading) {
    return (
      <Flex
        align="center"
        justify="center"
        style={{ flex: 1, padding: "3rem", height: "calc(100vh - 4rem)" }}
      >
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: "var(--gray-12)" }}
        />
      </Flex>
    );
  }

  return (
    <Flex
      direction="column"
      style={{
        height: "calc(100vh - 4rem)",
        backgroundColor: "var(--color-background)",
        overflow: "hidden",
      }}
      className="lg:h-[calc(100vh-4rem)]"
    >
      <RecentPageHeader viewMode={viewMode} onViewModeChange={setViewMode} />

      <Flex
        direction="column"
        p={{ initial: "4", sm: "6", lg: "8" }}
        style={{ flex: 1, overflowY: "auto", position: "relative", zIndex: 0 }}
      >
        {recentGroups.length === 0 ? (
          <RecentPageEmptyState />
        ) : (
          <Flex direction="column" gap="8">
            {recentGroups.map((group, i) => (
              <RecentPageGroup
                key={i}
                label={group.label}
                items={group.items}
                viewMode={viewMode}
                onDownload={handleDownload}
                onShare={setShareTarget}
                onDelete={(id, name) =>
                  setDeleteTarget({ type: "file", id, name })
                }
              />
            ))}
          </Flex>
        )}
      </Flex>

      {deleteTarget && (
        <DeleteConfirmModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          name={deleteTarget.name}
          type={deleteTarget.type}
        />
      )}

      <ShareModal
        key={shareTarget?.id || "empty-modal"}
        isOpen={!!shareTarget}
        onClose={() => setShareTarget(null)}
        file={shareTarget}
      />
    </Flex>
  );
}

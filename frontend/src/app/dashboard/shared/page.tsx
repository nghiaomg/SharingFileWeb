"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useSharedWithMe, useSharedByMe } from "@/features/files/share-queries";
import { getFileBlobUrl } from "@/features/files/api";
import { toast } from "sonner";
import { PreviewModal } from "@/features/dashboard/components/PreviewModal";
import { useSharedFolderContent } from "@/features/files/share-queries";
import { downloadFile } from "@/features/files/api";
import type { SharedAccessItem } from "@/features/files/schemas";
import { Flex, Box } from "@radix-ui/themes";
import { SharedPageHeader } from "./_components/SharedPageHeader";
import { SharedItemGrid } from "./_components/SharedItemGrid";
import { SharedItemList } from "./_components/SharedItemList";
import { SharedEmptyState } from "./_components/SharedEmptyState";

type Tab = "with-me" | "by-me";
type ViewMode = "grid" | "list";

export default function SharedPage() {
  const [tab, setTab] = useState<Tab>("with-me");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const { data: sharedWithMe, isLoading: loadingWithMe } = useSharedWithMe();
  const { data: sharedByMe, isLoading: loadingByMe } = useSharedByMe();

  const items = tab === "with-me" ? sharedWithMe : sharedByMe;
  const isLoading = tab === "with-me" ? loadingWithMe : loadingByMe;

  // Preview state
  const [previewItem, setPreviewItem] = useState<
    | (SharedAccessItem & {
        previewType?: "pdf" | "xlsx" | "folder" | "unknown";
      })
    | null
  >(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const { data: folderContent, isLoading: isFolderLoading } =
    useSharedFolderContent(
      previewItem?.fileType === "folder" ? previewItem.id : null,
    );

  // ── Handlers ────────────────────────────────────────────────────────────────

  const closePreview = () => {
    if (previewUrl && previewItem?.fileType !== "folder") {
      window.URL.revokeObjectURL(previewUrl);
    }
    setPreviewItem(null);
    setPreviewUrl("");
  };

  const handlePreview = async (item: SharedAccessItem) => {
    let type: "pdf" | "xlsx" | "folder" | "unknown" = "unknown";
    if (item.fileType === "folder") type = "folder";
    else if (item.fileType === "application/pdf") type = "pdf";
    else if (item.fileType?.includes("spreadsheetml")) type = "xlsx";

    if (type === "pdf" || type === "xlsx") {
      try {
        toast.loading("Đang chuẩn bị file xem trước...", {
          id: "preview-load",
        });
        const url = await getFileBlobUrl(item.fileId);
        setPreviewUrl(url);
        toast.dismiss("preview-load");
      } catch {
        toast.error("Lỗi khi tải file xem trước");
        toast.dismiss("preview-load");
        return;
      }
    }
    setPreviewItem({ ...item, previewType: type });
  };

  const handleDownloadFolderFile = (child: { id: string; name: string }) => {
    if (previewItem?.permission === "DOWNLOAD") {
      downloadFile(child.id, child.name)
        .then(() => toast.success("Đang tải..."))
        .catch(() => toast.error("Lỗi tải xuống"));
    } else {
      toast.error("Bạn không có quyền tải file trong thư mục này");
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

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
      <SharedPageHeader
        tab={tab}
        onTabChange={setTab}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <Box
        p={{ initial: "4", sm: "6", lg: "8" }}
        style={{ flex: 1, overflowY: "auto", position: "relative", zIndex: 0 }}
      >
        {!items || items.length === 0 ? (
          <SharedEmptyState tab={tab} />
        ) : (
          <Flex direction="column" gap="4">
            {viewMode === "grid" ? (
              <SharedItemGrid
                items={items}
                tab={tab}
                onPreview={handlePreview}
              />
            ) : (
              <SharedItemList
                items={items}
                tab={tab}
                onPreview={handlePreview}
              />
            )}
          </Flex>
        )}
      </Box>

      {previewItem && (
        <PreviewModal
          isOpen={!!previewItem}
          onClose={closePreview}
          itemName={previewItem.fileName}
          itemType={previewItem.previewType || "unknown"}
          fileUrl={previewUrl}
          folderChildren={folderContent}
          isLoading={isFolderLoading}
          onDownloadFile={handleDownloadFolderFile}
        />
      )}
    </Flex>
  );
}

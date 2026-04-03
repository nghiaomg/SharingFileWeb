"use client";

import { Eye, Download, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { determineFileType } from "@/lib/file-utils";
import { formatBytes } from "@/lib/format";
import { downloadFile } from "@/features/files/api";
import { toast } from "sonner";
import {
  Flex,
  Box,
  Text,
  IconButton,
  DropdownMenu,
} from "@radix-ui/themes";
import type { SharedAccessItem } from "@/features/files/schemas";

function getColorName(fileType: string | null | undefined) {
  if (fileType?.includes("image")) return "teal";
  if (fileType?.includes("video")) return "rose";
  if (fileType?.includes("zip") || fileType?.includes("rar")) return "amber";
  return "blue";
}

interface SharedItemRowProps {
  item: SharedAccessItem;
  tab: "with-me" | "by-me";
  isLast: boolean;
  onPreview: (item: SharedAccessItem) => void;
}

export function SharedItemRow({
  item,
  tab,
  isLast,
  onPreview,
}: SharedItemRowProps) {
  const meta = determineFileType(item.fileType || "");
  const Icon = meta.icon;
  const colorName = getColorName(item.fileType);
  const canPreview =
    item.fileType === "folder" ||
    item.fileType === "application/pdf" ||
    item.fileType?.includes("spreadsheetml");

  return (
    <Flex
      align="center"
      px="4"
      py="3"
      className="group"
      style={{
        borderBottom: isLast ? "none" : "1px solid var(--gray-a3)",
        transition: "background-color 0.2s",
      }}
    >
      {/* File name */}
      <Flex align="center" gap="3" style={{ flex: 4, minWidth: 0 }}>
        <Flex
          align="center"
          justify="center"
          flexShrink="0"
          style={{
            width: 40,
            height: 40,
            backgroundColor: `var(--${colorName}-a3)`,
            borderRadius: "var(--radius-3)",
          }}
        >
          <Icon
            className="w-5 h-5"
            style={{ color: `var(--${colorName}-11)` }}
          />
        </Flex>
        <Text
          size="2"
          weight="medium"
          truncate
          title={item.fileName}
          style={{ color: "var(--color-foreground)" }}
        >
          {item.fileName}
        </Text>
      </Flex>

      {/* Shared by/to */}
      <Box style={{ flex: 3 }}>
        <Text
          size="2"
          truncate
          style={{ color: "var(--muted-foreground)" }}
        >
          {tab === "with-me" ? item.ownerEmail : item.recipientEmail}
        </Text>
      </Box>

      {/* Size */}
      <Box style={{ flex: 2, textAlign: "right" }}>
        <Text
          size="2"
          style={{
            fontFamily: "var(--font-geist-mono)",
            color: "var(--muted-foreground)",
          }}
        >
          {formatBytes(item.fileSize)}
        </Text>
      </Box>

      {/* Time */}
      <Box style={{ flex: 2 }} className="ml-4">
        <Text size="2" style={{ color: "var(--muted-foreground)" }}>
          {format(new Date(item.createdAt), "dd MMM, yyyy HH:mm", {
            locale: vi,
          })}
        </Text>
      </Box>

      {/* Actions */}
      <Flex justify="end" style={{ flex: 1 }}>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <IconButton
              variant="ghost"
              color="gray"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="w-4 h-4" />
            </IconButton>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content size="2" variant="solid" align="end">
            {canPreview && (
              <DropdownMenu.Item
                onClick={() => onPreview(item)}
                className="cursor-pointer"
              >
                <Eye className="w-4 h-4 mr-2" /> Xem trước
              </DropdownMenu.Item>
            )}
            {item.permission === "DOWNLOAD" &&
              tab === "with-me" &&
              item.fileType !== "folder" && (
                <DropdownMenu.Item
                  onClick={() =>
                    downloadFile(item.fileId, item.fileName)
                      .then(() => toast.success("Đang tải..."))
                      .catch(() => toast.error("Lỗi tải xuống"))
                  }
                  className="cursor-pointer"
                >
                  <Download className="w-4 h-4 mr-2" /> Tải xuống
                </DropdownMenu.Item>
              )}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Flex>
    </Flex>
  );
}

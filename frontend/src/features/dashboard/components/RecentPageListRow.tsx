"use client";

import { Download, Link as LinkIcon, Trash2, MoreVertical } from "lucide-react";
import { Flex, Box, Text, IconButton, DropdownMenu } from "@radix-ui/themes";
import { formatBytes } from "@/lib/format";
import { determineFileType } from "@/lib/file-utils";
import type { FileItem } from "@/features/files/schemas";

interface RecentPageListRowProps {
  file: FileItem;
  timeStr: string;
  isLast: boolean;
  onDownload: (id: string, name: string) => void;
  onShare: (file: FileItem) => void;
  onDelete: (id: string, name: string) => void;
}

export function RecentPageListRow({
  file,
  timeStr,
  isLast,
  onDownload,
  onShare,
  onDelete,
}: RecentPageListRowProps) {
  const fileMeta = determineFileType(file.type || "");
  const Icon = fileMeta.icon;

  const colorName = fileMeta.type.includes("Hình ảnh")
    ? "teal"
    : fileMeta.type.includes("Video")
      ? "rose"
      : fileMeta.type.includes("Nén")
        ? "amber"
        : "blue";

  return (
    <Flex
      align="center"
      px="4"
      py="3"
      className="group hover:bg-secondary/50"
      style={{
        borderBottom: isLast ? "none" : "1px solid var(--gray-a3)",
        transition: "background-color 0.2s",
      }}
    >
      {/* File name */}
      <Flex align="center" gap="3" style={{ flex: 5, minWidth: 0 }}>
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
          title={file.name}
          style={{ color: "var(--color-foreground)" }}
        >
          {file.name}
        </Text>
      </Flex>

      {/* File type */}
      <Box style={{ flex: 2 }}>
        <Text size="2" style={{ color: "var(--muted-foreground)" }}>
          {fileMeta.type}
        </Text>
      </Box>

      {/* File size */}
      <Box style={{ flex: 2, textAlign: "right" }}>
        <Text
          size="2"
          style={{
            fontFamily: "var(--font-geist-mono)",
            color: "var(--muted-foreground)",
          }}
        >
          {formatBytes(file.size)}
        </Text>
      </Box>

      {/* Time */}
      <Box style={{ flex: 2 }} className="ml-4">
        <Text size="2" style={{ color: "var(--muted-foreground)" }}>
          {timeStr}
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
            <DropdownMenu.Item
              onClick={() => onDownload(file.id, file.name)}
              className="cursor-pointer"
            >
              <Download className="w-4 h-4 mr-2" /> Tải xuống
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={() => onShare(file)}
              className="cursor-pointer"
            >
              <LinkIcon className="w-4 h-4 mr-2" /> Chia sẻ
            </DropdownMenu.Item>
            <DropdownMenu.Item
              color="red"
              onClick={() => onDelete(file.id, file.name)}
              className="cursor-pointer"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Xóa
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Flex>
    </Flex>
  );
}

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
  Card,
} from "@radix-ui/themes";
import type { SharedAccessItem } from "@/features/files/schemas";

const PERMISSION_META: Record<string, { icon: typeof Eye; label: string }> = {
  VIEW: { icon: Eye, label: "Xem" },
  DOWNLOAD: { icon: Download, label: "Tải xuống" },
};

function getColorName(fileType: string | null | undefined) {
  if (fileType?.includes("image")) return "teal";
  if (fileType?.includes("video")) return "rose";
  if (fileType?.includes("zip") || fileType?.includes("rar")) return "amber";
  return "blue";
}

interface SharedItemCardProps {
  item: SharedAccessItem;
  tab: "with-me" | "by-me";
  onPreview: (item: SharedAccessItem) => void;
}

export function SharedItemCard({ item, tab, onPreview }: SharedItemCardProps) {
  const meta = determineFileType(item.fileType || "");
  const Icon = meta.icon;
  const colorName = getColorName(item.fileType);
  const permMeta = PERMISSION_META[item.permission];
  const PermIcon = permMeta?.icon || Eye;
  const canPreview =
    item.fileType === "folder" ||
    item.fileType === "application/pdf" ||
    item.fileType?.includes("spreadsheetml");

  return (
    <Card
      size="2"
      variant="ghost"
      className="group"
      style={{ position: "relative", border: "none" }}
    >
      <Flex align="start" gap="3" mb="3">
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
        <Box style={{ flex: 1, minWidth: 0, paddingRight: "1.5rem" }}>
          <Text
            size="2"
            weight="bold"
            truncate
            as="div"
            title={item.fileName}
            style={{
              lineHeight: "1.25",
              marginBottom: "4px",
              color: "var(--color-foreground)",
            }}
          >
            {item.fileName}
          </Text>
          <Text
            size="1"
            as="div"
            truncate
            style={{ color: "var(--muted-foreground)" }}
          >
            {tab === "with-me"
              ? `Bởi ${item.ownerEmail}`
              : `Cho ${item.recipientEmail}`}
          </Text>
        </Box>
      </Flex>

      <Flex
        align="center"
        justify="between"
        mt="auto"
        style={{
          borderTop: "1px solid var(--gray-a4)",
          paddingTop: "12px",
          marginTop: "12px",
        }}
      >
        <Flex align="center" gap="1">
          <PermIcon className="w-3 h-3" style={{ color: "var(--gray-10)" }} />
          <Text size="1" style={{ color: "var(--muted-foreground)" }}>
            {formatBytes(item.fileSize)}
          </Text>
        </Flex>
        <Text size="1" style={{ color: "var(--muted-foreground)" }}>
          {format(new Date(item.createdAt), "dd MMM, yyyy", { locale: vi })}
        </Text>
      </Flex>

      <Box
        position="absolute"
        top="0"
        right="0"
        m="2"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <IconButton
              variant="ghost"
              color="gray"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="w-4 h-4" />
            </IconButton>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content size="2" variant="solid" align="end">
            {canPreview && (
              <DropdownMenu.Item
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview(item);
                }}
                className="cursor-pointer"
              >
                <Eye className="w-4 h-4 mr-2" /> Xem trước
              </DropdownMenu.Item>
            )}
            {item.permission === "DOWNLOAD" &&
              tab === "with-me" &&
              item.fileType !== "folder" && (
                <DropdownMenu.Item
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadFile(item.fileId, item.fileName)
                      .then(() => toast.success("Đang tải..."))
                      .catch(() => toast.error("Lỗi tải xuống"));
                  }}
                  className="cursor-pointer"
                >
                  <Download className="w-4 h-4 mr-2" /> Tải xuống
                </DropdownMenu.Item>
              )}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Box>
    </Card>
  );
}

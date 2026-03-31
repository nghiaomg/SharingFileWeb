import React from "react";
import type { FileItem } from "@/features/files/schemas";
import {
  Box,
  Flex,
  Card,
  Text,
  IconButton,
  DropdownMenu,
} from "@radix-ui/themes";
import { determineFileType } from "@/lib/file-utils";
import { formatBytes } from "@/lib/format";
import {
  MoreVertical,
  Download,
  Link as LinkIcon,
  Trash2,
  Share2,
  Pencil,
} from "lucide-react";

export interface FileCardProps {
  file: FileItem;
  /** Hiển thị dạng hộp lưới (Card lớn dọc) hoặc dạng danh sách dòng gọn */
  variant?: "grid" | "list";
  /** Tùy chọn border cho dạng list (Grid luôn có border dạng thẻ) */
  bordered?: boolean;
  /** Tùy chỉnh dòng văn bản phụ (ngày tháng, dung lượng...) */
  subtitle?: string;
  /** Hiển thị header hành động trực tiếp thay vì Dropdown Menu (Dùng cho Recent Files) */
  showDirectActions?: boolean;
  /** Các actions file thông dụng */
  onDownload?: (file: FileItem) => void;
  onShare?: (file: FileItem) => void;
  onRename?: (file: FileItem) => void;
  onDelete?: (file: FileItem) => void;
  onClick?: (file: FileItem) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function FileCard({
  file,
  variant = "grid",
  bordered = false,
  subtitle,
  showDirectActions = false,
  onDownload,
  onShare,
  onRename,
  onDelete,
  onClick,
  className = "",
  style = {},
}: FileCardProps) {
  const fileMeta = determineFileType(file.type || "");
  const Icon = fileMeta.icon;
  const colorName = "gray"; // Đổi màu chủ đạo file sang tông đen/xám (zinc/gray) theo theme mới

  const defaultSubtitle = `${formatBytes(file.size)}`;

  const renderActions = () => {
    // Render dạng nút bấm trực tiếp nếu được yêu cầu
    if (showDirectActions) {
      return (
        <Flex align="center" gap="1">
          {onDownload && (
            <IconButton
              variant="ghost"
              color="gray"
              onClick={(e) => {
                e.stopPropagation();
                onDownload(file);
              }}
            >
              <Download className="w-5 h-5" />
            </IconButton>
          )}
          {onShare && (
            <IconButton
              variant="ghost"
              color="gray"
              onClick={(e) => {
                e.stopPropagation();
                onShare(file);
              }}
            >
              <Share2 className="w-5 h-5" />
            </IconButton>
          )}
        </Flex>
      );
    }

    // Render DropdownMenu context menu
    if (onDownload || onShare || onRename || onDelete) {
      return (
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
            {onDownload && (
              <DropdownMenu.Item
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload(file);
                }}
                className="cursor-pointer"
              >
                <Download className="w-4 h-4 mr-2" /> Tải xuống
              </DropdownMenu.Item>
            )}
            {onShare && (
              <DropdownMenu.Item
                onClick={(e) => {
                  e.stopPropagation();
                  onShare(file);
                }}
                className="cursor-pointer"
              >
                <LinkIcon className="w-4 h-4 mr-2" /> Chia sẻ
              </DropdownMenu.Item>
            )}
            {onRename && (
              <DropdownMenu.Item
                onClick={(e) => {
                  e.stopPropagation();
                  onRename(file);
                }}
                className="cursor-pointer"
              >
                <Pencil className="w-4 h-4 mr-2" /> Đổi tên
              </DropdownMenu.Item>
            )}
            {onDelete && (
              <DropdownMenu.Item
                color="red"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(file);
                }}
                className="cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Xóa
              </DropdownMenu.Item>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      );
    }
    return null;
  };

  if (variant === "list") {
    return (
      <Flex
        align="center"
        justify="between"
        gap="4"
        p="4"
        className={`group hover:bg-secondary/50 ${className}`}
        style={{
          transition: "background-color 0.2s",
          cursor: onClick ? "pointer" : "default",
          backgroundColor: bordered ? "var(--gray-a2)" : "transparent",
          border: "none",
          borderRadius: bordered ? "var(--radius-4)" : "0",
          ...style,
        }}
        onClick={() => onClick?.(file)}
      >
        <Flex align="center" gap="4" style={{ flex: 1, minWidth: 0 }}>
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
          <Box style={{ minWidth: 0, flex: 1 }}>
            <Text as="div" size="3" weight="bold" truncate mb="1">
              {file.name}
            </Text>
            <Text
              as="div"
              size="2"
              style={{ color: "var(--muted-foreground)" }}
            >
              {subtitle || defaultSubtitle}
            </Text>
          </Box>
        </Flex>

        <Box className="opacity-0 group-hover:opacity-100 transition-opacity">
          {renderActions()}
        </Box>
      </Flex>
    );
  }

  // Default Grid Variant
  return (
    <Card
      size="2"
      variant="ghost"
      className={`group ${className}`}
      style={{
        position: "relative",
        cursor: onClick ? "pointer" : "default",
        border: "none",
        ...style,
      }}
      onClick={() => onClick?.(file)}
    >
      <Flex align="start" gap="3" mb="2">
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
        <Box style={{ flex: 1, minWidth: 0, paddingRight: "2rem" }}>
          <Text
            size="2"
            weight="bold"
            truncate
            as="div"
            title={file.name}
            style={{ lineHeight: "1.25", marginBottom: "4px" }}
          >
            {file.name}
          </Text>
          <Text size="1" as="div" style={{ color: "var(--muted-foreground)" }}>
            {subtitle || defaultSubtitle}
          </Text>
        </Box>
      </Flex>

      <Box
        position="absolute"
        top="0"
        right="0"
        m="2"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {renderActions()}
      </Box>
    </Card>
  );
}

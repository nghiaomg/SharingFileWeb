import React, { useMemo } from "react";
import {
  Dialog,
  Button,
  Flex,
  Text,
  Box,
  ScrollArea,
  IconButton,
} from "@radix-ui/themes";
import { formatBytes } from "@/lib/format";
import { determineFileType } from "@/lib/file-utils";
import { Trash, FileText } from "lucide-react";

export interface PendingUploadFile {
  file: File;
  path: string; // Tên folder tương đối nếu có
}

interface ConfirmUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onRemove: (index: number) => void;
  files: PendingUploadFile[];
  isLoading?: boolean;
}

export function ConfirmUploadDialog({
  isOpen,
  onClose,
  onConfirm,
  onRemove,
  files,
  isLoading = false,
}: ConfirmUploadDialogProps) {
  // Tính tổng dung lượng
  const totalSize = useMemo(() => {
    return files.reduce((acc, current) => acc + current.file.size, 0);
  }, [files]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Content
        maxWidth="600px"
        style={{ borderRadius: "var(--radius-4)", padding: "24px" }}
      >
        <Dialog.Title
          size="5"
          weight="bold"
          mb="2"
          style={{ color: "var(--color-foreground)" }}
        >
          Xác nhận tải lên
        </Dialog.Title>
        <Dialog.Description
          size="2"
          mb="4"
          style={{ color: "var(--muted-foreground)" }}
        >
          Bạn đã chọn {files.length} tệp với tổng dung lượng là{" "}
          {formatBytes(totalSize)}.
        </Dialog.Description>

        <Box
          mb="5"
          style={{
            border: "1px solid var(--gray-a4)",
            borderRadius: "var(--radius-3)",
            overflow: "hidden",
          }}
        >
          <Flex
            px="3"
            py="2"
            style={{
              backgroundColor: "var(--gray-a2)",
              borderBottom: "1px solid var(--gray-a4)",
            }}
          >
            <Box style={{ flex: 1 }}>
              <Text
                size="1"
                weight="bold"
                color="gray"
                style={{ textTransform: "uppercase" }}
              >
                Tệp / Thư mục
              </Text>
            </Box>
            <Box style={{ width: "80px", textAlign: "right" }}>
              <Text
                size="1"
                weight="bold"
                color="gray"
                style={{ textTransform: "uppercase" }}
              >
                Dung lượng
              </Text>
            </Box>
            <Box style={{ width: "40px" }}></Box>
          </Flex>
          <ScrollArea
            type="always"
            scrollbars="vertical"
            style={{ maxHeight: "300px" }}
          >
            <Flex direction="column">
              {files.length === 0 ? (
                <Flex align="center" justify="center" p="4">
                  <Text size="2" style={{ color: "var(--muted-foreground)" }}>
                    Không có tệp nào được chọn.
                  </Text>
                </Flex>
              ) : (
                files.map((item, index) => {
                  const fileMeta = determineFileType(item.file.type || "");
                  const Icon = fileMeta.icon || FileText;

                  // Hiển thị đường dẫn nếu có (kéo thả folder)
                  const displayName = item.path
                    ? `${item.path}/${item.file.name}`
                    : item.file.name;

                  return (
                    <Flex
                      key={index}
                      align="center"
                      px="3"
                      py="2"
                      className="group"
                      style={{
                        borderBottom:
                          index < files.length - 1
                            ? "1px solid var(--gray-a3)"
                            : "none",
                      }}
                    >
                      <Flex
                        align="center"
                        gap="2"
                        style={{ flex: 1, minWidth: 0 }}
                      >
                        <Icon
                          className="w-4 h-4 text-gray-500"
                          style={{ flexShrink: 0 }}
                        />
                        <Text size="2" truncate title={displayName}>
                          {displayName}
                        </Text>
                      </Flex>
                      <Box
                        style={{
                          width: "80px",
                          textAlign: "right",
                          marginLeft: "8px",
                        }}
                      >
                        <Text
                          size="1"
                          color="gray"
                          style={{ fontFamily: "var(--font-geist-mono)" }}
                        >
                          {formatBytes(item.file.size)}
                        </Text>
                      </Box>
                      <Box
                        style={{
                          width: "40px",
                          display: "flex",
                          justifyContent: "flex-end",
                        }}
                      >
                        <IconButton
                          size="1"
                          variant="ghost"
                          color="red"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => onRemove(index)}
                          disabled={isLoading}
                          style={{ cursor: "pointer" }}
                        >
                          <Trash className="w-3 h-3" />
                        </IconButton>
                      </Box>
                    </Flex>
                  );
                })
              )}
            </Flex>
          </ScrollArea>
        </Box>

        <Flex gap="3" justify="end">
          <Button
            variant="soft"
            color="gray"
            type="button"
            size="3"
            onClick={onClose}
            disabled={isLoading}
            style={{ cursor: "pointer" }}
          >
            Hủy
          </Button>
          <Button
            size="3"
            onClick={onConfirm}
            disabled={isLoading || files.length === 0}
            style={{
              cursor:
                isLoading || files.length === 0 ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? "Đang xử lý..." : "Tải lên"}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

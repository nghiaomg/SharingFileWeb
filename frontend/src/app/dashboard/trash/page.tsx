"use client";

import { useState } from "react";
import {
  File as FileIcon,
  Trash2,
  RotateCcw,
  MoreVertical,
  Loader2,
  Sparkles,
  FolderOpen,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useTrashItems } from "@/features/trash/queries";
import {
  useRestoreItem,
  useDeletePermanent,
  useEmptyTrash,
} from "@/features/trash/mutations";
import { formatBytes } from "@/lib/format";
import { getApiErrorMessage } from "@/types/api";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import {
  Flex,
  Box,
  Heading,
  Text,
  Grid,
  IconButton,
  DropdownMenu,
  Card,
  Button,
} from "@radix-ui/themes";
import { ViewModeToggle } from "@/features/dashboard/components/ViewModeToggle";

export default function TrashPage() {
  const { data: trashData, isLoading } = useTrashItems();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "folder" | "file";
    id: string;
  } | null>(null);
  const restoreMutation = useRestoreItem();
  const deletePermanentMutation = useDeletePermanent();
  const emptyTrashMutation = useEmptyTrash();
  const [isConfirmEmptyOpen, setIsConfirmEmptyOpen] = useState(false);

  const handleRestore = (type: "folder" | "file", id: string) => {
    restoreMutation.mutate(
      { type, id },
      {
        onSuccess: () => toast.success("Khôi phục thành công!"),
        onError: (error) =>
          toast.error(getApiErrorMessage(error, "Lỗi khôi phục.")),
      },
    );
  };

  const confirmDeletePermanent = async () => {
    if (!deleteTarget) return;
    deletePermanentMutation.mutate(deleteTarget, {
      onSuccess: () => {
        toast.success("Đã xóa vĩnh viễn.");
        setDeleteTarget(null);
      },
      onError: () => toast.error("Lỗi xóa vĩnh viễn."),
    });
  };

  const handleEmptyTrash = () => {
    emptyTrashMutation.mutate(undefined, {
      onSuccess: () => {
        setIsConfirmEmptyOpen(false);
      },
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Không rõ";
    return format(new Date(dateString), "dd MMM, yyyy HH:mm", { locale: vi });
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

  const folders = trashData?.folders || [];
  const files = trashData?.files || [];
  const isEmpty = folders.length === 0 && files.length === 0;

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
      {/* Header */}
      <Flex
        direction={{ initial: "column", sm: "row" }}
        align={{ initial: "stretch", sm: "end" }}
        justify="between"
        gap="4"
        px={{ initial: "4", sm: "6", lg: "8" }}
        py="5"
        className="relative z-10 bg-card/30 backdrop-blur-xl"
        style={{ borderBottom: "1px solid var(--gray-a4)", flexShrink: 0 }}
      >
        <Box>
          <Heading
            size="6"
            weight="bold"
            style={{
              letterSpacing: "-0.025em",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              color: "var(--card-heading)",
            }}
          >
            <Trash2
              style={{ width: 32, height: 32, color: "var(--icon-storage)" }}
            />
            Thùng rác
          </Heading>
          <Text
            size="2"
            mt="1"
            style={{ display: "block", color: "var(--muted-foreground)" }}
          >
            Nơi chứa các tệp đã xóa. Tự động dọn dẹp sau 30 ngày.
          </Text>
        </Box>

        <Flex align="center" gap="3" style={{ flexShrink: 0 }}>
          {!isEmpty && (
            <Button
              color="red"
              variant="soft"
              onClick={() => setIsConfirmEmptyOpen(true)}
              style={{ cursor: "pointer" }}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Dọn sạch thùng rác
            </Button>
          )}
          <ViewModeToggle value={viewMode} onChange={setViewMode} />
        </Flex>
      </Flex>

      {/* Content  */}
      <Box
        p={{ initial: "4", sm: "6", lg: "8" }}
        style={{ flex: 1, overflowY: "auto", position: "relative", zIndex: 0 }}
      >
        {isEmpty ? (
          <Flex
            direction="column"
            align="center"
            justify="center"
            p="6"
            style={{
              minHeight: "400px",
              borderRadius: "var(--radius-5)",
              textAlign: "center",
            }}
          >
            <Box
              p="4"
              mb="4"
              style={{
                borderRadius: "100%",
                backgroundColor: "var(--gray-a3)",
              }}
            >
              <Sparkles
                style={{ width: 64, height: 64, color: "var(--gray-a5)" }}
              />
            </Box>
            <Heading
              size="6"
              mb="3"
              style={{ color: "var(--color-foreground)" }}
            >
              Thùng rác trống
            </Heading>
            <Text
              size="3"
              style={{ maxWidth: "24rem", color: "var(--muted-foreground)" }}
            >
              Không có thư mục hay tệp tin nào đã bị xóa gần đây.
            </Text>
          </Flex>
        ) : (
          <Flex direction="column" gap="6">
            {/* Folders Section */}
            {folders.length > 0 && (
              <Box>
                <Text
                  size="2"
                  weight="bold"
                  mb="4"
                  style={{
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    display: "block",
                    color: "var(--muted-foreground)",
                  }}
                >
                  Thư mục bị xóa ({folders.length})
                </Text>

                {viewMode === "grid" ? (
                  <Grid
                    columns={{ initial: "1", sm: "2", lg: "3", xl: "4" }}
                    gap="4"
                  >
                    {folders.map((folder) => (
                      <Card
                        key={folder.id}
                        size="2"
                        variant="ghost"
                        className="group"
                        style={{ position: "relative", border: "none" }}
                      >
                        <Flex align="center" gap="3" mb="1">
                          <Flex
                            align="center"
                            justify="center"
                            flexShrink="0"
                            style={{
                              width: 40,
                              height: 40,
                              backgroundColor: "var(--amber-a3)",
                              borderRadius: "var(--radius-3)",
                            }}
                          >
                            <FolderOpen
                              className="w-5 h-5"
                              style={{ color: "var(--amber-11)" }}
                            />
                          </Flex>
                          <Box
                            style={{
                              flex: 1,
                              minWidth: 0,
                              paddingRight: "1.5rem",
                            }}
                          >
                            <Text
                              size="3"
                              weight="bold"
                              truncate
                              style={{ color: "var(--color-foreground)" }}
                            >
                              {folder.name}
                            </Text>
                            <Text
                              size="1"
                              as="div"
                              truncate
                              style={{ color: "var(--muted-foreground)" }}
                            >
                              Xóa: {formatDate(folder.deletedAt)}
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
                            <DropdownMenu.Content
                              size="2"
                              variant="solid"
                              align="end"
                            >
                              <DropdownMenu.Item
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRestore("folder", folder.id);
                                }}
                                className="cursor-pointer"
                                style={{ color: "var(--gray-11)" }}
                              >
                                <RotateCcw className="w-4 h-4 mr-2" /> Khôi phục
                              </DropdownMenu.Item>
                              <DropdownMenu.Item
                                color="red"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteTarget({
                                    type: "folder",
                                    id: folder.id,
                                  });
                                }}
                                className="cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Xóa vĩnh
                                viễn
                              </DropdownMenu.Item>
                            </DropdownMenu.Content>
                          </DropdownMenu.Root>
                        </Box>
                      </Card>
                    ))}
                  </Grid>
                ) : (
                  <Card
                    size="1"
                    variant="ghost"
                    style={{ padding: 0, overflow: "hidden", border: "none" }}
                  >
                    <Flex
                      px="4"
                      py="3"
                      style={{
                        borderBottom: "1px solid var(--gray-a4)",
                        backgroundColor: "var(--gray-a2)",
                      }}
                    >
                      <Box style={{ flex: 5 }}>
                        <Text
                          size="2"
                          weight="medium"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          Tên thư mục
                        </Text>
                      </Box>
                      <Box style={{ flex: 4 }}>
                        <Text
                          size="2"
                          weight="medium"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          Ngày xóa
                        </Text>
                      </Box>
                      <Box style={{ flex: 1, textAlign: "right" }}>
                        <Text
                          size="2"
                          weight="medium"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          Thao tác
                        </Text>
                      </Box>
                    </Flex>
                    <Flex direction="column">
                      {folders.map((folder, idx) => (
                        <Flex
                          key={folder.id}
                          align="center"
                          px="4"
                          py="3"
                          className="group hover:bg-secondary/50"
                          style={{
                            borderBottom:
                              idx < folders.length - 1
                                ? "1px solid var(--gray-a3)"
                                : "none",
                            transition: "background-color 0.2s",
                          }}
                        >
                          <Flex
                            align="center"
                            gap="3"
                            style={{ flex: 5, minWidth: 0 }}
                          >
                            <Flex
                              align="center"
                              justify="center"
                              flexShrink="0"
                              style={{
                                width: 40,
                                height: 40,
                                backgroundColor: "var(--amber-a3)",
                                borderRadius: "var(--radius-3)",
                              }}
                            >
                              <FolderOpen
                                className="w-5 h-5"
                                style={{ color: "var(--amber-11)" }}
                              />
                            </Flex>
                            <Text
                              size="2"
                              weight="medium"
                              truncate
                              style={{ color: "var(--color-foreground)" }}
                            >
                              {folder.name}
                            </Text>
                          </Flex>
                          <Box style={{ flex: 4 }}>
                            <Text
                              size="2"
                              style={{ color: "var(--muted-foreground)" }}
                            >
                              {formatDate(folder.deletedAt)}
                            </Text>
                          </Box>
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
                              <DropdownMenu.Content
                                size="2"
                                variant="solid"
                                align="end"
                              >
                                <DropdownMenu.Item
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRestore("folder", folder.id);
                                  }}
                                  className="cursor-pointer"
                                  style={{ color: "var(--gray-11)" }}
                                >
                                  <RotateCcw className="w-4 h-4 mr-2" /> Khôi
                                  phục
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                  color="red"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteTarget({
                                      type: "folder",
                                      id: folder.id,
                                    });
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" /> Xóa vĩnh
                                  viễn
                                </DropdownMenu.Item>
                              </DropdownMenu.Content>
                            </DropdownMenu.Root>
                          </Flex>
                        </Flex>
                      ))}
                    </Flex>
                  </Card>
                )}
              </Box>
            )}

            {/* Files Section */}
            {files.length > 0 && (
              <Box>
                <Text
                  size="2"
                  weight="bold"
                  mb="4"
                  style={{
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    display: "block",
                    color: "var(--muted-foreground)",
                  }}
                >
                  Tệp bị xóa ({files.length})
                </Text>

                {viewMode === "grid" ? (
                  <Grid
                    columns={{ initial: "1", sm: "2", lg: "3", xl: "5" }}
                    gap="4"
                  >
                    {files.map((file) => {
                      const Icon = FileIcon;
                      const colorName = "rose";

                      return (
                        <Card
                          key={file.id}
                          size="2"
                          variant="surface"
                          className="group"
                          style={{ position: "relative" }}
                        >
                          <Flex align="start" gap="3" mb="1">
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
                            <Box
                              style={{
                                flex: 1,
                                minWidth: 0,
                                paddingRight: "1.5rem",
                              }}
                            >
                              <Text
                                size="2"
                                weight="bold"
                                truncate
                                as="div"
                                title={file.name}
                                style={{
                                  lineHeight: "1.25",
                                  marginBottom: "4px",
                                  color: "var(--color-foreground)",
                                }}
                              >
                                {file.name}
                              </Text>
                              <Text
                                size="1"
                                as="div"
                                truncate
                                style={{ color: "var(--muted-foreground)" }}
                              >
                                {formatBytes(file.size)} • Xóa:{" "}
                                {formatDate(file.deletedAt)}
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
                              <DropdownMenu.Content
                                size="2"
                                variant="solid"
                                align="end"
                              >
                                <DropdownMenu.Item
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRestore("file", file.id);
                                  }}
                                  className="cursor-pointer"
                                  style={{ color: "var(--gray-11)" }}
                                >
                                  <RotateCcw className="w-4 h-4 mr-2" /> Khôi
                                  phục
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                  color="red"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteTarget({
                                      type: "file",
                                      id: file.id,
                                    });
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" /> Xóa vĩnh
                                  viễn
                                </DropdownMenu.Item>
                              </DropdownMenu.Content>
                            </DropdownMenu.Root>
                          </Box>
                        </Card>
                      );
                    })}
                  </Grid>
                ) : (
                  <Card
                    size="1"
                    variant="ghost"
                    style={{ padding: 0, overflow: "hidden", border: "none" }}
                  >
                    <Flex
                      px="4"
                      py="3"
                      style={{
                        borderBottom: "1px solid var(--gray-a4)",
                        backgroundColor: "var(--gray-a2)",
                      }}
                    >
                      <Box style={{ flex: 5 }}>
                        <Text
                          size="2"
                          weight="medium"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          Tên tệp
                        </Text>
                      </Box>
                      <Box style={{ flex: 2, textAlign: "right" }}>
                        <Text
                          size="2"
                          weight="medium"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          Dung lượng
                        </Text>
                      </Box>
                      <Box style={{ flex: 2 }} className="ml-4">
                        <Text
                          size="2"
                          weight="medium"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          Ngày xóa
                        </Text>
                      </Box>
                      <Box style={{ flex: 1, textAlign: "right" }}>
                        <Text
                          size="2"
                          weight="medium"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          Thao tác
                        </Text>
                      </Box>
                    </Flex>
                    <Flex direction="column">
                      {files.map((file, idx) => {
                        const Icon = FileIcon;
                        const colorName = "rose";

                        return (
                          <Flex
                            key={file.id}
                            align="center"
                            px="4"
                            py="3"
                            className="group hover:bg-secondary/50"
                            style={{
                              borderBottom:
                                idx < files.length - 1
                                  ? "1px solid var(--gray-a3)"
                                  : "none",
                              transition: "background-color 0.2s",
                            }}
                          >
                            <Flex
                              align="center"
                              gap="3"
                              style={{ flex: 5, minWidth: 0 }}
                            >
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
                            <Box style={{ flex: 2 }} className="ml-4">
                              <Text
                                size="2"
                                style={{ color: "var(--muted-foreground)" }}
                              >
                                {formatDate(file.deletedAt)}
                              </Text>
                            </Box>
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
                                <DropdownMenu.Content
                                  size="2"
                                  variant="solid"
                                  align="end"
                                >
                                  <DropdownMenu.Item
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRestore("file", file.id);
                                    }}
                                    className="cursor-pointer"
                                    style={{ color: "var(--gray-11)" }}
                                  >
                                    <RotateCcw className="w-4 h-4 mr-2" /> Khôi
                                    phục
                                  </DropdownMenu.Item>
                                  <DropdownMenu.Item
                                    color="red"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeleteTarget({
                                        type: "file",
                                        id: file.id,
                                      });
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" /> Xóa vĩnh
                                    viễn
                                  </DropdownMenu.Item>
                                </DropdownMenu.Content>
                              </DropdownMenu.Root>
                            </Flex>
                          </Flex>
                        );
                      })}
                    </Flex>
                  </Card>
                )}
              </Box>
            )}
          </Flex>
        )}
      </Box>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeletePermanent}
        title="Xóa vĩnh viễn"
        description={`Bạn có chắc muốn XÓA VĨNH VIỄN ${deleteTarget?.type === "folder" ? "thư mục" : "tệp"} này không? Hành động này không thể hoàn tác và dữ liệu sẽ mất vĩnh viễn!`}
        confirmText="Xác nhận xóa"
        color="red"
      />

      <ConfirmModal
        isOpen={isConfirmEmptyOpen}
        onClose={() => setIsConfirmEmptyOpen(false)}
        onConfirm={handleEmptyTrash}
        title="Dọn sạch thùng rác"
        description="Bạn có chắc chắn muốn dọn sạch thùng rác không? Toàn bộ tệp và thư mục sẽ bị xoá vĩnh viễn và KHÔNG THỂ KHÔI PHỤC."
        confirmText="Dọn sạch"
        color="red"
      />
    </Flex>
  );
}

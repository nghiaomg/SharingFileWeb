"use client";

import { useUploadStore } from "../upload-store";
import {
  Box,
  Flex,
  Card,
  Text,
  IconButton,
  Button,
  Progress,
} from "@radix-ui/themes";
import {
  Play,
  Pause,
  X,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
  GripHorizontal,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, useDragControls } from "framer-motion";

export function UploadQueueManager() {
  const {
    items,
    pauseUpload,
    resumeUpload,
    cancelUpload,
    retryUpload,
    moveUp,
    moveDown,
    clearCompleted,
  } = useUploadStore();
  const [isMinimized, setIsMinimized] = useState(false);
  const dragControls = useDragControls();

  const totalFiles = items.length;
  const completedFiles = items.filter((i) => i.status === "SUCCESS").length;
  const isAllDone = totalFiles > 0 && completedFiles === totalFiles;

  // Tự động ẩn (xóa hàng đợi) sau khi hoàn tất tất cả được 3 giây
  useEffect(() => {
    if (isAllDone) {
      const timer = setTimeout(() => {
        clearCompleted();
        setIsMinimized(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isAllDone, clearCompleted]);

  if (items.length === 0) return null;

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
      }}
    >
      {isMinimized ? (
        // Chế độ Bong bóng (Bubble) khi bị thu nhỏ bằng dấu X
        <Button
          size="3"
          variant="solid"
          color="gray"
          onClick={() => setIsMinimized(false)}
          onPointerDown={(e) => dragControls.start(e)}
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "var(--shadow-5)",
            cursor: "grab",
            touchAction: "none",
          }}
        >
          <ChevronUp className="w-5 h-5 pointer-events-none" />
          <Text size="1" weight="bold" className="pointer-events-none">
            {completedFiles}/{totalFiles}
          </Text>
        </Button>
      ) : (
        // Chế độ hiển thị chi tiết đầy đủ
        <Card
          size="2"
          variant="surface"
          style={{
            width: "380px",
            boxShadow: "var(--shadow-5)",
            display: "flex",
            flexDirection: "column",
            maxHeight: "400px",
          }}
        >
          {/* Header with Drag Handle */}
          <Flex
            align="center"
            justify="between"
            mb="4"
            onPointerDown={(e) => dragControls.start(e)}
            style={{ cursor: "grab", touchAction: "none" }}
          >
            <Flex align="center" gap="2">
              <GripHorizontal
                className="w-4 h-4"
                style={{ color: "var(--muted-foreground)" }}
              />
              <Text
                size="3"
                weight="bold"
                style={{ color: "var(--color-foreground)" }}
              >
                Đang tải lên {completedFiles}/{totalFiles}
              </Text>
            </Flex>
            <Flex gap="2" onPointerDown={(e) => e.stopPropagation()}>
              {isAllDone && (
                <Button
                  size="1"
                  variant="ghost"
                  color="gray"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearCompleted();
                  }}
                >
                  Xóa tất cả
                </Button>
              )}
              <IconButton
                size="1"
                variant="ghost"
                color="gray"
                onClick={() => setIsMinimized(true)}
                title="Thu nhỏ thành bong bóng"
              >
                <X className="w-4 h-4" />
              </IconButton>
            </Flex>
          </Flex>

          {/* Queue List */}
          <Flex
            direction="column"
            gap="3"
            style={{ overflowY: "auto", flex: 1, paddingRight: "4px" }}
          >
            {items.map((item, index) => {
              const isPending = item.status === "PENDING";
              const isUploading = item.status === "UPLOADING";
              const isPaused = item.status === "PAUSED";
              const isSuccess = item.status === "SUCCESS";
              const isError = item.status === "ERROR";
              const isCanceled = item.status === "CANCELED";

              const canMoveUp =
                isPending &&
                index > 0 &&
                items[index - 1].status !== "UPLOADING";
              const canMoveDown = isPending && index < items.length - 1;

              return (
                <Box
                  key={item.id}
                  p="2"
                  style={{
                    backgroundColor: "var(--gray-a2)",
                    borderRadius: "var(--radius-3)",
                  }}
                >
                  <Flex justify="between" align="start" gap="2" mb="2">
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        size="2"
                        weight="medium"
                        truncate
                        style={{ display: "block" }}
                      >
                        {item.file.name}
                      </Text>

                      {/* Status Text */}
                      <Text
                        size="1"
                        style={
                          isError
                            ? { color: "var(--destructive)" }
                            : isSuccess
                              ? { color: "var(--icon-teal)" }
                              : { color: "var(--muted-foreground)" }
                        }
                      >
                        {isSuccess && "Thành công"}
                        {isUploading && `Đang tải... ${item.progress}%`}
                        {isPending && "Chờ đến lượt"}
                        {isPaused && "Đã tạm dừng"}
                        {isError && (item.errorMessage || "Lỗi tải lên")}
                        {isCanceled && "Đã hủy"}
                      </Text>
                    </Box>

                    {/* Actions */}
                    <Flex gap="1" align="center">
                      {(isPending || isPaused) && !isCanceled && (
                        <IconButton
                          size="1"
                          variant="ghost"
                          color="gray"
                          onClick={() => resumeUpload(item.id)}
                          title="Tiếp tục"
                        >
                          <Play className="w-4 h-4" />
                        </IconButton>
                      )}
                      {isUploading && (
                        <IconButton
                          size="1"
                          variant="ghost"
                          color="orange"
                          onClick={() => pauseUpload(item.id)}
                          title="Tạm dừng"
                        >
                          <Pause className="w-4 h-4" />
                        </IconButton>
                      )}
                      {isError && (
                        <IconButton
                          size="1"
                          variant="ghost"
                          color="blue"
                          onClick={() => retryUpload(item.id)}
                          title="Thử lại"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </IconButton>
                      )}
                      {(isPending || isUploading || isPaused || isError) &&
                        !isCanceled && (
                          <IconButton
                            size="1"
                            variant="ghost"
                            color="red"
                            onClick={() => cancelUpload(item.id)}
                            title="Hủy"
                          >
                            <XCircle className="w-4 h-4" />
                          </IconButton>
                        )}
                      {isSuccess && (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      )}
                      {isError && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </Flex>
                  </Flex>

                  {/* Progress Bar */}
                  {!isSuccess && !isError && !isCanceled && (
                    <Flex align="center" gap="2">
                      <Box style={{ flex: 1 }}>
                        <Progress
                          value={item.progress}
                          size="1"
                          color={isPaused ? "amber" : "violet"}
                        />
                      </Box>
                      {/* Priority reordering */}
                      {isPending && (
                        <Flex gap="1">
                          <IconButton
                            size="1"
                            variant="soft"
                            color="gray"
                            disabled={!canMoveUp}
                            onClick={() => moveUp(item.id)}
                          >
                            <ChevronUp className="w-3 h-3" />
                          </IconButton>
                          <IconButton
                            size="1"
                            variant="soft"
                            color="gray"
                            disabled={!canMoveDown}
                            onClick={() => moveDown(item.id)}
                          >
                            <ChevronDown className="w-3 h-3" />
                          </IconButton>
                        </Flex>
                      )}
                    </Flex>
                  )}
                </Box>
              );
            })}
          </Flex>
        </Card>
      )}
    </motion.div>
  );
}

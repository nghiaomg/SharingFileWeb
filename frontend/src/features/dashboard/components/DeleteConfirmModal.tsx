"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Dialog, Button, Flex, Text, Callout } from "@radix-ui/themes";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  name: string;
  type?: "folder" | "file";
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  name,
}: DeleteConfirmModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    try {
      setError("");
      setIsLoading(true);
      await onConfirm();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        const e = err as Error & { response?: { data?: { message?: string } } };
        setError(
          e.response?.data?.message ||
            e.message ||
            "Lỗi khi xóa. Vui lòng thử lại.",
        );
      } else {
        setError("Lỗi khi xóa. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) onClose();
      }}
    >
      <Dialog.Content maxWidth="450px">
        <Dialog.Title>
          <Flex align="center" gap="2" style={{ color: "var(--red-9)" }}>
            <AlertTriangle className="w-5 h-5" />
            <Text>Xác nhận xóa</Text>
          </Flex>
        </Dialog.Title>

        <Dialog.Description size="2" mb="4">
          Bạn có chắc chắn muốn bỏ <Text weight="bold">{name}</Text> vào thùng
          rác không?
          <br />
          <Text color="gray" size="1">
            Dữ liệu có thể được khôi phục hoặc xóa vĩnh viễn trong thùng rác sau
            30 ngày.
          </Text>
        </Dialog.Description>

        {error && (
          <Callout.Root color="red" mb="4">
            <Callout.Text>{error}</Callout.Text>
          </Callout.Root>
        )}

        <Flex gap="3" justify="end">
          <Button
            variant="soft"
            color="gray"
            onClick={onClose}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            color="red"
            onClick={handleConfirm}
            disabled={isLoading}
            loading={isLoading}
          >
            Bỏ vào thùng rác
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

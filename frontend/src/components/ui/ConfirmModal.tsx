"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Dialog, Button, Flex, Text } from "@radix-ui/themes";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  color?: React.ComponentProps<typeof Button>["color"];
  icon?: React.ReactNode;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  color = "blue",
  icon = <AlertTriangle className="w-5 h-5" />,
}: ConfirmModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onConfirm();
      onClose();
    } catch (err) {
      console.error(err);
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
          <Flex align="center" gap="2">
            {icon}
            <Text>{title}</Text>
          </Flex>
        </Dialog.Title>

        <Dialog.Description size="2" mb="5" mt="2">
          {description}
        </Dialog.Description>

        <Flex gap="3" justify="end">
          <Button
            variant="soft"
            color="gray"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            color={color}
            onClick={handleConfirm}
            disabled={isLoading}
            loading={isLoading}
          >
            {confirmText}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

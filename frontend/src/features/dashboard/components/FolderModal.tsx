"use client";

import { useState } from "react";
import { Dialog, Button, Flex, TextField, Callout } from "@radix-ui/themes";

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  folder?: { id: string; name: string } | null;
  isLoading?: boolean;
}

export function FolderModal({
  isOpen,
  onClose,
  onSubmit,
  folder,
  isLoading = false,
}: FolderModalProps) {
  const [name, setName] = useState(folder?.name || "");
  const [error, setError] = useState("");

  const isEdit = !!folder;
  const title = isEdit ? "Đổi tên thư mục" : "Tạo thư mục mới";
  const submitText = isEdit ? "Lưu" : "Tạo";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Tên thư mục không được để trống.");
      return;
    }

    onSubmit(name.trim());
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) onClose();
      }}
    >
      <Dialog.Content maxWidth="450px">
        <Dialog.Title>{title}</Dialog.Title>

        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="3" mb="4">
            <label>Tên thư mục</label>
            <TextField.Root
              placeholder="Nhập tên thư mục..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              size="3"
            />
          </Flex>

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
              type="button"
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading} loading={isLoading}>
              {submitText}
            </Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}

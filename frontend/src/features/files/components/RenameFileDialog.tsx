import React, { useState } from "react";
import { Dialog, Button, Flex, Text, TextField } from "@radix-ui/themes";
import type { FileItem } from "@/features/files/schemas";

interface RenameFileDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (newName: string) => void;
    file: FileItem | null;
    isLoading?: boolean;
}

export function RenameFileDialog({ isOpen, onClose, onSubmit, file, isLoading = false }: RenameFileDialogProps) {
    const [name, setName] = useState(file?.name || "");

    // Cập nhật lại state name khi file.name thay đổi (ví dụ khi đóng/mở với file khác)
    const prevFileId = React.useRef(file?.id);
    if (file?.id !== prevFileId.current) {
        prevFileId.current = file?.id;
        setName(file?.name || "");
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed || (file && trimmed === file.name)) {
            onClose();
            return;
        }
        onSubmit(trimmed);
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Content maxWidth="450px" style={{ borderRadius: "var(--radius-4)", padding: "24px" }}>
                <Dialog.Title size="5" weight="bold" mb="4">
                    Đổi tên tệp
                </Dialog.Title>
                
                <form onSubmit={handleSubmit}>
                    <Flex direction="column" gap="4">
                        <label>
                            <Text as="div" size="2" mb="2" weight="bold" color="gray">
                                Tên tệp
                            </Text>
                            <TextField.Root placeholder="Nhập tên tệp mới..." value={name} onChange={(e) => setName(e.target.value)} size="3" autoFocus />
                        </label>
                    </Flex>

                    <Flex gap="3" mt="6" justify="end">
                        <Dialog.Close>
                            <Button variant="soft" color="gray" type="button" size="3" disabled={isLoading} style={{ cursor: "pointer" }}>
                                Hủy
                            </Button>
                        </Dialog.Close>
                        <Button type="submit" size="3" disabled={isLoading || !name.trim()} style={{ cursor: isLoading ? "wait" : "pointer" }}>
                            {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                        </Button>
                    </Flex>
                </form>
            </Dialog.Content>
        </Dialog.Root>
    );
}

"use client";

import { useState } from "react";
import {
    Dialog,
    TextField,
    Button,
    Text,
    IconButton,
    TextArea,
    Select,
} from "@radix-ui/themes";
import { X, Send } from "lucide-react";
import { useBroadcastNotification } from "../../hooks/useNotificationsMutation";
import { toast } from "sonner";

interface BroadcastModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function BroadcastModal({ isOpen, onClose }: BroadcastModalProps) {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [targetEmail, setTargetEmail] = useState("ALL");
    const [type, setType] = useState("SYSTEM");

    const { mutate: broadcast, isPending } = useBroadcastNotification();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !message.trim()) return;

        broadcast(
            { title, message, targetEmail, type },
            {
                onSuccess: () => {
                    toast.success(
                        `Đã gửi thông báo tới ${targetEmail === "ALL" ? "Toàn bộ hệ thống" : targetEmail}`,
                    );
                    onClose();
                    setTitle("");
                    setMessage("");
                },
                onError: (err: unknown) => {
                    const eObj = err as { response?: { data?: { message?: string } } };
                    toast.error(eObj?.response?.data?.message || "Lỗi gửi thông báo");
                }
            },
        );
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={(val) => !val && onClose()}>
            <Dialog.Content
                maxWidth="500px"
                className="bg-card glass border border-border"
            >
                <Dialog.Title className="text-xl font-bold flex items-center justify-between">
                    <span>Gửi Thông báo Hệ thống (Broadcast)</span>
                    <IconButton variant="ghost" color="gray" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </IconButton>
                </Dialog.Title>
                <Dialog.Description size="2" mb="4" className="text-muted-foreground">
                    Soạn tin nhắn để đẩy Notification (chuông) cho người dùng toàn hệ
                    thống hoặc theo địa chỉ Email chỉ định.
                </Dialog.Description>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <label className="flex flex-col gap-1">
                        <Text size="2" weight="bold">
                            Nhóm đối tượng nhận
                        </Text>
                        <Select.Root
                            value={targetEmail === "ALL" ? "ALL" : "SPECIFIC"}
                            onValueChange={(val) =>
                                setTargetEmail(val === "ALL" ? "ALL" : "")
                            }
                        >
                            <Select.Trigger />
                            <Select.Content>
                                <Select.Item value="ALL">
                                    Toàn bộ người dùng (Broadcast Tất cả)
                                </Select.Item>
                                <Select.Item value="SPECIFIC">
                                    Cá nhân (Nhập Email cụ thể)
                                </Select.Item>
                            </Select.Content>
                        </Select.Root>
                    </label>

                    {targetEmail !== "ALL" && (
                        <label className="flex flex-col gap-1">
                            <Text size="2" weight="bold">
                                Email người nhận
                            </Text>
                            <TextField.Root
                                value={targetEmail}
                                onChange={(e) => setTargetEmail(e.target.value)}
                                placeholder="VD: user@gmail.com"
                                size="3"
                                required
                            />
                        </label>
                    )}

                    <label className="flex flex-col gap-1">
                        <Text size="2" weight="bold">
                            Loại tin nhắn
                        </Text>
                        <Select.Root value={type} onValueChange={setType}>
                            <Select.Trigger />
                            <Select.Content>
                                <Select.Item value="SYSTEM">Hệ thống (SYSTEM)</Select.Item>
                                <Select.Item value="ALERT">Cảnh báo (ALERT)</Select.Item>
                                <Select.Item value="PROMO">Khuyến mãi (PROMO)</Select.Item>
                            </Select.Content>
                        </Select.Root>
                    </label>

                    <label className="flex flex-col gap-1">
                        <Text size="2" weight="bold">
                            Tiêu đề (Title)
                        </Text>
                        <TextField.Root
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="VD: Chào mừng bạn đến hệ thống mới!"
                            size="3"
                            required
                        />
                    </label>

                    <label className="flex flex-col gap-1">
                        <Text size="2" weight="bold">
                            Nội dung (Message)
                        </Text>
                        <TextArea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Nhập nội dung chi tiết..."
                            size="3"
                            required
                        />
                    </label>

                    <div className="flex justify-end gap-3 mt-4">
                        <Button
                            variant="soft"
                            color="gray"
                            type="button"
                            onClick={onClose}
                            size="3"
                        >
                            Hủy
                        </Button>
                        <Button type="submit" size="3" disabled={isPending}>
                            <Send className="w-4 h-4 mr-2" /> Đẩy Thông Báo
                        </Button>
                    </div>
                </form>
            </Dialog.Content>
        </Dialog.Root>
    );
}

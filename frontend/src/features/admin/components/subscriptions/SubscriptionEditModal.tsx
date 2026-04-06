"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    TextField,
    Button,
    Switch,
    Text,
    IconButton,
    TextArea,
} from "@radix-ui/themes";
import { X, Plus, Trash2 } from "lucide-react";
import { AdminSubscriptionPlan } from "../../types/subscriptions.types";
import {
    useCreatePlan,
    useUpdatePlan,
} from "../../hooks/useSubscriptionsMutation";
import { toast } from "sonner";

interface SubscriptionEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan?: AdminSubscriptionPlan | null; // If null, it's create mode
}

export function SubscriptionEditModal({
    isOpen,
    onClose,
    plan,
}: SubscriptionEditModalProps) {
    const isEditing = !!plan;

    // Form State
    const [name, setName] = useState("");
    const [maxStorageMB, setMaxStorageMB] = useState("");
    const [maxFileSizeMB, setMaxFileSizeMB] = useState("");
    const [price, setPrice] = useState("");
    const [durationDays, setDurationDays] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [sortOrder, setSortOrder] = useState("0");
    const [description, setDescription] = useState("");
    const [features, setFeatures] = useState<string[]>([]);

    const { mutate: createPlan, isPending: isCreating } = useCreatePlan();
    const { mutate: updatePlan, isPending: isUpdating } = useUpdatePlan();

    useEffect(() => {
        setTimeout(() => {
            if (plan && isOpen) {
                setName(plan.name);
                setMaxStorageMB(String(Math.floor(plan.maxStorageBytes / (1024 * 1024))));
                setMaxFileSizeMB(
                    String(Math.floor(plan.maxFileSizeBytes / (1024 * 1024))),
                );
                setPrice(String(plan.price));
                setDurationDays(String(plan.durationDays));
                setIsActive(plan.isActive);
                setSortOrder(String(plan.sortOrder));
                setDescription(plan.description || "");
                setFeatures(plan.features || []);
            } else if (!plan && isOpen) {
                // Reset form
                setName("");
                setMaxStorageMB("1024");
                setMaxFileSizeMB("100");
                setPrice("0");
                setDurationDays("30");
                setIsActive(true);
                setSortOrder("10");
                setDescription("");
                setFeatures([]);
            }
        }, 0);
    }, [plan, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            name,
            maxStorageBytes: Number(maxStorageMB) * 1024 * 1024,
            maxFileSizeBytes: Number(maxFileSizeMB) * 1024 * 1024,
            price: Number(price),
            durationDays: Number(durationDays),
            isActive,
            sortOrder: Number(sortOrder),
            description,
            features,
        };

        if (isEditing && plan) {
            updatePlan(
                { id: plan.id, data: payload },
                {
                    onSuccess: () => {
                        toast.success("Cập nhật gói cước thành công");
                        onClose();
                    },
                    onError: (err: unknown) => {
                        const eObj = err as { response?: { data?: { message?: string } } };
                        toast.error(eObj?.response?.data?.message || "Lỗi cập nhật gói");
                    }
                },
            );
        } else {
            createPlan(payload, {
                onSuccess: () => {
                    toast.success("Tạo gói cước thành công");
                    onClose();
                },
                onError: (err: unknown) => {
                    const eObj = err as { response?: { data?: { message?: string } } };
                    toast.error(eObj?.response?.data?.message || "Lỗi tạo gói");
                }
            });
        }
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={(val) => !val && onClose()}>
            <Dialog.Content
                maxWidth="600px"
                className="bg-card glass border border-border"
            >
                <Dialog.Title className="text-xl font-bold flex items-center justify-between">
                    <span>
                        {isEditing ? `Sửa gói Plan: ${plan?.name}` : "Tạo gói Plan mới"}
                    </span>
                    <IconButton variant="ghost" color="gray" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </IconButton>
                </Dialog.Title>
                <Dialog.Description size="2" mb="4" className="text-muted-foreground">
                    Điền các thông số dung lượng, giá và tính năng cho Gói Đăng Ký.
                </Dialog.Description>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="grid grid-cols-2 gap-4">
                        <label className="flex flex-col gap-1">
                            <Text size="2" weight="bold">
                                Tên Gói (Name)
                            </Text>
                            <TextField.Root
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="VD: VIP_PRO"
                                size="3"
                                required
                            />
                        </label>

                        <label className="flex flex-col gap-1">
                            <Text size="2" weight="bold">
                                Giá (VND)
                            </Text>
                            <TextField.Root
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="0"
                                size="3"
                                required
                            />
                        </label>

                        <label className="flex flex-col gap-1">
                            <Text size="2" weight="bold">
                                Dung lượng Tổng (MB)
                            </Text>
                            <TextField.Root
                                type="number"
                                value={maxStorageMB}
                                onChange={(e) => setMaxStorageMB(e.target.value)}
                                placeholder="1024"
                                size="3"
                                required
                            />
                        </label>

                        <label className="flex flex-col gap-1">
                            <Text size="2" weight="bold">
                                Giới hạn 1 File (MB)
                            </Text>
                            <TextField.Root
                                type="number"
                                value={maxFileSizeMB}
                                onChange={(e) => setMaxFileSizeMB(e.target.value)}
                                placeholder="100"
                                size="3"
                                required
                            />
                        </label>

                        <label className="flex flex-col gap-1">
                            <Text size="2" weight="bold">
                                Thời hạn (Ngày)
                            </Text>
                            <TextField.Root
                                type="number"
                                value={durationDays}
                                onChange={(e) => setDurationDays(e.target.value)}
                                placeholder="30"
                                size="3"
                                required
                            />
                        </label>

                        <label className="flex flex-col gap-1">
                            <Text size="2" weight="bold">
                                Thứ tự Hiển thị (Order)
                            </Text>
                            <TextField.Root
                                type="number"
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                placeholder="10"
                                size="3"
                                required
                            />
                        </label>
                    </div>

                    <label className="flex flex-col gap-1">
                        <Text size="2" weight="bold">
                            Mô tả ngắn
                        </Text>
                        <TextArea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Gói cước dành cho người dùng cơ bản..."
                            size="3"
                        />
                    </label>

                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <Text size="2" weight="bold">
                                Danh sách Tính năng
                            </Text>
                            <Button
                                type="button"
                                size="1"
                                variant="soft"
                                onClick={() => setFeatures([...features, ""])}
                            >
                                <Plus className="w-3 h-3" /> Thêm item
                            </Button>
                        </div>
                        {features.map((feat, idx) => (
                            <div key={idx} className="flex gap-2 w-full">
                                <TextField.Root
                                    value={feat}
                                    onChange={(e) => {
                                        const newF = [...features];
                                        newF[idx] = e.target.value;
                                        setFeatures(newF);
                                    }}
                                    className="flex-1"
                                    placeholder="Tính năng..."
                                />
                                <IconButton
                                    type="button"
                                    color="red"
                                    variant="soft"
                                    onClick={() => {
                                        setFeatures(features.filter((_, i) => i !== idx));
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </IconButton>
                            </div>
                        ))}
                    </div>

                    <label className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border border-border mt-2">
                        <Text size="2" weight="bold">
                            Trạng thái Kích Hoạt (Hoạt động)
                        </Text>
                        <Switch checked={isActive} onCheckedChange={setIsActive} />
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
                        <Button type="submit" size="3" disabled={isCreating || isUpdating}>
                            {isEditing ? "Lưu thay đổi" : "Tạo gói Plan"}
                        </Button>
                    </div>
                </form>
            </Dialog.Content>
        </Dialog.Root>
    );
}

"use client";

import { useState } from "react";
import { Link as LinkIcon, Users, Globe, Plus, Copy, Trash2, ShieldCheck, Eye, Download, Lock, Pencil, X } from "lucide-react";
import { useShareInternal, useCreateShareLink, useRevokeShareLink, useUpdateShareLink, useRevokeAccess, useUpdatePermission } from "@/features/files/share-mutations";
import { useFileAccesses, useFileLinks } from "@/features/files/share-queries";
import type { FileItem, ShareLinkItem } from "@/features/files/schemas";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/types/api";
import { Dialog, Tabs, Flex, Text, TextField, Button, IconButton, Select, Box, Card, Badge, Callout } from "@radix-ui/themes";

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    file: FileItem | null;
}

const PERMISSION_LABELS: Record<string, { label: string; icon: typeof Eye; color: string }> = {
    VIEW: { label: "Xem", icon: Eye, color: "var(--indigo-a9)" },
    DOWNLOAD: { label: "Tải xuống", icon: Download, color: "var(--jade-a9)" },
};

function PermissionSelectLocal({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <Flex gap="2">
            {Object.entries(PERMISSION_LABELS).map(([key, meta]) => {
                const Icon = meta.icon;
                const isActive = value === key;
                return (
                    <Button
                        key={key}
                        type="button"
                        variant={isActive ? "soft" : "outline"}
                        color={isActive ? (key === "VIEW" ? "indigo" : "jade") : "gray"}
                        onClick={() => onChange(key)}
                        style={{ cursor: "pointer" }}
                    >
                        <Icon className="w-3.5 h-3.5" />
                        {meta.label}
                    </Button>
                );
            })}
        </Flex>
    );
}

export function ShareModal({ isOpen, onClose, file }: ShareModalProps) {
    // ─── Invite Tab State ─────────────────────────────────────────
    const [emailInput, setEmailInput] = useState("");
    const [emails, setEmails] = useState<string[]>([]);
    const [invitePermission, setInvitePermission] = useState("VIEW");

    // ─── Link Tab State ───────────────────────────────────────────
    const [linkPermission, setLinkPermission] = useState("DOWNLOAD");
    const [linkPassword, setLinkPassword] = useState("");
    const [linkExpiry, setLinkExpiry] = useState<number | "">("");
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);

    // ─── Edit Link State ──────────────────────────────────────────
    const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
    const [editLinkPermission, setEditLinkPermission] = useState<string>("VIEW");
    const [editLinkPassword, setEditLinkPassword] = useState("");
    const [editLinkExpiry, setEditLinkExpiry] = useState<number | "">("");

    // ─── Mutations ────────────────────────────────────────────────
    const shareInternalMutation = useShareInternal();
    const createLinkMutation = useCreateShareLink();
    const revokeLinkMutation = useRevokeShareLink();
    const updateLinkMutation = useUpdateShareLink();
    const revokeAccessMutation = useRevokeAccess();
    const updatePermissionMutation = useUpdatePermission();

    // ─── Queries ──────────────────────────────────────────────────
    const { data: accesses = [], refetch: refetchAccesses } = useFileAccesses(file?.id || "");
    const { data: links = [], refetch: refetchLinks } = useFileLinks(file?.id || "");

    if (!isOpen || !file) return null;

    const startEditLink = (link: ShareLinkItem) => {
        setEditingLinkId(link.id);
        setEditLinkPermission(link.permission);
        setEditLinkPassword("");
        setEditLinkExpiry("");
    };

    const handleUpdateLink = (linkId: string) => {
        updateLinkMutation.mutate(
            { 
                linkId, 
                data: {
                    permission: editLinkPermission as "VIEW" | "DOWNLOAD",
                    password: editLinkPassword === "" ? null : editLinkPassword,
                    expiresInDays: editLinkExpiry === "" ? null : Number(editLinkExpiry)
                }
            },
            {
                onSuccess: () => {
                    toast.success("Đã cập nhật link chia sẻ");
                    setEditingLinkId(null);
                    refetchLinks();
                },
                onError: (err: Error) => toast.error(getApiErrorMessage(err)),
            }
        );
    };

    // ─── Invite Handlers ──────────────────────────────────────────
    const handleAddEmail = () => {
        const trimmed = emailInput.trim();
        if (!trimmed || !trimmed.includes("@")) {
            toast.error("Email không hợp lệ");
            return;
        }
        if (emails.includes(trimmed)) {
            toast.error("Email đã có trong danh sách");
            return;
        }
        setEmails((prev) => [...prev, trimmed]);
        setEmailInput("");
    };

    const handleSendInvites = () => {
        if (emails.length === 0) {
            toast.error("Vui lòng thêm ít nhất một email");
            return;
        }
        shareInternalMutation.mutate(
            { fileId: file.id, emails, permission: invitePermission as "VIEW" | "DOWNLOAD" },
            {
                onSuccess: () => {
                    toast.success(`Đã chia sẻ cho ${emails.length} người`);
                    setEmails([]);
                    refetchAccesses();
                },
                onError: (err) => toast.error(getApiErrorMessage(err)),
            }
        );
    };

    // ─── Link Handlers ────────────────────────────────────────────
    const handleCreateLink = () => {
        createLinkMutation.mutate(
            {
                fileId: file.id,
                permission: linkPermission as "VIEW" | "DOWNLOAD",
                password: linkPassword || null,
                expiresInDays: linkExpiry === "" ? null : Number(linkExpiry),
            },
            {
                onSuccess: (data) => {
                    const fullUrl = `${window.location.origin}/shared/${data.token}`;
                    setGeneratedLink(fullUrl);
                    refetchLinks();
                    toast.success("Đã tạo link chia sẻ!");
                },
                onError: (err) => toast.error(getApiErrorMessage(err)),
            }
        );
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => {
            if (!open) onClose();
        }}>
            <Dialog.Content maxWidth="800px" style={{ display: 'flex', flexDirection: 'column', padding: 0, maxHeight: '90vh' }}>
                {/* Header */}
                <Box p="4" style={{ borderBottom: "1px solid var(--gray-a6)" }}>
                    <Flex justify="between" align="center" gap="3">
                        <Dialog.Title style={{ margin: 0, minWidth: 0 }}>
                            <Flex align="center" gap="2" style={{ minWidth: 0 }}>
                                <Globe className="w-5 h-5" style={{ flexShrink: 0, color: "var(--icon-indigo)" }} />
                                <Text truncate style={{ color: "var(--color-foreground)" }}>Chia sẻ: {file.name}</Text>
                            </Flex>
                        </Dialog.Title>
                        <Dialog.Close>
                            <IconButton variant="ghost" color="gray" style={{ flexShrink: 0 }}>
                                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor"/>
                                </svg>
                            </IconButton>
                        </Dialog.Close>
                    </Flex>
                </Box>

                <Box flexGrow="1" style={{ overflowY: "auto", overflowX: "hidden" }}>
                    <Tabs.Root defaultValue="invite">
                        <Tabs.List size="2">
                            <Tabs.Trigger value="invite"><Flex gap="2" align="center"><Users className="w-4 h-4" /> Mời người xem</Flex></Tabs.Trigger>
                            <Tabs.Trigger value="link"><Flex gap="2" align="center"><LinkIcon className="w-4 h-4" /> Tạo link</Flex></Tabs.Trigger>
                            <Tabs.Trigger value="manage"><Flex gap="2" align="center"><ShieldCheck className="w-4 h-4" /> Quản lý</Flex></Tabs.Trigger>
                        </Tabs.List>

                        <Box p="5">
                            {/* ── Tab: Invite ─────────────────────────────────────── */}
                            <Tabs.Content value="invite">
                                <Flex direction="column" gap="4">
                                    <Box>
                                        <Text as="div" size="2" weight="bold" mb="2">Quyền truy cập</Text>
                                        <PermissionSelectLocal value={invitePermission} onChange={setInvitePermission} />
                                    </Box>

                                    <Box>
                                        <Text as="div" size="2" weight="bold" mb="2">Email người nhận</Text>
                                        <Flex gap="2">
                                            <Box flexGrow="1">
                                                <TextField.Root 
                                                    placeholder="Nhập email..." 
                                                    value={emailInput} 
                                                    onChange={(e) => setEmailInput(e.target.value)}
                                                    onKeyDown={(e) => e.key === "Enter" && handleAddEmail()}
                                                    size="3"
                                                />
                                            </Box>
                                            <IconButton size="3" variant="soft" onClick={handleAddEmail}>
                                                <Plus className="w-5 h-5" />
                                            </IconButton>
                                        </Flex>
                                    </Box>

                                    {emails.length > 0 && (
                                        <Flex wrap="wrap" gap="2">
                                            {emails.map((email) => (
                                                <Badge key={email} size="2" variant="soft" color="indigo" style={{ padding: '0px 10px', height: '32px' }}>
                                                    <Flex align="center" gap="2">
                                                        {email}
                                                        <IconButton 
                                                            size="1" 
                                                            variant="ghost" 
                                                            color="red" 
                                                            onClick={() => setEmails((p) => p.filter((e) => e !== email))}
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </IconButton>
                                                    </Flex>
                                                </Badge>
                                            ))}
                                        </Flex>
                                    )}

                                    <Button
                                        size="3"
                                        style={{ width: "100%" }}
                                        onClick={handleSendInvites}
                                        disabled={shareInternalMutation.isPending || emails.length === 0}
                                        loading={shareInternalMutation.isPending}
                                    >
                                        Gửi lời mời ({emails.length})
                                    </Button>
                                </Flex>
                            </Tabs.Content>

                            {/* ── Tab: Link ───────────────────────────────────────── */}
                            <Tabs.Content value="link">
                                <Flex direction="column" gap="4">
                                    <Box>
                                        <Text as="div" size="2" weight="bold" mb="2">Quyền cho link</Text>
                                        <PermissionSelectLocal value={linkPermission} onChange={setLinkPermission} />
                                    </Box>

                                    <Box>
                                        <Text as="div" size="2" weight="bold" mb="2">Mật khẩu bảo vệ (tùy chọn)</Text>
                                        <TextField.Root 
                                            type="password"
                                            placeholder="Để trống nếu không cần"
                                            value={linkPassword}
                                            onChange={(e) => setLinkPassword(e.target.value)}
                                            size="3"
                                        />
                                    </Box>

                                    <Box>
                                        <Text as="div" size="2" weight="bold" mb="2">Hết hạn sau (ngày)</Text>
                                        <TextField.Root 
                                            type="number"
                                            min="1"
                                            placeholder="Để trống = vĩnh viễn"
                                            value={linkExpiry.toString()}
                                            onChange={(e) => setLinkExpiry(e.target.value === "" ? "" : Number(e.target.value))}
                                            size="3"
                                        />
                                    </Box>

                                    {generatedLink && (
                                        <Callout.Root color="jade" variant="soft">
                                            <Flex justify="between" align="center" width="100%" gap="3">
                                                <Text size="2" truncate style={{ minWidth: 0 }}>{generatedLink}</Text>
                                                <Button size="1" style={{ flexShrink: 0 }} onClick={() => { navigator.clipboard.writeText(generatedLink); toast.success("Đã sao chép!"); }}>
                                                    <Copy className="w-3.5 h-3.5" /> Copy
                                                </Button>
                                            </Flex>
                                        </Callout.Root>
                                    )}

                                    <Button
                                        size="3"
                                        style={{ width: "100%" }}
                                        onClick={handleCreateLink}
                                        disabled={createLinkMutation.isPending}
                                        loading={createLinkMutation.isPending}
                                    >
                                        Tạo link chia sẻ
                                    </Button>
                                </Flex>
                            </Tabs.Content>

                            {/* ── Tab: Manage ─────────────────────────────────────── */}
                            <Tabs.Content value="manage">
                                <Flex direction="column" gap="5">
                                    {/* Shared Users */}
                                    <Box>
                                        <Text as="div" size="2" weight="bold" mb="3">Người được chia sẻ ({accesses.length})</Text>
                                        {accesses.length === 0 ? (
                                            <Text size="2" style={{ color: "var(--muted-foreground)" }}>Chưa chia sẻ cho ai.</Text>
                                        ) : (
                                            <Flex direction="column" gap="2">
                                                {accesses.map((access) => (
                                                    <Card key={access.id} variant="surface">
                                                        <Flex align="center" justify="between">
                                                            <Box style={{ minWidth: 0, flex: 1 }}>
                                                                <Text as="div" size="2" weight="bold" truncate>{access.recipientEmail}</Text>
                                                                <Text as="div" size="1" color="gray">{PERMISSION_LABELS[access.permission]?.label || access.permission}</Text>
                                                            </Box>
                                                            <Flex align="center" gap="2" style={{ flexShrink: 0 }}>
                                                                <Select.Root 
                                                                    value={access.permission} 
                                                                    onValueChange={(val) => 
                                                                        updatePermissionMutation.mutate(
                                                                            { accessId: access.id, permission: val },
                                                                            { onSuccess: () => { toast.success("Đã cập nhật"); refetchAccesses(); } }
                                                                        )
                                                                    }
                                                                >
                                                                    <Select.Trigger />
                                                                    <Select.Content>
                                                                        <Select.Item value="VIEW">Xem</Select.Item>
                                                                        <Select.Item value="DOWNLOAD">Tải xuống</Select.Item>
                                                                    </Select.Content>
                                                                </Select.Root>
                                                                <IconButton 
                                                                    variant="soft" 
                                                                    color="red"
                                                                    onClick={() => revokeAccessMutation.mutate(access.id, { onSuccess: () => refetchAccesses() })}
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </IconButton>
                                                            </Flex>
                                                        </Flex>
                                                    </Card>
                                                ))}
                                            </Flex>
                                        )}
                                    </Box>

                                    {/* Share Links */}
                                    <Box>
                                        <Text as="div" size="2" weight="bold" mb="3">Links chia sẻ ({links.length})</Text>
                                        {links.length === 0 ? (
                                            <Text size="2" style={{ color: "var(--muted-foreground)" }}>Chưa có link nào.</Text>
                                        ) : (
                                            <Flex direction="column" gap="2">
                                                {links.map((link) => (
                                                    <Card key={link.id} variant="surface">
                                                        {editingLinkId === link.id ? (
                                                            <Flex direction="column" gap="3">
                                                                <Flex gap="2">
                                                                    <Select.Root value={editLinkPermission} onValueChange={setEditLinkPermission}>
                                                                        <Select.Trigger style={{ flex: 1 }} />
                                                                        <Select.Content>
                                                                            <Select.Item value="VIEW">Xem</Select.Item>
                                                                            <Select.Item value="DOWNLOAD">Tải xuống</Select.Item>
                                                                        </Select.Content>
                                                                </Select.Root>
                                                                    <Select.Root value={editLinkExpiry.toString()} onValueChange={(v) => setEditLinkExpiry(v === "" ? "" : Number(v))}>
                                                                        <Select.Trigger style={{ flex: 1 }} />
                                                                        <Select.Content>
                                                                            <Select.Item value="">Giữ nguyên</Select.Item>
                                                                            <Select.Item value="-1">Không bao giờ</Select.Item>
                                                                            <Select.Item value="1">1 ngày</Select.Item>
                                                                            <Select.Item value="7">7 ngày</Select.Item>
                                                                            <Select.Item value="30">30 ngày</Select.Item>
                                                                        </Select.Content>
                                                                    </Select.Root>
                                                                </Flex>
                                                                <TextField.Root 
                                                                    type="password"
                                                                    placeholder={link.hasPassword ? "Mật khẩu mới (tuỳ chọn)" : "Thêm mật khẩu (tuỳ chọn)"}
                                                                    value={editLinkPassword}
                                                                    onChange={(e) => setEditLinkPassword(e.target.value)}
                                                                />
                                                                <Flex gap="2" justify="end">
                                                                    <Button variant="soft" color="gray" onClick={() => setEditingLinkId(null)}>Hủy</Button>
                                                                    <Button 
                                                                        onClick={() => handleUpdateLink(link.id)}
                                                                        disabled={updateLinkMutation.isPending}
                                                                        loading={updateLinkMutation.isPending}
                                                                    >
                                                                        Lưu
                                                                    </Button>
                                                                </Flex>
                                                            </Flex>
                                                        ) : (
                                                            <Flex align="center" justify="between">
                                                                <Box style={{ minWidth: 0, flex: 1 }}>
                                                                    <Text as="div" size="2" style={{ fontFamily: "monospace", color: "var(--muted-foreground)" }}>{link.token.slice(0, 16)}...</Text>
                                                                    <Flex align="center" gap="2" mt="1">
                                                                        <Text size="1" weight="bold" style={{ color: "var(--color-foreground)" }}>{PERMISSION_LABELS[link.permission]?.label}</Text>
                                                                        {link.hasPassword && <Badge size="1" color="amber"><Lock className="w-3 h-3" /></Badge>}
                                                                        {link.expiresAt && <Text size="1" style={{ color: "var(--muted-foreground)" }}>Hết hạn: {new Date(link.expiresAt).toLocaleDateString("vi-VN")}</Text>}
                                                                    </Flex>
                                                                </Box>
                                                                <Flex align="center" gap="1" style={{ flexShrink: 0 }}>
                                                                    <IconButton variant="soft" color="indigo" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/shared/${link.token}`); toast.success("Đã sao chép"); }}>
                                                                        <Copy className="w-4 h-4" />
                                                                    </IconButton>
                                                                    <IconButton variant="soft" color="orange" onClick={() => startEditLink(link)}>
                                                                        <Pencil className="w-4 h-4" />
                                                                    </IconButton>
                                                                    <IconButton variant="soft" color="red" onClick={() => revokeLinkMutation.mutate(link.id, { onSuccess: () => refetchLinks() })}>
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </IconButton>
                                                                </Flex>
                                                            </Flex>
                                                        )}
                                                    </Card>
                                                ))}
                                            </Flex>
                                        )}
                                    </Box>
                                </Flex>
                            </Tabs.Content>
                        </Box>
                    </Tabs.Root>
                </Box>

                <Box p="4" style={{ borderTop: "1px solid var(--gray-a6)" }}>
                    <Flex justify="end">
                        <Dialog.Close>
                            <Button variant="soft" color="gray">Đóng</Button>
                        </Dialog.Close>
                    </Flex>
                </Box>
            </Dialog.Content>
        </Dialog.Root>
    );
}

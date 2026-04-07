"use client";

import { useState } from "react";
import {
  Link as LinkIcon,
  Users,
  Globe,
  Plus,
  Copy,
  Trash2,
  ShieldCheck,
  Eye,
  Download,
  Lock,
  Pencil,
  X,
} from "lucide-react";
import {
  useShareInternal,
  useCreateShareLink,
  useRevokeShareLink,
  useUpdateShareLink,
  useRevokeAccess,
  useUpdatePermission,
} from "@/features/files/share-mutations";
import { useFileAccesses, useFileLinks } from "@/features/files/share-queries";
import type { FileItem, ShareLinkItem } from "@/features/files/schemas";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/types/api";
import {
  Dialog,
  Tabs,
  Flex,
  Text,
  TextField,
  Button,
  IconButton,
  Select,
  Box,
  Badge,
  Callout,
} from "@radix-ui/themes";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileItem | null;
}

const PERMISSION_LABELS: Record<
  string,
  { label: string; icon: typeof Eye; color: string }
> = {
  VIEW: { label: "Xem", icon: Eye, color: "var(--gray-12)" },
  DOWNLOAD: { label: "Tải xuống", icon: Download, color: "var(--jade-a9)" },
};

function PermissionSelectLocal({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Flex gap="2">
      {Object.entries(PERMISSION_LABELS).map(([key, meta]) => {
        const Icon = meta.icon;
        const isActive = value === key;
        return (
          <Button
            key={key}
            type="button"
            variant={isActive ? "soft" : "ghost"}
            color={isActive ? (key === "VIEW" ? "gray" : "jade") : "gray"}
            highContrast={isActive && key === "VIEW"}
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
  const { data: accesses = [], refetch: refetchAccesses } = useFileAccesses(
    file?.id || "",
  );
  const { data: links = [], refetch: refetchLinks } = useFileLinks(
    file?.id || "",
  );

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
          expiresInDays: editLinkExpiry === "" ? null : Number(editLinkExpiry),
        },
      },
      {
        onSuccess: () => {
          toast.success("Đã cập nhật link chia sẻ");
          setEditingLinkId(null);
          refetchLinks();
        },
        onError: (err: Error) => toast.error(getApiErrorMessage(err)),
      },
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
    const currentEmails = [...emails];
    const trimmed = emailInput.trim();

    if (trimmed && trimmed.includes("@")) {
      if (!currentEmails.includes(trimmed)) {
        currentEmails.push(trimmed);
        setEmails(currentEmails);
      }
      setEmailInput("");
    } else if (trimmed) {
      toast.error("Email đang nhập không hợp lệ");
      return;
    }

    if (currentEmails.length === 0) {
      toast.error("Vui lòng thêm ít nhất một email");
      return;
    }

    shareInternalMutation.mutate(
      {
        fileId: file.id,
        emails: currentEmails,
        permission: invitePermission as "VIEW" | "DOWNLOAD",
      },
      {
        onSuccess: () => {
          toast.success(`Đã chia sẻ cho ${currentEmails.length} người`);
          setEmails([]);
          refetchAccesses();
        },
        onError: (err) => toast.error(getApiErrorMessage(err)),
      },
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
      },
    );
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Content
        maxWidth="500px"
        style={{
          display: "flex",
          flexDirection: "column",
          padding: 0,
          maxHeight: "90vh",
          overflow: "hidden",
          border: "none",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        }}
      >
        {/* Header */}
        <Box pt="5" px="5" pb="3">
          <Flex justify="between" align="center" gap="3">
            <Dialog.Title style={{ margin: 0, minWidth: 0, fontWeight: 600 }}>
              <Flex align="center" gap="3" style={{ minWidth: 0 }}>
                <div
                  style={{
                    backgroundColor: "var(--gray-a3)",
                    padding: "8px",
                    borderRadius: "12px",
                  }}
                >
                  <Globe
                    className="w-5 h-5"
                    style={{ color: "var(--gray-12)" }}
                  />
                </div>
                <Text
                  truncate
                  size="4"
                  style={{ color: "var(--color-foreground)" }}
                >
                  Chia sẻ tệp
                </Text>
              </Flex>
            </Dialog.Title>
            <Dialog.Close>
              <IconButton
                variant="ghost"
                color="gray"
                style={{ flexShrink: 0, borderRadius: "full" }}
              >
                <X className="w-4 h-4" />
              </IconButton>
            </Dialog.Close>
          </Flex>
          <Text
            size="2"
            color="gray"
            mt="2"
            truncate
            style={{ display: "block" }}
          >
            {file.name}
          </Text>
        </Box>

        <Box flexGrow="1" style={{ overflowY: "auto", overflowX: "hidden" }}>
          <Tabs.Root defaultValue="invite">
            <Box px="5">
              <Tabs.List
                size="2"
                style={{
                  boxShadow: "none",
                  borderBottom: "2px solid var(--gray-a3)",
                }}
              >
                <Tabs.Trigger value="invite" style={{ paddingBottom: "12px" }}>
                  <Flex gap="2" align="center">
                    <Users className="w-4 h-4" /> Mời qua Email
                  </Flex>
                </Tabs.Trigger>
                <Tabs.Trigger value="link" style={{ paddingBottom: "12px" }}>
                  <Flex gap="2" align="center">
                    <LinkIcon className="w-4 h-4" /> Liên kết
                  </Flex>
                </Tabs.Trigger>
                <Tabs.Trigger value="manage" style={{ paddingBottom: "12px" }}>
                  <Flex gap="2" align="center">
                    <ShieldCheck className="w-4 h-4" /> Thu hồi
                  </Flex>
                </Tabs.Trigger>
              </Tabs.List>
            </Box>

            <Box p="5">
              {/* ── Tab: Invite ─────────────────────────────────────── */}
              <Tabs.Content value="invite">
                <Flex direction="column" gap="5">
                  <Box>
                    <Text as="div" size="2" weight="medium" color="gray" mb="2">
                      Cấp quyền
                    </Text>
                    <PermissionSelectLocal
                      value={invitePermission}
                      onChange={setInvitePermission}
                    />
                  </Box>

                  <Box>
                    <Text as="div" size="2" weight="medium" color="gray" mb="2">
                      Địa chỉ Email
                    </Text>
                    <Flex gap="2">
                      <Box flexGrow="1">
                        <TextField.Root
                          placeholder="nghia@example.com..."
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleAddEmail()
                          }
                          size="3"
                          variant="soft"
                        />
                      </Box>
                      <IconButton
                        size="3"
                        variant="soft"
                        color="gray"
                        highContrast
                        onClick={handleAddEmail}
                        style={{ cursor: "pointer" }}
                      >
                        <Plus className="w-5 h-5" />
                      </IconButton>
                    </Flex>
                  </Box>

                  {emails.length > 0 && (
                    <Flex
                      wrap="wrap"
                      gap="2"
                      p="3"
                      style={{
                        backgroundColor: "var(--gray-a2)",
                        borderRadius: "var(--radius-3)",
                      }}
                    >
                      {emails.map((email) => (
                        <Badge
                          key={email}
                          size="2"
                          variant="surface"
                          color="gray"
                          highContrast
                          style={{
                            padding: "4px 10px",
                            height: "auto",
                            borderRadius: "16px",
                          }}
                        >
                          <Flex align="center" gap="2">
                            {email}
                            <IconButton
                              size="1"
                              variant="ghost"
                              color="gray"
                              style={{
                                cursor: "pointer",
                                height: "16px",
                                width: "16px",
                                minHeight: "16px",
                              }}
                              onClick={() =>
                                setEmails((p) => p.filter((e) => e !== email))
                              }
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
                    color="gray"
                    highContrast
                    style={{
                      width: "100%",
                      marginTop: "8px",
                      cursor: "pointer",
                    }}
                    onClick={handleSendInvites}
                    disabled={
                      shareInternalMutation.isPending || (emails.length === 0 && !emailInput.trim())
                    }
                    loading={shareInternalMutation.isPending}
                  >
                    Gửi lời mời truy cập
                  </Button>
                </Flex>
              </Tabs.Content>

              {/* ── Tab: Link ───────────────────────────────────────── */}
              <Tabs.Content value="link">
                <Flex direction="column" gap="5">
                  <Box>
                    <Text as="div" size="2" weight="medium" color="gray" mb="2">
                      Quyền truy cập
                    </Text>
                    <PermissionSelectLocal
                      value={linkPermission}
                      onChange={setLinkPermission}
                    />
                  </Box>

                  <Box>
                    <Text as="div" size="2" weight="medium" color="gray" mb="2">
                      Bảo mật bằng Mật khẩu (Không bắt buộc)
                    </Text>
                    <TextField.Root
                      type="password"
                      placeholder="Nhập mật khẩu..."
                      value={linkPassword}
                      onChange={(e) => setLinkPassword(e.target.value)}
                      size="3"
                      variant="soft"
                    />
                  </Box>

                  <Box>
                    <Text as="div" size="2" weight="medium" color="gray" mb="2">
                      Tự động hết hạn (Số ngày - Tuỳ chọn)
                    </Text>
                    <TextField.Root
                      type="number"
                      min="1"
                      placeholder="Bỏ trống để vô thời hạn"
                      value={linkExpiry.toString()}
                      onChange={(e) =>
                        setLinkExpiry(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      size="3"
                      variant="soft"
                    />
                  </Box>

                  {generatedLink && (
                    <Callout.Root color="jade" variant="soft" mt="2">
                      <Flex
                        justify="between"
                        align="center"
                        width="100%"
                        gap="3"
                      >
                        <Text size="2" truncate style={{ minWidth: 0 }}>
                          {generatedLink}
                        </Text>
                        <Button
                          size="1"
                          variant="solid"
                          color="jade"
                          style={{ flexShrink: 0, cursor: "pointer" }}
                          onClick={() => {
                            navigator.clipboard.writeText(generatedLink);
                            toast.success("Đã sao chép link!");
                          }}
                        >
                          <Copy className="w-3.5 h-3.5 mr-1" /> Copy
                        </Button>
                      </Flex>
                    </Callout.Root>
                  )}

                  <Button
                    size="3"
                    color="gray"
                    highContrast
                    style={{
                      width: "100%",
                      marginTop: "8px",
                      cursor: "pointer",
                    }}
                    onClick={handleCreateLink}
                    disabled={createLinkMutation.isPending}
                    loading={createLinkMutation.isPending}
                  >
                    Tạo liên kết chia sẻ mới
                  </Button>
                </Flex>
              </Tabs.Content>

              {/* ── Tab: Manage ─────────────────────────────────────── */}
              <Tabs.Content value="manage">
                <Flex direction="column" gap="5">
                  {/* Shared Users */}
                  <Box>
                    <Text as="div" size="2" weight="bold" mb="3">
                      Người được chia sẻ ({accesses.length})
                    </Text>
                    {accesses.length === 0 ? (
                      <Text size="2" style={{ color: "var(--gray-a10)" }}>
                        Tệp này chưa được chia sẻ với ai.
                      </Text>
                    ) : (
                      <Flex direction="column" gap="2">
                        {accesses.map((access) => (
                          <Flex
                            key={access.id}
                            align="center"
                            justify="between"
                            p="3"
                            style={{
                              backgroundColor: "var(--gray-a2)",
                              borderRadius: "var(--radius-3)",
                            }}
                          >
                            <Box style={{ minWidth: 0, flex: 1 }}>
                              <Text as="div" size="2" weight="bold" truncate>
                                {access.recipientEmail}
                              </Text>
                              <Text as="div" size="1" color="gray">
                                {PERMISSION_LABELS[access.permission]?.label ||
                                  access.permission}
                              </Text>
                            </Box>
                            <Flex
                              align="center"
                              gap="2"
                              style={{ flexShrink: 0 }}
                            >
                              <Select.Root
                                value={access.permission}
                                onValueChange={(val) =>
                                  updatePermissionMutation.mutate(
                                    { accessId: access.id, permission: val },
                                    {
                                      onSuccess: () => {
                                        toast.success(
                                          "Cập nhật quyền thành công",
                                        );
                                        refetchAccesses();
                                      },
                                    },
                                  )
                                }
                              >
                                <Select.Trigger variant="ghost" />
                                <Select.Content>
                                  <Select.Item value="VIEW">
                                    Chỉ Xem
                                  </Select.Item>
                                  <Select.Item value="DOWNLOAD">
                                    Tải xuống
                                  </Select.Item>
                                </Select.Content>
                              </Select.Root>
                              <IconButton
                                variant="ghost"
                                color="red"
                                onClick={() =>
                                  revokeAccessMutation.mutate(access.id, {
                                    onSuccess: () => refetchAccesses(),
                                  })
                                }
                                style={{ cursor: "pointer" }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </IconButton>
                            </Flex>
                          </Flex>
                        ))}
                      </Flex>
                    )}
                  </Box>

                  {/* Share Links */}
                  <Box>
                    <Text as="div" size="2" weight="bold" mb="3">
                      Liên kết chia sẻ ({links.length})
                    </Text>
                    {links.length === 0 ? (
                      <Text size="2" style={{ color: "var(--gray-a10)" }}>
                        Tệp này chưa có liên kết nào.
                      </Text>
                    ) : (
                      <Flex direction="column" gap="2">
                        {links.map((link) => (
                          <Box
                            key={link.id}
                            p="3"
                            style={{
                              backgroundColor: "var(--gray-a2)",
                              borderRadius: "var(--radius-3)",
                            }}
                          >
                            {editingLinkId === link.id ? (
                              <Flex direction="column" gap="3">
                                <Flex gap="2">
                                  <Select.Root
                                    value={editLinkPermission}
                                    onValueChange={setEditLinkPermission}
                                  >
                                    <Select.Trigger
                                      variant="soft"
                                      style={{ flex: 1 }}
                                    />
                                    <Select.Content>
                                      <Select.Item value="VIEW">
                                        Chỉ xem
                                      </Select.Item>
                                      <Select.Item value="DOWNLOAD">
                                        Được tải xuống
                                      </Select.Item>
                                    </Select.Content>
                                  </Select.Root>
                                  <Select.Root
                                    value={editLinkExpiry === "" ? "no-change" : editLinkExpiry.toString()}
                                    onValueChange={(v) =>
                                      setEditLinkExpiry(
                                        v === "no-change" ? "" : Number(v),
                                      )
                                    }
                                  >
                                    <Select.Trigger
                                      variant="soft"
                                      style={{ flex: 1 }}
                                    />
                                    <Select.Content>
                                      <Select.Item value="no-change">
                                        Không đổi
                                      </Select.Item>
                                      <Select.Item value="-1">
                                        Vô thời hạn
                                      </Select.Item>
                                      <Select.Item value="1">
                                        1 ngày
                                      </Select.Item>
                                      <Select.Item value="7">
                                        7 ngày
                                      </Select.Item>
                                      <Select.Item value="30">
                                        30 ngày
                                      </Select.Item>
                                    </Select.Content>
                                  </Select.Root>
                                </Flex>
                                <TextField.Root
                                  type="password"
                                  placeholder={
                                    link.hasPassword
                                      ? "Đổi mật khẩu bảo vệ mới..."
                                      : "Bảo vệ bằng mật khẩu..."
                                  }
                                  value={editLinkPassword}
                                  onChange={(e) =>
                                    setEditLinkPassword(e.target.value)
                                  }
                                  variant="soft"
                                />
                                <Flex gap="2" justify="end" mt="1">
                                  <Button
                                    variant="ghost"
                                    color="gray"
                                    onClick={() => setEditingLinkId(null)}
                                    style={{ cursor: "pointer" }}
                                  >
                                    Đóng
                                  </Button>
                                  <Button
                                    color="gray"
                                    highContrast
                                    onClick={() => handleUpdateLink(link.id)}
                                    disabled={updateLinkMutation.isPending}
                                    loading={updateLinkMutation.isPending}
                                    style={{ cursor: "pointer" }}
                                  >
                                    Cập nhật
                                  </Button>
                                </Flex>
                              </Flex>
                            ) : (
                              <Flex align="center" justify="between">
                                <Box style={{ minWidth: 0, flex: 1 }}>
                                  <Text
                                    as="div"
                                    size="2"
                                    style={{
                                      fontFamily: "monospace",
                                      color: "var(--gray-a11)",
                                    }}
                                  >
                                    {window.location.host}/...
                                    {link.token.slice(-6)}
                                  </Text>
                                  <Flex align="center" gap="2" mt="2">
                                    <Badge
                                      size="1"
                                      color={
                                        link.permission === "VIEW"
                                          ? "gray"
                                          : "jade"
                                      }
                                      highContrast={link.permission === "VIEW"}
                                      variant="soft"
                                    >
                                      {
                                        PERMISSION_LABELS[link.permission]
                                          ?.label
                                      }
                                    </Badge>
                                    {link.hasPassword && (
                                      <Badge
                                        size="1"
                                        color="gray"
                                        variant="soft"
                                      >
                                        <Lock className="w-3 h-3" />
                                      </Badge>
                                    )}
                                    {link.expiresAt && (
                                      <Text
                                        size="1"
                                        style={{ color: "var(--gray-a10)" }}
                                      >
                                        Hết hạn:{" "}
                                        {new Date(
                                          link.expiresAt,
                                        ).toLocaleDateString("vi-VN")}
                                      </Text>
                                    )}
                                  </Flex>
                                </Box>
                                <Flex
                                  align="center"
                                  gap="1"
                                  style={{ flexShrink: 0 }}
                                >
                                  <IconButton
                                    variant="ghost"
                                    color="gray"
                                    onClick={() => {
                                      navigator.clipboard.writeText(
                                        `${window.location.origin}/shared/${link.token}`,
                                      );
                                      toast.success("Đã copy link");
                                    }}
                                    style={{ cursor: "pointer" }}
                                  >
                                    <Copy className="w-4 h-4" />
                                  </IconButton>
                                  <IconButton
                                    variant="ghost"
                                    color="gray"
                                    onClick={() => startEditLink(link)}
                                    style={{ cursor: "pointer" }}
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </IconButton>
                                  <IconButton
                                    variant="ghost"
                                    color="red"
                                    onClick={() =>
                                      revokeLinkMutation.mutate(link.id, {
                                        onSuccess: () => refetchLinks(),
                                      })
                                    }
                                    style={{ cursor: "pointer" }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </IconButton>
                                </Flex>
                              </Flex>
                            )}
                          </Box>
                        ))}
                      </Flex>
                    )}
                  </Box>
                </Flex>
              </Tabs.Content>
            </Box>
          </Tabs.Root>
        </Box>
      </Dialog.Content>
    </Dialog.Root>
  );
}

"use client";

import { useState } from "react";
import { Share2, Users, Loader2, Download, Eye, LayoutGrid, List as ListIcon, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useSharedWithMe, useSharedByMe } from "@/features/files/share-queries";
import { determineFileType } from "@/lib/file-utils";
import { formatBytes } from "@/lib/format";
import { downloadFile, getFileBlobUrl } from "@/features/files/api";
import { toast } from "sonner";
import { PreviewModal } from "@/features/dashboard/components/PreviewModal";
import { useSharedFolderContent } from "@/features/files/share-queries";
import type { SharedAccessItem } from "@/features/files/schemas";
import { Flex, Box, Heading, Text, Grid, IconButton, DropdownMenu, Card } from "@radix-ui/themes";

const PERMISSION_LABELS: Record<string, { label: string; icon: typeof Eye; color: string }> = {
    VIEW: { label: "Xem", icon: Eye, color: "text-blue-500" },
    DOWNLOAD: { label: "Tải xuống", icon: Download, color: "text-emerald-500" },
};

export default function SharedPage() {
    const [tab, setTab] = useState<"with-me" | "by-me">("with-me");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const { data: sharedWithMe, isLoading: loadingWithMe } = useSharedWithMe();
    const { data: sharedByMe, isLoading: loadingByMe } = useSharedByMe();

    const items = tab === "with-me" ? sharedWithMe : sharedByMe;
    const isLoading = tab === "with-me" ? loadingWithMe : loadingByMe;

    // Preview state
    const [previewItem, setPreviewItem] = useState<(SharedAccessItem & { previewType?: "pdf" | "xlsx" | "folder" | "unknown" }) | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");
    
    const { data: folderContent, isLoading: isFolderLoading } = useSharedFolderContent(
        previewItem && previewItem.fileType === "folder" ? previewItem.id : null
    );

    const closePreview = () => {
        if (previewUrl && previewItem?.fileType !== "folder") {
            window.URL.revokeObjectURL(previewUrl);
        }
        setPreviewItem(null);
        setPreviewUrl("");
    };

    const handlePreview = async (item: SharedAccessItem) => {
        let type: "pdf" | "xlsx" | "folder" | "unknown" = "unknown";
        if (item.fileType === "folder") type = "folder";
        else if (item.fileType === "application/pdf") type = "pdf";
        else if (item.fileType?.includes("spreadsheetml")) type = "xlsx";

        if (type === "pdf" || type === "xlsx") {
            try {
                toast.loading("Đang chuẩn bị file xem trước...", { id: "preview-load" });
                const url = await getFileBlobUrl(item.fileId);
                setPreviewUrl(url);
                toast.dismiss("preview-load");
            } catch {
                toast.error("Lỗi khi tải file xem trước");
                toast.dismiss("preview-load");
                return;
            }
        }
        setPreviewItem({ ...item, previewType: type });
    };

    if (isLoading) {
        return (
            <Flex align="center" justify="center" style={{ flex: 1, padding: "3rem", height: "calc(100vh - 4rem)" }}>
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--gray-12)" }} />
            </Flex>
        );
    }

    return (
        <Flex direction="column" style={{ height: "calc(100vh - 4rem)", backgroundColor: "var(--color-background)", overflow: "hidden" }} className="lg:h-[calc(100vh-4rem)]">
            {/* Header */}
            <Flex direction={{ initial: "column", sm: "row" }} align={{ initial: "stretch", sm: "end" }} justify="between" gap="4" px={{ initial: "4", sm: "6", lg: "8" }} py="5" className="relative z-10 bg-card/30 backdrop-blur-xl" style={{ borderBottom: "1px solid var(--gray-a4)", flexShrink: 0 }}>
                <Box>
                    <Heading size="6" weight="bold" style={{ letterSpacing: "-0.025em", display: "flex", alignItems: "center", gap: "12px", color: "var(--card-heading)" }}>
                        <Share2 style={{ width: 32, height: 32, color: "var(--icon-storage)" }} />
                        Chia sẻ
                    </Heading>
                </Box>

                <Flex align="center" gap="3" style={{ flexShrink: 0 }}>
                    <Flex p="1" style={{ backgroundColor: "var(--color-card)", borderRadius: "var(--radius-3)", border: "1px solid var(--gray-a5)" }}>
                        <button
                            onClick={() => setTab("with-me")}
                            className={`px-4 py-1.5 font-medium text-sm transition-colors ${
                                tab === "with-me" ? "bg-background border border-border/50 text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground border border-transparent"
                            }`}
                            style={{ borderRadius: "var(--radius-2)" }}
                        >
                            Với tôi
                        </button>
                        <button
                            onClick={() => setTab("by-me")}
                            className={`px-4 py-1.5 font-medium text-sm transition-colors ${
                                tab === "by-me" ? "bg-background border border-border/50 text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground border border-transparent"
                            }`}
                            style={{ borderRadius: "var(--radius-2)" }}
                        >
                            Bởi tôi
                        </button>
                    </Flex>

                    <Flex align="center" gap="1" p="1" style={{ backgroundColor: "var(--color-card)", borderRadius: "var(--radius-3)", border: "1px solid var(--gray-a5)" }}>
                        <IconButton
                            size="2"
                            variant={viewMode === "grid" ? "solid" : "ghost"}
                            color={viewMode === "grid" ? "violet" : "gray"}
                            onClick={() => setViewMode("grid")}
                            style={{ cursor: "pointer" }}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </IconButton>
                        <IconButton
                            size="2"
                            variant={viewMode === "list" ? "solid" : "ghost"}
                            color={viewMode === "list" ? "violet" : "gray"}
                            onClick={() => setViewMode("list")}
                            style={{ cursor: "pointer" }}
                        >
                            <ListIcon className="w-4 h-4" />
                        </IconButton>
                    </Flex>
                </Flex>
            </Flex>

            {/* Content  */}
            <Box p={{ initial: "4", sm: "6", lg: "8" }} style={{ flex: 1, overflowY: "auto", position: "relative", zIndex: 0 }}>
                {(!items || items.length === 0) ? (
                    <Flex direction="column" align="center" justify="center" p="6" style={{ minHeight: "400px", border: "2px dashed var(--gray-a6)", borderRadius: "var(--radius-5)", textAlign: "center" }}>
                        <Box p="4" mb="4" style={{ borderRadius: "100%", backgroundColor: "var(--gray-a3)" }}>
                            <Users style={{ width: 64, height: 64, color: "var(--gray-a6)" }} />
                        </Box>
                        <Heading size="6" mb="3" style={{ color: "var(--color-foreground)" }}>
                            {tab === "with-me" ? "Chưa có ai chia sẻ tệp cho bạn" : "Bạn chưa chia sẻ tệp nào"}
                        </Heading>
                        <Text size="3" style={{ maxWidth: "24rem", color: "var(--muted-foreground)" }}>
                            {tab === "with-me"
                                ? "Khi người khác chia sẻ tệp cho bạn, tệp sẽ xuất hiện ở đây."
                                : "Sử dụng nút Chia sẻ trên tệp để chia sẻ với người khác."
                            }
                        </Text>
                    </Flex>
                ) : (
                    <Flex direction="column" gap="4">
                        <Text size="2" weight="bold" mb="2" style={{ textTransform: "uppercase", letterSpacing: "0.05em", display: "block", color: "var(--muted-foreground)" }}>
                            {tab === "with-me" ? "Được chia sẻ với tôi" : "Tôi đã chia sẻ"}
                        </Text>
                        
                        {viewMode === "grid" ? (
                            <Grid columns={{ initial: "1", sm: "2", lg: "3", xl: "4" }} gap="4">
                                {items.map((item) => {
                                    const meta = determineFileType(item.fileType || "");
                                    const Icon = meta.icon;
                                    const colorName = item.fileType?.includes("image") ? "teal" : item.fileType?.includes("video") ? "rose" : item.fileType?.includes("zip") || item.fileType?.includes("rar") ? "amber" : "blue";
                                    const permMeta = PERMISSION_LABELS[item.permission];
                                    const PermIcon = permMeta?.icon || Eye;
                                    const canPreview = item.fileType === "folder" || item.fileType === "application/pdf" || item.fileType?.includes("spreadsheetml");

                                    return (
                                        <Card key={item.id} size="2" variant="surface" className="group" style={{ position: "relative" }}>
                                            <Flex align="start" gap="3" mb="3">
                                                <Flex align="center" justify="center" flexShrink="0" style={{ width: 40, height: 40, backgroundColor: `var(--${colorName}-a3)`, borderRadius: "var(--radius-3)" }}>
                                                    <Icon className="w-5 h-5" style={{ color: `var(--${colorName}-11)` }} />
                                                </Flex>
                                                <Box style={{ flex: 1, minWidth: 0, paddingRight: "1.5rem" }}>
                                                    <Text size="2" weight="bold" truncate as="div" title={item.fileName} style={{ lineHeight: "1.25", marginBottom: "4px", color: "var(--color-foreground)" }}>
                                                        {item.fileName}
                                                    </Text>
                                                    <Text size="1" as="div" truncate style={{ color: "var(--muted-foreground)" }}>
                                                        {tab === "with-me" ? `Bởi ${item.ownerEmail}` : `Cho ${item.recipientEmail}`}
                                                    </Text>
                                                </Box>
                                            </Flex>

                                            <Flex align="center" justify="between" mt="auto" style={{ borderTop: "1px solid var(--gray-a4)", paddingTop: "12px", marginTop: "12px" }}>
                                                <Flex align="center" gap="1">
                                                    <PermIcon className={`w-3 h-3 ${permMeta?.color || "text-gray-500"}`} />
                                                    <Text size="1" style={{ color: "var(--muted-foreground)" }}>{formatBytes(item.fileSize)}</Text>
                                                </Flex>
                                                <Text size="1" style={{ color: "var(--muted-foreground)" }}>
                                                    {format(new Date(item.createdAt), "dd MMM, yyyy", { locale: vi })}
                                                </Text>
                                            </Flex>

                                            <Box position="absolute" top="0" right="0" m="2" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <DropdownMenu.Root>
                                                    <DropdownMenu.Trigger>
                                                        <IconButton variant="ghost" color="gray" onClick={(e) => e.stopPropagation()}>
                                                            <MoreVertical className="w-4 h-4" />
                                                        </IconButton>
                                                    </DropdownMenu.Trigger>
                                                    <DropdownMenu.Content size="2" variant="solid" align="end">
                                                        {canPreview && (
                                                            <DropdownMenu.Item onClick={(e) => { e.stopPropagation(); handlePreview(item); }} className="cursor-pointer">
                                                                <Eye className="w-4 h-4 mr-2" /> Xem trước
                                                            </DropdownMenu.Item>
                                                        )}
                                                        {item.permission === "DOWNLOAD" && tab === "with-me" && item.fileType !== "folder" && (
                                                            <DropdownMenu.Item onClick={(e) => { e.stopPropagation(); downloadFile(item.fileId, item.fileName).then(() => toast.success("Đang tải...")).catch(() => toast.error("Lỗi tải xuống")); }} className="cursor-pointer">
                                                                <Download className="w-4 h-4 mr-2" /> Tải xuống
                                                            </DropdownMenu.Item>
                                                        )}
                                                    </DropdownMenu.Content>
                                                </DropdownMenu.Root>
                                            </Box>
                                        </Card>
                                    );
                                })}
                            </Grid>
                        ) : (
                            <Card size="1" variant="surface" style={{ padding: 0, overflow: "hidden" }}>
                                <Flex px="4" py="3" style={{ borderBottom: "1px solid var(--gray-a4)", backgroundColor: "var(--gray-a2)" }}>
                                    <Box style={{ flex: 4 }}><Text size="2" weight="medium" style={{ color: "var(--muted-foreground)" }}>Tên tệp</Text></Box>
                                    <Box style={{ flex: 3 }}><Text size="2" weight="medium" style={{ color: "var(--muted-foreground)" }}>{tab === "with-me" ? "Chia sẻ bởi" : "Chia sẻ cho"}</Text></Box>
                                    <Box style={{ flex: 2, textAlign: "right" }}><Text size="2" weight="medium" style={{ color: "var(--muted-foreground)" }}>Dung lượng</Text></Box>
                                    <Box style={{ flex: 2 }} className="ml-4"><Text size="2" weight="medium" style={{ color: "var(--muted-foreground)" }}>Thời gian</Text></Box>
                                    <Box style={{ flex: 1, textAlign: "right" }}><Text size="2" weight="medium" style={{ color: "var(--muted-foreground)" }}>Thao tác</Text></Box>
                                </Flex>
                                <Flex direction="column">
                                    {items.map((item, idx) => {
                                        const meta = determineFileType(item.fileType || "");
                                        const Icon = meta.icon;
                                        const colorName = item.fileType?.includes("image") ? "teal" : item.fileType?.includes("video") ? "rose" : item.fileType?.includes("zip") || item.fileType?.includes("rar") ? "amber" : "blue";
                                        const canPreview = item.fileType === "folder" || item.fileType === "application/pdf" || item.fileType?.includes("spreadsheetml");

                                        return (
                                            <Flex key={item.id} align="center" px="4" py="3" className="group hover:bg-secondary/50" style={{ borderBottom: idx < items.length - 1 ? "1px solid var(--gray-a3)" : "none", transition: "background-color 0.2s" }}>
                                                <Flex align="center" gap="3" style={{ flex: 4, minWidth: 0 }}>
                                                    <Flex align="center" justify="center" flexShrink="0" style={{ width: 40, height: 40, backgroundColor: `var(--${colorName}-a3)`, borderRadius: "var(--radius-3)" }}>
                                                        <Icon className="w-5 h-5" style={{ color: `var(--${colorName}-11)` }} />
                                                    </Flex>
                                                    <Text size="2" weight="medium" truncate title={item.fileName} style={{ color: "var(--color-foreground)" }}>{item.fileName}</Text>
                                                </Flex>
                                                <Box style={{ flex: 3 }}><Text size="2" truncate style={{ color: "var(--muted-foreground)" }}>{tab === "with-me" ? item.ownerEmail : item.recipientEmail}</Text></Box>
                                                <Box style={{ flex: 2, textAlign: "right" }}><Text size="2" style={{ fontFamily: "var(--font-geist-mono)", color: "var(--muted-foreground)" }}>{formatBytes(item.fileSize)}</Text></Box>
                                                <Box style={{ flex: 2 }} className="ml-4"><Text size="2" style={{ color: "var(--muted-foreground)" }}>{format(new Date(item.createdAt), "dd MMM, yyyy HH:mm", { locale: vi })}</Text></Box>
                                                <Flex justify="end" style={{ flex: 1 }}>
                                                    <DropdownMenu.Root>
                                                        <DropdownMenu.Trigger>
                                                            <IconButton variant="ghost" color="gray" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <MoreVertical className="w-4 h-4" />
                                                            </IconButton>
                                                        </DropdownMenu.Trigger>
                                                        <DropdownMenu.Content size="2" variant="solid" align="end">
                                                            {canPreview && (
                                                                <DropdownMenu.Item onClick={() => handlePreview(item)} className="cursor-pointer">
                                                                    <Eye className="w-4 h-4 mr-2" /> Xem trước
                                                                </DropdownMenu.Item>
                                                            )}
                                                            {item.permission === "DOWNLOAD" && tab === "with-me" && item.fileType !== "folder" && (
                                                                <DropdownMenu.Item onClick={() => downloadFile(item.fileId, item.fileName).then(() => toast.success("Đang tải...")).catch(() => toast.error("Lỗi tải xuống"))} className="cursor-pointer">
                                                                    <Download className="w-4 h-4 mr-2" /> Tải xuống
                                                                </DropdownMenu.Item>
                                                            )}
                                                        </DropdownMenu.Content>
                                                    </DropdownMenu.Root>
                                                </Flex>
                                            </Flex>
                                        );
                                    })}
                                </Flex>
                            </Card>
                        )}
                    </Flex>
                )}
            </Box>

            {previewItem && (
                <PreviewModal
                    isOpen={!!previewItem}
                    onClose={closePreview}
                    itemName={previewItem.fileName}
                    itemType={previewItem.previewType || "unknown"}
                    fileUrl={previewUrl}
                    folderChildren={folderContent}
                    isLoading={isFolderLoading}
                    onDownloadFile={(child) => {
                        if (previewItem.permission === "DOWNLOAD") {
                            downloadFile(child.id, child.name)
                                .then(() => toast.success("Đang tải..."))
                                .catch(() => toast.error("Lỗi tải xuống"));
                        } else {
                            toast.error("Bạn không có quyền tải file trong thư mục này");
                        }
                    }}
                />
            )}
        </Flex>
    );
}

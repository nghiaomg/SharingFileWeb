"use client";

import { useState, useMemo } from "react";
import { Clock, Loader2, LayoutGrid, List as ListIcon, Download, Link as LinkIcon, Trash2, MoreVertical } from "lucide-react";
import { format, isToday, isYesterday, differenceInDays } from "date-fns";
import { vi } from "date-fns/locale";
import { useRecentFiles } from "@/features/files/queries";
import { useDownloadFile, useDeleteFile } from "@/features/files/mutations";
import { FileCard } from "@/features/files/components/FileCard";
import { Flex, Box, Heading, Text, Grid, IconButton, DropdownMenu, Card } from "@radix-ui/themes";
import { ShareModal } from "@/features/dashboard/components/ShareModal";
import { DeleteConfirmModal } from "@/features/dashboard/components/DeleteConfirmModal";
import { formatBytes } from "@/lib/format";
import { determineFileType } from "@/lib/file-utils";
import type { FileItem } from "@/features/files/schemas";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/types/api";

interface GroupedFilesItem {
    file: { id: string; name: string; type: string | null; size: number; createdAt: string };
    timeStr: string;
}

interface GroupedFiles {
    label: string;
    items: GroupedFilesItem[];
}

export default function RecentFilesPage() {
    const { data: files, isLoading } = useRecentFiles();
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // mutations
    const downloadFileMutation = useDownloadFile();
    const deleteFileMutation = useDeleteFile();

    // modals
    const [shareTarget, setShareTarget] = useState<FileItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ type: "file"; id: string; name: string } | null>(null);

    const handleDownload = (fileId: string, fileName: string) => {
        downloadFileMutation.mutate({ fileId, fileName }, {
            onSuccess: () => toast.success("Đang tải xuống..."),
            onError: (err) => toast.error(getApiErrorMessage(err, "Lỗi khi tải xuống"))
        });
    };

    const handleShare = (file: FileItem) => {
        setShareTarget(file);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        try {
            await deleteFileMutation.mutateAsync(deleteTarget.id);
            toast.success("Đã xóa tệp khỏi gần đây");
            setDeleteTarget(null);
        } catch (err) {
            toast.error(getApiErrorMessage(err));
        }
    };

    const recentGroups: GroupedFiles[] = useMemo(() => {
        if (!files) return [];

        const groupsMap = new Map<string, GroupedFilesItem[]>();

        files.forEach(file => {
            const date = new Date(file.createdAt);
            let label = "";
            let timeStr = format(date, "HH:mm");

            if (isToday(date)) {
                label = "Hôm nay";
            } else if (isYesterday(date)) {
                label = "Hôm qua";
            } else {
                const diff = differenceInDays(new Date(), date);
                if (diff <= 7) {
                    label = "Tuần trước";
                    timeStr = format(date, "EEEE HH:mm", { locale: vi });
                } else {
                    label = "Cũ hơn";
                    timeStr = format(date, "dd MMM, yyyy HH:mm", { locale: vi });
                }
            }

            if (!groupsMap.has(label)) {
                groupsMap.set(label, []);
            }

            groupsMap.get(label)!.push({
                file,
                timeStr,
            });
        });

        const orderedLabels = ["Hôm nay", "Hôm qua", "Tuần trước", "Cũ hơn"];
        const finalGroups: GroupedFiles[] = [];

        orderedLabels.forEach(label => {
            if (groupsMap.has(label)) {
                finalGroups.push({ label, items: groupsMap.get(label)! });
            }
        });

        return finalGroups;
    }, [files]);

    if (isLoading) {
        return (
            <Flex align="center" justify="center" style={{ flex: 1, padding: "3rem", height: "calc(100vh - 4rem)" }}>
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--violet-9)" }} />
            </Flex>
        );
    }

    return (
        <Flex direction="column" style={{ height: "calc(100vh - 4rem)", backgroundColor: "var(--color-background)", overflow: "hidden" }} className="lg:h-[calc(100vh-4rem)]">
            {/* Header */}
            <Flex direction={{ initial: "column", sm: "row" }} align={{ initial: "stretch", sm: "end" }} justify="between" gap="4" px={{ initial: "4", sm: "6", lg: "8" }} py="5" className="relative z-10 bg-card/30 backdrop-blur-xl" style={{ borderBottom: "1px solid var(--gray-a4)", flexShrink: 0 }}>
                <Box>
                    <Heading size="6" weight="bold" style={{ letterSpacing: "-0.025em", display: "flex", alignItems: "center", gap: "12px" }}>
                        <Clock style={{ width: 32, height: 32, color: "var(--violet-9)" }} />
                        Gần đây
                    </Heading>
                </Box>

                <Flex align="center" gap="3" style={{ flexShrink: 0 }}>
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
                {recentGroups.length === 0 ? (
                    <Flex direction="column" align="center" justify="center" p="6" style={{ minHeight: "400px", border: "2px dashed var(--gray-a6)", borderRadius: "var(--radius-5)", textAlign: "center" }}>
                        <Box p="4" mb="4" style={{ borderRadius: "100%", backgroundColor: "var(--gray-a3)" }}>
                            <Clock style={{ width: 64, height: 64, color: "var(--gray-a8)" }} />
                        </Box>
                        <Heading size="6" mb="3">Không có tệp gần đây</Heading>
                        <Text size="3" color="gray" style={{ maxWidth: "24rem" }}>
                            Những tệp bạn vừa mở, tải lên hoặc làm việc gần đây sẽ hiển thị ở đây.
                        </Text>
                    </Flex>
                ) : (
                    <Flex direction="column" gap="8">
                        {recentGroups.map((group, i) => (
                            <Box key={i}>
                                <Text size="2" weight="bold" color="gray" mb="4" style={{ textTransform: "uppercase", letterSpacing: "0.05em", display: "block" }}>
                                    {group.label}
                                </Text>

                                {viewMode === "grid" ? (
                                    <Grid columns={{ initial: "1", sm: "2", lg: "3", xl: "5" }} gap="4">
                                        {group.items.map((item) => (
                                            <FileCard 
                                                key={item.file.id} 
                                                file={item.file as unknown as FileItem} 
                                                variant="grid" 
                                                subtitle={item.timeStr}
                                                onDownload={() => handleDownload(item.file.id, item.file.name)}
                                                onShare={() => handleShare(item.file as unknown as FileItem)}
                                                onDelete={() => setDeleteTarget({ type: "file", id: item.file.id, name: item.file.name })}
                                            />
                                        ))}
                                    </Grid>
                                ) : (
                                    <Card size="1" variant="surface" style={{ padding: 0, overflow: "hidden" }}>
                                        <Flex px="4" py="3" style={{ borderBottom: "1px solid var(--gray-a4)", backgroundColor: "var(--gray-a2)" }}>
                                            <Box style={{ flex: 5 }}><Text size="2" weight="medium" color="gray">Tên tệp</Text></Box>
                                            <Box style={{ flex: 2 }}><Text size="2" weight="medium" color="gray">Loại</Text></Box>
                                            <Box style={{ flex: 2, textAlign: "right" }}><Text size="2" weight="medium" color="gray">Dung lượng</Text></Box>
                                            <Box style={{ flex: 2 }} className="ml-4"><Text size="2" weight="medium" color="gray">Thời gian</Text></Box>
                                            <Box style={{ flex: 1, textAlign: "right" }}><Text size="2" weight="medium" color="gray">Thao tác</Text></Box>
                                        </Flex>
                                        <Flex direction="column">
                                            {group.items.map((item, idx) => {
                                                const file = item.file as unknown as FileItem;
                                                const fileMeta = determineFileType(file.type || "");
                                                const Icon = fileMeta.icon;
                                                const colorName = fileMeta.type.includes("Hình ảnh") ? "teal" : fileMeta.type.includes("Video") ? "rose" : fileMeta.type.includes("Nén") ? "amber" : "blue";
                                                return (
                                                    <Flex key={file.id} align="center" px="4" py="3" className="group hover:bg-secondary/50" style={{ borderBottom: idx < group.items.length - 1 ? "1px solid var(--gray-a3)" : "none", transition: "background-color 0.2s" }}>
                                                        <Flex align="center" gap="3" style={{ flex: 5, minWidth: 0 }}>
                                                            <Flex align="center" justify="center" flexShrink="0" style={{ width: 40, height: 40, backgroundColor: `var(--${colorName}-a3)`, borderRadius: "var(--radius-3)" }}>
                                                                <Icon className="w-5 h-5" style={{ color: `var(--${colorName}-11)` }} />
                                                            </Flex>
                                                            <Text size="2" weight="medium" truncate title={file.name}>{file.name}</Text>
                                                        </Flex>
                                                        <Box style={{ flex: 2 }}><Text size="2" color="gray">{fileMeta.type}</Text></Box>
                                                        <Box style={{ flex: 2, textAlign: "right" }}><Text size="2" color="gray" style={{ fontFamily: "var(--font-geist-mono)" }}>{formatBytes(file.size)}</Text></Box>
                                                        <Box style={{ flex: 2 }} className="ml-4"><Text size="2" color="gray">{item.timeStr}</Text></Box>
                                                        <Flex justify="end" style={{ flex: 1 }}>
                                                            <DropdownMenu.Root>
                                                                <DropdownMenu.Trigger>
                                                                    <IconButton variant="ghost" color="gray" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <MoreVertical className="w-4 h-4" />
                                                                    </IconButton>
                                                                </DropdownMenu.Trigger>
                                                                <DropdownMenu.Content size="2" variant="solid" align="end">
                                                                    <DropdownMenu.Item onClick={() => handleDownload(file.id, file.name)} className="cursor-pointer">
                                                                        <Download className="w-4 h-4 mr-2" /> Tải xuống
                                                                    </DropdownMenu.Item>
                                                                    <DropdownMenu.Item onClick={() => handleShare(file)} className="cursor-pointer">
                                                                        <LinkIcon className="w-4 h-4 mr-2" /> Chia sẻ
                                                                    </DropdownMenu.Item>
                                                                    <DropdownMenu.Item color="red" onClick={() => setDeleteTarget({ type: "file", id: file.id, name: file.name })} className="cursor-pointer">
                                                                        <Trash2 className="w-4 h-4 mr-2" /> Xóa
                                                                    </DropdownMenu.Item>
                                                                </DropdownMenu.Content>
                                                            </DropdownMenu.Root>
                                                        </Flex>
                                                    </Flex>
                                                );
                                            })}
                                        </Flex>
                                    </Card>
                                )}
                            </Box>
                        ))}
                    </Flex>
                )}
            </Box>

            {deleteTarget && (
                <DeleteConfirmModal
                    isOpen={!!deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onConfirm={handleDeleteConfirm}
                    name={deleteTarget.name}
                    type={deleteTarget.type}
                />
            )}

            <ShareModal
                key={shareTarget?.id || 'empty-modal'}
                isOpen={!!shareTarget}
                onClose={() => setShareTarget(null)}
                file={shareTarget}
            />
        </Flex>
    );
}

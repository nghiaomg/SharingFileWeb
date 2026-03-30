"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    FolderOpen, Plus, LayoutGrid, List as ListIcon, MoreVertical,
    Pencil, Trash2, Download, Link as LinkIcon, Loader2, ChevronRight, Home
} from "lucide-react";
import Link from "next/link";
import { useFolderChildren, useRootFolder, useFolder, fileKeys } from "@/features/files/queries";
import { useCreateFolder, useUpdateFolder, useDeleteFolder, useDeleteFile, useDownloadFile, useRenameFile } from "@/features/files/mutations";
import { resolveFolderPath } from "@/features/files/api";
import { useUploadStore } from "@/features/files/upload-store";
import { FolderModal } from "@/features/dashboard/components/FolderModal";
import { RenameFileDialog } from "@/features/files/components/RenameFileDialog";
import { ConfirmUploadDialog, type PendingUploadFile } from "@/features/files/components/ConfirmUploadDialog";
import { UploadDropdown } from "./UploadDropdown";
import { DeleteConfirmModal } from "@/features/dashboard/components/DeleteConfirmModal";
import { ShareModal } from "@/features/dashboard/components/ShareModal";
import { formatBytes } from "@/lib/format";
import { determineFileType } from "@/lib/file-utils";
import { getApiErrorMessage } from "@/types/api";
import type { FolderItem, FileItem } from "@/features/files/schemas";
import { toast } from "sonner";
import { Box, Flex, Grid, Card, Heading, Text, Button, IconButton, DropdownMenu } from "@radix-ui/themes";
import { FileCard } from "@/features/files/components/FileCard";
import { useQueryClient } from "@tanstack/react-query";
import { authKeys } from "@/features/auth/queries";

interface FileExplorerProps {
    folderId?: string | null;
}

export function FileExplorer({ folderId }: FileExplorerProps) {
    const router = useRouter();

    // ─── Determine which folder to use ──────────────────────────────────────────
    const { data: rootFolder } = useRootFolder();
    const currentFolderId = folderId || rootFolder?.id || "";

    const { data: folderInfo } = useFolder(folderId || "");
    const { data: children, isLoading } = useFolderChildren(currentFolderId);
    
    // Upload Store
    const storeItems = useUploadStore(state => state.items);
    const isUploading = storeItems.some(i => i.status === "UPLOADING");

    const queryClient = useQueryClient();

    // ─── Refetch on upload success ──────────────────────────────────────────────
    useEffect(() => {
        const handleUploadSuccess = () => {
            queryClient.invalidateQueries({ queryKey: fileKeys.all() });
            queryClient.invalidateQueries({ queryKey: authKeys.storageUsage() });
        };
        window.addEventListener("upload-success", handleUploadSuccess);
        return () => window.removeEventListener("upload-success", handleUploadSuccess);
    }, [queryClient]);

    // ─── Mutations ──────────────────────────────────────────────────────────────
    const createFolderMutation = useCreateFolder();
    const updateFolderMutation = useUpdateFolder();
    const deleteFolderMutation = useDeleteFolder();
    const deleteFileMutation = useDeleteFile();
    const downloadFileMutation = useDownloadFile();
    const renameFileMutation = useRenameFile();

    // ─── Local UI State ─────────────────────────────────────────────────────────
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [isDragging, setIsDragging] = useState(false);
    const [, setDragCounter] = useState(0);
    const [pendingUploadFiles, setPendingUploadFiles] = useState<PendingUploadFile[]>([]);
    const [isConfirmUploadOpen, setIsConfirmUploadOpen] = useState(false);

    // Folder Modal
    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
    const [editingFolder, setEditingFolder] = useState<FolderItem | null>(null);

    // Delete Modal
    const [deleteTarget, setDeleteTarget] = useState<{ type: "folder" | "file"; id: string; name: string } | null>(null);

    // File Rename Modal
    const [renamingFile, setRenamingFile] = useState<FileItem | null>(null);

    // Share
    const [shareTarget, setShareTarget] = useState<FileItem | null>(null);

    const folders = children?.folders || [];
    const files = children?.files || [];

    // ─── Handlers ───────────────────────────────────────────────────────────────
    const handleCreateFolder = useCallback((name: string) => {
        createFolderMutation.mutate({ name, parentId: currentFolderId }, {
            onSuccess: () => {
                setIsFolderModalOpen(false);
                toast.success(`Đã tạo thư mục "${name}"`);
            },
            onError: (err) => toast.error(getApiErrorMessage(err)),
        });
    }, [createFolderMutation, currentFolderId]);

    const handleUpdateFolder = useCallback((name: string) => {
        if (!editingFolder) return;
        updateFolderMutation.mutate({ id: editingFolder.id, data: { name } }, {
            onSuccess: () => { 
                setEditingFolder(null); 
                setIsFolderModalOpen(false); 
                toast.success("Đổi tên thành công");
            },
            onError: (err) => toast.error(getApiErrorMessage(err)),
        });
    }, [updateFolderMutation, editingFolder]);

    const handleRenameFileSubmit = useCallback((newName: string) => {
        if (!renamingFile) return;
        renameFileMutation.mutate({ fileId: renamingFile.id, newName }, {
            onSuccess: () => {
                setRenamingFile(null);
                toast.success("Đổi tên tệp thành công");
            },
            onError: (err) => toast.error(getApiErrorMessage(err)),
        });
    }, [renameFileMutation, renamingFile]);

    const handleDeleteConfirm = useCallback(async () => {
        if (!deleteTarget) return;
        try {
            if (deleteTarget.type === "folder") {
                await deleteFolderMutation.mutateAsync(deleteTarget.id);
            } else {
                await deleteFileMutation.mutateAsync(deleteTarget.id);
            }
            toast.success("Đã chuyển vào thùng rác");
            setDeleteTarget(null);
        } catch (err) {
            toast.error(getApiErrorMessage(err));
            throw err;
        }
    }, [deleteTarget, deleteFolderMutation, deleteFileMutation]);

    const processFiles = useCallback(async (inputFiles: FileList | File[] | PendingUploadFile[]) => {
        if (!inputFiles || inputFiles.length === 0 || !currentFolderId) return;

        let filesArray: PendingUploadFile[];
        if (inputFiles.length > 0 && 'path' in inputFiles[0] && 'file' in inputFiles[0]) {
            filesArray = inputFiles as PendingUploadFile[];
        } else {
            filesArray = Array.from(inputFiles as FileList | File[]).map(file => {
                let path = "";
                if (file.webkitRelativePath) {
                    const parts = file.webkitRelativePath.split('/');
                    if (parts.length > 1) {
                        parts.pop();
                        path = parts.join('/');
                    }
                }
                return { file, path };
            });
        }

        const pathsToResolve = new Set<string>();

        filesArray.forEach(item => {
            if (item.path) {
                pathsToResolve.add(item.path);
            }
        });

        const folderMap: Record<string, string> = {};

        if (pathsToResolve.size > 0) {
            toast.loading("Đang tạo cấu trúc thư mục...", { id: "resolve-folders" });
            try {
                for (const path of Array.from(pathsToResolve)) {
                    const resolvedFolder = await resolveFolderPath({ path, parentId: currentFolderId });
                    folderMap[path] = resolvedFolder.id;
                }
                toast.success("Đã tạo cấu trúc thư mục", { id: "resolve-folders" });
            } catch (err) {
                console.error("Folder creation error:", err);
                toast.error("Lỗi khi tạo cấu trúc thư mục", { id: "resolve-folders" });
                return;
            }
        }

        filesArray.forEach(item => {
            let targetFolderId = currentFolderId;
            if (item.path && folderMap[item.path]) {
                targetFolderId = folderMap[item.path];
            }
            useUploadStore.getState().addFiles([item.file], targetFolderId);
        });
        
        toast.info(`Đã xếp hàng ${filesArray.length} tệp để tải lên.`);
    }, [currentFolderId]);

    const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCounter((prev) => prev + 1);
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCounter((prev) => {
            const next = prev - 1;
            if (next === 0) {
                setIsDragging(false);
            }
            return next;
        });
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy';
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCounter(0);
        setIsDragging(false);

        if (!e.dataTransfer.items || e.dataTransfer.items.length === 0) return;

        const files: PendingUploadFile[] = [];
        
        const readEntry = async (entry: FileSystemEntry, path = "") => {
            if (entry.isFile) {
                await new Promise<void>((resolve, reject) => {
                    (entry as FileSystemFileEntry).file((file: File) => {
                        files.push({ file, path });
                        resolve();
                    }, reject);
                });
            } else if (entry.isDirectory) {
                const dirReader = (entry as FileSystemDirectoryEntry).createReader();
                const newPath = path ? `${path}/${entry.name}` : entry.name;
                
                const readEntriesPromise = () => new Promise<FileSystemEntry[]>((resolve, reject) => {
                    dirReader.readEntries(resolve, reject);
                });

                let allEntries: FileSystemEntry[] = [];
                let batch: FileSystemEntry[] = [];
                do {
                    batch = await readEntriesPromise();
                    allEntries = allEntries.concat(batch);
                } while (batch.length > 0);

                for (const subEntry of allEntries) {
                    await readEntry(subEntry, newPath);
                }
            }
        };

        toast.loading("Đang đọc tệp...", { id: "read-files" });
        try {
            const promises = [];
            for (let i = 0; i < e.dataTransfer.items.length; i++) {
                const item = e.dataTransfer.items[i];
                if (item.kind === "file") {
                    const entry = item.webkitGetAsEntry();
                    if (entry) {
                        promises.push(readEntry(entry));
                    } else {
                        const file = item.getAsFile();
                        if (file) files.push({ file, path: "" });
                    }
                }
            }
            await Promise.all(promises);
            toast.dismiss("read-files");

            if (files.length > 0) {
                setPendingUploadFiles(files);
                setIsConfirmUploadOpen(true);
            }
        } catch (error) {
            console.error("Error reading dropped files:", error);
            toast.error("Lỗi khi đọc file", { id: "read-files" });
        }
    }, []);

    const handleShare = useCallback((file: FileItem) => {
        setShareTarget(file);
    }, []);

    const handleDownload = useCallback((fileId: string, fileName: string) => {
        downloadFileMutation.mutate({ fileId, fileName }, {
            onSuccess: () => toast.success("Đang tải xuống..."),
            onError: (err) => toast.error(getApiErrorMessage(err, "Lỗi khi tải xuống"))
        });
    }, [downloadFileMutation]);

    // ─── Downloading indicator ────────────────────────────────────────────────────

    if (isLoading) {
        return (
            <Flex align="center" justify="center" style={{ flex: 1, padding: "3rem" }}>
                <Loader2 className="w-8 h-8 animate-spin text-zinc-900 dark:text-zinc-100" style={{ color: "var(--gray-12)" }} />
            </Flex>
        );
    }

    return (
        <Flex direction="column" style={{ height: "calc(100vh - 4rem)", backgroundColor: "var(--color-background)", overflow: "hidden" }} className="lg:h-[calc(100vh-4rem)]">
            {/* Header */}
            <Flex direction={{ initial: "column", sm: "row" }} align={{ initial: "stretch", sm: "end" }} justify="between" gap="4" px={{ initial: "4", sm: "6", lg: "8" }} py="5" className="relative z-10 bg-card/30 backdrop-blur-xl" style={{ borderBottom: "1px solid var(--gray-a4)", flexShrink: 0 }}>
                <Box>
                    {folderId && folderInfo && (
                        <Flex align="center" gap="2" mb="2">
                            <Link href="/dashboard/files" className="hover:text-foreground transition-colors flex items-center gap-1">
                                <Text size="2" color="gray" style={{ display: "flex", alignItems: "center" }}><Home className="w-4 h-4 mr-1" /> Tệp của tôi</Text>
                            </Link>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            <Text size="2" weight="medium">{folderInfo.name}</Text>
                        </Flex>
                    )}
                    <Heading size="6" weight="bold" style={{ letterSpacing: "-0.025em", display: "flex", alignItems: "center", gap: "12px" }}>
                        {!folderId || !folderInfo ? <Home style={{ width: 32, height: 32, color: "var(--gray-12)" }} /> : <FolderOpen style={{ width: 32, height: 32, color: "var(--amber-11)" }} />}
                        {folderId && folderInfo ? folderInfo.name : "Tệp của tôi"}
                    </Heading>
                </Box>

                <Flex align="center" gap="3" style={{ flexShrink: 0 }}>
                    <UploadDropdown isUploading={isUploading} onUpload={processFiles} />
                    
                    <Button
                        variant="soft"
                        color="gray"
                        size="3"
                        onClick={() => {
                            setEditingFolder(null);
                            setIsFolderModalOpen(true);
                        }}
                    >
                        <Plus className="w-4 h-4" /> Thư mục mới
                    </Button>

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
            <Box 
                p={{ initial: "4", sm: "6", lg: "8" }} 
                style={{ flex: 1, overflowY: "auto", position: "relative", zIndex: 0 }}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                {/* Drag Overlay */}
                {isDragging && (
                    <Flex 
                        align="center" 
                        justify="center" 
                        direction="column"
                        style={{
                            position: "absolute",
                            top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: "var(--gray-a3)",
                            backdropFilter: "blur(2px)",
                            zIndex: 50,
                            border: "2px dashed var(--gray-12)",
                            borderRadius: "var(--radius-5)",
                            margin: "1rem"
                        }}
                    >
                        <Box p="4" mb="4" style={{ borderRadius: "100%", backgroundColor: "var(--gray-a4)", transition: "all 0.3s" }}>
                            <FolderOpen style={{ width: 64, height: 64, color: "var(--gray-12)", transition: "all 0.3s" }} />
                        </Box>
                        <Heading size="6" mb="3" style={{ color: "var(--gray-12)" }}>
                            Thả tệp hoặc thư mục vào đây
                        </Heading>
                        <Text size="3" color="gray" style={{ maxWidth: "24rem", textAlign: "center" }}>
                            Chúng tôi sẽ liệt kê các tệp để bạn duyệt và xác nhận trước khi tải lên.
                        </Text>
                    </Flex>
                )}

                {folders.length === 0 && files.length === 0 ? (
                    <Flex 
                        direction="column"
                        align="center"
                        justify="center"
                        p="6"
                        style={{
                            minHeight: "400px",
                            border: `2px dashed var(--gray-a6)`,
                            backgroundColor: "transparent",
                            borderRadius: "var(--radius-5)",
                            textAlign: "center"
                        }}
                    >
                        <Box p="4" mb="4" style={{ borderRadius: "100%", backgroundColor: "var(--gray-a3)", transition: "all 0.3s" }}>
                            <FolderOpen style={{ width: 64, height: 64, color: "var(--gray-a8)" }} />
                        </Box>
                        <Heading size="6" mb="3" style={{ color: "var(--gray-11)" }}>
                            Thư mục trống
                        </Heading>
                        <Text size="3" color="gray" style={{ maxWidth: "24rem" }}>
                            Kéo thả tệp vào đây hoặc nhấn mũi tên tải lên ở góc trên cùng để bắt đầu.
                        </Text>
                    </Flex>
                ) : (
                    <Flex direction="column" gap="6">
                        {/* Folders */}
                        {folders.length > 0 && (
                            <Box>
                                <Text size="2" weight="bold" color="gray" mb="4" style={{ textTransform: "uppercase", letterSpacing: "0.05em", display: "block" }}>
                                    Thư mục ({folders.length})
                                </Text>
                                
                                {viewMode === "grid" ? (
                                    <Grid columns={{ initial: "1", sm: "2", lg: "3", xl: "4" }} gap="4">
                                        {folders.map(folder => (
                                            <Card key={folder.id} size="2" variant="ghost" className="group" style={{ cursor: "pointer", position: "relative", border: "none" }}>
                                                <Flex 
                                                    align="center" 
                                                    gap="3" 
                                                    onClick={() => router.push(`/dashboard/files/${folder.id}`)}
                                                >
                                                    <Flex align="center" justify="center" flexShrink="0" style={{ width: 40, height: 40, backgroundColor: "var(--brown-a3)", borderRadius: "var(--radius-3)" }}>
                                                        <FolderOpen className="w-5 h-5" style={{ color: "var(--brown-11)" }} />
                                                    </Flex>
                                                    <Text size="3" weight="bold" truncate>{folder.name}</Text>
                                                </Flex>

                                                {/* Context Menu */}
                                                <Box position="absolute" top="0" right="0" m="2">
                                                    <DropdownMenu.Root>
                                                        <DropdownMenu.Trigger>
                                                            <IconButton variant="ghost" color="gray" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                                                <MoreVertical className="w-4 h-4" />
                                                            </IconButton>
                                                        </DropdownMenu.Trigger>
                                                        <DropdownMenu.Content size="2" variant="solid" align="end">
                                                            <DropdownMenu.Item onClick={(e) => { e.stopPropagation(); setEditingFolder(folder); setIsFolderModalOpen(true); }} className="cursor-pointer">
                                                                <Pencil className="w-4 h-4 mr-2" /> Đổi tên
                                                            </DropdownMenu.Item>
                                                            <DropdownMenu.Item color="red" onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: "folder", id: folder.id, name: folder.name }); }} className="cursor-pointer">
                                                                <Trash2 className="w-4 h-4 mr-2" /> Xóa
                                                            </DropdownMenu.Item>
                                                        </DropdownMenu.Content>
                                                    </DropdownMenu.Root>
                                                </Box>
                                            </Card>
                                        ))}
                                    </Grid>
                                ) : (
                                    <Flex direction="column" gap="2">
                                        {folders.map(folder => (
                                            <Card key={folder.id} size="2" variant="ghost" className="group" style={{ cursor: "pointer", position: "relative", border: "none" }}>
                                                <Flex 
                                                    align="center" 
                                                    gap="4"
                                                    onClick={() => router.push(`/dashboard/files/${folder.id}`)}
                                                >
                                                    <Flex align="center" justify="center" flexShrink="0" style={{ width: 40, height: 40, backgroundColor: "var(--brown-a3)", borderRadius: "var(--radius-3)" }}>
                                                        <FolderOpen className="w-5 h-5" style={{ color: "var(--brown-11)" }} />
                                                    </Flex>
                                                    <Text size="3" weight="bold" truncate style={{ flex: 1 }}>{folder.name}</Text>
                                                </Flex>

                                                <Box position="absolute" top="0" right="0" bottom="0" m="2" style={{ display: "flex", alignItems: "center" }}>
                                                    <DropdownMenu.Root>
                                                        <DropdownMenu.Trigger>
                                                            <IconButton variant="ghost" color="gray" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                                                <MoreVertical className="w-4 h-4" />
                                                            </IconButton>
                                                        </DropdownMenu.Trigger>
                                                        <DropdownMenu.Content size="2" variant="solid" align="end">
                                                            <DropdownMenu.Item onClick={(e) => { e.stopPropagation(); setEditingFolder(folder); setIsFolderModalOpen(true); }} className="cursor-pointer">
                                                                <Pencil className="w-4 h-4 mr-2" /> Đổi tên
                                                            </DropdownMenu.Item>
                                                            <DropdownMenu.Item color="red" onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: "folder", id: folder.id, name: folder.name }); }} className="cursor-pointer">
                                                                <Trash2 className="w-4 h-4 mr-2" /> Xóa
                                                            </DropdownMenu.Item>
                                                        </DropdownMenu.Content>
                                                    </DropdownMenu.Root>
                                                </Box>
                                            </Card>
                                        ))}
                                    </Flex>
                                )}
                            </Box>
                        )}

                        {/* Files */}
                        {files.length > 0 && (
                            <Box>
                                <Text size="2" weight="bold" color="gray" mb="4" style={{ textTransform: "uppercase", letterSpacing: "0.05em", display: "block" }}>
                                    Tệp ({files.length})
                                </Text>
                                {viewMode === "grid" ? (
                                    <Grid columns={{ initial: "1", sm: "2", lg: "3", xl: "5" }} gap="4">
                                        {files.map(file => (
                                                <FileCard
                                                    key={file.id}
                                                    file={file}
                                                    variant="grid"
                                                    onDownload={() => handleDownload(file.id, file.name)}
                                                    onShare={() => handleShare(file)}
                                                    onRename={() => setRenamingFile(file)}
                                                    onDelete={() => setDeleteTarget({ type: "file", id: file.id, name: file.name })}
                                                />
                                        ))}
                                    </Grid>
                                ) : (
                                    <Card size="1" variant="surface" style={{ padding: 0, overflow: "hidden" }}>
                                        <Flex px="4" py="3" style={{ borderBottom: "1px solid var(--gray-a4)", backgroundColor: "var(--gray-a2)" }}>
                                            <Box style={{ flex: 5 }}><Text size="2" weight="medium" color="gray">Tên tệp</Text></Box>
                                            <Box style={{ flex: 2 }}><Text size="2" weight="medium" color="gray">Loại</Text></Box>
                                            <Box style={{ flex: 2, textAlign: "right" }}><Text size="2" weight="medium" color="gray">Dung lượng</Text></Box>
                                            <Box style={{ flex: 2 }} className="ml-4"><Text size="2" weight="medium" color="gray">Ngày tạo</Text></Box>
                                            <Box style={{ flex: 1, textAlign: "right" }}><Text size="2" weight="medium" color="gray">Thao tác</Text></Box>
                                        </Flex>
                                        <Flex direction="column">
                                            {files.map((file, i) => {
                                                const fileMeta = determineFileType(file.type || "");
                                                const Icon = fileMeta.icon;
                                                const colorName = fileMeta.type.includes("Hình ảnh") ? "teal" : fileMeta.type.includes("Video") ? "rose" : fileMeta.type.includes("Nén") ? "amber" : "blue";
                                                return (
                                                    <Flex key={file.id} align="center" px="4" py="3" className="group hover:bg-secondary/50" style={{ borderBottom: i < files.length - 1 ? "1px solid var(--gray-a3)" : "none", transition: "background-color 0.2s" }}>
                                                        <Flex align="center" gap="3" style={{ flex: 5, minWidth: 0 }}>
                                                            <Flex align="center" justify="center" flexShrink="0" style={{ width: 40, height: 40, backgroundColor: `var(--${colorName}-a3)`, borderRadius: "var(--radius-3)" }}>
                                                                <Icon className="w-5 h-5" style={{ color: `var(--${colorName}-11)` }} />
                                                            </Flex>
                                                            <Text size="2" weight="medium" truncate title={file.name}>{file.name}</Text>
                                                        </Flex>
                                                        <Box style={{ flex: 2 }}><Text size="2" color="gray">{fileMeta.type}</Text></Box>
                                                        <Box style={{ flex: 2, textAlign: "right" }}><Text size="2" color="gray" style={{ fontFamily: "var(--font-geist-mono)" }}>{formatBytes(file.size)}</Text></Box>
                                                        <Box style={{ flex: 2 }} className="ml-4"><Text size="2" color="gray">{new Date(file.createdAt).toLocaleDateString("vi-VN")}</Text></Box>
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
                                                                    <DropdownMenu.Item onClick={() => setRenamingFile(file)} className="cursor-pointer">
                                                                        <Pencil className="w-4 h-4 mr-2" /> Đổi tên
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
                        )}
                    </Flex>
                )}
            </Box>

            {/* Modals */}
            {isFolderModalOpen && (
                <FolderModal
                    isOpen={isFolderModalOpen}
                    onClose={() => { setIsFolderModalOpen(false); setEditingFolder(null); }}
                    onSubmit={editingFolder ? handleUpdateFolder : handleCreateFolder}
                    folder={editingFolder}
                    isLoading={createFolderMutation.isPending || updateFolderMutation.isPending}
                />
            )}

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

            <RenameFileDialog
                isOpen={!!renamingFile}
                onClose={() => setRenamingFile(null)}
                onSubmit={handleRenameFileSubmit}
                file={renamingFile}
                isLoading={renameFileMutation.isPending}
            />

            <ConfirmUploadDialog
                isOpen={isConfirmUploadOpen}
                onClose={() => {
                    setIsConfirmUploadOpen(false);
                    setPendingUploadFiles([]);
                }}
                onConfirm={() => {
                    setIsConfirmUploadOpen(false);
                    processFiles(pendingUploadFiles);
                    setPendingUploadFiles([]);
                }}
                onRemove={(index) => {
                    setPendingUploadFiles(prev => {
                        const next = [...prev];
                        next.splice(index, 1);
                        return next;
                    });
                }}
                files={pendingUploadFiles}
            />
        </Flex>
    );
}

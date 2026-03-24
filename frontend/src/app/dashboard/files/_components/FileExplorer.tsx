"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    FolderOpen, Upload, Plus, LayoutGrid, List as ListIcon, MoreVertical,
    Pencil, Trash2, Download, Link as LinkIcon, Loader2, ChevronRight, Home,
    FileText, FolderUp
} from "lucide-react";
import Link from "next/link";
import { useFolderChildren, useRootFolder, useFolder } from "@/features/files/queries";
import { useCreateFolder, useUpdateFolder, useDeleteFolder, useUploadFile, useDeleteFile, useDownloadFile } from "@/features/files/mutations";
import { FolderModal } from "@/features/dashboard/components/FolderModal";
import { DeleteConfirmModal } from "@/features/dashboard/components/DeleteConfirmModal";
import { ShareModal } from "@/features/dashboard/components/ShareModal";
import { formatBytes } from "@/lib/format";
import { determineFileType } from "@/lib/file-utils";
import { getApiErrorMessage } from "@/types/api";
import type { FolderItem, FileItem } from "@/features/files/schemas";
import { toast } from "sonner";

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

    // ─── Mutations ──────────────────────────────────────────────────────────────
    const createFolderMutation = useCreateFolder();
    const updateFolderMutation = useUpdateFolder();
    const deleteFolderMutation = useDeleteFolder();
    const uploadFileMutation = useUploadFile();
    const deleteFileMutation = useDeleteFile();
    const downloadFileMutation = useDownloadFile();

    // ─── Local UI State ─────────────────────────────────────────────────────────
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [isUploadMenuOpen, setIsUploadMenuOpen] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
    const [isDragging, setIsDragging] = useState(false);

    // Folder Modal
    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
    const [editingFolder, setEditingFolder] = useState<FolderItem | null>(null);

    // Delete Modal
    const [deleteTarget, setDeleteTarget] = useState<{ type: "folder" | "file"; id: string; name: string } | null>(null);

    // Share
    const [shareTarget, setShareTarget] = useState<FileItem | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);

    const folders = children?.folders || [];
    const files = children?.files || [];

    // Close menus on click outside
    useEffect(() => {
        const handleClickOutside = () => {
            setActiveMenuId(null);
            setIsUploadMenuOpen(false);
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

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
            throw err; // throw to let DeleteConfirmModal show the error inline
        }
    }, [deleteTarget, deleteFolderMutation, deleteFileMutation]);

    const processFiles = useCallback((filesToUpload: FileList | File[]) => {
        if (!filesToUpload || filesToUpload.length === 0 || !currentFolderId) return;

        Array.from(filesToUpload).forEach(file => {
            const fileId = crypto.randomUUID();
            setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

            uploadFileMutation.mutate({
                file,
                folderId: currentFolderId,
                onProgress: (p) => setUploadProgress(prev => ({ ...prev, [fileId]: p }))
            }, {
                onSuccess: () => {
                    setUploadProgress(prev => {
                        const next = { ...prev };
                        delete next[fileId];
                        return next;
                    });
                    toast.success(`Đã tải lên ${file.name}`);
                },
                onError: (err) => {
                    toast.error(getApiErrorMessage(err, "Lỗi upload file"));
                    setUploadProgress(prev => {
                        const next = { ...prev };
                        delete next[fileId];
                        return next;
                    });
                },
            });
        });
    }, [currentFolderId, uploadFileMutation]);

    const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            processFiles(e.target.files);
        }
        e.target.value = "";
    }, [processFiles]);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            processFiles(e.dataTransfer.files);
        }
    }, [processFiles]);

    const handleShare = useCallback((file: FileItem) => {
        setShareTarget(file);
        setActiveMenuId(null);
    }, []);

    const handleDownload = useCallback((fileId: string, fileName: string) => {
        downloadFileMutation.mutate({ fileId, fileName }, {
            onSuccess: () => toast.success("Đang tải xuống..."),
            onError: (err) => toast.error(getApiErrorMessage(err, "Lỗi khi tải xuống"))
        });
        setActiveMenuId(null);
    }, [downloadFileMutation]);

    // ─── Uploading indicator ────────────────────────────────────────────────────
    const isUploading = Object.keys(uploadProgress).length > 0;

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] lg:h-screen bg-background overflow-hidden">
            {/* Header */}
            <header className="px-8 py-6 flex flex-col sm:flex-row sm:items-end justify-between border-b border-border/50 bg-card/30 backdrop-blur-xl gap-4">
                <div>
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Link href="/dashboard/files" className="hover:text-foreground transition-colors flex items-center gap-1">
                            <Home className="w-4 h-4" /> Tệp của tôi
                        </Link>
                        {folderId && folderInfo && (
                            <>
                                <ChevronRight className="w-4 h-4" />
                                <span className="text-foreground font-medium">{folderInfo.name}</span>
                            </>
                        )}
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {folderId && folderInfo ? folderInfo.name : "Tệp của tôi"}
                    </h1>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    {/* Upload */}
                    <div className="relative">
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" multiple />
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        <input type="file" ref={folderInputRef} onChange={handleFileUpload} className="hidden" multiple {...({webkitdirectory: "true", directory: "true"} as any)} />
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setTimeout(() => setIsUploadMenuOpen(prev => !prev), 0);
                            }}
                            disabled={isUploading}
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors text-sm disabled:opacity-60 border border-primary/40 hover:border-primary cursor-pointer"
                        >
                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            {isUploading ? "Đang tải lên..." : "Tải lên"}
                        </button>

                        {isUploadMenuOpen && !isUploading && (
                            <div className="absolute top-12 right-0 w-48 bg-card border border-border rounded-xl z-20 py-1 shadow-sm mt-2" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => {
                                        setIsUploadMenuOpen(false);
                                        fileInputRef.current?.click();
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-secondary transition-colors cursor-pointer"
                                >
                                    <FileText className="w-4 h-4" /> Tải tệp lên
                                </button>
                                <button
                                    onClick={() => {
                                        setIsUploadMenuOpen(false);
                                        folderInputRef.current?.click();
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-secondary transition-colors cursor-pointer"
                                >
                                    <FolderUp className="w-4 h-4" /> Tải thư mục lên
                                </button>
                            </div>
                        )}
                    </div>

                    {/* New Folder */}
                    <button
                        onClick={() => {
                            setEditingFolder(null);
                            setIsFolderModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-foreground rounded-xl font-bold hover:bg-secondary/80 transition-colors text-sm border border-border"
                    >
                        <Plus className="w-4 h-4" /> Thư mục mới
                    </button>

                    {/* View Toggle */}
                    <div className="flex items-center bg-card p-1 rounded-xl border border-border/60">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-primary text-white border border-primary/30" : "text-muted-foreground hover:bg-secondary border border-transparent"}`}
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-primary text-white border border-primary/30" : "text-muted-foreground hover:bg-secondary border border-transparent"}`}
                        >
                            <ListIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Upload Progress */}
            {isUploading && (
                <div className="px-8 py-3 bg-primary/5 border-b border-primary/20">
                    {Object.entries(uploadProgress).map(([id, progress]) => (
                        <div key={id} className="flex items-center gap-3">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                            </div>
                            <span className="text-sm font-mono text-primary">{progress}%</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Content */}
            <main className="flex-1 overflow-y-auto p-8 scroll-smooth z-0">
                {folders.length === 0 && files.length === 0 ? (
                    <div 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`h-full min-h-[400px] flex flex-col items-center justify-center text-center rounded-3xl border-2 border-dashed transition-all duration-300 ${
                            isDragging ? "border-primary bg-primary/5" : "border-border/60 hover:border-border hover:bg-card/50"
                        }`}
                    >
                        <div className={`p-6 rounded-full mb-6 transition-colors duration-300 ${isDragging ? "bg-primary/20" : "bg-card border border-border"}`}>
                            <FolderOpen className={`w-16 h-16 transition-colors duration-300 ${isDragging ? "text-primary" : "text-muted-foreground/40"}`} />
                        </div>
                        <h3 className={`text-2xl font-bold mb-3 transition-colors duration-300 ${isDragging ? "text-primary" : ""}`}>
                            {isDragging ? "Thả tệp vào đây" : "Thư mục trống"}
                        </h3>
                        <p className="text-muted-foreground/80 font-medium max-w-sm leading-relaxed">
                            {isDragging ? "Chúng tôi sẽ tự động tải lên không gian của bạn." : "Kéo thả tệp vào đây hoặc nhấn mũi tên tải lên ở góc trên cùng để bắt đầu."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Folders */}
                        {folders.length > 0 && (
                            <section>
                                <h3 className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider">Thư mục ({folders.length})</h3>
                                <div className={viewMode === "grid"
                                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
                                    : "space-y-2"
                                }>
                                    {folders.map(folder => (
                                        <div
                                            key={folder.id}
                                            onClick={() => router.push(`/dashboard/files/${folder.id}`)}
                                            className={`group relative cursor-pointer transition-all ${activeMenuId === folder.id ? "z-50" : "z-0"} ${
                                                viewMode === "grid"
                                                    ? "bg-card border border-border/60 hover:border-border p-4 rounded-2xl"
                                                    : "bg-card border border-border/60 hover:border-border p-3 rounded-xl flex items-center gap-4"
                                            }`}
                                        >
                                            <div className={`${viewMode === "grid" ? "flex items-center gap-4 mb-3" : "flex items-center gap-4 flex-1"}`}>
                                                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center shrink-0">
                                                    <FolderOpen className="w-5 h-5 text-amber-500" />
                                                </div>
                                                <h4 className="font-semibold truncate">{folder.name}</h4>
                                            </div>

                                            {/* Context Menu */}
                                            <button
                                                type="button"
                                                className="absolute top-2 right-2 p-2 rounded-lg text-muted-foreground hover:bg-secondary opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const newId = activeMenuId === folder.id ? null : folder.id;
                                                    setTimeout(() => setActiveMenuId(newId), 0);
                                                }}
                                            >
                                                <MoreVertical className="w-5 h-5" />
                                            </button>

                                            {activeMenuId === folder.id && (
                                                <div className="absolute top-12 right-2 w-52 bg-card border border-border rounded-xl z-20 py-1" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingFolder(folder);
                                                            setIsFolderModalOpen(true);
                                                            setActiveMenuId(null);
                                                        }}
                                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-secondary transition-colors"
                                                    >
                                                        <Pencil className="w-4 h-4" /> Đổi tên
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setDeleteTarget({ type: "folder", id: folder.id, name: folder.name });
                                                            setActiveMenuId(null);
                                                        }}
                                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-rose-500/10 text-rose-500 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" /> Xóa
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Files */}
                        {files.length > 0 && (
                            <section>
                                <h3 className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider">Tệp ({files.length})</h3>
                                {viewMode === "grid" ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                                        {files.map(file => {
                                            const fileMeta = determineFileType(file.type || "");
                                            const Icon = fileMeta.icon;
                                            return (
                                                <div key={file.id} className={`group relative bg-card border border-border/60 hover:border-border p-4 rounded-2xl transition-all ${activeMenuId === file.id ? "z-50" : "z-0"}`}>
                                                    <div className="flex items-center gap-4 mb-3">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${fileMeta.bg}`}>
                                                            <Icon className={`w-5 h-5 ${fileMeta.color}`} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-semibold truncate text-sm" title={file.name}>{file.name}</h4>
                                                            <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                                                        </div>
                                                    </div>

                                                    <button
                                                            type="button"
                                                        className="absolute top-2 right-2 p-2 rounded-lg text-muted-foreground hover:bg-secondary opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const newId = activeMenuId === file.id ? null : file.id;
                                                            setTimeout(() => setActiveMenuId(newId), 0);
                                                        }}
                                                    >
                                                        <MoreVertical className="w-5 h-5" />
                                                    </button>

                                                    {activeMenuId === file.id && (
                                                        <div className="absolute top-12 right-2 w-52 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-20 py-1" onClick={e => e.stopPropagation()}>
                                                            <button onClick={() => handleDownload(file.id, file.name)} className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-secondary transition-colors">
                                                                <Download className="w-4 h-4" /> Tải xuống
                                                            </button>
                                                            <button onClick={() => handleShare(file)} className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-secondary transition-colors">
                                                                <LinkIcon className="w-4 h-4" /> Chia sẻ
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setDeleteTarget({ type: "file", id: file.id, name: file.name });
                                                                    setActiveMenuId(null);
                                                                }}
                                                                className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-rose-500/10 text-rose-500 transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" /> Xóa
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="bg-card rounded-2xl border border-border">
                                        <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-secondary/50 font-medium text-muted-foreground text-sm rounded-t-2xl">
                                            <div className="col-span-5">Tên tệp</div>
                                            <div className="col-span-2">Loại</div>
                                            <div className="col-span-2 text-right">Dung lượng</div>
                                            <div className="col-span-2">Ngày tạo</div>
                                            <div className="col-span-1 text-right">Thao tác</div>
                                        </div>
                                        <div className="divide-y divide-border">
                                            {files.map(file => {
                                                const fileMeta = determineFileType(file.type || "");
                                                const Icon = fileMeta.icon;
                                                return (
                                                    <div key={file.id} className={`grid grid-cols-12 gap-4 p-4 items-center hover:bg-secondary/30 transition-colors relative group ${activeMenuId === file.id ? "z-50" : "z-0"}`}>
                                                        <div className="col-span-5 flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${fileMeta.bg}`}>
                                                                <Icon className={`w-4 h-4 ${fileMeta.color}`} />
                                                            </div>
                                                            <span className="font-medium truncate text-sm" title={file.name}>{file.name}</span>
                                                        </div>
                                                        <div className="col-span-2 text-muted-foreground text-sm">{fileMeta.type}</div>
                                                        <div className="col-span-2 text-right text-muted-foreground text-sm font-mono">{formatBytes(file.size)}</div>
                                                        <div className="col-span-2 text-muted-foreground text-sm">{new Date(file.createdAt).toLocaleDateString("vi-VN")}</div>
                                                        <div className="col-span-1 text-right relative">
                                                            <button
                                                                type="button"
                                                                className="p-2 rounded-lg text-muted-foreground hover:bg-secondary opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const newId = activeMenuId === file.id ? null : file.id;
                                                                    setTimeout(() => setActiveMenuId(newId), 0);
                                                                }}
                                                            >
                                                                <MoreVertical className="w-5 h-5" />
                                                            </button>

                                                            {activeMenuId === file.id && (
                                                                <div className="absolute top-10 right-0 w-52 bg-card border border-border rounded-xl overflow-hidden z-20 py-1 text-left" onClick={e => e.stopPropagation()}>
                                                                    <button onClick={() => handleDownload(file.id, file.name)} className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-secondary transition-colors">
                                                                        <Download className="w-4 h-4" /> Tải xuống
                                                                    </button>
                                                                    <button onClick={() => handleShare(file)} className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-secondary transition-colors">
                                                                        <LinkIcon className="w-4 h-4" /> Chia sẻ
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setDeleteTarget({ type: "file", id: file.id, name: file.name });
                                                                            setActiveMenuId(null);
                                                                        }}
                                                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-rose-500/10 text-rose-500 transition-colors"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" /> Xóa
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}
                    </div>
                )}
            </main>

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
        </div>
    );
}

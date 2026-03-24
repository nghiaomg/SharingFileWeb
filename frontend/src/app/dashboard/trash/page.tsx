"use client";

import { useState, useEffect } from "react";
import { File as FileIcon, Trash2, RotateCcw, MoreVertical, LayoutGrid, List as ListIcon, Loader2, Sparkles, FolderOpen } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useTrashItems } from "@/features/trash/queries";
import { useRestoreItem, useDeletePermanent } from "@/features/trash/mutations";
import { formatBytes } from "@/lib/format";
import { getApiErrorMessage } from "@/types/api";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export default function TrashPage() {
    const { data: trashData, isLoading } = useTrashItems();
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ type: "folder" | "file", id: string } | null>(null);
    const restoreMutation = useRestoreItem();
    const deletePermanentMutation = useDeletePermanent();

    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const handleRestore = (type: "folder" | "file", id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        restoreMutation.mutate({ type, id }, {
            onSuccess: () => toast.success("Khôi phục thành công!"),
            onError: (error) => toast.error(getApiErrorMessage(error, "Lỗi khôi phục.")),
        });
        setActiveMenuId(null);
    };

    const handleDeletePermanent = (type: "folder" | "file", id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteTarget({ type, id });
        setActiveMenuId(null);
    };

    const confirmDeletePermanent = async () => {
        if (!deleteTarget) return;
        deletePermanentMutation.mutate(deleteTarget, {
            onSuccess: () => {
                toast.success("Đã xóa vĩnh viễn.");
                setDeleteTarget(null);
            },
            onError: () => toast.error("Lỗi xóa vĩnh viễn."),
        });
    };

    const formatDate = (dateString?: string) => {
         if (!dateString) return "Không rõ";
         return format(new Date(dateString), "dd MMM, yyyy - HH:mm", { locale: vi });
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-muted-foreground font-medium animate-pulse">Đang tải thùng rác...</p>
                </div>
            </div>
        );
    }

    const folders = trashData?.folders || [];
    const files = trashData?.files || [];
    const isEmpty = folders.length === 0 && files.length === 0;

    return (
        <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] lg:h-screen bg-background relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 opacity-5 pointer-events-none">
                <Trash2 className="w-96 h-96" />
            </div>

            <header className="px-8 py-6 flex items-end justify-between border-b border-border/50 bg-card/30 backdrop-blur-xl relative z-10">
                <div>
                   <h1 className="text-3xl font-bold tracking-tight mb-2">Thùng rác</h1>
                   <p className="text-muted-foreground flex items-center gap-2">
                       Nơi chứa các tệp đã xóa. Tự động dọn dẹp sau 30 ngày.
                   </p>
                </div>

                <div className="flex items-center gap-3 bg-card p-1.5 rounded-xl border object-contain shadow-sm">
                   <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-primary text-white shadow-md shadow-primary/20" : "text-muted-foreground hover:bg-secondary"}`}
                   >
                        <LayoutGrid className="w-5 h-5" />
                   </button>
                   <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-primary text-white shadow-md shadow-primary/20" : "text-muted-foreground hover:bg-secondary"}`}
                   >
                        <ListIcon className="w-5 h-5" />
                   </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-8 relative z-10 scroll-smooth">
                {isEmpty ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <div className="w-32 h-32 bg-secondary/50 rounded-full flex items-center justify-center mb-6">
                            <Sparkles className="w-16 h-16 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Thùng rác trống</h3>
                        <p className="text-muted-foreground max-w-[300px]">Không có thư mục hay tệp tin nào đã bị xóa gần đây.</p>
                    </div>
                ) : (
                    <div className={viewMode === "grid" ? "space-y-10" : "space-y-8"}>
                        {/* Folders Section */}
                        {folders.length > 0 && (
                            <section>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    Thư mục bị xóa ({folders.length})
                                </h3>

                                {viewMode === "grid" ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                                        {folders.map(folder => (
                                            <div key={folder.id} className="group relative bg-card p-4 rounded-2xl border border-border/60 hover:border-border transition-all">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center">
                                                        <FolderOpen className="w-6 h-6 text-rose-500" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold truncate">{folder.name}</h4>
                                                        <p className="text-xs text-muted-foreground truncate flex gap-1">
                                                           Xóa: {formatDate(folder.deletedAt)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <button
                                                    className="absolute top-2 right-2 p-2 rounded-lg text-muted-foreground hover:bg-secondary opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveMenuId(activeMenuId === folder.id ? null : folder.id);
                                                    }}
                                                >
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>

                                                {activeMenuId === folder.id && (
                                                    <div className="absolute top-12 right-2 w-48 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-20 py-1">
                                                        <button onClick={(e) => handleRestore("folder", folder.id, e)} className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-secondary transition-colors text-emerald-500">
                                                            <RotateCcw className="w-4 h-4" /> Khôi phục
                                                        </button>
                                                        <button onClick={(e) => handleDeletePermanent("folder", folder.id, e)} className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-rose-500/10 transition-colors text-rose-500">
                                                            <Trash2 className="w-4 h-4" /> Xóa vĩnh viễn
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-card rounded-2xl border border-border overflow-hidden">
                                        <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-secondary/50 font-medium text-muted-foreground">
                                            <div className="col-span-6">Tên thư mục</div>
                                            <div className="col-span-4">Ngày xóa</div>
                                            <div className="col-span-2 text-right">Thao tác</div>
                                        </div>
                                        <div className="divide-y divide-border">
                                            {folders.map((folder) => (
                                                <div key={folder.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-secondary/30 transition-colors relative">
                                                    <div className="col-span-6 flex items-center gap-3">
                                                       <FolderOpen className="w-5 h-5 text-rose-500" />
                                                       <span className="font-medium truncate">{folder.name}</span>
                                                    </div>
                                                    <div className="col-span-4 text-muted-foreground text-sm">{formatDate(folder.deletedAt)}</div>
                                                    <div className="col-span-2 text-right relative">
                                                        <button
                                                            className="p-2 rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveMenuId(activeMenuId === folder.id ? null : folder.id);
                                                            }}
                                                        >
                                                            <MoreVertical className="w-5 h-5" />
                                                        </button>

                                                        {activeMenuId === folder.id && (
                                                            <div className="absolute top-10 right-0 w-48 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-20 py-1 text-left">
                                                                <button onClick={(e) => handleRestore("folder", folder.id, e)} className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-secondary text-emerald-500">
                                                                    <RotateCcw className="w-4 h-4" /> Khôi phục
                                                                </button>
                                                                <button onClick={(e) => handleDeletePermanent("folder", folder.id, e)} className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-rose-500/10 text-rose-500">
                                                                    <Trash2 className="w-4 h-4" /> Xóa vĩnh viễn
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Files Section */}
                        {files.length > 0 && (
                            <section>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    Tệp bị xóa ({files.length})
                                </h3>

                                {viewMode === "grid" ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                                        {files.map(file => (
                                            <div key={file.id} className="group relative bg-card p-4 rounded-2xl border border-border/60 hover:border-border transition-all">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center">
                                                        <FileIcon className="w-6 h-6 text-rose-500" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold truncate" title={file.name}>{file.name}</h4>
                                                        <p className="text-xs text-muted-foreground flex gap-2 truncate">
                                                           {formatBytes(file.size)} | Xóa: {formatDate(file.deletedAt)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <button
                                                    className="absolute top-2 right-2 p-2 rounded-lg text-muted-foreground hover:bg-secondary opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveMenuId(activeMenuId === file.id ? null : file.id);
                                                    }}
                                                >
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>

                                                {activeMenuId === file.id && (
                                                    <div className="absolute top-12 right-2 w-48 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-20 py-1 mx-2">
                                                        <button onClick={(e) => handleRestore("file", file.id, e)} className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-secondary transition-colors text-emerald-500">
                                                            <RotateCcw className="w-4 h-4" /> Khôi phục
                                                        </button>
                                                        <button onClick={(e) => handleDeletePermanent("file", file.id, e)} className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-rose-500/10 transition-colors text-rose-500">
                                                            <Trash2 className="w-4 h-4" /> Xóa vĩnh viễn
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-card rounded-2xl border border-border overflow-hidden">
                                        <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-secondary/50 font-medium text-muted-foreground">
                                            <div className="col-span-6">Tên tệp tin</div>
                                            <div className="col-span-2 text-right">Dung lượng</div>
                                            <div className="col-span-2">Ngày xóa</div>
                                            <div className="col-span-2 text-right">Thao tác</div>
                                        </div>
                                        <div className="divide-y divide-border">
                                            {files.map((file) => (
                                                <div key={file.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-secondary/30 transition-colors relative">
                                                    <div className="col-span-6 flex items-center gap-3">
                                                       <FileIcon className="w-5 h-5 text-rose-500" />
                                                       <span className="font-medium truncate" title={file.name}>{file.name}</span>
                                                    </div>
                                                    <div className="col-span-2 text-right text-muted-foreground">{formatBytes(file.size)}</div>
                                                    <div className="col-span-2 text-muted-foreground text-sm">{formatDate(file.deletedAt)}</div>
                                                    <div className="col-span-2 text-right relative">
                                                        <button
                                                            className="p-2 rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveMenuId(activeMenuId === file.id ? null : file.id);
                                                            }}
                                                        >
                                                            <MoreVertical className="w-5 h-5" />
                                                        </button>

                                                        {activeMenuId === file.id && (
                                                            <div className="absolute top-10 right-0 w-48 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-20 py-1 text-left">
                                                                <button onClick={(e) => handleRestore("file", file.id, e)} className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-secondary text-emerald-500">
                                                                    <RotateCcw className="w-4 h-4" /> Khôi phục
                                                                </button>
                                                                <button onClick={(e) => handleDeletePermanent("file", file.id, e)} className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-rose-500/10 text-rose-500">
                                                                    <Trash2 className="w-4 h-4" /> Xóa vĩnh viễn
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}
                    </div>
                )}
            </main>

            <ConfirmModal 
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDeletePermanent}
                title="Xóa vĩnh viễn"
                description={`Bạn có chắc muốn XÓA VĨNH VIỄN ${deleteTarget?.type === 'folder' ? 'thư mục' : 'tệp'} này không? Hành động này không thể hoàn tác và dữ liệu sẽ mất vĩnh viễn!`}
                confirmText="Xác nhận xóa"
                confirmColor="bg-rose-500 hover:bg-rose-600 text-white"
            />
        </div>
    );
}

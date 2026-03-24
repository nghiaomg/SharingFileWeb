"use client";

import { useState } from "react";
import { Share2, Users, Loader2, Download, Eye } from "lucide-react";
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

const PERMISSION_LABELS: Record<string, { label: string; icon: typeof Eye; color: string }> = {
    VIEW: { label: "Xem", icon: Eye, color: "text-blue-500" },
    DOWNLOAD: { label: "Tải xuống", icon: Download, color: "text-emerald-500" },
};

export default function SharedPage() {
    const [tab, setTab] = useState<"with-me" | "by-me">("with-me");

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

    return (
        <div className="p-8 pb-32 h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Share2 className="w-8 h-8 text-primary" /> Chia sẻ
                </h1>

                <div className="flex bg-secondary p-1 rounded-xl">
                    <button
                        onClick={() => setTab("with-me")}
                        className={`px-4 py-2 font-medium rounded-lg text-sm transition-colors ${
                            tab === "with-me" ? "bg-background border border-border/50 text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Với tôi
                    </button>
                    <button
                        onClick={() => setTab("by-me")}
                        className={`px-4 py-2 font-medium rounded-lg text-sm transition-colors ${
                            tab === "by-me" ? "bg-background border border-border/50 text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Bởi tôi
                    </button>
                </div>
            </div>

            {/* Hero */}
            {(!items || items.length === 0) && !isLoading && (
                <div className="glass bg-card/60 p-12 text-center rounded-3xl border border-border border-dashed mb-8">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">
                        {tab === "with-me" ? "Chưa có ai chia sẻ tệp cho bạn" : "Bạn chưa chia sẻ tệp nào"}
                    </h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        {tab === "with-me"
                            ? "Khi người khác chia sẻ tệp cho bạn, tệp sẽ xuất hiện ở đây."
                            : "Sử dụng nút Chia sẻ trên tệp để chia sẻ với người khác."
                        }
                    </p>
                </div>
            )}

            {/* List */}
            <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm flex-1">
                <div className="p-4 border-b border-border/50 bg-muted/30">
                    <h3 className="font-bold flex items-center gap-2 px-2">
                        <Share2 className="w-4 h-4 text-primary" />
                        {tab === "with-me" ? "Được chia sẻ với tôi" : "Tôi đã chia sẻ"}
                    </h3>
                </div>

                <div className="divide-y divide-border/50">
                    {isLoading ? (
                        <div className="p-8 text-center text-muted-foreground flex items-center justify-center">
                            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Đang tải...
                        </div>
                    ) : items && items.length > 0 ? (
                        items.map((item) => {
                            const meta = determineFileType(item.fileType || "");
                            const Icon = meta.icon;
                            const permMeta = PERMISSION_LABELS[item.permission];
                            const PermIcon = permMeta?.icon || Eye;

                            const canPreview = item.fileType === "folder" || item.fileType === "application/pdf" || item.fileType?.includes("spreadsheetml");

                            return (
                                <div key={item.id} className="flex items-center p-4 hover:bg-muted/20 transition-colors group">
                                    <div className={`p-3 rounded-xl bg-background border border-border shadow-sm mr-4 ${meta.bg}`}>
                                        <Icon className={`w-5 h-5 ${meta.color}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-base truncate pr-4 text-foreground group-hover:text-primary transition-colors">
                                            {item.fileName}
                                        </h4>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {tab === "with-me" ? `Chia sẻ bởi ${item.ownerEmail}` : `Chia sẻ cho ${item.recipientEmail}`}
                                            {" • "}
                                            {format(new Date(item.createdAt), "dd MMM, yyyy HH:mm", { locale: vi })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className={`flex items-center gap-1 text-xs font-semibold ${permMeta?.color || "text-muted-foreground"}`}>
                                            <PermIcon className="w-3.5 h-3.5" /> {permMeta?.label}
                                        </span>
                                        <span className="text-sm font-mono text-muted-foreground hidden md:block">
                                            {formatBytes(item.fileSize)}
                                        </span>
                                        {canPreview && (
                                            <button
                                                onClick={() => handlePreview(item)}
                                                className="p-2 text-primary hover:bg-primary/10 rounded-lg border border-transparent hover:border-border transition-colors opacity-0 group-hover:opacity-100"
                                                title="Xem trước"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        )}
                                        {item.permission === "DOWNLOAD" && tab === "with-me" && item.fileType !== "folder" && (
                                            <button
                                                onClick={() => downloadFile(item.fileId, item.fileName).then(() => toast.success("Đang tải...")).catch(() => toast.error("Lỗi tải xuống"))}
                                                className="p-2 text-muted-foreground hover:bg-background hover:text-foreground rounded-lg border border-transparent hover:border-border transition-colors opacity-0 group-hover:opacity-100"
                                                title="Tải xuống"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : null}
                </div>
            </div>

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
        </div>
    );
}

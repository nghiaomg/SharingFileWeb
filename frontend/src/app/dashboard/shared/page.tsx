"use client";

import { Share2, Users, Link as LinkIcon, ExternalLink, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useSharedFiles } from "@/features/files/queries";
import { categoriesMeta, getCategoryFromMime } from "@/lib/file-utils";
import { formatBytes } from "@/lib/format";

export default function SharedPage() {
    const { data: sharedFiles, isLoading } = useSharedFiles();

    return (
        <div className="p-8 pb-32 h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Share2 className="w-8 h-8 text-primary" /> Được chia sẻ với tôi
                </h1>

                <div className="flex bg-secondary p-1 rounded-xl">
                    <button className="px-4 py-2 bg-background border border-border/50 text-foreground font-medium rounded-lg shadow-sm text-sm">Với tôi</button>
                    <button className="px-4 py-2 text-muted-foreground hover:text-foreground font-medium text-sm">Bởi tôi</button>
                </div>
            </div>

            <div className="glass bg-card/60 p-12 text-center rounded-3xl border border-border border-dashed mb-12">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold mb-2">Chia sẻ nhanh chóng & hiệu quả</h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">Gửi hoặc nhận các tệp tin quan trọng mà không cần phải đính kèm qua email, và luôn đảm bảo quyền truy cập được lưu lại.</p>
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:shadow-primary/30 transition-all">
                    <LinkIcon className="w-4 h-4" /> Tạo liên kết chia sẻ mới
                </button>
            </div>

            <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm flex-1">
                <div className="p-4 border-b border-border/50 bg-muted/30">
                    <h3 className="font-bold flex items-center gap-2 px-2">
                        <Share2 className="w-4 h-4 text-primary" />
                        Gần đây được chia sẻ
                    </h3>
                </div>

                <div className="divide-y divide-border/50">
                    {isLoading ? (
                        <div className="p-8 text-center text-muted-foreground flex items-center justify-center">
                            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Đang tải...
                        </div>
                    ) : !sharedFiles || sharedFiles.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">Bạn chưa chia sẻ công khai tệp tin nào.</div>
                    ) : (
                        sharedFiles.map((file, i) => {
                            const catName = getCategoryFromMime(file.type);
                            const meta = categoriesMeta[catName] || categoriesMeta["Khác"];
                            const Icon = meta.icon;

                            return (
                                <div key={i} className="flex items-center p-4 hover:bg-muted/20 transition-colors group cursor-pointer">
                                    <div className={`p-3 rounded-xl bg-background border border-border shadow-sm mr-4 ${meta.color}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-base truncate pr-4 text-foreground group-hover:text-primary transition-colors">{file.name}</h4>
                                        <p className="text-xs text-muted-foreground mt-1">Đã chia sẻ bởi <span className="font-bold text-foreground">tôi</span> • {format(new Date(file.createdAt), "dd MMM, yyyy HH:mm", { locale: vi })}</p>
                                    </div>
                                    <div className="text-sm font-mono text-muted-foreground mr-6 hidden md:block">
                                        {formatBytes(file.size)}
                                    </div>
                                    <button
                                        className="p-2 text-muted-foreground hover:bg-background hover:text-foreground rounded-lg border border-transparent hover:border-border transition-colors opacity-0 group-hover:opacity-100"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(`/api/files/public/${file.id}`, '_blank');
                                        }}
                                        title="Mở liên kết chia sẻ"
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

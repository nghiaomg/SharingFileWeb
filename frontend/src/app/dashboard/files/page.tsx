"use client";

import { Folder, FileText, Image as ImageIcon, Video, Music, MoreVertical, Search, Plus, HardDrive, Share2, Grid, List as ListIcon, Filter } from "lucide-react";

const myFiles = [
    { name: "Công việc", type: "Thư mục", size: "--", date: "12 Th03, 2024", icon: Folder, color: "text-amber-500", bg: "bg-amber-500/10" },
    { name: "Thiết kế UI-UX", type: "Thư mục", size: "--", date: "05 Th03, 2024", icon: Folder, color: "text-amber-500", bg: "bg-amber-500/10" },
    { name: "Tai_Lieu_Huong_Dan.pdf", type: "Tài liệu", size: "4.5 MB", date: "Hôm qua", icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
    { name: "Banner_Trang_chu.jpg", type: "Hình ảnh", size: "1.2 MB", date: "22 Th02, 2024", icon: ImageIcon, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { name: "Video_QC_Thang_4.mp4", type: "Video", size: "245 MB", date: "15 Th02, 2024", icon: Video, color: "text-rose-500", bg: "bg-rose-500/10" },
    { name: "Nhac_Nen_Podcast.mp3", type: "Âm thanh", size: "8.4 MB", date: "01 Th02, 2024", icon: Music, color: "text-violet-500", bg: "bg-violet-500/10" },
];

export default function MyFilesPage() {
    return (
        <div className="p-8 pb-32">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold">Tệp của tôi</h1>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground font-medium rounded-xl hover:bg-secondary/80 transition-colors">
                        <Filter className="w-4 h-4" /> Bộ lọc
                    </button>
                    <div className="flex bg-secondary rounded-xl p-1">
                        <button className="p-2 rounded-lg bg-background shadow-sm text-foreground">
                            <Grid className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground">
                            <ListIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Actions / Navigation path */}
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-8 bg-card/50 p-3 rounded-2xl border border-border/50 w-fit">
                <span className="text-primary cursor-pointer hover:underline">FileFlow</span>
                <span>/</span>
                <span className="text-foreground">Tệp của tôi</span>
            </div>

            {/* Files Grid View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {myFiles.map((file, idx) => (
                    <div key={idx} className="bg-card border border-border/50 rounded-3xl p-5 hover:bg-card/80 transition-all hover:shadow-xl hover:shadow-primary/5 cursor-pointer group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-2xl ${file.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <file.icon className={`w-6 h-6 ${file.color}`} />
                            </div>
                            <button className="p-1.5 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity bg-background rounded-lg border border-border">
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        </div>
                        <h3 className="font-bold text-base truncate mb-1" title={file.name}>{file.name}</h3>
                        <div className="flex justify-between items-center text-xs text-muted-foreground mt-4 font-medium">
                            <span>{file.date}</span>
                            <span>{file.size}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="fixed bottom-8 right-8">
                <button className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 hover:scale-110 hover:rotate-90 transition-all">
                    <Plus className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
}

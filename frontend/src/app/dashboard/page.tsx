"use client";

import { Folder, FileText, Image as ImageIcon, Video, MoreVertical, Plus, HardDrive, Share2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const categories = [
    { title: "Tài liệu", icon: FileText, files: 120, size: "1.2 GB", color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Hình ảnh", icon: ImageIcon, files: 543, size: "3.4 GB", color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Video", icon: Video, files: 24, size: "12.5 GB", color: "text-rose-500", bg: "bg-rose-500/10" },
    { title: "Khác", icon: Folder, files: 54, size: "890 MB", color: "text-amber-500", bg: "bg-amber-500/10" },
];

const recentFiles = [
    { id: "doc-1", name: "Ban_ke_hoach_kinh_doanh_2024.pdf", size: "2.4 MB", type: "Tài liệu", date: "Hôm nay, 14:30", icon: FileText, color: "text-blue-500" },
    { id: "img-1", name: "Logo_FileFlow_Final.png", size: "840 KB", type: "Hình ảnh", date: "Hôm qua, 09:12", icon: ImageIcon, color: "text-emerald-500" },
    { id: "vid-1", name: "Video_gioi_thieu_san_pham.mp4", size: "124 MB", type: "Video", date: "10 T2, 2024", icon: Video, color: "text-rose-500" },
    { id: "folder-1", name: "Source_Code_Backup.zip", size: "2.1 GB", type: "Thư mục", date: "08 T2, 2024", icon: Folder, color: "text-amber-500" },
];

export default function DashboardPage() {
    const router = useRouter();

    const handleFileClick = (fileId: string, type: string) => {
        if (type === "Thư mục") {
            router.push(`/dashboard/files/${fileId}`);
        } else {
            // Usually opens file preview modal or details view
            alert(`Mở tệp: ${fileId}`);
        }
    };
    return (
        <div className="p-8 pb-32">
            <h1 className="text-3xl font-bold mb-8">Tổng quan lưu trữ</h1>

            {/* Storage Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {categories.map((cat, index) => (
                    <div key={index} className="p-6 rounded-3xl bg-card border border-border/50 shadow-sm hover:shadow-lg transition-all hover:bg-card/50 group cursor-pointer">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl ${cat.bg} transition-transform group-hover:scale-110`}>
                                <cat.icon className={`w-8 h-8 ${cat.color}`} />
                            </div>
                            <button className="text-muted-foreground hover:text-foreground">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>
                        <h3 className="text-lg font-bold mb-1">{cat.title}</h3>
                        <div className="flex justify-between items-center text-sm font-medium">
                            <span className="text-muted-foreground">{cat.files} tệp</span>
                            <span>{cat.size}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Tệp gần đây</h2>
                <Link href="/dashboard/files" className="text-sm font-bold text-primary hover:underline">
                    Xem tất cả
                </Link>
            </div>

            {/* Recent Files Table */}
            <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm">
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-border/50 bg-muted/30 text-sm font-bold text-muted-foreground">
                    <div className="col-span-6 pl-4">Tên tệp</div>
                    <div className="col-span-2 text-right">Kích cỡ</div>
                    <div className="col-span-3 text-right">Cập nhật lần cuối</div>
                    <div className="col-span-1 text-center">Tùy chọn</div>
                </div>

                <div className="divide-y divide-border/50">
                    {recentFiles.map((file, i) => (
                        <div
                            key={i}
                            onClick={() => handleFileClick(file.id, file.type)}
                            className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/20 transition-colors group cursor-pointer"
                        >
                            <div className="col-span-6 flex items-center gap-4 pl-4">
                                <div className={`p-2.5 rounded-xl bg-background border border-border/50 shadow-sm ${file.color}`}>
                                    <file.icon className="w-5 h-5" />
                                </div>
                                <span className="font-semibold truncate">{file.name}</span>
                            </div>
                            <div className="col-span-2 text-right text-sm text-muted-foreground font-mono">
                                {file.size}
                            </div>
                            <div className="col-span-3 text-right text-sm text-muted-foreground">
                                {file.date}
                            </div>
                            <div className="col-span-1 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                                <button className="p-2 text-muted-foreground hover:text-primary bg-background rounded-lg border border-border shadow-sm transition-colors cursor-pointer" onClick={(e) => { e.stopPropagation(); }}>
                                    <Share2 className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-muted-foreground hover:text-primary bg-background rounded-lg border border-border shadow-sm transition-colors cursor-pointer" onClick={(e) => { e.stopPropagation(); }}>
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Upload Action - Drag/Drop empty state simulation */}
            <div className="mt-12 rounded-3xl border-2 border-dashed border-border/60 bg-primary/5 p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-all group">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <HardDrive className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Không còn giới hạn lưu trữ!</h3>
                <p className="text-muted-foreground mb-6 max-w-lg">
                    Kéo và thả tệp của bạn vào khu vực này để tải lên tức thì, hoặc chia sẻ tệp mã hóa qua liên kết bảo mật ngay lập tức.
                </p>
                <button className="flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-lg hover:shadow-primary/40 hover:-translate-y-1 transition-all">
                    <Plus className="w-5 h-5" />
                    Tải lên hoặc Tạo thư mục
                </button>
            </div>
        </div>
    );
}

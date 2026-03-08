"use client";

import { useState } from "react";
import { Folder, FileText, Image as ImageIcon, Video, Music, MoreVertical, Plus, Grid, List as ListIcon, Filter, Upload, Download, Trash2, Share2, FileArchive, LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface FileItem {
    id: string;
    name: string;
    type: "Thư mục" | "Tài liệu" | "Hình ảnh" | "Video" | "Âm thanh" | "Lưu trữ";
    size: string;
    date: string;
    icon: LucideIcon;
    color: string;
    bg: string;
}

const dbFiles: FileItem[] = [
    { id: "1", name: "Công việc", type: "Thư mục", size: "--", date: "12 Th03, 2024", icon: Folder, color: "text-amber-500", bg: "bg-amber-500/10" },
    { id: "2", name: "Thiết kế UI-UX", type: "Thư mục", size: "--", date: "05 Th03, 2024", icon: Folder, color: "text-amber-500", bg: "bg-amber-500/10" },
    { id: "3", name: "Tai_Lieu_Huong_Dan.pdf", type: "Tài liệu", size: "4.5 MB", date: "Hôm qua", icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: "4", name: "Banner_Trang_chu.jpg", type: "Hình ảnh", size: "1.2 MB", date: "22 Th02, 2024", icon: ImageIcon, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { id: "5", name: "Video_QC_Thang_4.mp4", type: "Video", size: "245 MB", date: "15 Th02, 2024", icon: Video, color: "text-rose-500", bg: "bg-rose-500/10" },
    { id: "6", name: "Nhac_Nen_Podcast.mp3", type: "Âm thanh", size: "8.4 MB", date: "01 Th02, 2024", icon: Music, color: "text-violet-500", bg: "bg-violet-500/10" },
    { id: "7", name: "Backup_Database.zip", type: "Lưu trữ", size: "1.2 GB", date: "10 Th01, 2024", icon: FileArchive, color: "text-orange-500", bg: "bg-orange-500/10" },
];

const categories = ["Tất cả", "Thư mục", "Hình ảnh", "Tài liệu", "Media"];

export default function MyFilesPage() {
    const router = useRouter();
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [activeTab, setActiveTab] = useState("Tất cả");
    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
    const [isDragging, setIsDragging] = useState(false);
    const [dragCounter, setDragCounter] = useState(0);

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCounter((prev) => prev + 1);
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCounter((prev) => {
            const newCount = prev - 1;
            if (newCount === 0) {
                setIsDragging(false);
            }
            return newCount;
        });
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCounter(0);
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            alert(`Đã thả ${e.dataTransfer.files.length} tệp. Chờ tải lên!`);
        }
    };

    const toggleSelection = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newSet = new Set(selectedFiles);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedFiles(newSet);
    };

    const toggleAll = () => {
        if (selectedFiles.size === filteredFiles.length) {
            setSelectedFiles(new Set());
        } else {
            setSelectedFiles(new Set(filteredFiles.map(f => f.id)));
        }
    };

    const handleItemClick = (file: FileItem, e: React.MouseEvent) => {
        if (file.type === "Thư mục") {
            router.push(`/dashboard/files/${file.id}`);
        } else {
            toggleSelection(file.id, e);
        }
    };

    const filteredFiles = dbFiles.filter(file => {
        if (activeTab === "Tất cả") return true;
        if (activeTab === "Thư mục" && file.type === "Thư mục") return true;
        if (activeTab === "Hình ảnh" && file.type === "Hình ảnh") return true;
        if (activeTab === "Tài liệu" && file.type === "Tài liệu") return true;
        if (activeTab === "Media" && (file.type === "Video" || file.type === "Âm thanh")) return true;
        return false;
    });

    return (
        <div
            className={`p-4 md:p-8 pb-32 h-full flex flex-col relative transition-colors ${isDragging ? "bg-primary/5" : ""}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {/* Drag & Drop Overlay */}
            {isDragging && (
                <div className="absolute inset-4 z-50 bg-background/80 backdrop-blur-sm border-2 border-primary border-dashed rounded-3xl flex flex-col items-center justify-center">
                    <div className="p-6 bg-primary/20 rounded-full mb-6 pointer-events-none">
                        <Upload className="w-16 h-16 text-primary animate-bounce shadow-primary/30 drop-shadow-lg" />
                    </div>
                    <h2 className="text-3xl font-black mb-2 text-foreground pointer-events-none">Thả tệp để tải lên</h2>
                    <p className="text-muted-foreground font-medium pointer-events-none">Tất cả tệp sẽ được tải vào bộ nhớ của bạn ngay lập tức.</p>
                </div>
            )}

            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Tệp của tôi</h1>
                    {/* Navigation path */}
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <span className="text-primary cursor-pointer hover:underline">FileFlow</span>
                        <span>/</span>
                        <span className="text-foreground">Tệp của tôi</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-background border border-border text-foreground font-medium rounded-xl hover:bg-secondary/80 transition-colors shadow-sm">
                        <Plus className="w-4 h-4" /> Thư mục mới
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                        <Upload className="w-4 h-4" /> Tải lên
                    </button>
                </div>
            </div>

            {/* Toolbar Area */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-8 bg-card border border-border/50 p-2 rounded-2xl shadow-sm">
                <div className="flex gap-1 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide px-2">
                    {categories.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${activeTab === tab
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end px-2">
                    {selectedFiles.size > 0 && (
                        <div className="flex items-center gap-2 mr-4 bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-sm font-bold border border-primary/20">
                            <span>Đã chọn {selectedFiles.size} tệp</span>
                            <div className="w-px h-4 bg-primary/30 mx-1"></div>
                            <button className="p-1 hover:bg-primary/20 rounded-md transition-colors tooltip-trigger" title="Tải xuống"><Download className="w-4 h-4" /></button>
                            <button className="p-1 hover:bg-primary/20 rounded-md transition-colors tooltip-trigger" title="Chia sẻ"><Share2 className="w-4 h-4" /></button>
                            <button className="p-1 text-rose-500 hover:bg-rose-500/20 rounded-md transition-colors tooltip-trigger" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    )}

                    <button className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground font-medium rounded-lg hover:bg-secondary/80 transition-colors text-sm">
                        <Filter className="w-4 h-4" /> B.lọc
                    </button>
                    <div className="flex bg-secondary rounded-lg p-1">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            <ListIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Files Content */}
            <div className="flex-1">
                {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredFiles.map((file) => (
                            <div
                                key={file.id}
                                onClick={(e) => handleItemClick(file, e)}
                                className={`bg-card border rounded-3xl p-5 hover:shadow-xl transition-all cursor-pointer group relative ${selectedFiles.has(file.id)
                                    ? "border-primary ring-1 ring-primary/50 bg-primary/5 shadow-primary/10"
                                    : "border-border/50 hover:bg-card/80 hover:border-primary/30"
                                    }`}
                            >
                                {/* Checkbox Top Right */}
                                <div className={`absolute top-4 right-4 z-10 ${selectedFiles.has(file.id) ? 'block' : 'hidden group-hover:block'}`}>
                                    <div
                                        onClick={(e) => toggleSelection(file.id, e)}
                                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors cursor-pointer hover:border-primary/50 hover:scale-110 ${selectedFiles.has(file.id) ? 'bg-primary border-primary' : 'bg-background border-muted-foreground/50'}`}
                                    >
                                        {selectedFiles.has(file.id) && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                    </div>
                                </div>

                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-14 h-14 rounded-2xl ${file.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        <file.icon className={`w-7 h-7 ${file.color}`} />
                                    </div>
                                </div>
                                <h3 className="font-bold text-base truncate mb-1" title={file.name}>{file.name}</h3>
                                <div className="flex justify-between items-center text-xs text-muted-foreground mt-4 font-medium">
                                    <span>{file.date}</span>
                                    <span>{file.size}</span>
                                </div>

                                {/* Quick actions on hover */}
                                <div className="absolute bottom-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 text-muted-foreground hover:text-primary bg-background rounded-lg shadow-sm border border-border" onClick={(e) => e.stopPropagation()}>
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm">
                        <div className="grid grid-cols-12 gap-4 p-4 border-b border-border/50 bg-muted/30 text-sm font-bold text-muted-foreground items-center">
                            <div className="col-span-6 flex items-center gap-3 pl-4">
                                <button onClick={toggleAll} className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedFiles.size === filteredFiles.length && filteredFiles.length > 0 ? 'bg-primary border-primary' : 'bg-background border-border hover:border-primary/50'}`}>
                                    {selectedFiles.size > 0 && selectedFiles.size === filteredFiles.length && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                    {selectedFiles.size > 0 && selectedFiles.size < filteredFiles.length && <div className="w-2.5 h-0.5 bg-primary rounded-full"></div>}
                                </button>
                                Tên tệp
                            </div>
                            <div className="col-span-2 text-right">Kích cỡ</div>
                            <div className="col-span-3 text-right">Cập nhật lần cuối</div>
                            <div className="col-span-1 text-center">Tùy chọn</div>
                        </div>

                        <div className="divide-y divide-border/50">
                            {filteredFiles.map((file) => (
                                <div
                                    key={file.id}
                                    onClick={(e) => handleItemClick(file, e)}
                                    className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors group cursor-pointer ${selectedFiles.has(file.id) ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/20"
                                        }`}
                                >
                                    <div className="col-span-6 flex items-center gap-3 pl-4">
                                        <button
                                            onClick={(e) => toggleSelection(file.id, e)}
                                            className={`w-5 h-5 rounded border flex items-center justify-center transition-colors cursor-pointer hover:border-primary/50 shrink-0 ${selectedFiles.has(file.id) ? 'bg-primary border-primary' : 'bg-background border-border group-hover:border-primary/50'}`}
                                        >
                                            {selectedFiles.has(file.id) && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                        </button>
                                        <div className={`p-2 rounded-xl bg-background border border-border/50 shadow-sm shrink-0 ${file.bg}`}>
                                            <file.icon className={`w-5 h-5 ${file.color}`} />
                                        </div>
                                        <span className="font-semibold truncate pr-4 group-hover:text-primary transition-colors">{file.name}</span>
                                    </div>
                                    <div className="col-span-2 text-right text-sm text-muted-foreground font-mono">
                                        {file.size}
                                    </div>
                                    <div className="col-span-3 text-right text-sm text-muted-foreground">
                                        {file.date}
                                    </div>
                                    <div className="col-span-1 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                                        <button className="p-2 text-muted-foreground hover:text-primary bg-background rounded-lg border border-border shadow-sm transition-colors" onClick={(e) => e.stopPropagation()}>
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 text-muted-foreground hover:text-primary bg-background rounded-lg border border-border shadow-sm transition-colors" onClick={(e) => e.stopPropagation()}>
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {filteredFiles.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                        <Folder className="w-16 h-16 mb-4 opacity-20" />
                        <h3 className="text-xl font-bold text-foreground">Không có tệp nào</h3>
                        <p>Thư mục hoặc bộ lọc hiện tại của bạn không chứa dữ liệu.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

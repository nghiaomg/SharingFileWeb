"use client";

import { useState } from "react";
import { Folder, FileText, Image as ImageIcon, Video, Music, MoreVertical, Plus, Grid, List as ListIcon, Filter, Upload, Download, Trash2, Share2, FileArchive, LucideIcon, ArrowLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

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

// Mockdata showing nested items for the requested folder
const getNestedFiles = (folderId: string): FileItem[] => {
    // Prevent infinite URL growing by bounding the ID string
    const baseId = folderId.replace(/[^a-zA-Z0-9]/g, "").substring(0, 8);

    return [
        { id: `dir-${baseId}`, name: "Thư mục phụ", type: "Thư mục", size: "--", date: "Hôm qua", icon: Folder, color: "text-amber-500", bg: "bg-amber-500/10" },
        { id: `doc-${baseId}`, name: "Bao_Cao_Tien_Do.pdf", type: "Tài liệu", size: "2.4 MB", date: "Hôm qua", icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
        { id: `img-${baseId}`, name: "Concept_Draft.png", type: "Hình ảnh", size: "5.1 MB", date: "2 ngày trước", icon: ImageIcon, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    ];
};

const categories = ["Tất cả", "Thư mục", "Hình ảnh", "Tài liệu", "Media"];

export default function FolderDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const folderId = params?.folderId as string;

    // Simulate folder name derivation
    const folderName = folderId === "1" ? "Công việc" : folderId === "2" ? "Thiết kế UI-UX" : "Thư mục khác";

    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [activeTab, setActiveTab] = useState("Tất cả");
    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

    const folderFiles = getNestedFiles(folderId);

    const filteredFiles = folderFiles.filter(file => {
        if (activeTab === "Tất cả") return true;
        if (activeTab === "Thư mục" && file.type === "Thư mục") return true;
        if (activeTab === "Hình ảnh" && file.type === "Hình ảnh") return true;
        if (activeTab === "Tài liệu" && file.type === "Tài liệu") return true;
        if (activeTab === "Media" && (file.type === "Video" || file.type === "Âm thanh")) return true;
        return false;
    });

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

    return (
        <div className="p-4 md:p-8 pb-32 h-full flex flex-col w-full">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 w-full">
                <div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="p-2 border border-border/50 bg-card hover:bg-secondary rounded-xl transition-colors cursor-pointer text-muted-foreground hover:text-foreground shadow-sm"
                            title="Quay lại"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-2xl md:text-3xl font-bold mb-1">{folderName}</h1>
                    </div>
                    {/* Navigation path */}
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mt-2 pl-2">
                        <span onClick={() => router.push('/dashboard/files')} className="text-primary cursor-pointer hover:underline">Tệp của tôi</span>
                        <span>/</span>
                        <span className="text-foreground">{folderName}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-background border border-border text-foreground font-medium rounded-xl hover:bg-secondary/80 transition-colors shadow-sm cursor-pointer">
                        <Plus className="w-4 h-4" /> Thư mục mới
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 cursor-pointer">
                        <Upload className="w-4 h-4" /> Tải lên
                    </button>
                </div>
            </div>

            {/* Toolbar Area */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-8 bg-card border border-border/50 p-2 rounded-2xl shadow-sm w-full">
                <div className="flex gap-1 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide px-2">
                    {categories.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${activeTab === tab
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end px-2">
                    {selectedFiles.size > 0 && (
                        <div className="flex items-center gap-1.5 md:gap-2 mr-2 md:mr-4 bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-sm font-bold border border-primary/20">
                            <span className="whitespace-nowrap hidden sm:inline">Đã chọn {selectedFiles.size} tệp</span>
                            <span className="whitespace-nowrap sm:hidden">{selectedFiles.size} tệp</span>
                            <div className="w-px h-4 bg-primary/30 mx-1"></div>
                            <button className="p-1 hover:bg-primary/20 rounded-md transition-colors tooltip-trigger cursor-pointer" title="Tải xuống"><Download className="w-4 h-4" /></button>
                            <button className="p-1 hover:bg-primary/20 rounded-md transition-colors tooltip-trigger cursor-pointer" title="Chia sẻ"><Share2 className="w-4 h-4" /></button>
                            <button className="p-1 text-rose-500 hover:bg-rose-500/20 rounded-md transition-colors tooltip-trigger cursor-pointer" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground font-medium rounded-lg hover:bg-secondary/80 transition-colors text-sm cursor-pointer">
                            <Filter className="w-4 h-4" /> <span className="hidden sm:inline">B.lọc</span>
                        </button>
                        <div className="flex bg-secondary rounded-lg p-1 shrink-0">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-1.5 rounded-md transition-colors cursor-pointer ${viewMode === "grid" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-1.5 rounded-md transition-colors cursor-pointer ${viewMode === "list" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                <ListIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Files Content */}
            <div className="flex-1 w-full">
                {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
                                <div className={`absolute top-4 right-4 z-10 ${selectedFiles.has(file.id) ? 'block' : 'hidden md:group-hover:block'}`}>
                                    <div
                                        onClick={(e) => toggleSelection(file.id, e)}
                                        className={`w-6 h-6 rounded border flex items-center justify-center transition-colors cursor-pointer hover:scale-110 shadow-sm ${selectedFiles.has(file.id) ? 'bg-primary border-primary' : 'bg-background border-muted-foreground/50 hover:border-primary'}`}
                                    >
                                        {selectedFiles.has(file.id) && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                    </div>
                                </div>

                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-14 h-14 rounded-2xl ${file.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        <file.icon className={`w-7 h-7 ${file.color} ${file.type === "Thư mục" ? "fill-amber-500/20" : ""}`} />
                                    </div>
                                </div>
                                <h3 className="font-bold text-base truncate mb-1 group-hover:text-primary transition-colors" title={file.name}>{file.name}</h3>
                                <div className="flex justify-between items-center text-xs text-muted-foreground mt-4 font-medium">
                                    <span>{file.date}</span>
                                    <span>{file.size}</span>
                                </div>

                                {/* Quick actions on hover */}
                                <div className="absolute bottom-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 text-muted-foreground hover:text-primary bg-background rounded-lg shadow-sm border border-border cursor-pointer transition-colors" onClick={(e) => e.stopPropagation()}>
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm w-full overflow-x-auto">
                        <div className="min-w-[600px]">
                            <div className="grid grid-cols-12 gap-4 p-4 border-b border-border/50 bg-muted/30 text-sm font-bold text-muted-foreground items-center">
                                <div className="col-span-6 flex items-center gap-3 pl-4">
                                    <button onClick={toggleAll} className={`w-5 h-5 rounded border flex items-center justify-center transition-colors cursor-pointer hover:border-primary/50 ${selectedFiles.size === filteredFiles.length && filteredFiles.length > 0 ? 'bg-primary border-primary' : 'bg-background border-border'}`}>
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
                                            <div
                                                onClick={(e) => toggleSelection(file.id, e)}
                                                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${selectedFiles.has(file.id) ? 'bg-primary border-primary' : 'bg-background border-border group-hover:border-primary/50'}`}
                                            >
                                                {selectedFiles.has(file.id) && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                            </div>
                                            <div className={`p-2 rounded-xl bg-background border border-border/50 shadow-sm shrink-0 ${file.bg}`}>
                                                <file.icon className={`w-5 h-5 ${file.color} ${file.type === "Thư mục" ? "fill-amber-500/20" : ""}`} />
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
                    </div>
                )}

                {filteredFiles.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                        <Folder className="w-16 h-16 mb-4 opacity-20" />
                        <h3 className="text-xl font-bold text-foreground mb-2">Thư mục trống</h3>
                        <p className="text-sm">Kéo thả tệp vào đây hoặc nhấn Tải lên để thêm file mới.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

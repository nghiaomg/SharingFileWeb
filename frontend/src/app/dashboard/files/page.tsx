"use client";

import { useState, useEffect, useRef } from "react";
import { Folder, FileText, Image as ImageIcon, Video, Music, MoreVertical, Plus, Grid, List as ListIcon, Filter, Upload, Download, Trash2, Share2, FileArchive, Edit2, Loader2, LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { folderService, FolderResponse } from "@/services/folderService";
import { fileStoreService, FileResponse } from "@/services/fileStoreService";
import { FolderModal } from "@/features/dashboard/components/FolderModal";
import { DeleteConfirmModal } from "@/features/dashboard/components/DeleteConfirmModal";

interface FileItem {
    id: string;
    name: string;
    type: "Thư mục" | "Tài liệu" | "Hình ảnh" | "Video" | "Âm thanh" | "Lưu trữ";
    size: string;
    date: string;
    icon: LucideIcon;
    color: string;
    bg: string;
    public?: boolean;
}

const categories = ["Tất cả", "Thư mục", "Hình ảnh", "Tài liệu", "Media"];

export default function MyFilesPage() {
    const router = useRouter();
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [activeTab, setActiveTab] = useState("Tất cả");
    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
    const [isDragging, setIsDragging] = useState(false);

    const [folders, setFolders] = useState<FolderResponse[]>([]);
    const [files, setFiles] = useState<FileResponse[]>([]);

    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [folderToEdit, setFolderToEdit] = useState<{ id: string, name: string } | null>(null);
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [folderToDelete, setFolderToDelete] = useState<{ id: string, name: string } | null>(null);
    
    // Quick action menu state (for mobile & desktop)
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    const loadData = async () => {
        try {
            const [folderData, fileData] = await Promise.all([
                folderService.getRootFolders(),
                fileStoreService.getFiles(null)
            ]);
            setFolders(folderData);
            setFiles(fileData);
        } catch (error) {
            console.error("Failed to load data:", error);
        }
    };

    useEffect(() => {
        loadData();
        
        // Hide popup menus when scrolling or clicking outside
        const handleClickOutside = () => setActiveMenuId(null);
        window.addEventListener("click", handleClickOutside);
        return () => window.removeEventListener("click", handleClickOutside);
    }, []);

    // Format Date string
    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // Transform API Folders to FileItem structure
    const mappedFolders: FileItem[] = folders.map(f => ({
        id: f.id,
        name: f.name,
        type: "Thư mục",
        size: "--",
        date: formatDate(f.createdAt),
        icon: Folder,
        color: "text-amber-500",
        bg: "bg-amber-500/10"
    }));

    const getFormatSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const determineFileType = (mimeType: string) => {
        if (mimeType.startsWith('image/')) return { type: "Hình ảnh", icon: ImageIcon, color: "text-emerald-500", bg: "bg-emerald-500/10" };
        if (mimeType.startsWith('video/')) return { type: "Video", icon: Video, color: "text-rose-500", bg: "bg-rose-500/10" };
        if (mimeType.startsWith('audio/')) return { type: "Audio", icon: Music, color: "text-purple-500", bg: "bg-purple-500/10" };
        if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('rar')) return { type: "Lưu trữ", icon: FileArchive, color: "text-gray-500", bg: "bg-gray-500/10" };
        return { type: "Tài liệu", icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" };
    };

    const mappedFiles: FileItem[] = files.map(f => {
        const meta = determineFileType(f.type);
        return {
            id: f.id,
            name: f.name,
            type: meta.type as "Thư mục" | "Tài liệu" | "Hình ảnh" | "Video" | "Âm thanh" | "Lưu trữ",
            size: getFormatSize(f.size),
            date: formatDate(f.createdAt),
            icon: meta.icon,
            color: meta.color,
            bg: meta.bg,
            public: f.public
        };
    });

    // Combine folders and files
    const allItemsMerged: FileItem[] = [...mappedFolders, ...mappedFiles];

    // CRUD Handlers
    const handleCreateFolder = async (name: string) => {
        await folderService.createFolder(name, null);
        await loadData();
    };

    const handleEditFolder = async (name: string) => {
        if (!folderToEdit) return;
        await folderService.updateFolder(folderToEdit.id, name);
        await loadData();
    };

    const handleDeleteFolder = async () => {
        if (!folderToDelete) return;
        await folderService.deleteFolder(folderToDelete.id);
        await loadData();
    };

    const handleDeleteFile = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if(confirm("Bạn có chắc muốn bỏ tệp này vào thùng rác?")) {
            await fileStoreService.deleteFile(id);
            await loadData();
        }
    };

    const handleShareFile = async (id: string, isCurrentlyPublic: boolean, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const newStatus = !isCurrentlyPublic;
            await fileStoreService.toggleShareFile(id, newStatus);
            
            if (newStatus) {
                const link = `${window.location.origin}/shared/file/${id}`;
                await navigator.clipboard.writeText(link);
                alert("Đã sao chép liên kết chia sẻ vào khay nhớ tạm!");
            } else {
                alert("Đã huỷ chia sẻ công khai.");
            }
            await loadData();
        } catch {
             alert("Lỗi khi thay đổi trạng thái chia sẻ.");
        }
        setActiveMenuId(null);
    };

    const handleDownloadFile = async (id: string, name: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await fileStoreService.downloadFile(id, name);
        } catch {
            alert("Lỗi tải tệp xuống.");
        }
        setActiveMenuId(null);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            setUploadProgress(0);

            await fileStoreService.uploadFileChunked(file, null, (prog) => {
                setUploadProgress(prog);
            });

            await loadData();
        } catch (error: unknown) {
            if (error instanceof Error) {
                alert(error.message);
            } else {
                alert("Lỗi tải tệp lên.");
            }
        } finally {
            setIsUploading(false);
            setUploadProgress(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const toggleMenu = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setActiveMenuId(prev => prev === id ? null : id);
    };

    const openEditModal = (id: string, name: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setFolderToEdit({ id, name });
        setIsEditModalOpen(true);
        setActiveMenuId(null);
    };

    const openDeleteModal = (id: string, name: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setFolderToDelete({ id, name });
        setIsDeleteModalOpen(true);
        setActiveMenuId(null);
    };

    const dragCounterRef = useRef(0);

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounterRef.current += 1;
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounterRef.current -= 1;
        if (dragCounterRef.current === 0) {
            setIsDragging(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounterRef.current = 0;
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

    const filteredFiles = allItemsMerged.filter(file => {
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
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-background border border-border text-foreground font-medium rounded-xl hover:bg-secondary/80 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" /> Thư mục mới
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    <button 
                        onClick={handleUploadClick}
                        disabled={isUploading}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {isUploading ? `Đang tải... ${uploadProgress}%` : "Tải lên"}
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
                                    <div className="relative">
                                        <button className="p-2 text-muted-foreground hover:text-primary bg-background rounded-lg shadow-sm border border-border" onClick={(e) => toggleMenu(file.id, e)}>
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                        
                                        
                                        {/* Dropdown Menu */}
                                        {activeMenuId === file.id && (
                                            <div className="absolute bottom-full right-0 mb-2 w-36 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-20 animate-in fade-in slide-in-from-bottom-2">
                                                {file.type === "Thư mục" ? (
                                                    <>
                                                        <button onClick={(e) => openEditModal(file.id, file.name, e)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary transition-colors font-medium flex items-center gap-2 cursor-pointer">
                                                            <Edit2 className="w-4 h-4 text-primary" /> Đổi tên
                                                        </button>
                                                        <button onClick={(e) => openDeleteModal(file.id, file.name, e)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-rose-500/10 text-rose-500 transition-colors font-medium flex items-center gap-2 cursor-pointer">
                                                            <Trash2 className="w-4 h-4" /> Xóa
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={(e) => handleDownloadFile(file.id, file.name, e)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary transition-colors font-medium flex items-center gap-2 cursor-pointer">
                                                            <Download className="w-4 h-4 text-emerald-500" /> Tải xuống
                                                        </button>
                                                        <button onClick={(e) => handleShareFile(file.id, !!file.public, e)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary transition-colors font-medium flex items-center gap-2 cursor-pointer">
                                                            <Share2 className="w-4 h-4 text-primary" /> {file.public ? "Huỷ chia sẻ" : "Chia sẻ"}
                                                        </button>
                                                        <button onClick={(e) => handleDeleteFile(file.id, e)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-rose-500/10 text-rose-500 transition-colors font-medium flex items-center gap-2 cursor-pointer">
                                                            <Trash2 className="w-4 h-4" /> Xóa File
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
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
                                        <div className="relative">
                                            <button className="p-2 text-muted-foreground hover:text-primary bg-background rounded-lg border border-border shadow-sm transition-colors" onClick={(e) => toggleMenu(file.id, e)}>
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                            {/* Dropdown Menu for List view */}
                                        {activeMenuId === file.id && (
                                            <div className="absolute bottom-full right-0 mb-2 w-36 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-20 animate-in fade-in slide-in-from-bottom-2">
                                                {file.type === "Thư mục" ? (
                                                    <>
                                                        <button onClick={(e) => openEditModal(file.id, file.name, e)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary transition-colors font-medium flex items-center gap-2 cursor-pointer">
                                                            <Edit2 className="w-4 h-4 text-primary" /> Đổi tên
                                                        </button>
                                                        <button onClick={(e) => openDeleteModal(file.id, file.name, e)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-rose-500/10 text-rose-500 transition-colors font-medium flex items-center gap-2 cursor-pointer">
                                                            <Trash2 className="w-4 h-4" /> Xóa
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={(e) => handleDownloadFile(file.id, file.name, e)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary transition-colors font-medium flex items-center gap-2 cursor-pointer">
                                                            <Download className="w-4 h-4 text-emerald-500" /> Tải xuống
                                                        </button>
                                                        <button onClick={(e) => handleShareFile(file.id, !!file.public, e)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary transition-colors font-medium flex items-center gap-2 cursor-pointer">
                                                            <Share2 className="w-4 h-4 text-primary" /> {file.public ? "Huỷ chia sẻ" : "Chia sẻ"}
                                                        </button>
                                                        <button onClick={(e) => handleDeleteFile(file.id, e)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-rose-500/10 text-rose-500 transition-colors font-medium flex items-center gap-2 cursor-pointer">
                                                            <Trash2 className="w-4 h-4" /> Xóa File
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                        </div>
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
                {/* Modals */}
                <FolderModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSubmit={handleCreateFolder}
                    title="Tạo thư mục mới"
                    submitText="Tạo mới"
                />

                <FolderModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSubmit={handleEditFolder}
                    initialName={folderToEdit?.name}
                    title="Đổi tên thư mục"
                    submitText="Lưu thay đổi"
                />

                <DeleteConfirmModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDeleteFolder}
                    itemName={folderToDelete?.name || ""}
                />
        </div>
    );
}

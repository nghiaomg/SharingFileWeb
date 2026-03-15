"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Download, FileText, Image as ImageIcon, Video, Music, FileArchive, Loader2, Home, AlertCircle } from "lucide-react";
import { FileResponse } from "@/services/fileStoreService";

// Helper function
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

export default function SharedFilePage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [fileData, setFileData] = useState<FileResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        
        const fetchFileMetadata = async () => {
            try {
                // Chúng ta sẽ fetch public info thông qua endpoint backend
                const response = await fetch(`http://localhost:8080/api/files/public/${id}`);
                
                if (!response.ok) {
                    if (response.status === 404) throw new Error("File này có thể không tồn tại hoặc đã bị tắt chia sẻ công khai.");
                    throw new Error("Lỗi máy chủ khi lấy dữ liệu.");
                }

                const data: FileResponse = await response.json();
                setFileData(data);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Truy cập tệp thất bại.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchFileMetadata();
    }, [id]);

    const handleDownload = () => {
        if (!fileData) return;
        window.location.href = `http://localhost:8080/api/files/public/download/${fileData.id}`;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="mt-4 text-muted-foreground font-medium">Đang tìm kiếm tệp...</p>
            </div>
        );
    }

    if (error || !fileData) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
                <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="w-10 h-10 text-rose-500" />
                </div>
                <h1 className="text-2xl font-bold mb-2 text-foreground">Không tìm thấy tệp</h1>
                <p className="text-muted-foreground mb-8 max-w-md">{error}</p>
                
                <button 
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:shadow-primary/30 hover:-translate-y-1 transition-all cursor-pointer"
                >
                    <Home className="w-5 h-5" /> Về trang chủ
                </button>
            </div>
        );
    }

    const fileMeta = determineFileType(fileData.type);
    const formattedDate = new Date(fileData.createdAt).toLocaleDateString('vi-VN', { 
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
            
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>
            <div className="absolute top-[-10%] sm:top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] sm:bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/20 blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-md bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-500">
                <div className="p-8 text-center flex flex-col items-center">
                    <div className={`w-28 h-28 rounded-3xl ${fileMeta.bg} flex items-center justify-center mb-6 shadow-sm border border-border/50`}>
                        <fileMeta.icon className={`w-14 h-14 ${fileMeta.color}`} />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-foreground mb-2 break-all line-clamp-2" title={fileData.name}>
                        {fileData.name}
                    </h2>
                    
                    <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium mb-8">
                        <span className="bg-secondary px-3 py-1 rounded-lg">{fileMeta.type}</span>
                        <span>•</span>
                        <span>{getFormatSize(fileData.size)}</span>
                    </div>

                    <div className="w-full bg-secondary/50 rounded-2xl p-4 mb-8 text-left border border-border/50">
                        <p className="text-sm text-muted-foreground flex justify-between mb-2">
                            <span>Ngày đăng tải:</span>
                            <span className="font-semibold text-foreground">{formattedDate}</span>
                        </p>
                        <p className="text-sm text-muted-foreground flex justify-between">
                            <span>Bảo mật:</span>
                            <span className="font-semibold text-emerald-500 flex items-center gap-1">Công khai</span>
                        </p>
                    </div>

                    <button 
                        onClick={handleDownload}
                        className="w-full group flex items-center justify-center gap-3 px-6 py-4 bg-primary text-primary-foreground font-bold rounded-2xl shadow-lg hover:shadow-primary/30 transition-all cursor-pointer"
                    >
                        <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" /> 
                        Tải xuống an toàn
                    </button>
                </div>
                
                <div className="bg-muted border-t border-border/50 p-4 text-center">
                    <p className="text-xs text-muted-foreground">
                        Được chia sẻ thông qua <span className="font-bold text-foreground">SharingFileWeb</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Download, FileText, Image as ImageIcon, Video, Music, FileArchive, Loader2, Home, AlertCircle } from "lucide-react";
import apiClient from "@/lib/api-client";
import { isAxiosError } from "axios";

interface FileResponse {
    id: string;
    name: string;
    type: string;
    size: number;
    createdAt: string;
    isPublic: boolean;
}

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
                // Chúng ta sẽ fetch public info thông qua apiClient (sẽ kèm JWT nếu user đã đăng nhập)
                const response = await apiClient.get<FileResponse>(`/files/public/${id}`);
                setFileData(response.data);
            } catch (err: unknown) {
                if (isAxiosError(err)) {
                    if (err.response?.status === 404) {
                        setError("File này có thể không tồn tại hoặc đã bị tắt chia sẻ công khai.");
                    } else if (err.response?.status === 403 || err.response?.data?.message?.includes("Forbidden") || err.response?.data?.message?.includes("Unauthorized")) {
                        setError(err.response?.data?.message || "Bạn không có quyền hoặc chưa đăng nhập để xem file này.");
                    } else {
                        setError(err.response?.data?.message || "Truy cập tệp thất bại.");
                    }
                } else {
                    setError("Lỗi không xác định khi truy cập tệp.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchFileMetadata();
    }, [id]);

    const handleDownload = async () => {
        if (!fileData) return;
        try {
            const response = await apiClient.get(`/files/public/download/${fileData.id}`, {
                responseType: "blob",
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", fileData.name);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err: unknown) {
            if (isAxiosError(err)) {
                alert(err.response?.data?.message || "Tải xuống thất bại. Bạn có thể không có quyền truy cập.");
            } else {
                alert("Tải xuống thất bại do lỗi không xác định.");
            }
        }
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
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl border border-primary hover:bg-primary/90 transition-all cursor-pointer"
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
        <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-in fade-in zoom-in-95 duration-500">
                <div className="p-10 flex flex-col items-center text-center">
                    <div className={`w-24 h-24 rounded-2xl ${fileMeta.bg} flex items-center justify-center mb-6`}>
                        <fileMeta.icon className={`w-12 h-12 ${fileMeta.color}`} />
                    </div>
                    
                    <h2 className="text-xl font-semibold text-gray-900 mb-2 truncate w-full" title={fileData.name}>
                        {fileData.name}
                    </h2>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-8">
                        <span>{fileMeta.type}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span>{getFormatSize(fileData.size)}</span>
                    </div>

                    <div className="w-full bg-gray-50 rounded-2xl p-5 mb-8 text-left border border-gray-100 space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Ngày đăng tải</span>
                            <span className="font-medium text-gray-900">{formattedDate}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Người chia sẻ</span>
                            <span className="font-medium text-gray-900">Người dùng ẩn danh</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Quyền truy cập</span>
                            <span className="font-medium text-emerald-600 flex items-center gap-1">
                                {fileData.isPublic ? "Công khai" : "Được cấp quyền"}
                            </span>
                        </div>
                    </div>

                    <button 
                        onClick={handleDownload}
                        className="w-full group flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-all focus:ring-4 focus:ring-gray-200"
                    >
                        <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" /> 
                        Tải xuống tệp này
                    </button>
                </div>
                
                <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
                    <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">
                        Được cung cấp bởi SharingFileWeb
                    </p>
                </div>
            </div>
        </div>
    );
}

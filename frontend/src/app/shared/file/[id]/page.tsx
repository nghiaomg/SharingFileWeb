"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Download,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  FileArchive,
  Loader2,
  Home,
  AlertCircle,
  Eye,
} from "lucide-react";
import { isAxiosError } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

/** Uses new /api/public/share/{token} — StandardResponse unwrapped by fetch */
interface ShareMetadata {
  fileName: string;
  fileType: string;
  fileSize: number;
  permission: "VIEW" | "DOWNLOAD";
  expiresAt?: string;
  remainingViews?: number;
  hasPassword: boolean;
}

interface DownloadPayload {
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
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
  if (mimeType.startsWith("image/"))
    return {
      type: "Hình ảnh",
      icon: ImageIcon,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    };
  if (mimeType.startsWith("video/"))
    return {
      type: "Video",
      icon: Video,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    };
  if (mimeType.startsWith("audio/"))
    return {
      type: "Audio",
      icon: Music,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    };
  if (
    mimeType.includes("zip") ||
    mimeType.includes("tar") ||
    mimeType.includes("rar")
  )
    return {
      type: "Lưu trữ",
      icon: FileArchive,
      color: "text-gray-500",
      bg: "bg-gray-500/10",
    };
  return {
    type: "Tài liệu",
    icon: FileText,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  };
};

export default function SharedFilePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.id as string;

  const [fileData, setFileData] = useState<ShareMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [submittingPassword, setSubmittingPassword] = useState(false);

  const fetchFile = async (pwd?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const query = pwd ? `?password=${encodeURIComponent(pwd)}` : "";
      const res = await fetch(
        `${API_BASE_URL}/public/share/${token}${query}`,
      );
      const data = await res.json();

      if (!res.ok) {
        if (
          data.msg === "REQUIRES_PASSWORD" ||
          data.message === "REQUIRES_PASSWORD"
        ) {
          setNeedsPassword(true);
          setIsLoading(false);
          return;
        }
        setError(data.msg || data.message || "Không thể truy cập tệp");
        setIsLoading(false);
        return;
      }

      // fetch (no interceptor) → raw StandardResponse: { success, msg, data }
      const meta = data.data || data;
      setFileData(meta);
      setNeedsPassword(false);
    } catch {
      setError("Lỗi kết nối đến server");
    } finally {
      setIsLoading(false);
      setSubmittingPassword(false);
    }
  };

  useEffect(() => {
    if (token) fetchFile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handlePasswordSubmit = () => {
    if (!password.trim()) return;
    setSubmittingPassword(true);
    fetchFile(password);
  };

  const handleDownload = async () => {
    if (!fileData) return;
    try {
      const query = password
        ? `?password=${encodeURIComponent(password)}`
        : "";
      const res = await fetch(
        `${API_BASE_URL}/public/share/${token}/download${query}`,
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        alert(errData?.msg || errData?.message || "Tải xuống thất bại");
        return;
      }

      // Backend returns JSON: { success, msg, data: { url, fileName, ... } }
      const resJSON = await res.json();
      const payload: DownloadPayload | undefined = resJSON?.data;

      if (payload?.url) {
        const link = document.createElement("a");
        link.href = payload.url;
        link.target = "_blank";
        link.setAttribute("download", payload.fileName || "file");
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        alert("Không lấy được đường dẫn URL");
      }
    } catch {
      alert("Lỗi khi tải xuống");
    }
  };

  const handlePreview = async () => {
    if (!fileData) return;
    try {
      const query = password
        ? `?password=${encodeURIComponent(password)}`
        : "";
      const res = await fetch(
        `${API_BASE_URL}/public/share/${token}/preview${query}`,
      );
      if (res.ok) {
        const data = await res.json();
        const payload: DownloadPayload | undefined = data?.data;
        if (payload?.url) {
          window.open(payload.url, "_blank");
        }
      }
    } catch (err) {
      console.error("Lỗi tải file xem trước:", err);
    }
  };

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="mt-4 text-muted-foreground font-medium">
          Đang tìm kiếm tệp...
        </p>
      </div>
    );
  }

  // ─── Password Required ──────────────────────────────────────────────────────
  if (needsPassword) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl overflow-hidden shadow-sm p-10 text-center">
          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Tệp được bảo vệ
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Nhập mật khẩu để truy cập tệp này.
          </p>

          <input
            type="password"
            placeholder="Mật khẩu..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 mb-4 text-sm"
          />

          {error && <p className="text-rose-500 text-sm mb-4">{error}</p>}

          <button
            onClick={handlePasswordSubmit}
            disabled={submittingPassword || !password.trim()}
            className="w-full px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submittingPassword && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            Mở khóa
          </button>
        </div>
      </div>
    );
  }

  // ─── Error ──────────────────────────────────────────────────────────────────
  if (error || !fileData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-rose-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2 text-foreground">
          Không tìm thấy tệp
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md">{error}</p>

        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl border border-primary hover:bg-primary/90 transition-all cursor-pointer"
        >
          <Home className="w-5 h-5" /> Về trang chủ
        </button>
      </div>
    );
  }

  // ─── File View ──────────────────────────────────────────────────────────────
  const fileMeta = determineFileType(fileData.fileType);
  const canDownload = fileData.permission === "DOWNLOAD";
  const canPreview =
    fileData.fileType === "application/pdf" ||
    fileData.fileType?.includes("spreadsheetml") ||
    fileData.fileType.startsWith("image/");

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-in fade-in zoom-in-95 duration-500">
        <div className="p-10 flex flex-col items-center text-center">
          <div
            className={`w-24 h-24 rounded-2xl ${fileMeta.bg} flex items-center justify-center mb-6`}
          >
            <fileMeta.icon className={`w-12 h-12 ${fileMeta.color}`} />
          </div>

          <h2
            className="text-xl font-semibold text-gray-900 mb-2 truncate w-full"
            title={fileData.fileName}
          >
            {fileData.fileName}
          </h2>

          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-8">
            <span>{fileMeta.type}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>{getFormatSize(fileData.fileSize)}</span>
          </div>

          <div className="w-full bg-gray-50 rounded-2xl p-5 mb-8 text-left border border-gray-100 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Quyền truy cập</span>
              <span className="font-medium text-emerald-600 flex items-center gap-1">
                {canDownload ? (
                  <>
                    <Download className="w-3.5 h-3.5" /> Xem & Tải xuống
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" /> Chỉ xem
                  </>
                )}
              </span>
            </div>
            {fileData.hasPassword && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Mật khẩu</span>
                <span className="font-medium text-amber-600">Có</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 w-full">
            {canPreview && (
              <button
                onClick={handlePreview}
                className="w-full group flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-500/10 text-blue-600 font-bold rounded-xl hover:bg-blue-500/20 transition-all border border-blue-500/20"
              >
                <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Xem trước
              </button>
            )}
            {canDownload ? (
              <button
                onClick={handleDownload}
                className="w-full group flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-all focus:ring-4 focus:ring-gray-200"
              >
                <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                Tải xuống tệp này
              </button>
            ) : (
              !canPreview && (
                <div className="w-full text-center p-4 bg-gray-50 border border-gray-100 rounded-xl">
                  <p className="text-muted-foreground text-sm font-medium flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" /> Link này chỉ cho phép xem, không
                    cho tải xuống
                  </p>
                </div>
              )
            )}
          </div>
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

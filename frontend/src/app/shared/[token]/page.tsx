"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
  Lock,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { PreviewModal } from "@/features/dashboard/components/PreviewModal";
import type { FileItem } from "@/features/files/schemas";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

interface PublicFileResponse {
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
  permission: string; // permission: VIEW, DOWNLOAD
}

const getFormatSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const determineFileType = (mimeType: string) => {
  if (mimeType?.startsWith("image/"))
    return {
      type: "Hình ảnh",
      icon: ImageIcon,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    };
  if (mimeType?.startsWith("video/"))
    return {
      type: "Video",
      icon: Video,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    };
  if (mimeType?.startsWith("audio/"))
    return {
      type: "Audio",
      icon: Music,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    };
  if (
    mimeType?.includes("zip") ||
    mimeType?.includes("tar") ||
    mimeType?.includes("rar")
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

export default function SharedTokenPage() {
  const params = useParams();
  const token = params.token as string;

  const [fileData, setFileData] = useState<PublicFileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [submittingPassword, setSubmittingPassword] = useState(false);

  // Preview state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [folderChildren, setFolderChildren] = useState<FileItem[]>([]);
  // Dialog states
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [showRestrictedDialog, setShowRestrictedDialog] = useState(false);
  const [showFeatureDevDialog, setShowFeatureDevDialog] = useState(false);

  const closePreview = () => {
    if (previewUrl && fileData?.fileType !== "folder") {
      window.URL.revokeObjectURL(previewUrl);
    }
    setIsPreviewOpen(false);
    setPreviewUrl("");
  };

  const handlePreview = async () => {
    if (!fileData) return;
    setIsPreviewOpen(true);
    setIsPreviewLoading(true);

    const query = password ? `?password=${encodeURIComponent(password)}` : "";
    let type: "pdf" | "xlsx" | "folder" | "unknown" = "unknown";
    if (fileData.fileType === "folder") type = "folder";
    else if (fileData.fileType === "application/pdf") type = "pdf";
    else if (fileData.fileType?.includes("spreadsheetml")) type = "xlsx";

    try {
      if (type === "folder") {
        const res = await fetch(
          `${API_BASE_URL}/public/share/${token}/folder${query}`,
          { cache: "no-store" },
        );
        const data = await res.json();
        if (res.ok) {
          setFolderChildren(data.data || []);
        }
      } else if (type === "pdf" || type === "xlsx") {
        const urlParams = new URLSearchParams(query);
        urlParams.set("inline", "true");
        const downloadUrl = `${API_BASE_URL}/public/share/${token}/download?${urlParams.toString()}`;
        const res = await fetch(downloadUrl, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data?.data?.url) {
            setPreviewUrl(data.data.url);
          }
        }
      }
    } catch (err) {
      console.error("Lỗi tải file xem trước:", err);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const fetchFile = async (pwd?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const query = pwd ? `?password=${encodeURIComponent(pwd)}` : "";
      const res = await fetch(`${API_BASE_URL}/public/share/${token}${query}`, {
        cache: "no-store",
      });
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

      const fileResponse = data.data || data;
      setFileData(fileResponse);
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
      const query = password ? `?password=${encodeURIComponent(password)}` : "";
      const res = await fetch(
        `${API_BASE_URL}/public/share/${token}/download${query}`,
        { cache: "no-store" },
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        alert(errData?.msg || errData?.message || "Tải xuống thất bại");
        return;
      }

      const resJSON = await res.json();
      if (resJSON?.data?.url) {
        const link = document.createElement("a");
        link.href = resJSON.data.url;
        link.target = "_blank";
        link.download = fileData.fileName || "download";
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        alert("Không lấy được đường dẫn URL từ máy chủ.");
      }
    } catch {
      alert("Lỗi khi tải xuống");
    }
  };

  // ─── Loading ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="mt-4 text-muted-foreground font-medium">
          Đang tải tệp...
        </p>
      </div>
    );
  }

  // ─── Password Required ────────────────────────────────────
  if (needsPassword) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl overflow-hidden shadow-sm p-10 text-center">
          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-amber-500" />
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
            {submittingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
            Mở khóa
          </button>
        </div>
      </div>
    );
  }

  // ─── Error ────────────────────────────────────────────────
  if (error || !fileData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-rose-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Không tìm thấy tệp</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          {error || "Link này không hợp lệ hoặc đã bị thu hồi."}
        </p>
        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all"
        >
          <Home className="w-5 h-5" /> Về trang chủ
        </Link>
      </div>
    );
  }

  // ─── File View ────────────────────────────────────────────
  const fileMeta = determineFileType(fileData.fileType);
  const canDownload = fileData.permission === "DOWNLOAD";
  const formattedDate = new Date(fileData.createdAt).toLocaleDateString(
    "vi-VN",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  const canPreview =
    fileData.fileType === "folder" ||
    fileData.fileType === "application/pdf" ||
    fileData.fileType?.includes("spreadsheetml");

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-card border border-border rounded-2xl overflow-hidden shadow-sm animate-in fade-in zoom-in-95 duration-500">
        <div className="p-10 flex flex-col items-center text-center">
          <div
            className={`w-24 h-24 rounded-2xl ${fileMeta.bg} flex items-center justify-center mb-6`}
          >
            <fileMeta.icon className={`w-12 h-12 ${fileMeta.color}`} />
          </div>

          <h2
            className="text-xl font-bold text-foreground mb-2 truncate w-full"
            title={fileData.fileName}
          >
            {fileData.fileName}
          </h2>

          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-muted-foreground font-medium mb-8">
            <span>{fileMeta.type}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>{getFormatSize(fileData.fileSize)}</span>
          </div>

          <div className="w-full bg-muted/30 rounded-2xl p-5 mb-8 text-left border border-border/50 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Ngày đăng tải</span>
              <span className="font-medium text-foreground">
                {formattedDate}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-muted-foreground">
                Quyền truy cập
              </span>
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
          </div>

          <div className="flex flex-col gap-3 w-full">
            {canPreview && (
              <button
                onClick={handlePreview}
                className="w-full group flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-500/10 text-blue-600 font-bold rounded-xl hover:bg-blue-500/20 transition-all border border-blue-500/20"
              >
                <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Theo dõi Xem trước
              </button>
            )}
            {canDownload && fileData.fileType !== "folder" ? (
              <button
                onClick={handleDownload}
                className="w-full group flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all"
              >
                <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                Tải xuống tệp này
              </button>
            ) : (
              !canPreview && (
                <div className="w-full text-center p-4 bg-muted/50 border border-border/50 rounded-xl">
                  <p className="text-muted-foreground text-sm font-medium flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" /> Link này chỉ cho phép xem, không
                    cho tải xuống
                  </p>
                </div>
              )
            )}
          </div>
        </div>

        <div className="bg-muted/20 p-4 text-center border-t border-border/50">
          <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase">
            Được cung cấp bởi SharingFileWeb
          </p>
        </div>
      </div>

      {isPreviewOpen && (
        <PreviewModal
          isOpen={isPreviewOpen}
          onClose={closePreview}
          itemName={fileData.fileName}
          itemType={
            fileData.fileType === "folder"
              ? "folder"
              : fileData.fileType === "application/pdf"
                ? "pdf"
                : fileData.fileType?.includes("spreadsheetml")
                  ? "xlsx"
                  : "unknown"
          }
          fileUrl={previewUrl}
          folderChildren={folderChildren}
          isLoading={isPreviewLoading}
          onDownloadFile={async () => {
            if (canDownload) {
              try {
                setShowFeatureDevDialog(true);
              } catch (e) {
                console.error(e);
              }
            } else {
              setShowRestrictedDialog(true);
            }
          }}
        />
      )}

      {/* Restricted Download Dialog */}
      {showRestrictedDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowRestrictedDialog(false)}
          />
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Quyền truy cập hạn chế
              </h3>
              <p className="text-muted-foreground text-sm">
                Link này được thiết lập chỉ cho phép xem nội dung. Bạn không có
                quyền tải xuống tệp tin này.
              </p>
            </div>
            <div className="bg-muted/30 p-4 border-t border-border flex justify-center">
              <button
                onClick={() => setShowRestrictedDialog(false)}
                className="w-full max-w-[200px] py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feature in Dev Dialog */}
      {showFeatureDevDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowFeatureDevDialog(false)}
          />
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Tính năng đang phát triển
              </h3>
              <p className="text-muted-foreground text-sm">
                Tính năng tải từng tệp lẻ trong một thư mục chia sẻ theo Public
                Link hiện đang được chúng tôi phát triển. Vui lòng quay lại sau!
              </p>
            </div>
            <div className="bg-muted/30 p-4 border-t border-border flex justify-center">
              <button
                onClick={() => setShowFeatureDevDialog(false)}
                className="w-full max-w-[200px] py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

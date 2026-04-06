"use client";

import { useAdminFiles } from "../../hooks/useFilesQuery";
import { useDeleteAdminFile } from "../../hooks/useFilesMutation";
import {
  Loader2,
  Trash2,
  File,
  Archive,
  Image as ImageIcon,
  Video,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { formatBytes } from "@/lib/format";
import { format } from "date-fns";
import { useState } from "react";
import { Button } from "@radix-ui/themes";

export function FilesList() {
  const [page, setPage] = useState(0);
  const { data: pageData, isLoading, isError } = useAdminFiles(undefined, page, 15);
  const { mutate: deleteFile, isPending: isDeleting } = useDeleteAdminFile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 p-6 bg-red-500/10 rounded-xl">
        Đã xảy ra lỗi khi tải danh sách tệp. Có thể endpoint /api/files/all chưa
        sẵn sàng hoặc bạn chưa đủ quyền truy cập.
      </div>
    );
  }

  const getFileIcon = (mimeType: string | undefined) => {
    if (!mimeType) return <File className="w-5 h-5 text-gray-500" />;
    if (mimeType.startsWith("image/"))
      return <ImageIcon className="w-5 h-5 text-blue-500" />;
    if (mimeType.startsWith("video/"))
      return <Video className="w-5 h-5 text-purple-500" />;
    if (
      mimeType.includes("pdf") ||
      mimeType.includes("word") ||
      mimeType.includes("text")
    )
      return <FileText className="w-5 h-5 text-orange-500" />;
    if (
      mimeType.includes("zip") ||
      mimeType.includes("tar") ||
      mimeType.includes("rar")
    )
      return <Archive className="w-5 h-5 text-red-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const files = pageData?.content || [];

  return (
    <div className="flex flex-col gap-4">
      {/* Mobile Card View (hidden on Desktop) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {files.map((file) => (
          <div
            key={file.id}
            className="bg-card rounded-xl border border-border p-4 shadow-sm space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">{getFileIcon(file.type)}</div>
              <div className="flex-1 overflow-hidden">
                <p
                  className="font-bold text-foreground text-sm truncate"
                  title={file.name}
                >
                  {file.name}
                </p>
                <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                  <span>{formatBytes(file.size)}</span>
                  <span>•</span>
                  <span>
                    {file.createdAt
                      ? format(new Date(file.createdAt), "dd/MM")
                      : "N/A"}
                  </span>
                </div>
                {file.isDeleted && (
                  <span className="text-[10px] text-red-500 font-bold border border-red-500/20 bg-red-500/10 px-1 py-0.5 mt-1 rounded inline-block">
                    THÙNG RÁC
                  </span>
                )}
              </div>
            </div>
            <div className="text-xs text-muted-foreground bg-secondary/30 p-2 rounded-md">
              Chủ sở hữu:{" "}
              <span className="font-mono text-foreground">
                {file.ownerId.slice(0, 10)}...
              </span>
            </div>
            <div className="pt-2 border-t border-border mt-2">
              <button
                onClick={() => {
                  if (
                    confirm(
                      `Hành động NGUY HIỂM: Xóa cứng (Permanent Delete) tệp "${file.name}" khỏi hệ thống Cloud Backup B2? Tệp không thể khôi phục!`,
                    )
                  ) {
                    deleteFile(file.id, {
                      onSuccess: () =>
                        toast.success("Đã tiêu hủy tệp vĩnh viễn"),
                      onError: () => toast.error("Không thể tiêu hủy tệp"),
                    });
                  }
                }}
                disabled={isDeleting}
                className="w-full py-2 flex justify-center items-center gap-1.5 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors font-medium text-xs shadow-sm disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" /> Xóa tệp vĩnh viễn
              </button>
            </div>
          </div>
        ))}
        {files.length === 0 && (
          <div className="text-center p-8 text-muted-foreground text-sm border border-dashed rounded-xl border-border">
            Không có tệp tin nào trên hệ thống.
          </div>
        )}
      </div>

      {/* Desktop Table View (hidden on Mobile) */}
      <div className="hidden md:block bg-card rounded-xl border border-border shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
              <tr>
                <th className="px-6 py-4 font-medium">Định dạng & Tên</th>
                <th className="px-6 py-4 font-medium">Dung lượng</th>
                <th className="px-6 py-4 font-medium">Chủ sở hữu (ID)</th>
                <th className="px-6 py-4 font-medium">Ngày tải lên</th>
                <th className="px-6 py-4 font-medium text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {files.map((file) => (
                <tr
                  key={file.id}
                  className="hover:bg-secondary/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.type)}
                      <div>
                        <p
                          className="font-medium text-foreground max-w-[200px] md:max-w-[300px] truncate"
                          title={file.name}
                        >
                          {file.name}
                        </p>
                        {file.isDeleted && (
                          <span className="text-[10px] text-red-500 font-bold border border-red-500/20 bg-red-500/10 px-1 py-0.5 mt-1 rounded inline-block">
                            THÙNG RÁC
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-medium">
                    {formatBytes(file.size)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="text-[11px] font-mono font-bold text-muted-foreground bg-secondary px-2 py-1 rounded"
                      title={file.ownerId}
                    >
                      {file.ownerId.slice(0, 10)}...
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {file.createdAt
                      ? format(new Date(file.createdAt), "dd/MM/yyyy HH:mm")
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 flex justify-end">
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `Hành động NGUY HIỂM: Xóa cứng (Permanent Delete) tệp "${file.name}" khỏi hệ thống Cloud Backup B2? Tệp không thể khôi phục!`,
                          )
                        ) {
                          deleteFile(file.id, {
                            onSuccess: () =>
                              toast.success("Đã tiêu hủy tệp vĩnh viễn"),
                            onError: () => toast.error("Không thể tiêu hủy tệp"),
                          });
                        }
                      }}
                      disabled={isDeleting}
                      className="px-3 py-1.5 flex items-center gap-1.5 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors shadow-sm text-xs font-semibold disabled:opacity-50"
                      title="Xóa cứng (Tiêu hủy)"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> <span>Xóa tệp</span>
                    </button>
                  </td>
                </tr>
              ))}
              {files.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    Không có tệp tin nào trên hệ thống lưu trữ.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {pageData && pageData.totalPages > 0 && (
        <div className="p-4 border border-border rounded-xl flex items-center justify-between bg-card shadow-sm text-sm">
          <span className="text-muted-foreground font-medium flex gap-1">
            Trang <b>{pageData.currentPage + 1}</b> /{" "}
            <b>{pageData.totalPages}</b>
          </span>
          <div className="flex gap-2">
            <Button
              variant="soft"
              color="gray"
              size="2"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft className="w-4 h-4" /> Trước
            </Button>
            <Button
              variant="soft"
              color="gray"
              size="2"
              disabled={page >= pageData.totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Sau <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

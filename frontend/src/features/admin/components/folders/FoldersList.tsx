"use client";

import { useAdminFolders } from "../../hooks/useFoldersQuery";
import { useDeleteAdminFolder } from "../../hooks/useFoldersMutation";
import { Loader2, Trash2, Folder, FolderOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useState } from "react";
import { Button } from "@radix-ui/themes";

export function FoldersList() {
  const [page, setPage] = useState(0);
  const { data: pageData, isLoading, isError } = useAdminFolders(page, 15);
  const { mutate: deleteFolder, isPending: isDeleting } = useDeleteAdminFolder();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 p-6 bg-red-500/10 rounded-xl font-medium text-sm">
        Đã xảy ra lỗi khi tải danh sách Thư mục. Tham số hoặc quyền truy cập
        không đủ (Yêu cầu ROLE_ADMIN).
      </div>
    );
  }

  const folders = pageData?.content || [];

  return (
    <div className="flex flex-col gap-4">
      {/* Mobile Card View (hidden on Desktop) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className="bg-card rounded-xl border border-border p-4 shadow-sm space-y-3"
          >
            <div className="flex items-start gap-3">
              <Folder className="w-5 h-5 text-yellow-500 fill-yellow-500/20 mt-1" />
              <div className="flex-1 overflow-hidden">
                <p
                  className="font-bold text-foreground text-sm truncate"
                  title={folder.name}
                >
                  {folder.name}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {folder.parentId ? (
                    <span className="px-2 py-0.5 bg-secondary text-muted-foreground font-mono text-[10px] rounded font-bold">
                      Thư mục con
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 font-bold text-[10px] rounded inline-flex items-center gap-1 w-max">
                      <FolderOpen className="w-3 h-3" /> Root
                    </span>
                  )}
                  {folder.isDeleted && (
                    <span className="text-[10px] text-red-500 font-bold border border-red-500/20 bg-red-500/10 px-1 py-0.5 rounded inline-block">
                      THÙNG RÁC
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-secondary/30 p-2 rounded-md">
                <p className="text-muted-foreground">Chủ sở hữu:</p>
                <p className="font-mono text-foreground font-medium">
                  {folder.ownerId.slice(0, 10)}...
                </p>
              </div>
              <div className="bg-secondary/30 p-2 rounded-md">
                <p className="text-muted-foreground">Ngày tạo:</p>
                <p className="font-medium text-foreground">
                  {folder.createdAt
                    ? format(new Date(folder.createdAt), "dd/MM/yy")
                    : "N/A"}
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-border mt-2">
              <button
                onClick={() => {
                  if (
                    confirm(
                      `Hành động NGUY HIỂM TỘT ĐỘ: Xóa cứng (Permanent Delete) thư mục "${folder.name}" sẽ TIÊU HỦY TOÀN BỘ nhánh thư mục này (kể cả file nằm bên trong) khỏi lưu trữ đám mây. Bạn có chắc chắn?`,
                    )
                  ) {
                    deleteFolder(folder.id, {
                      onSuccess: () =>
                        toast.success(
                          "Đã tiêu hủy thư mục và toàn bộ cấu trúc nhánh con!",
                        ),
                      onError: () =>
                        toast.error(
                          "Không thể tiêu hủy thư mục. Kiểm tra quyền.",
                        ),
                    });
                  }
                }}
                disabled={isDeleting}
                className="w-full py-2 flex justify-center items-center gap-1.5 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors font-medium text-xs shadow-sm disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" /> Xóa nhánh vĩnh viễn
              </button>
            </div>
          </div>
        ))}
        {folders.length === 0 && (
          <div className="text-center p-8 text-muted-foreground text-sm border border-dashed rounded-xl border-border">
            Bảng trắng. Hệ thống không ghi nhận bất kỳ thư mục nào.
          </div>
        )}
      </div>

      {/* Desktop Table View (hidden on Mobile) */}
      <div className="hidden md:block bg-card rounded-xl border border-border shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
              <tr>
                <th className="px-6 py-4 font-medium">Tên Thư mục</th>
                <th className="px-6 py-4 font-medium">Cấp bậc</th>
                <th className="px-6 py-4 font-medium">Chủ sở hữu (ID)</th>
                <th className="px-6 py-4 font-medium">Ngày tạo</th>
                <th className="px-6 py-4 font-medium text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {folders.map((folder) => (
                <tr
                  key={folder.id}
                  className="hover:bg-secondary/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Folder className="w-5 h-5 text-yellow-500 fill-yellow-500/20" />
                      <div>
                        <p
                          className="font-medium text-foreground max-w-[200px] md:max-w-[300px] truncate"
                          title={folder.name}
                        >
                          {folder.name}
                        </p>
                        {folder.isDeleted && (
                          <span className="text-[10px] text-red-500 font-bold border border-red-500/20 bg-red-500/10 px-1 py-0.5 mt-1 rounded inline-block">
                            THÙNG RÁC
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {folder.parentId ? (
                      <span
                        className="px-2 py-1 bg-secondary text-muted-foreground font-mono text-[11px] rounded font-bold"
                        title={`Cha: ${folder.parentId}`}
                      >
                        Thư mục con
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-amber-500/10 text-amber-600 font-bold text-[11px] rounded inline-flex items-center gap-1 w-max">
                        <FolderOpen className="w-3 h-3" /> Root (Gốc)
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="text-[11px] font-mono font-bold text-muted-foreground bg-secondary px-2 py-1 rounded"
                      title={folder.ownerId}
                    >
                      {folder.ownerId.slice(0, 10)}...
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {folder.createdAt
                      ? format(new Date(folder.createdAt), "dd/MM/yyyy HH:mm")
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 flex justify-end">
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `Hành động NGUY HIỂM TỘT ĐỘ: Xóa cứng (Permanent Delete) thư mục "${folder.name}" sẽ TIÊU HỦY TOÀN BỘ nhánh thư mục này (kể cả file nằm bên trong) khỏi lưu trữ đám mây. Bạn có chắc chắn?`,
                          )
                        ) {
                          deleteFolder(folder.id, {
                            onSuccess: () =>
                              toast.success(
                                "Đã tiêu hủy thư mục và toàn bộ cấu trúc nhánh con!",
                              ),
                            onError: () =>
                              toast.error(
                                "Không thể tiêu hủy thư mục. Kiểm tra quyền.",
                              ),
                          });
                        }
                      }}
                      disabled={isDeleting}
                      className="px-3 py-1.5 flex items-center gap-1.5 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors shadow-sm text-xs font-semibold disabled:opacity-50"
                      title="Xóa nhánh (Tiêu hủy Tụt Độ)"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> <span>Xóa nhánh</span>
                    </button>
                  </td>
                </tr>
              ))}
              {folders.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    Bảng trắng. Hệ thống không ghi nhận bất kỳ thư mục nào.
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

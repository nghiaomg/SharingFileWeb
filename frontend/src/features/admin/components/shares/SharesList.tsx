"use client";

import { useAdminShares } from "../../hooks/useSharesQuery";
import { useDeleteShareLink } from "../../hooks/useSharesMutation";
import { Loader2, Link as LinkIcon, Eye, Ban, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useState } from "react";
import { Button } from "@radix-ui/themes";

export function SharesList() {
  const [page, setPage] = useState(0);
  const { data: pageData, isLoading, isError } = useAdminShares(page, 15);
  const { mutate: deleteShare, isPending: isDeleting } = useDeleteShareLink();

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
        Đã xảy ra lỗi khi tải danh sách Shared Links. (Yêu cầu ROLE_ADMIN)
      </div>
    );
  }

  // Define some helper functions
  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt).getTime() < new Date().getTime();
  };

  const isLimitReached = (maxViews: number | null, viewCount: number) => {
    if (!maxViews) return false;
    return viewCount >= maxViews;
  };

  const shares = pageData?.content || [];

  return (
    <div className="flex flex-col gap-4">
      {/* Mobile Card View (hidden on Desktop) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {shares.map((share) => (
          <div
            key={share.id}
            className="bg-transparent border-b border-border/50 py-4 space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg shrink-0 mt-1">
                <LinkIcon className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p
                  className="font-mono font-bold text-foreground text-sm truncate"
                  title={`Token: ${share.token}`}
                >
                  {share.token.slice(0, 15)}...
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <p className="text-[10px] text-muted-foreground" title="File ID">
                    FID: {share.fileId.slice(0, 10)}...
                  </p>
                  <span
                    className={`px-1.5 py-0.5 font-bold text-[9px] rounded uppercase ${share.permission === "DOWNLOAD" ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"}`}
                  >
                    {share.permission}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-secondary/30 p-2 rounded-md">
                <p className="text-muted-foreground mb-1">Chủ sở hữu:</p>
                <p className="font-mono font-bold text-foreground truncate" title={share.ownerId}>
                  UID: {share.ownerId.slice(0, 8)}...
                </p>
              </div>
              <div className="bg-secondary/30 p-2 rounded-md">
                <p className="text-muted-foreground mb-1">Truy cập:</p>
                <p className="font-bold text-foreground flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-muted-foreground" />{" "}
                  {share.viewCount} / {share.maxViews ? share.maxViews : "∞"}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <div>
                {isExpired(share.expiresAt) ? (
                  <span className="text-[10px] text-red-500 font-bold uppercase bg-red-500/10 px-2 py-1 rounded">
                    Đã hết hạn
                  </span>
                ) : isLimitReached(share.maxViews, share.viewCount) ? (
                  <span className="text-[10px] text-orange-500 font-bold uppercase bg-orange-500/10 px-2 py-1 rounded">
                    Quá giới hạn (Bị khóa)
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-500 font-bold uppercase bg-emerald-500/10 px-2 py-1 rounded">
                    Link Đang Sống
                  </span>
                )}
                {share.expiresAt && !isExpired(share.expiresAt) && (
                  <p className="text-[9px] text-muted-foreground mt-1.5">
                    Hết hạn: {format(new Date(share.expiresAt), "dd/MM HH:mm")}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-border mt-2">
              <button
                onClick={() => {
                  if (
                    confirm(
                      `Hành động này sẽ Cấm (Revoke) và Tiêu Hủy vĩnh viễn Link chia sẻ này khỏi hệ thống. Những người dùng đang nhấp vào Link sẽ bị thông báo Lỗi 404. Tiếp tục?`,
                    )
                  ) {
                    deleteShare(share.id, {
                      onSuccess: () =>
                        toast.success("Đã cấm công khai và xóa link chia sẻ"),
                      onError: () => toast.error("Không thể xóa link"),
                    });
                  }
                }}
                disabled={isDeleting}
                className="w-full py-2 flex justify-center items-center gap-1.5 bg-orange-500 text-white hover:bg-orange-600 rounded-lg transition-colors font-medium text-xs shadow-sm disabled:opacity-50"
              >
                <Ban className="w-3.5 h-3.5" /> Chặn/Xóa Link
              </button>
            </div>
          </div>
        ))}
        {shares.length === 0 && (
          <div className="text-center p-8 text-muted-foreground text-sm border border-dashed rounded-xl border-border">
            Hiện không có bất kỳ Share Link nào đang tồn tại trên hệ thống.
          </div>
        )}
      </div>

      {/* Desktop Table View (hidden on Mobile) */}
      <div className="hidden md:block bg-transparent overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
              <tr>
                <th className="px-6 py-4 font-medium">Mã Token Link</th>
                <th className="px-6 py-4 font-medium">Chủ sở hữu</th>
                <th className="px-6 py-4 font-medium">Lượt truy cập</th>
                <th className="px-6 py-4 font-medium">Trạng thái (Hạn/Sống)</th>
                <th className="px-6 py-4 font-medium text-right">
                  Lệnh Cấm (Ban)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {shares.map((share) => (
                <tr
                  key={share.id}
                  className="hover:bg-secondary/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <LinkIcon className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <p
                          className="font-mono font-bold text-foreground text-xs"
                          title={`Token: ${share.token}`}
                        >
                          {share.token.slice(0, 15)}...
                        </p>
                        <p
                          className="text-[10px] text-muted-foreground mt-1"
                          title="File ID"
                        >
                          FID: {share.fileId.slice(0, 10)}...
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p
                      className="text-xs font-mono text-muted-foreground font-bold mb-1"
                      title="User ID"
                    >
                      UID: {share.ownerId.slice(0, 8)}...
                    </p>
                    <span
                      className={`px-2 py-0.5 font-bold text-[10px] rounded uppercase ${share.permission === "DOWNLOAD" ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"}`}
                    >
                      {share.permission}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-foreground flex items-center gap-1">
                      <Eye className="w-4 h-4 text-muted-foreground" />{" "}
                      {share.viewCount} / {share.maxViews ? share.maxViews : "∞"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    {isExpired(share.expiresAt) ? (
                      <span className="text-[11px] text-red-500 font-bold uppercase bg-red-500/10 px-2 py-1 rounded">
                        Đã hết hạn
                      </span>
                    ) : isLimitReached(share.maxViews, share.viewCount) ? (
                      <span className="text-[11px] text-orange-500 font-bold uppercase bg-orange-500/10 px-2 py-1 rounded">
                        Quá giới hạn (Bị khóa)
                      </span>
                    ) : (
                      <span className="text-[11px] text-emerald-500 font-bold uppercase bg-emerald-500/10 px-2 py-1 rounded">
                        Link Đang Sống
                      </span>
                    )}
                    {share.expiresAt && !isExpired(share.expiresAt) && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Hết hạn:{" "}
                        {format(new Date(share.expiresAt), "dd/MM HH:mm")}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-2">
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `Hành động này sẽ Cấm (Revoke) và Tiêu Hủy vĩnh viễn Link chia sẻ này khỏi hệ thống. Những người dùng đang nhấp vào Link sẽ bị thông báo Lỗi 404. Tiếp tục?`,
                          )
                        ) {
                          deleteShare(share.id, {
                            onSuccess: () =>
                              toast.success(
                                "Đã cấm công khai và xóa link chia sẻ",
                              ),
                            onError: () => toast.error("Không thể xóa link"),
                          });
                        }
                      }}
                      disabled={isDeleting}
                      className="px-3 py-1.5 flex items-center gap-1.5 bg-orange-500 text-white hover:bg-orange-600 rounded-lg transition-colors shadow-sm text-xs font-semibold disabled:opacity-50"
                      title="Cấm truy cập / Xóa Link Vĩnh Viễn"
                    >
                      <Ban className="w-3.5 h-3.5" /> <span>Cấm Link</span>
                    </button>
                  </td>
                </tr>
              ))}
              {shares.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    Hiện không có bất kỳ Share Link nào đang tồn tại trên hệ
                    thống.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {pageData && pageData.totalPages > 0 && (
        <div className="py-4 flex items-center justify-between bg-transparent text-sm">
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

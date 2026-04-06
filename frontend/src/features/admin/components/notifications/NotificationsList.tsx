"use client";

import { useState } from "react";
import { useAdminNotifications } from "../../hooks/useNotificationsQuery";
import { useDeleteNotification } from "../../hooks/useNotificationsMutation";
import {
  Loader2,
  Trash2,
  Mail,
  RadioReceiver,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@radix-ui/themes";
import { BroadcastModal } from "./BroadcastModal";

export function NotificationsList() {
  const [page, setPage] = useState(0);
  const {
    data: pageData,
    isLoading,
    isError,
  } = useAdminNotifications(page, 50);
  const { mutate: deleteData, isPending: isDeleting } = useDeleteNotification();

  const [modalOpen, setModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 p-6 bg-red-500/10 rounded-xl text-sm font-medium">
        Đã xảy ra lỗi khi kết nối với Hệ thống thông báo. Yêu cầu quyền
        ROLE_ADMIN.
      </div>
    );
  }

  const notifications = pageData?.content || [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end gap-3">
        <Button size="3" onClick={() => setModalOpen(true)}>
          <RadioReceiver className="w-4 h-4 mr-2" /> Giao thức Broadcast
        </Button>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className="bg-card rounded-xl border border-border p-4 space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg shrink-0 mt-1">
                <Mail className="w-4 h-4 text-purple-500" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="font-bold text-foreground text-sm truncate">
                  {notif.recipientEmail}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-1.5 py-0.5 bg-secondary text-muted-foreground font-bold text-[9px] rounded uppercase">
                    {notif.type}
                  </span>
                  {notif.isRead ? (
                    <span className="text-[9px] text-emerald-500 font-bold uppercase">
                      Đã xem
                    </span>
                  ) : (
                    <span className="text-[9px] text-orange-500 font-bold uppercase">
                      Chưa đọc
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-secondary/30 p-2 rounded-md">
              <p
                className="font-bold text-foreground text-[13px] truncate"
                title={notif.title}
              >
                {notif.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1 break-words">
                {notif.message}
              </p>
            </div>

            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>
                {notif.createdAt
                  ? format(new Date(notif.createdAt), "dd/MM/yyyy HH:mm")
                  : "N/A"}
              </span>
            </div>

            <div className="pt-2 border-t border-border mt-2">
              <button
                onClick={() => {
                  if (confirm(`Bạn có muốn xóa log thông báo này khỏi CSDL?`)) {
                    deleteData(notif.id, {
                      onSuccess: () => toast.success("Đã xóa log thông báo"),
                      onError: () => toast.error("Không thể xóa log"),
                    });
                  }
                }}
                disabled={isDeleting}
                className="w-full py-2 flex justify-center items-center gap-1.5 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors font-medium text-xs disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" /> Xóa Log DB
              </button>
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="text-center p-8 text-muted-foreground text-sm border border-dashed rounded-xl border-border">
            Chưa có bất kỳ tin nhắn máy chủ nào được đẩy đi.
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-card rounded-xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
              <tr>
                <th className="px-6 py-4 font-medium">Người nhận</th>
                <th className="px-6 py-4 font-medium">Thông điệp</th>
                <th className="px-6 py-4 font-medium">System Type</th>
                <th className="px-6 py-4 font-medium">Trạng thái đọc</th>
                <th className="px-6 py-4 font-medium text-right">Xóa Log</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {notifications.map((notif) => (
                <tr
                  key={notif.id}
                  className="hover:bg-secondary/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/10 rounded-lg">
                        <Mail className="w-4 h-4 text-purple-500" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-xs">
                          {notif.recipientEmail}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {notif.createdAt
                            ? format(
                                new Date(notif.createdAt),
                                "dd/MM/yyyy HH:mm",
                              )
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p
                      className="font-bold text-foreground text-sm max-w-[250px] truncate"
                      title={notif.title}
                    >
                      {notif.title}
                    </p>
                    <p
                      className="text-xs text-muted-foreground max-w-[250px] truncate mt-1"
                      title={notif.message}
                    >
                      {notif.message}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-secondary text-muted-foreground font-bold text-[10px] rounded uppercase">
                      {notif.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {notif.isRead ? (
                      <span className="text-[11px] text-emerald-500 font-bold uppercase">
                        Đã xem
                      </span>
                    ) : (
                      <span className="text-[11px] text-orange-500 font-bold uppercase">
                        Chưa đọc
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-2">
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `Bạn có muốn xóa log thông báo này khỏi CSDL?`,
                          )
                        ) {
                          deleteData(notif.id, {
                            onSuccess: () =>
                              toast.success("Đã xóa log thông báo"),
                            onError: () => toast.error("Không thể xóa log"),
                          });
                        }
                      }}
                      disabled={isDeleting}
                      className="px-3 py-1.5 flex items-center gap-1.5 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors text-xs font-semibold disabled:opacity-50"
                      title="Xóa Log DB"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> <span>Xóa Log</span>
                    </button>
                  </td>
                </tr>
              ))}
              {notifications.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    Chưa có bất kỳ tin nhắn máy chủ nào được đẩy đi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {pageData && pageData.totalPages > 0 && (
        <div className="p-4 border border-border rounded-xl flex items-center justify-between bg-card text-sm">
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

      <BroadcastModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

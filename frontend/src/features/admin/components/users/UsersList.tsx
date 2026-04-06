"use client";

import { useAdminUsers } from "../../hooks/useUsersQuery";
import { useDeleteUser } from "../../hooks/useUsersMutation";
import { Loader2, Trash2, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { AdminUser } from "../../types/users.types";
import { UserEditModal } from "./UserEditModal";
import { Button } from "@radix-ui/themes";

export function UsersList() {
  const [page, setPage] = useState(0);
  const { data: pageData, isLoading, isError } = useAdminUsers(page, 15);
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

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
        Đã xảy ra lỗi khi tải danh sách người dùng.
      </div>
    );
  }

  const users = pageData?.content || [];

  return (
    <div className="flex flex-col gap-4">
      {/* Mobile Card View (hidden on Desktop) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-card rounded-xl border border-border p-4 shadow-sm space-y-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-foreground text-sm">
                  {user.username}
                </p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {user.roles?.map((r) => (
                <span
                  key={r.id}
                  className="px-2 py-0.5 text-[10px] font-bold bg-primary/10 text-primary rounded-md"
                >
                  {r.name.replace("ROLE_", "")}
                </span>
              ))}
              {user.subscriptionPlan && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-600 rounded-md">
                  {user.subscriptionPlan}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 pt-3 border-t border-border mt-2">
              <button
                onClick={() => setEditingUser(user)}
                className="flex-1 py-2 flex justify-center items-center gap-1.5 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors font-medium text-xs shadow-sm"
              >
                <Edit className="w-3.5 h-3.5" /> Sửa
              </button>
              <button
                onClick={() => {
                  if (
                    confirm(
                      `Bạn có chắc chắn muốn xóa tài khoản ${user.username}? Dữ liệu không thể khôi phục!`,
                    )
                  ) {
                    deleteUser(user.id, {
                      onSuccess: () =>
                        toast.success("Xóa người dùng thành công"),
                      onError: () =>
                        toast.error("Có lỗi xảy ra hoặc bạn không đủ quyền"),
                    });
                  }
                }}
                disabled={isDeleting}
                className="flex-1 py-2 flex justify-center items-center gap-1.5 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors font-medium text-xs shadow-sm disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" /> Xóa
              </button>
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <div className="text-center p-8 text-muted-foreground text-sm border border-dashed rounded-xl border-border">
            Chưa có dữ liệu người dùng.
          </div>
        )}
      </div>

      {/* Desktop Table View (hidden on Mobile) */}
      <div className="hidden md:block bg-card rounded-xl border border-border shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
              <tr>
                <th className="px-6 py-4 font-medium">Username</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Quyền / Gói</th>
                <th className="px-6 py-4 font-medium text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-secondary/30 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-foreground">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 flex-wrap items-center">
                      {user.roles?.map((r) => (
                        <span
                          key={r.id}
                          className="px-2 py-1 text-[10px] font-bold bg-primary/10 text-primary rounded-md"
                        >
                          {r.name.replace("ROLE_", "")}
                        </span>
                      ))}
                      {user.subscriptionPlan && (
                        <span className="px-2 py-1 text-[10px] font-bold bg-amber-500/10 text-amber-600 rounded-md">
                          {user.subscriptionPlan}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 flex items-center justify-end gap-3">
                    <button
                      onClick={() => setEditingUser(user)}
                      className="px-3 py-1.5 flex items-center gap-1.5 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors shadow-sm text-xs font-semibold"
                      title="Chỉnh sửa User"
                    >
                      <Edit className="w-3.5 h-3.5" /> <span>Sửa</span>
                    </button>
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `Bạn có chắc chắn muốn xóa tài khoản ${user.username}? Dữ liệu không thể khôi phục!`,
                          )
                        ) {
                          deleteUser(user.id, {
                            onSuccess: () =>
                              toast.success("Xóa người dùng thành công"),
                            onError: () =>
                              toast.error(
                                "Có lỗi xảy ra hoặc bạn không đủ quyền",
                              ),
                          });
                        }
                      }}
                      disabled={isDeleting}
                      title="Xóa người dùng"
                      className="px-3 py-1.5 flex items-center gap-1.5 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors shadow-sm text-xs font-semibold disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> <span>Xóa</span>
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    Chưa có dữ liệu người dùng.
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

      {editingUser && (
        <UserEditModal
          user={editingUser}
          isOpen={true}
          onClose={() => setEditingUser(null)}
        />
      )}
    </div>
  );
}

"use client";

import { useAdminUsers } from "../../hooks/useUsersQuery";
import { useDeleteUser } from "../../hooks/useUsersMutation";
import { Loader2, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

export function UsersList() {
    const { data: users, isLoading, isError } = useAdminUsers();
    const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isError) {
        return <div className="text-red-500 p-6 bg-red-500/10 rounded-xl">Đã xảy ra lỗi khi tải danh sách người dùng.</div>;
    }

    return (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
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
                        {users?.map((user) => (
                            <tr key={user.id} className="hover:bg-secondary/30 transition-colors">
                                <td className="px-6 py-4 font-medium text-foreground">{user.username}</td>
                                <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2 flex-wrap items-center">
                                        {user.roles?.map((r) => (
                                            <span key={r.id} className="px-2 py-1 text-[10px] font-bold bg-primary/10 text-primary rounded-md">
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
                                        className="p-2 text-muted-foreground hover:bg-secondary hover:text-foreground rounded-lg transition-colors"
                                        title="Chỉnh sửa (Bảo trì)"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm(`Bạn có chắc chắn muốn xóa tài khoản ${user.username}? Dữ liệu không thể khôi phục!`)) {
                                                deleteUser(user.id, {
                                                    onSuccess: () => toast.success("Xóa người dùng thành công"),
                                                    onError: () => toast.error("Có lỗi xảy ra hoặc bạn không đủ quyền"),
                                                });
                                            }
                                        }}
                                        disabled={isDeleting}
                                        title="Xóa người dùng"
                                        className="p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {(!users || users.length === 0) && (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                    Chưa có dữ liệu người dùng.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

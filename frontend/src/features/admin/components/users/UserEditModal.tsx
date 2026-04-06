"use client";

import { useState } from "react";
import { AdminUser, UpdateAdminUser } from "../../types/users.types";
import { useUpdateUser } from "../../hooks/useUsersMutation";
import { X, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";

interface UserEditModalProps {
  user: AdminUser;
  isOpen: boolean;
  onClose: () => void;
}

export function UserEditModal({ user, isOpen, onClose }: UserEditModalProps) {
  const { mutate: updateUser, isPending } = useUpdateUser();
  const [roles, setRoles] = useState(user.roles?.map((r) => r.name) || []);
  const [plan, setPlan] = useState(user.subscriptionPlan || "");
  const [maxStorage, setMaxStorage] = useState(user.maxStorage || 0);

  const isAdmin = roles.includes("ROLE_ADMIN");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: UpdateAdminUser = {
      roles: roles.length > 0 ? roles : ["ROLE_USER"],
      subscriptionPlan: plan || undefined,
      maxStorage: Number(maxStorage) > 0 ? Number(maxStorage) : undefined,
    };

    updateUser(
      { id: user.id, data },
      {
        onSuccess: () => {
          toast.success(`Cập nhật tài khoản ${user.username} thành công!`);
          onClose();
        },
        onError: () =>
          toast.error("Cập nhật thất bại. Thiếu quyền hoặc lỗi mạng."),
      },
    );
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card p-6 rounded-2xl shadow-xl z-50 outline-none border border-border data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-bold text-foreground">
              Sửa thông tin
            </Dialog.Title>
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:bg-secondary hover:text-foreground rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">
                Tài khoản (Username)
              </label>
              <input
                type="text"
                value={user.username}
                disabled
                className="w-full px-4 py-2 border border-border rounded-xl bg-secondary text-foreground cursor-not-allowed opacity-70"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-3 p-4 border border-border rounded-xl cursor-pointer hover:bg-secondary/30 transition-colors">
                <div className="flex items-center h-5 mt-0.5">
                  <input
                    type="checkbox"
                    checked={isAdmin}
                    onChange={(e) => {
                      if (e.target.checked)
                        setRoles(Array.from(new Set([...roles, "ROLE_ADMIN"])));
                      else setRoles(roles.filter((r) => r !== "ROLE_ADMIN"));
                    }}
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-border"
                  />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Shield className="w-4 h-4 text-red-500" />
                    Đặc quyền Quản trị (Admin)
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Cấp toàn quyền sinh sát trên hệ thống FileFlow cho người
                    dùng này.
                  </p>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">
                Gói cước (Vượt rào)
              </label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-xl bg-background text-foreground focus:ring-2 focus:ring-primary/50 outline-none"
              >
                <option value="">(Không gán cứng)</option>
                <option value="PRO">PRO</option>
                <option value="PREMIUM">PREMIUM</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">
                Dung lượng cứng (Bytes)
              </label>
              <input
                type="number"
                value={maxStorage}
                onChange={(e) => setMaxStorage(Number(e.target.value))}
                className="w-full px-4 py-2 border border-border rounded-xl bg-background text-foreground focus:ring-2 focus:ring-primary/50 outline-none"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Sét giới hạn dung lượng lưu trữ cứng cho User. Nhập 0 để dùng
                mặc định.
              </p>
            </div>

            <div className="pt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-bold bg-secondary text-foreground hover:bg-secondary/80 rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center justify-center min-w-28 px-5 py-2.5 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl disabled:opacity-70 transition-colors"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Lưu thay đổi"
                )}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

"use client";

import { useState } from "react";
import { Lock, X, Loader2 } from "lucide-react";
import { useChangePassword } from "@/features/auth/mutations";
import { getApiErrorMessage } from "@/types/api";
import { ChangePasswordSchema } from "@/features/auth/schemas";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ isOpen, onClose }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const [successMsg, setSuccessMsg] = useState("");
  const mutation = useChangePassword();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const result = ChangePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });
    if (!result.success) {
      setValidationError(result.error.issues[0].message);
      return;
    }

    mutation.mutate(result.data, {
      onSuccess: () => {
        setSuccessMsg("Đổi mật khẩu thành công!");
        setTimeout(() => {
          handleClose();
        }, 2000);
      },
    });
  };

  const handleClose = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setValidationError(null);
    setSuccessMsg("");
    mutation.reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-md rounded-3xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-border/50 bg-muted/30">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" /> Đổi mật khẩu
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 hover:bg-secondary/80 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {successMsg ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8" />
              </div>
              <p className="text-lg font-bold text-emerald-500">{successMsg}</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              {validationError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm rounded-xl mb-4">
                  {validationError}
                </div>
              )}
              {mutation.isError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm rounded-xl mb-4">
                  {getApiErrorMessage(
                    mutation.error,
                    "Đã xảy ra lỗi khi đổi mật khẩu.",
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                  placeholder="Nhập mật khẩu hiện tại"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                  placeholder="Nhập mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 text-sm font-bold bg-secondary hover:bg-secondary/80 rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="px-5 py-2.5 text-sm font-bold bg-primary hover:bg-primary/90 text-white rounded-xl transition-colors flex items-center gap-2"
                >
                  {mutation.isPending && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  Cập nhật
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

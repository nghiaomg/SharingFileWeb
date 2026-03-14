"use client";

import { useState } from "react";
import { X, Loader2, AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    itemName: string;
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, itemName }: DeleteConfirmModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleConfirm = async () => {
        try {
            setError("");
            setIsLoading(true);
            await onConfirm();
            onClose();
        } catch (err: unknown) {
            setError((err as any).response?.data?.message || "Lỗi khi xóa. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-5 border-b border-border/50">
                    <h3 className="text-xl font-bold text-rose-500 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" /> Xác nhận xóa
                    </h3>
                    <button onClick={onClose} disabled={isLoading} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5">
                    <p className="mb-2 text-foreground">Bạn có chắc chắn muốn xóa <strong>{itemName}</strong> không?</p>
                    <p className="text-sm text-muted-foreground mb-5">Hành động này không thể hoàn tác. Mọi dữ liệu bên trong thư mục này sẽ bị xóa vĩnh viễn.</p>
                    
                    {error && <p className="text-rose-500 text-sm mb-4 p-3 bg-rose-500/10 rounded-lg">{error}</p>}

                    <div className="flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-5 py-2.5 rounded-xl font-medium text-muted-foreground hover:bg-muted transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className="px-5 py-2.5 rounded-xl font-bold bg-rose-500 text-white hover:bg-rose-600 transition-colors flex items-center gap-2 shadow-md shadow-rose-500/20"
                        >
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Xóa vĩnh viễn
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

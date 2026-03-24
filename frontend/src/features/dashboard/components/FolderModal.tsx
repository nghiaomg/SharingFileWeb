"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";

interface FolderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (name: string) => void;
    folder?: { id: string; name: string } | null;
    isLoading?: boolean;
}

export function FolderModal({ isOpen, onClose, onSubmit, folder, isLoading = false }: FolderModalProps) {
    const [name, setName] = useState(folder?.name || "");
    const [error, setError] = useState("");

    const isEdit = !!folder;
    const title = isEdit ? "Đổi tên thư mục" : "Tạo thư mục mới";
    const submitText = isEdit ? "Lưu" : "Tạo";

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!name.trim()) {
            setError("Tên thư mục không được để trống.");
            return;
        }

        onSubmit(name.trim());
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="bg-card w-full max-w-md rounded-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-5 border-b border-border/50">
                    <h3 className="text-xl font-bold">{title}</h3>
                    <button onClick={onClose} disabled={isLoading} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="text-sm font-bold text-muted-foreground mb-2 block">Tên thư mục</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                            placeholder="Nhập tên thư mục..."
                            className="w-full px-4 py-3 bg-secondary/60 border border-border rounded-xl text-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                        />
                    </div>

                    {error && <p className="text-rose-500 text-sm p-3 bg-rose-500/10 rounded-lg">{error}</p>}

                    <div className="flex gap-3 justify-end pt-2">
                        <button type="button" onClick={onClose} disabled={isLoading} className="px-5 py-2.5 rounded-xl font-medium text-muted-foreground hover:bg-muted transition-colors">
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-5 py-2.5 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-2"
                        >
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {submitText}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

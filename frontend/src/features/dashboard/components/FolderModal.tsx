"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

interface FolderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (name: string) => Promise<void>;
    initialName?: string;
    title: string;
    submitText: string;
}

export function FolderModal({ isOpen, onClose, onSubmit, initialName = "", title, submitText }: FolderModalProps) {
    const [name, setName] = useState(initialName);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setName(initialName);
            setError("");
        }
    }, [isOpen, initialName]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!name.trim()) {
            setError("Tên thư mục không được để trống");
            return;
        }

        try {
            setIsLoading(true);
            await onSubmit(name.trim());
            onClose();
        } catch (err: unknown) {
            if (err instanceof Error) {
                const e = err as Error & { response?: { data?: { message?: string } } };
                setError(e.response?.data?.message || e.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
            } else {
                setError("Đã xảy ra lỗi. Vui lòng thử lại.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-5 border-b border-border/50">
                    <h3 className="text-xl font-bold">{title}</h3>
                    <button onClick={onClose} disabled={isLoading} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5">
                    <div className="mb-5">
                        <label htmlFor="folderName" className="block text-sm font-medium mb-2 text-muted-foreground">Tên thư mục</label>
                        <input
                            id="folderName"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isLoading}
                            placeholder="Nhập tên thư mục..."
                            className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            autoFocus
                        />
                        {error && <p className="text-rose-500 text-sm mt-2">{error}</p>}
                    </div>

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
                            type="submit"
                            disabled={isLoading}
                            className="px-5 py-2.5 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-md shadow-primary/20"
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

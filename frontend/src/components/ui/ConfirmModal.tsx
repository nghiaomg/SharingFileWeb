"use client";

import { useState } from "react";
import { X, Loader2, AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title: string;
    description: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: string; // e.g. "bg-rose-500 hover:bg-rose-600"
    icon?: React.ReactNode;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    confirmColor = "bg-primary hover:bg-primary/90 text-white",
    icon = <AlertTriangle className="w-5 h-5" />
}: ConfirmModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        try {
            setIsLoading(true);
            await onConfirm();
            onClose();
        } catch (err) {
            // Error handling should be done in parent component via toast
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-5 border-b border-border/50">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        {icon} <span className="text-foreground">{title}</span>
                    </h3>
                    <button onClick={onClose} disabled={isLoading} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5">
                    <div className="mb-6 text-foreground text-sm sm:text-base leading-relaxed">
                        {description}
                    </div>

                    <div className="flex gap-3 justify-end items-center">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-5 py-2.5 rounded-xl font-medium text-muted-foreground hover:bg-muted transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className={`px-5 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-md ${confirmColor}`}
                        >
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

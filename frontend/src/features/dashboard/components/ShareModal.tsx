"use client";

import { useState } from "react";
import { X, Loader2, Link as LinkIcon, Users, Lock, Globe, Plus } from "lucide-react";
import { useShareFile } from "@/features/files/mutations";
import type { FileItem } from "@/features/files/schemas";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/types/api";

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    file: FileItem | null;
}

export function ShareModal({ isOpen, onClose, file }: ShareModalProps) {
    const shareMutation = useShareFile();

    const [accessMode, setAccessMode] = useState<"PRIVATE" | "PUBLIC" | "RESTRICTED">(
        (file?.accessMode as "PRIVATE" | "PUBLIC" | "RESTRICTED") || (file?.isPublic ? "PUBLIC" : "PRIVATE")
    );
    const [emailInput, setEmailInput] = useState("");
    const [sharedEmails, setSharedEmails] = useState<string[]>(file?.sharedEmails || []);
    const [expiresInDays, setExpiresInDays] = useState<number | "">("");
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);

    if (!isOpen || !file) return null;

    const handleAddEmail = () => {
        if (!emailInput.trim() || !emailInput.includes("@")) {
            toast.error("Email không hợp lệ");
            return;
        }
        if (sharedEmails.includes(emailInput.trim())) {
            toast.error("Email đã tồn tại trong danh sách");
            return;
        }
        setSharedEmails(prev => [...prev, emailInput.trim()]);
        setEmailInput("");
    };

    const handleRemoveEmail = (e: string) => {
        setSharedEmails(prev => prev.filter(email => email !== e));
    };

    const handleSave = () => {
        shareMutation.mutate({
            fileId: file.id,
            payload: {
                accessMode,
                sharedEmails,
                expiresInDays: expiresInDays === "" ? null : Number(expiresInDays)
            }
        }, {
            onSuccess: () => {
                toast.success("Cập nhật quyền truy cập thành công!");
                
                if (accessMode !== "PRIVATE") {
                    const shareLink = `${window.location.origin}/shared/file/${file.id}`;
                    setGeneratedLink(shareLink);
                } else {
                    onClose();
                }
            },
            onError: (err) => {
                toast.error(getApiErrorMessage(err, "Lỗi khi chia sẻ"));
            }
        });
    };

    if (generatedLink) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                <div className="bg-card w-full max-w-lg rounded-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center p-5 border-b border-border/50">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <LinkIcon className="w-5 h-5 text-primary" /> 
                            Chia sẻ thành công
                        </h3>
                        <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-5 space-y-4">
                        <p className="text-sm text-foreground">Link chia sẻ cho tệp <span className="font-semibold">{file.name}</span> đã sẵn sàng.</p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                readOnly
                                value={generatedLink}
                                className="flex-1 px-4 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none text-sm text-muted-foreground"
                            />
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(generatedLink);
                                    toast.success("Đã sao chép link chia sẻ!");
                                }}
                                className="px-4 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors whitespace-nowrap"
                            >
                                Copy
                            </button>
                        </div>
                    </div>

                    <div className="p-5 border-t border-border/50 bg-secondary/30 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl font-medium text-muted-foreground hover:bg-muted transition-colors border border-border bg-background"
                        >
                            Hoàn tất
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="bg-card w-full max-w-lg rounded-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-5 border-b border-border/50">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" /> 
                        Chia sẻ tệp: {file.name}
                    </h3>
                    <button onClick={onClose} disabled={shareMutation.isPending} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5 space-y-6">
                    {/* Quyền Cấp Truy Cập */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-foreground">Quyền truy cập</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => setAccessMode("PRIVATE")}
                                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${accessMode === "PRIVATE" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}
                            >
                                <Lock className="w-5 h-5" />
                                <span className="text-xs font-semibold">Riêng tư</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setAccessMode("PUBLIC")}
                                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${accessMode === "PUBLIC" ? "border-emerald-500 bg-emerald-500/5 text-emerald-500" : "border-border text-muted-foreground hover:bg-muted"}`}
                            >
                                <Globe className="w-5 h-5" />
                                <span className="text-xs font-semibold">Công khai (Ai có link)</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setAccessMode("RESTRICTED")}
                                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${accessMode === "RESTRICTED" ? "border-orange-500 bg-orange-500/5 text-orange-500" : "border-border text-muted-foreground hover:bg-muted"}`}
                            >
                                <Users className="w-5 h-5" />
                                <span className="text-xs font-semibold">Chỉ người được mời</span>
                            </button>
                        </div>
                    </div>

                    {/* Mời Email */}
                    {accessMode === "RESTRICTED" && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                            <label className="text-sm font-semibold text-foreground">Mời người xem theo Email</label>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Nhập email..."
                                    value={emailInput}
                                    onChange={(e) => setEmailInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleAddEmail()}
                                    className="flex-1 px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                                <button
                                    onClick={handleAddEmail}
                                    className="p-2.5 bg-secondary text-foreground hover:bg-secondary/80 rounded-xl transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                            {sharedEmails.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {sharedEmails.map(email => (
                                        <span key={email} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-lg font-medium">
                                            {email}
                                            <button onClick={() => handleRemoveEmail(email)} className="hover:text-rose-500 transition-colors">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Hạn chia sẻ */}
                    {(accessMode === "PUBLIC" || accessMode === "RESTRICTED") && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                            <label className="text-sm font-semibold text-foreground">Hết hạn sau (ngày)</label>
                            <input
                                type="number"
                                min="1"
                                placeholder="Để trống nếu muốn vĩnh viễn"
                                value={expiresInDays}
                                onChange={(e) => setExpiresInDays(e.target.value === "" ? "" : Number(e.target.value))}
                                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            <p className="text-xs text-muted-foreground">Link chia sẻ sẽ ngừng hoạt động sau khoảng thời gian này.</p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-5 border-t border-border/50 bg-secondary/30 flex justify-end items-center">
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={shareMutation.isPending}
                            className="px-5 py-2.5 rounded-xl font-medium text-muted-foreground hover:bg-muted transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={shareMutation.isPending}
                            className="px-5 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 bg-primary hover:bg-primary/90 text-white"
                        >
                            {shareMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            Tạo link
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  LinkIcon,
  Copy,
  Fingerprint,
  HardDrive,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { formatBytes } from "@/lib/format";
import { format } from "date-fns";
import { AdminFolder } from "../../types/folders.types";
import { AdminStorageFile } from "../../types/files.types";

interface AdminStorageInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AdminFolder | AdminStorageFile | null;
  type: "folder" | "file";
}

export function AdminStorageInfoModal({
  isOpen,
  onClose,
  data,
  type,
}: AdminStorageInfoModalProps) {
  if (!data) return null;

  const isFolder = type === "folder";

  // Construct user-facing URL if possible
  const generateLink = () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    return isFolder
      ? `${baseUrl}/dashboard?folder=${data.id}`
      : `${baseUrl}/api/files/download/${data.id}`;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép vào khay nhớ tạm!");
  };

  const url = generateLink();

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card p-6 rounded-2xl z-50 outline-none border border-border data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-bold text-foreground">
              Thông tin chi tiết
            </Dialog.Title>
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:bg-secondary hover:text-foreground rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-secondary/30 p-4 rounded-xl border border-secondary">
              <h3
                className="font-bold text-foreground text-lg truncate mb-1"
                title={data.name}
              >
                {data.name}
              </h3>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isFolder ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"}`}
                >
                  {isFolder ? "THƯ MỤC" : "TỆP TIN"}
                </span>
                {data.isBanned && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-destructive/10 text-destructive">
                    BANNED
                  </span>
                )}
              </div>

              <div className="space-y-3 mt-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Fingerprint className="w-4 h-4" /> User ID
                  </span>
                  <span className="font-mono text-foreground font-semibold">
                    {data.ownerId.slice(0, 15)}...
                  </span>
                </div>
                {!isFolder && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <HardDrive className="w-4 h-4" /> Kích thước
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatBytes((data as AdminStorageFile).size || 0)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Ngày tạo
                  </span>
                  <span className="font-semibold text-foreground">
                    {data.createdAt
                      ? format(new Date(data.createdAt), "dd/MM/yyyy HH:mm")
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground flex items-center gap-2">
                <LinkIcon className="w-4 h-4" /> Link chia sẻ nội bộ / Link truy
                cập
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={url}
                  className="flex-1 w-full px-3 py-2 border border-border rounded-lg bg-secondary text-foreground text-sm font-mono truncate"
                />
                <button
                  onClick={() => handleCopy(url)}
                  className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors "
                  title="Sao chép Link"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

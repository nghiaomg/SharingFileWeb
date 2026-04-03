"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Loader2, FileText, FolderUp } from "lucide-react";

interface UploadDropdownProps {
  isUploading: boolean;
  onUpload: (files: FileList | File[]) => void;
}

export function UploadDropdown({ isUploading, onUpload }: UploadDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = () => setIsOpen(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesCopy = Array.from(e.target.files);
      onUpload(filesCopy);
    }
    e.target.value = "";
  };

  return (
    <div className="relative z-50">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        multiple
      />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleFileUpload}
        className="hidden"
        multiple
        {...({ webkitdirectory: "true", directory: "true" } as any)}
      />

      <button
        onClick={(e) => {
          e.stopPropagation();
          setTimeout(() => setIsOpen((prev) => !prev), 0);
        }}
        disabled={isUploading}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all duration-200 text-sm disabled:opacity-60 cursor-pointer"
        style={{
          background: "var(--color-foreground)",
          color: "var(--color-background)",
          border: "1px solid var(--gray-a4)",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
        }}
      >
        {isUploading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Upload className="w-4 h-4" />
        )}
        {isUploading ? "Đang tải lên..." : "Tải lên"}
      </button>

      {isOpen && !isUploading && (
        <div
          className="absolute top-12 right-0 w-48 rounded-xl z-20 py-1 mt-2"
          style={{
            background: "var(--color-popover)",
            border: "1px solid var(--gray-a4)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setIsOpen(false);
              fileInputRef.current?.click();
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer"
            style={{ color: "var(--color-foreground)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--gray-a3)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <FileText className="w-4 h-4" style={{ color: "var(--icon-blue)" }} /> Tải tệp lên
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              folderInputRef.current?.click();
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer"
            style={{ color: "var(--color-foreground)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--gray-a3)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <FolderUp className="w-4 h-4" style={{ color: "var(--amber-11)" }} /> Tải thư mục lên
          </button>
        </div>
      )}
    </div>
  );
}

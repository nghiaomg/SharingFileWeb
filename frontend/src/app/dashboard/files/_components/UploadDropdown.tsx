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
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" multiple />
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <input type="file" ref={folderInputRef} onChange={handleFileUpload} className="hidden" multiple {...({ webkitdirectory: "true", directory: "true" } as any)} />
            
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setTimeout(() => setIsOpen((prev) => !prev), 0);
                }}
                disabled={isUploading}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors text-sm disabled:opacity-60 border border-primary/40 hover:border-primary cursor-pointer"
            >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {isUploading ? "Đang tải lên..." : "Tải lên"}
            </button>

            {isOpen && !isUploading && (
                <div className="absolute top-12 right-0 w-48 bg-card border border-border rounded-xl z-20 py-1 shadow-sm mt-2" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            fileInputRef.current?.click();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-secondary transition-colors cursor-pointer"
                    >
                        <FileText className="w-4 h-4" /> Tải tệp lên
                    </button>
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            folderInputRef.current?.click();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-secondary transition-colors cursor-pointer"
                    >
                        <FolderUp className="w-4 h-4" /> Tải thư mục lên
                    </button>
                </div>
            )}
        </div>
    );
}

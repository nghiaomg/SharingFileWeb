"use client";

import { useState } from "react";
import { useAdminFolders } from "../../hooks/useFoldersQuery";
import { useAdminFiles } from "../../hooks/useFilesQuery";
import { Loader2, FolderOpen, FileText, Image as ImageIcon, Video, Archive, ChevronRight, Home } from "lucide-react";
import { formatBytes } from "@/lib/format";
import { format } from "date-fns";

export function AdminStorageExplorer() {
    const [currentFolder, setCurrentFolder] = useState<{ id: string | null; name: string }>({ id: null, name: "Cấp cao nhất (Root)" });
    const [breadcrumb, setBreadcrumb] = useState<{ id: string | null; name: string }[]>([{ id: null, name: "Cấp cao nhất (Root)" }]);

    const { data: foldersData, isLoading: isLoadingFolders } = useAdminFolders(currentFolder.id);
    const { data: filesData, isLoading: isLoadingFiles } = useAdminFiles(currentFolder.id);

    const navigateToFolder = (id: string | null, name: string) => {
        setCurrentFolder({ id, name });
        const idx = breadcrumb.findIndex(b => b.id === id);
        if (idx !== -1) {
            setBreadcrumb(breadcrumb.slice(0, idx + 1));
        } else {
            setBreadcrumb([...breadcrumb, { id, name }]);
        }
    };

    const getFileIcon = (mimeType: string | undefined) => {
        if (!mimeType) return <FileText className="w-5 h-5 text-gray-500" />;
        if (mimeType.startsWith("image/")) return <ImageIcon className="w-5 h-5 text-blue-500" />;
        if (mimeType.startsWith("video/")) return <Video className="w-5 h-5 text-purple-500" />;
        if (mimeType.includes("zip") || mimeType.includes("rar")) return <Archive className="w-5 h-5 text-red-500" />;
        return <FileText className="w-5 h-5 text-gray-500" />;
    };

    const folders = foldersData?.content || [];
    const files = filesData?.content || [];
    const isLoading = isLoadingFolders || isLoadingFiles;

    return (
        <div className="flex flex-col gap-4 bg-transparent border-none shadow-none">
            {/* Header & Breadcrumb */}
            <div className="flex items-center gap-2 mb-4 bg-transparent">
                {breadcrumb.map((crumb, idx) => (
                    <div key={crumb.id || "root"} className="flex items-center gap-2">
                        <button
                            onClick={() => navigateToFolder(crumb.id, crumb.name)}
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                        >
                            {idx === 0 ? <Home className="w-4 h-4" /> : null}
                            {crumb.name}
                        </button>
                        {idx < breadcrumb.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    </div>
                ))}
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {/* Folders Section */}
                    {folders.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Thư mục ({folders.length})</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {folders.map(folder => (
                                    <div
                                        key={folder.id}
                                        onClick={() => navigateToFolder(folder.id, folder.name)}
                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer group border-none shadow-none"
                                    >
                                        <div className="w-10 h-10 rounded bg-[#fef3c7] dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                                            <FolderOpen className="w-5 h-5 text-amber-500" />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-sm font-bold text-foreground truncate">{folder.name}</p>
                                            <p className="text-[10px] text-muted-foreground font-mono truncate">UID: {folder.ownerId.slice(0, 8)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Files Section */}
                    {files.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Tệp tin ({files.length})</p>
                            <div className="bg-transparent border-none shadow-none">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-muted-foreground border-b border-border/50">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Tên file</th>
                                            <th className="px-4 py-3 font-medium">Dung lượng</th>
                                            <th className="px-4 py-3 font-medium">Chủ sở hữu</th>
                                            <th className="px-4 py-3 font-medium">Tạo lúc</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/20">
                                        {files.map(file => (
                                            <tr key={file.id} className="hover:bg-secondary/30 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        {getFileIcon(file.type)}
                                                        <p className="font-medium text-foreground truncate max-w-[200px]">{file.name}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">{formatBytes(file.size)}</td>
                                                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">UID: {file.ownerId.slice(0, 8)}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{file.createdAt ? format(new Date(file.createdAt), "dd/MM/yyyy HH:mm") : "N/A"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {folders.length === 0 && files.length === 0 && (
                        <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                            <FolderOpen className="w-12 h-12 text-muted-foreground/30 mb-3" />
                            <p className="font-medium text-foreground">Thư mục trống</p>
                            <p className="text-sm">Chưa có tệp hay thư mục nào ở đây.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

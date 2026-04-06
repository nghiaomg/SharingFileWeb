"use client";

import { AdminFolder } from "../../types/folders.types";
import { AdminStorageFile } from "../../types/files.types";

import { useState } from "react";
import { useAdminFolders } from "../../hooks/useFoldersQuery";
import { useAdminFiles } from "../../hooks/useFilesQuery";
import { useRevokeAdminFolder } from "../../hooks/useFoldersMutation";
import { useRevokeAdminFile } from "../../hooks/useFilesMutation";
import {
  Loader2,
  FolderOpen,
  FileText,
  Image as ImageIcon,
  Video,
  Archive,
  ChevronRight,
  Home,
  Info,
  Ban,
  Edit2,
} from "lucide-react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { AdminStorageInfoModal } from "./AdminStorageInfoModal";
import { formatBytes } from "@/lib/format";
import { format } from "date-fns";

export function AdminStorageExplorer() {
  const [currentFolder, setCurrentFolder] = useState<{
    id: string | null;
    name: string;
  }>({ id: null, name: "Cấp cao nhất (Root)" });
  const [breadcrumb, setBreadcrumb] = useState<
    { id: string | null; name: string }[]
  >([{ id: null, name: "Cấp cao nhất (Root)" }]);
  const [infoModal, setInfoModal] = useState<{
    isOpen: boolean;
    data: AdminFolder | AdminStorageFile | null;
    type: "folder" | "file";
  }>({ isOpen: false, data: null, type: "folder" });

  const { data: foldersData, isLoading: isLoadingFolders } = useAdminFolders(
    currentFolder.id,
  );
  const { data: filesData, isLoading: isLoadingFiles } = useAdminFiles(
    currentFolder.id,
  );

  const { mutate: revokeFolder, isPending: isRevokingFolder } =
    useRevokeAdminFolder();
  const { mutate: revokeFile, isPending: isRevokingFile } =
    useRevokeAdminFile();

  const navigateToFolder = (id: string | null, name: string) => {
    setCurrentFolder({ id, name });
    const idx = breadcrumb.findIndex((b) => b.id === id);
    if (idx !== -1) {
      setBreadcrumb(breadcrumb.slice(0, idx + 1));
    } else {
      setBreadcrumb([...breadcrumb, { id, name }]);
    }
  };

  const getFileIcon = (mimeType: string | undefined) => {
    if (!mimeType) return <FileText className="w-5 h-5 text-gray-500" />;
    if (mimeType.startsWith("image/"))
      return <ImageIcon className="w-5 h-5 text-blue-500" />;
    if (mimeType.startsWith("video/"))
      return <Video className="w-5 h-5 text-purple-500" />;
    if (mimeType.includes("zip") || mimeType.includes("rar"))
      return <Archive className="w-5 h-5 text-red-500" />;
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  const folders = foldersData?.content || [];
  const files = filesData?.content || [];
  const isLoading = isLoadingFolders || isLoadingFiles;

  return (
    <div className="flex flex-col gap-4 bg-transparent border-none ">
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
            {idx < breadcrumb.length - 1 && (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
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
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                Thư mục ({folders.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {folders.map((folder) => (
                  <ContextMenu.Root key={folder.id}>
                    <ContextMenu.Trigger>
                      <div
                        onClick={() => navigateToFolder(folder.id, folder.name)}
                        className={`flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer group ${folder.isBanned ? "bg-destructive/10 border border-destructive/30 opacity-70" : "border-none "}`}
                      >
                        <div
                          className={`w-10 h-10 rounded flex items-center justify-center shrink-0 ${folder.isBanned ? "bg-destructive/20" : "bg-[#fef3c7] dark:bg-amber-900/30"}`}
                        >
                          <FolderOpen
                            className={`w-5 h-5 ${folder.isBanned ? "text-destructive" : "text-amber-500"}`}
                          />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="flex items-center gap-2">
                            <p
                              className={`text-sm font-bold text-foreground truncate ${folder.isBanned ? "line-through decoration-destructive text-destructive" : ""}`}
                            >
                              {folder.name}
                            </p>
                            {folder.isBanned && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-destructive text-destructive-foreground">
                                BANNED
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground font-mono truncate">
                            UID: {folder.ownerId.slice(0, 8)}
                          </p>
                        </div>
                      </div>
                    </ContextMenu.Trigger>
                    <ContextMenu.Portal>
                      <ContextMenu.Content className="z-50 min-w-[160px] bg-popover border border-border rounded-lg p-1 overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
                        <ContextMenu.Item className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-secondary hover:text-foreground focus:bg-secondary focus:text-foreground">
                          <Edit2 className="w-4 h-4 mr-2" /> Đổi tên
                        </ContextMenu.Item>
                        <ContextMenu.Item
                          onClick={() =>
                            setInfoModal({
                              isOpen: true,
                              data: folder,
                              type: "folder",
                            })
                          }
                          className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-secondary hover:text-foreground focus:bg-secondary focus:text-foreground"
                        >
                          <Info className="w-4 h-4 mr-2" /> Thông tin
                        </ContextMenu.Item>
                        <ContextMenu.Separator className="h-px bg-border my-1" />
                        <ContextMenu.Item
                          disabled={isRevokingFolder}
                          onClick={() => revokeFolder(folder.id)}
                          className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none text-destructive hover:bg-destructive focus:bg-destructive hover:text-destructive-foreground focus:text-destructive-foreground disabled:opacity-50"
                        >
                          <Ban className="w-4 h-4 mr-2" />{" "}
                          {folder.isBanned ? "Bỏ Thu hồi" : "Thu hồi"}
                        </ContextMenu.Item>
                      </ContextMenu.Content>
                    </ContextMenu.Portal>
                  </ContextMenu.Root>
                ))}
              </div>
            </div>
          )}

          {/* Files Section */}
          {files.length > 0 && (
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                Tệp tin ({files.length})
              </p>
              <div className="bg-transparent border-none ">
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
                    {files.map((file) => (
                      <ContextMenu.Root key={file.id}>
                        <ContextMenu.Trigger asChild>
                          <tr
                            className={`hover:bg-secondary/30 transition-colors ${file.isBanned ? "bg-destructive/5 opacity-70" : ""}`}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {getFileIcon(file.type)}
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <p
                                      className={`font-medium text-foreground truncate max-w-[200px] ${file.isBanned ? "line-through decoration-destructive text-destructive" : ""}`}
                                    >
                                      {file.name}
                                    </p>
                                    {file.isBanned && (
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-destructive text-destructive-foreground">
                                        BANNED
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {formatBytes(file.size)}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                              UID: {file.ownerId.slice(0, 8)}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {file.createdAt
                                ? format(
                                    new Date(file.createdAt),
                                    "dd/MM/yyyy HH:mm",
                                  )
                                : "N/A"}
                            </td>
                          </tr>
                        </ContextMenu.Trigger>
                        <ContextMenu.Portal>
                          <ContextMenu.Content className="z-50 min-w-[160px] bg-popover border border-border rounded-lg p-1 overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
                            <ContextMenu.Item className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-secondary hover:text-foreground focus:bg-secondary focus:text-foreground">
                              <Edit2 className="w-4 h-4 mr-2" /> Đổi tên
                            </ContextMenu.Item>
                            <ContextMenu.Item
                              onClick={() =>
                                setInfoModal({
                                  isOpen: true,
                                  data: file,
                                  type: "file",
                                })
                              }
                              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-secondary hover:text-foreground focus:bg-secondary focus:text-foreground"
                            >
                              <Info className="w-4 h-4 mr-2" /> Thông tin
                            </ContextMenu.Item>
                            <ContextMenu.Separator className="h-px bg-border my-1" />
                            <ContextMenu.Item
                              disabled={isRevokingFile}
                              onClick={() => revokeFile(file.id)}
                              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none text-destructive hover:bg-destructive focus:bg-destructive hover:text-destructive-foreground focus:text-destructive-foreground disabled:opacity-50"
                            >
                              <Ban className="w-4 h-4 mr-2" />{" "}
                              {file.isBanned ? "Bỏ Thu hồi" : "Thu hồi"}
                            </ContextMenu.Item>
                          </ContextMenu.Content>
                        </ContextMenu.Portal>
                      </ContextMenu.Root>
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

      <AdminStorageInfoModal
        isOpen={infoModal.isOpen}
        onClose={() => setInfoModal({ ...infoModal, isOpen: false })}
        data={infoModal.data}
        type={infoModal.type}
      />
    </div>
  );
}

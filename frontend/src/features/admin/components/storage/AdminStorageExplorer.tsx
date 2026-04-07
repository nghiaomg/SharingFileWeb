"use client";

import { AdminFolder } from "../../types/folders.types";
import { AdminStorageFile } from "../../types/files.types";
import Cookies from "js-cookie";

import { useState, useEffect } from "react";
import { useAdminFolders } from "../../hooks/useFoldersQuery";
import { useAdminFiles } from "../../hooks/useFilesQuery";
import {
  useRevokeAdminFolder,
  useDeleteAdminFolder,
  useRenameAdminFolder,
} from "../../hooks/useFoldersMutation";
import {
  useRevokeAdminFile,
  useDeleteAdminFile,
  useRenameAdminFile,
} from "../../hooks/useFilesMutation";
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
  Search,
  Filter,
  Trash2,
  Eye,
  LinkIcon,
} from "lucide-react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { AdminStorageInfoModal } from "./AdminStorageInfoModal";
import { formatBytes } from "@/lib/format";
import { format } from "date-fns";
import { toast } from "sonner";

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
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    id: string;
    name: string;
    type: "folder" | "file";
  }>({ isOpen: false, id: "", name: "", type: "folder" });

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterBanned, setFilterBanned] = useState<string>("ALL"); // ALL, NORMAL, BANNED

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const isBannedParam =
    filterBanned === "ALL" ? null : filterBanned === "BANNED" ? true : false;
  const effectiveFolderId = debouncedSearch ? null : currentFolder.id;

  const { data: foldersData, isLoading: isLoadingFolders } = useAdminFolders(
    effectiveFolderId,
    debouncedSearch || null,
    isBannedParam,
  );
  const { data: filesData, isLoading: isLoadingFiles } = useAdminFiles(
    effectiveFolderId,
    debouncedSearch || null,
    isBannedParam,
  );

  const { mutate: revokeFolder, isPending: isRevokingFolder } =
    useRevokeAdminFolder();
  const { mutate: revokeFile, isPending: isRevokingFile } =
    useRevokeAdminFile();
  const { mutate: deleteFolder, isPending: isDeletingFolder } =
    useDeleteAdminFolder();
  const { mutate: deleteFile, isPending: isDeletingFile } =
    useDeleteAdminFile();
  const { mutate: renameFolder, isPending: isRenamingFolder } =
    useRenameAdminFolder();
  const { mutate: renameFile, isPending: isRenamingFile } =
    useRenameAdminFile();

  const navigateToFolder = (id: string | null, name: string) => {
    setCurrentFolder({ id, name });
    const idx = breadcrumb.findIndex((b) => b.id === id);
    if (idx !== -1) {
      setBreadcrumb(breadcrumb.slice(0, idx + 1));
    } else {
      setBreadcrumb([...breadcrumb, { id, name }]);
    }
    setSearchInput(""); // Clear search when navigating
  };

  const handleRename = (
    id: string,
    currentName: string,
    type: "folder" | "file",
  ) => {
    const newName = window.prompt("Nhập tên mới:", currentName);
    if (newName && newName.trim() !== "" && newName !== currentName) {
      if (type === "folder") {
        renameFolder(
          { id, name: newName },
          { onSuccess: () => toast.success("Đổi tên thư mục thành công") },
        );
      } else {
        renameFile(
          { id, name: newName },
          { onSuccess: () => toast.success("Đổi tên tệp thành công") },
        );
      }
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.type === "folder") {
      deleteFolder(deleteDialog.id, {
        onSuccess: () => {
          toast.success("Đã xóa thư mục vĩnh viễn");
          setDeleteDialog({ ...deleteDialog, isOpen: false });
        },
      });
    } else {
      deleteFile(deleteDialog.id, {
        onSuccess: () => {
          toast.success("Đã xóa tệp vĩnh viễn");
          setDeleteDialog({ ...deleteDialog, isOpen: false });
        },
      });
    }
  };

  const handlePreview = (id: string) => {
    const token = Cookies.get("access_token");
    window.open(`/api/files/${id}/preview${token ? `?token=${token}` : ""}`, "_blank");
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
      {/* Top Bar: Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm thư mục / tệp tin..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-secondary border-none rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary transition-all text-foreground"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={filterBanned}
            onChange={(e) => setFilterBanned(e.target.value)}
            className="w-full sm:w-auto bg-secondary text-foreground text-sm border-none rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-all"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="NORMAL">Bình thường</option>
            <option value="BANNED">Vi phạm</option>
          </select>
        </div>
      </div>

      {/* Breadcrumb */}
      {!debouncedSearch && (
        <div className="flex items-center gap-2 mb-2 bg-transparent">
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
      )}

      {debouncedSearch && (
        <div className="text-sm text-muted-foreground mb-2">
          Đang tìm kiếm:{" "}
          <span className="font-bold text-foreground">&quot;{debouncedSearch}&quot;</span>{" "}
          (Toàn hệ thống)
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Folders Section - Now as Table */}
          {folders.length > 0 && (
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                Thư mục ({folders.length})
              </p>
              <div className="bg-transparent border-none overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground border-b border-border/50">
                    <tr>
                      <th className="px-4 py-3 font-medium">Tên thư mục</th>
                      <th className="px-4 py-3 font-medium">Chủ sở hữu</th>
                      <th className="px-4 py-3 font-medium">Tạo lúc</th>
                      <th className="px-4 py-3 font-medium">Trạng thái</th>
                      <th className="px-4 py-3 font-medium text-right">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {folders.map((folder) => (
                      <ContextMenu.Root key={folder.id}>
                        <ContextMenu.Trigger asChild>
                          <tr
                            className={`hover:bg-secondary/30 transition-colors ${folder.isBanned ? "bg-destructive/5 opacity-70" : ""}`}
                          >
                            <td
                              className="px-4 py-3 cursor-pointer"
                              onClick={() =>
                                navigateToFolder(folder.id, folder.name)
                              }
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${folder.isBanned ? "bg-destructive/20" : "bg-[#fef3c7] dark:bg-amber-900/30"}`}
                                >
                                  <FolderOpen
                                    className={`w-4 h-4 ${folder.isBanned ? "text-destructive" : "text-amber-500"}`}
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <p
                                    className={`font-medium text-foreground truncate max-w-[200px] ${folder.isBanned ? "line-through decoration-destructive text-destructive" : ""}`}
                                  >
                                    {folder.name}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                              UID: {folder.ownerId.slice(0, 8)}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {folder.createdAt
                                ? format(
                                  new Date(folder.createdAt),
                                  "dd/MM/yyyy HH:mm",
                                )
                                : "N/A"}
                            </td>
                            <td
                              className="px-4 py-3"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <select
                                value={folder.isBanned ? "BANNED" : "NORMAL"}
                                onChange={(e) => {
                                  const newValue = e.target.value === "BANNED";
                                  if (Boolean(folder.isBanned) !== newValue) {
                                    revokeFolder(folder.id, {
                                      onSuccess: () =>
                                        toast.success(
                                          `Đã chuyển thư mục thành: ${newValue ? "Vi phạm" : "Bình thường"}`,
                                        ),
                                      onError: () =>
                                        toast.error(
                                          "Cập nhật trạng thái thất bại",
                                        ),
                                    });
                                  }
                                }}
                                disabled={isRevokingFolder}
                                className={`text-xs border rounded-md px-2 py-1.5 outline-none cursor-pointer transition-colors ${folder.isBanned ? "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20" : "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20 dark:text-green-400"}`}
                              >
                                <option
                                  value="NORMAL"
                                  className="text-foreground bg-background"
                                >
                                  Bình thường
                                </option>
                                <option
                                  value="BANNED"
                                  className="text-foreground bg-background"
                                >
                                  Vi phạm
                                </option>
                              </select>
                            </td>
                            <td
                              className="px-4 py-3 text-right"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center justify-end gap-2 text-muted-foreground">
                                <button
                                  onClick={() =>
                                    setInfoModal({
                                      isOpen: true,
                                      data: folder,
                                      type: "folder",
                                    })
                                  }
                                  className="p-1.5 hover:bg-secondary rounded-lg transition-colors tooltip-trigger"
                                  title="Lấy link & Thông tin"
                                >
                                  <LinkIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleRename(
                                      folder.id,
                                      folder.name,
                                      "folder",
                                    )
                                  }
                                  className="p-1.5 hover:bg-secondary rounded-lg transition-colors tooltip-trigger"
                                  title="Đổi tên"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    setDeleteDialog({
                                      isOpen: true,
                                      id: folder.id,
                                      name: folder.name,
                                      type: "folder",
                                    })
                                  }
                                  className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors tooltip-trigger"
                                  title="Xóa vĩnh viễn"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        </ContextMenu.Trigger>
                        <ContextMenu.Portal>
                          <ContextMenu.Content className="z-50 min-w-[160px] bg-popover border border-border rounded-lg p-1 overflow-hidden shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
                            <ContextMenu.Item
                              onClick={() =>
                                handleRename(folder.id, folder.name, "folder")
                              }
                              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-secondary hover:text-foreground focus:bg-secondary focus:text-foreground"
                            >
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
                              disabled={isDeletingFolder}
                              onClick={() =>
                                setDeleteDialog({
                                  isOpen: true,
                                  id: folder.id,
                                  name: folder.name,
                                  type: "folder",
                                })
                              }
                              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none text-destructive hover:bg-destructive focus:bg-destructive hover:text-destructive-foreground focus:text-destructive-foreground disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Xóa vĩnh viễn
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

          {/* Files Section */}
          {files.length > 0 && (
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                Tệp tin ({files.length})
              </p>
              <div className="bg-transparent border-none overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground border-b border-border/50">
                    <tr>
                      <th className="px-4 py-3 font-medium">Tên file</th>
                      <th className="px-4 py-3 font-medium">Dung lượng</th>
                      <th className="px-4 py-3 font-medium">Chủ sở hữu</th>
                      <th className="px-4 py-3 font-medium">Tạo lúc</th>
                      <th className="px-4 py-3 font-medium">Trạng thái</th>
                      <th className="px-4 py-3 font-medium text-right">
                        Hành động
                      </th>
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
                            <td
                              className="px-4 py-3"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <select
                                value={file.isBanned ? "BANNED" : "NORMAL"}
                                onChange={(e) => {
                                  const newValue = e.target.value === "BANNED";
                                  if (Boolean(file.isBanned) !== newValue) {
                                    revokeFile(file.id, {
                                      onSuccess: () =>
                                        toast.success(
                                          `Đã chuyển tệp thành: ${newValue ? "Vi phạm" : "Bình thường"}`,
                                        ),
                                      onError: () =>
                                        toast.error(
                                          "Cập nhật trạng thái thất bại",
                                        ),
                                    });
                                  }
                                }}
                                disabled={isRevokingFile}
                                className={`text-xs border rounded-md px-2 py-1.5 outline-none cursor-pointer transition-colors ${file.isBanned ? "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20" : "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20 dark:text-green-400"}`}
                              >
                                <option
                                  value="NORMAL"
                                  className="text-foreground bg-background"
                                >
                                  Bình thường
                                </option>
                                <option
                                  value="BANNED"
                                  className="text-foreground bg-background"
                                >
                                  Vi phạm
                                </option>
                              </select>
                            </td>
                            <td
                              className="px-4 py-3 text-right"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center justify-end gap-2 text-muted-foreground">
                                <button
                                  onClick={() =>
                                    setInfoModal({
                                      isOpen: true,
                                      data: file,
                                      type: "file",
                                    })
                                  }
                                  className="p-1.5 hover:bg-secondary rounded-lg transition-colors tooltip-trigger"
                                  title="Lấy link & Thông tin"
                                >
                                  <LinkIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handlePreview(file.id)}
                                  className="p-1.5 hover:bg-secondary rounded-lg transition-colors tooltip-trigger"
                                  title="Xem trước / Tải xuống"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleRename(file.id, file.name, "file")
                                  }
                                  className="p-1.5 hover:bg-secondary rounded-lg transition-colors tooltip-trigger"
                                  title="Đổi tên"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    setDeleteDialog({
                                      isOpen: true,
                                      id: file.id,
                                      name: file.name,
                                      type: "file",
                                    })
                                  }
                                  className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors tooltip-trigger"
                                  title="Xóa vĩnh viễn"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        </ContextMenu.Trigger>
                        <ContextMenu.Portal>
                          <ContextMenu.Content className="z-50 min-w-[160px] bg-popover border border-border rounded-lg p-1 overflow-hidden shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
                            <ContextMenu.Item
                              onClick={() => handlePreview(file.id)}
                              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-secondary hover:text-foreground focus:bg-secondary focus:text-foreground"
                            >
                              <Eye className="w-4 h-4 mr-2" /> Xem trước
                            </ContextMenu.Item>
                            <ContextMenu.Item
                              onClick={() =>
                                handleRename(file.id, file.name, "file")
                              }
                              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-secondary hover:text-foreground focus:bg-secondary focus:text-foreground"
                            >
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
                              disabled={isDeletingFile}
                              onClick={() =>
                                setDeleteDialog({
                                  isOpen: true,
                                  id: file.id,
                                  name: file.name,
                                  type: "file",
                                })
                              }
                              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none text-destructive hover:bg-destructive focus:bg-destructive hover:text-destructive-foreground focus:text-destructive-foreground disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Xóa vĩnh viễn
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
              <p className="font-medium text-foreground">Không có dữ liệu</p>
              <p className="text-sm">Chưa có tệp hay thư mục nào ở đây.</p>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog.Root
        open={deleteDialog.isOpen}
        onOpenChange={(open) =>
          !open && setDeleteDialog({ ...deleteDialog, isOpen: false })
        }
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <AlertDialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-xl bg-card border border-border p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
            <AlertDialog.Title className="text-lg font-bold text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Xóa vĩnh viễn
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-3 text-sm text-foreground/80 leading-relaxed">
              Bạn có chắc chắn muốn xóa thư mục/tệp &quot;
              <span className="font-bold">{deleteDialog.name}</span>&quot;? Hành động
              này sẽ{" "}
              <strong className="text-destructive">
                xóa toàn bộ dữ liệu khỏi Database và Cloud Backblaze (B2)
              </strong>{" "}
              không thể khôi phục lại.
            </AlertDialog.Description>
            <div className="mt-6 flex justify-end gap-3">
              <AlertDialog.Cancel asChild>
                <button className="px-4 py-2 font-medium text-sm text-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors">
                  Hủy bỏ
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeletingFolder || isDeletingFile}
                  className="px-4 py-2 font-medium text-sm text-primary-foreground bg-destructive hover:bg-destructive/90 rounded-lg transition-colors disabled:opacity-50"
                >
                  Xóa vĩnh viễn
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      <AdminStorageInfoModal
        isOpen={infoModal.isOpen}
        onClose={() => setInfoModal({ ...infoModal, isOpen: false })}
        data={infoModal.data}
        type={infoModal.type}
      />
    </div>
  );
}

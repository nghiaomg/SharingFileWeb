import {
  FileText,
  Image as ImageIcon,
  Video,
  Folder,
  Music,
  FileArchive,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface FileCategoryMeta {
  icon: LucideIcon;
  color: string;
  bg: string;
}

export const categoriesMeta: Record<string, FileCategoryMeta> = {
  "Tài liệu": { icon: FileText, color: "text-zinc-600 dark:text-zinc-400", bg: "bg-zinc-500/10" },
  "Hình ảnh": { icon: ImageIcon, color: "text-zinc-600 dark:text-zinc-400", bg: "bg-zinc-500/10" },
  "Video": { icon: Video, color: "text-zinc-600 dark:text-zinc-400", bg: "bg-zinc-500/10" },
  "Thư mục": { icon: Folder, color: "text-zinc-600 dark:text-zinc-400", bg: "bg-zinc-500/10" },
  "Âm thanh": { icon: Music, color: "text-zinc-600 dark:text-zinc-400", bg: "bg-zinc-500/10" },
  "Lưu trữ": { icon: FileArchive, color: "text-zinc-600 dark:text-zinc-400", bg: "bg-zinc-500/10" },
  "Khác": { icon: FileText, color: "text-zinc-600 dark:text-zinc-400", bg: "bg-zinc-500/10" },
};

/**
 * Determine file type metadata from MIME type
 */
export function determineFileType(mimeType: string): {
  type: string;
  icon: LucideIcon;
  color: string;
  bg: string;
} {
  if (mimeType.startsWith("image/"))
    return { type: "Hình ảnh", icon: ImageIcon, color: "text-zinc-600 dark:text-zinc-400", bg: "bg-zinc-500/10" };
  if (mimeType.startsWith("video/"))
    return { type: "Video", icon: Video, color: "text-zinc-600 dark:text-zinc-400", bg: "bg-zinc-500/10" };
  if (mimeType.startsWith("audio/"))
    return { type: "Âm thanh", icon: Music, color: "text-zinc-600 dark:text-zinc-400", bg: "bg-zinc-500/10" };
  if (mimeType.includes("zip") || mimeType.includes("tar") || mimeType.includes("rar"))
    return { type: "Lưu trữ", icon: FileArchive, color: "text-zinc-600 dark:text-zinc-400", bg: "bg-zinc-500/10" };
  return { type: "Tài liệu", icon: FileText, color: "text-zinc-600 dark:text-zinc-400", bg: "bg-zinc-500/10" };
}

/**
 * Get category name from MIME type (simpler version)
 */
export function getCategoryFromMime(mimeType: string | null): string {
  if (!mimeType) return "Khác";
  if (mimeType.startsWith("image/")) return "Hình ảnh";
  if (mimeType.startsWith("video/")) return "Video";
  if (
    mimeType.includes("pdf") ||
    mimeType.includes("document") ||
    mimeType.includes("excel") ||
    mimeType.includes("msword")
  )
    return "Tài liệu";
  return "Khác";
}

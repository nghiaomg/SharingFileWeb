"use client";

import { use } from "react";
import { FileExplorer } from "../_components/FileExplorer";

export default function FolderDetailPage({
  params,
}: {
  params: Promise<{ folderId: string }>;
}) {
  const { folderId } = use(params);
  return <FileExplorer folderId={folderId} />;
}

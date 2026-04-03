"use client";

import { Box, Text, Grid } from "@radix-ui/themes";
import { FileCard } from "@/features/files/components/FileCard";
import { RecentPageListView } from "./RecentPageListView";
import type { FileItem } from "@/features/files/schemas";

interface GroupItem {
  file: FileItem;
  timeStr: string;
}

interface RecentPageGroupProps {
  label: string;
  items: GroupItem[];
  viewMode: "grid" | "list";
  onDownload: (id: string, name: string) => void;
  onShare: (file: FileItem) => void;
  onDelete: (id: string, name: string) => void;
}

export function RecentPageGroup({
  label,
  items,
  viewMode,
  onDownload,
  onShare,
  onDelete,
}: RecentPageGroupProps) {
  return (
    <Box>
      <Text
        size="2"
        weight="bold"
        mb="4"
        style={{
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          display: "block",
          color: "var(--muted-foreground)",
        }}
      >
        {label}
      </Text>

      {viewMode === "grid" ? (
        <Grid columns={{ initial: "1", sm: "2", lg: "3", xl: "5" }} gap="4">
          {items.map((item) => (
            <FileCard
              key={item.file.id}
              file={item.file}
              variant="grid"
              subtitle={item.timeStr}
              onDownload={() => onDownload(item.file.id, item.file.name)}
              onShare={() => onShare(item.file)}
              onDelete={() => onDelete(item.file.id, item.file.name)}
            />
          ))}
        </Grid>
      ) : (
        <RecentPageListView
          items={items}
          onDownload={onDownload}
          onShare={onShare}
          onDelete={onDelete}
        />
      )}
    </Box>
  );
}

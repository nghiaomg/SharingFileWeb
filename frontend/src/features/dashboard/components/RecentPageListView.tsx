"use client";

import { Card, Flex, Box, Text } from "@radix-ui/themes";
import { RecentPageListRow } from "./RecentPageListRow";
import type { FileItem } from "@/features/files/schemas";

interface ListItem {
  file: FileItem;
  timeStr: string;
}

interface RecentPageListViewProps {
  items: ListItem[];
  onDownload: (id: string, name: string) => void;
  onShare: (file: FileItem) => void;
  onDelete: (id: string, name: string) => void;
}

function ListHeader() {
  return (
    <Flex
      px="4"
      py="3"
      style={{
        borderBottom: "1px solid var(--gray-a4)",
        backgroundColor: "var(--gray-a2)",
      }}
    >
      <Box style={{ flex: 5 }}>
        <Text
          size="2"
          weight="medium"
          style={{ color: "var(--muted-foreground)" }}
        >
          Tên tệp
        </Text>
      </Box>
      <Box style={{ flex: 2 }}>
        <Text
          size="2"
          weight="medium"
          style={{ color: "var(--muted-foreground)" }}
        >
          Loại
        </Text>
      </Box>
      <Box style={{ flex: 2, textAlign: "right" }}>
        <Text
          size="2"
          weight="medium"
          style={{ color: "var(--muted-foreground)" }}
        >
          Dung lượng
        </Text>
      </Box>
      <Box style={{ flex: 2 }} className="ml-4">
        <Text
          size="2"
          weight="medium"
          style={{ color: "var(--muted-foreground)" }}
        >
          Thời gian
        </Text>
      </Box>
      <Box style={{ flex: 1, textAlign: "right" }}>
        <Text
          size="2"
          weight="medium"
          style={{ color: "var(--muted-foreground)" }}
        >
          Thao tác
        </Text>
      </Box>
    </Flex>
  );
}

export function RecentPageListView({
  items,
  onDownload,
  onShare,
  onDelete,
}: RecentPageListViewProps) {
  return (
    <Card
      size="1"
      variant="ghost"
      style={{ padding: 0, overflow: "hidden", border: "none" }}
    >
      <ListHeader />
      <Flex direction="column">
        {items.map((item, idx) => (
          <RecentPageListRow
            key={item.file.id}
            file={item.file}
            timeStr={item.timeStr}
            isLast={idx === items.length - 1}
            onDownload={onDownload}
            onShare={onShare}
            onDelete={onDelete}
          />
        ))}
      </Flex>
    </Card>
  );
}

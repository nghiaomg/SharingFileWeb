"use client";

import { Flex, Box, Text, Card } from "@radix-ui/themes";
import { SharedItemRow } from "./SharedItemRow";
import type { SharedAccessItem } from "@/features/files/schemas";

interface SharedItemListProps {
  items: SharedAccessItem[];
  tab: "with-me" | "by-me";
  onPreview: (item: SharedAccessItem) => void;
}

function ListHeader({ tab }: { tab: "with-me" | "by-me" }) {
  return (
    <Flex
      px="4"
      py="3"
      style={{
        borderBottom: "1px solid var(--gray-a4)",
        backgroundColor: "var(--gray-a2)",
      }}
    >
      <Box style={{ flex: 4 }}>
        <Text
          size="2"
          weight="medium"
          style={{ color: "var(--muted-foreground)" }}
        >
          Tên tệp
        </Text>
      </Box>
      <Box style={{ flex: 3 }}>
        <Text
          size="2"
          weight="medium"
          style={{ color: "var(--muted-foreground)" }}
        >
          {tab === "with-me" ? "Chia sẻ bởi" : "Chia sẻ cho"}
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

export function SharedItemList({ items, tab, onPreview }: SharedItemListProps) {
  return (
    <Card
      size="1"
      variant="ghost"
      style={{ padding: 0, overflow: "hidden", border: "none" }}
    >
      <ListHeader tab={tab} />
      <Flex direction="column">
        {items.map((item, idx) => (
          <SharedItemRow
            key={item.id}
            item={item}
            tab={tab}
            isLast={idx === items.length - 1}
            onPreview={onPreview}
          />
        ))}
      </Flex>
    </Card>
  );
}

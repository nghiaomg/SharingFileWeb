"use client";

import { Clock } from "lucide-react";
import { Flex, Box, Heading, Text } from "@radix-ui/themes";

export function RecentPageEmptyState() {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      p="6"
      style={{
        minHeight: "400px",
        borderRadius: "var(--radius-5)",
        textAlign: "center",
      }}
    >
      <Box
        p="4"
        mb="4"
        style={{
          borderRadius: "100%",
          backgroundColor: "var(--gray-a3)",
        }}
      >
        <Clock style={{ width: 64, height: 64, color: "var(--gray-a5)" }} />
      </Box>
      <Heading size="6" mb="3" style={{ color: "var(--color-foreground)" }}>
        Không có tệp gần đây
      </Heading>
      <Text
        size="3"
        style={{ maxWidth: "24rem", color: "var(--muted-foreground)" }}
      >
        Những tệp bạn vừa mở, tải lên hoặc làm việc gần đây sẽ hiển thị ở đây.
      </Text>
    </Flex>
  );
}

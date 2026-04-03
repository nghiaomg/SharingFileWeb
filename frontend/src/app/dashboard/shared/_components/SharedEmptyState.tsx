import { Users } from "lucide-react";
import { Flex, Box, Heading, Text } from "@radix-ui/themes";

interface SharedEmptyStateProps {
  tab: "with-me" | "by-me";
}

export function SharedEmptyState({ tab }: SharedEmptyStateProps) {
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
        <Users
          style={{ width: 64, height: 64, color: "var(--gray-a5)" }}
        />
      </Box>
      <Heading
        size="6"
        mb="3"
        style={{ color: "var(--color-foreground)" }}
      >
        {tab === "with-me"
          ? "Chưa có ai chia sẻ tệp cho bạn"
          : "Bạn chưa chia sẻ tệp nào"}
      </Heading>
      <Text
        size="3"
        style={{ maxWidth: "24rem", color: "var(--muted-foreground)" }}
      >
        {tab === "with-me"
          ? "Khi người khác chia sẻ tệp cho bạn, tệp sẽ xuất hiện ở đây."
          : "Sử dụng nút Chia sẻ trên tệp để chia sẻ với người khác."}
      </Text>
    </Flex>
  );
}

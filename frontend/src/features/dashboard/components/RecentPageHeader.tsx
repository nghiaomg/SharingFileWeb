"use client";

import { Clock } from "lucide-react";
import { Flex, Box, Heading } from "@radix-ui/themes";
import { ViewModeToggle } from "./ViewModeToggle";

interface RecentPageHeaderProps {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

export function RecentPageHeader({
  viewMode,
  onViewModeChange,
}: RecentPageHeaderProps) {
  return (
    <Flex
      direction={{ initial: "column", sm: "row" }}
      align={{ initial: "stretch", sm: "end" }}
      justify="between"
      gap="4"
      px={{ initial: "4", sm: "6", lg: "8" }}
      py="5"
      className="relative z-10 bg-card/30 backdrop-blur-xl"
      style={{ borderBottom: "1px solid var(--gray-a4)", flexShrink: 0 }}
    >
      <Box>
        <Heading
          size="6"
          weight="bold"
          style={{
            letterSpacing: "-0.025em",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "var(--card-heading)",
          }}
        >
          <Clock
            style={{ width: 32, height: 32, color: "var(--icon-storage)" }}
          />
          Gần đây
        </Heading>
      </Box>

      <ViewModeToggle value={viewMode} onChange={onViewModeChange} />
    </Flex>
  );
}

"use client";

import { Share2 } from "lucide-react";
import { Flex, Box, Heading } from "@radix-ui/themes";
import { ViewModeToggle } from "@/features/dashboard/components/ViewModeToggle";

interface SharedPageHeaderProps {
  tab: "with-me" | "by-me";
  onTabChange: (tab: "with-me" | "by-me") => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

function TabButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <Box
      as="button"
      onClick={onClick}
      px="3"
      py="1"
      style={{
        cursor: "pointer",
        borderRadius: "var(--radius-2)",
        border: "none",
        background: isActive ? "var(--gray-a4)" : "transparent",
        color: isActive
          ? "var(--color-foreground)"
          : "var(--muted-foreground)",
        fontSize: "13px",
        fontWeight: 500,
        fontFamily: "inherit",
        transition: "all 0.2s",
        whiteSpace: "nowrap",
        minWidth: "52px",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.color = "var(--color-foreground)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.color = "var(--muted-foreground)";
        }
      }}
    >
      {label}
    </Box>
  );
}

export function SharedPageHeader({
  tab,
  onTabChange,
  viewMode,
  onViewModeChange,
}: SharedPageHeaderProps) {
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
          <Share2
            style={{ width: 32, height: 32, color: "var(--icon-storage)" }}
          />
          Chia sẻ
        </Heading>
      </Box>

      <Flex align="center" gap="3" style={{ flexShrink: 0 }}>
        {/* Tab switcher */}
        <Flex
          align="center"
          gap="1"
          p="1"
          style={{
            backgroundColor: "var(--gray-a2)",
            borderRadius: "var(--radius-3)",
            border: "1px solid var(--gray-a4)",
          }}
        >
          <TabButton
            label="Với tôi"
            isActive={tab === "with-me"}
            onClick={() => onTabChange("with-me")}
          />
          <TabButton
            label="Bởi tôi"
            isActive={tab === "by-me"}
            onClick={() => onTabChange("by-me")}
          />
        </Flex>

        {/* View mode toggle */}
        <ViewModeToggle value={viewMode} onChange={onViewModeChange} />
      </Flex>
    </Flex>
  );
}

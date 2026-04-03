"use client";

import { Flex, IconButton } from "@radix-ui/themes";

interface ViewModeToggleProps {
  value: "grid" | "list";
  onChange: (mode: "grid" | "list") => void;
}

export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  return (
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
      {/* Grid */}
      <IconButton
        size="2"
        variant="ghost"
        color="gray"
        onClick={() => onChange("grid")}
        style={{
          cursor: "pointer",
          ...(value === "grid"
            ? {
                background: "var(--gray-a4)",
                color: "var(--color-foreground)",
              }
            : { color: "var(--muted-foreground)" }),
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      </IconButton>

      {/* List */}
      <IconButton
        size="2"
        variant="ghost"
        color="gray"
        onClick={() => onChange("list")}
        style={{
          cursor: "pointer",
          ...(value === "list"
            ? {
                background: "var(--gray-a4)",
                color: "var(--color-foreground)",
              }
            : { color: "var(--muted-foreground)" }),
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      </IconButton>
    </Flex>
  );
}

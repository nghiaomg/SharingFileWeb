"use client";

import { Grid } from "@radix-ui/themes";
import { SharedItemCard } from "./SharedItemCard";
import type { SharedAccessItem } from "@/features/files/schemas";

interface SharedItemGridProps {
  items: SharedAccessItem[];
  tab: "with-me" | "by-me";
  onPreview: (item: SharedAccessItem) => void;
}

export function SharedItemGrid({ items, tab, onPreview }: SharedItemGridProps) {
  return (
    <Grid columns={{ initial: "1", sm: "2", lg: "3", xl: "4" }} gap="4">
      {items.map((item) => (
        <SharedItemCard
          key={item.id}
          item={item}
          tab={tab}
          onPreview={onPreview}
        />
      ))}
    </Grid>
  );
}

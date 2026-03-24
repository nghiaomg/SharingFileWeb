"use client";

import { Clock, Loader2 } from "lucide-react";
import { format, isToday, isYesterday, differenceInDays } from "date-fns";
import { vi } from "date-fns/locale";
import { useRecentFiles } from "@/features/files/queries";
import { useMemo } from "react";
import { FileCard } from "@/features/files/components/FileCard";
import { Grid } from "@radix-ui/themes";
import type { FileItem } from "@/features/files/schemas";

interface GroupedFilesItem {
    file: { id: string; name: string; type: string | null; size: number; createdAt: string };
    timeStr: string;
}

interface GroupedFiles {
    label: string;
    items: GroupedFilesItem[];
}

export default function RecentFilesPage() {
    const { data: files, isLoading } = useRecentFiles();

    const recentGroups: GroupedFiles[] = useMemo(() => {
        if (!files) return [];

        const groupsMap = new Map<string, GroupedFilesItem[]>();

        files.forEach(file => {
            const date = new Date(file.createdAt);
            let label = "";
            let timeStr = format(date, "HH:mm");

            if (isToday(date)) {
                label = "Hôm nay";
            } else if (isYesterday(date)) {
                label = "Hôm qua";
            } else {
                const diff = differenceInDays(new Date(), date);
                if (diff <= 7) {
                    label = "Tuần trước";
                    timeStr = format(date, "EEEE HH:mm", { locale: vi });
                } else {
                    label = "Cũ hơn";
                    timeStr = format(date, "dd MMM, yyyy HH:mm", { locale: vi });
                }
            }

            if (!groupsMap.has(label)) {
                groupsMap.set(label, []);
            }

            groupsMap.get(label)!.push({
                file,
                timeStr,
            });
        });

        const orderedLabels = ["Hôm nay", "Hôm qua", "Tuần trước", "Cũ hơn"];
        const finalGroups: GroupedFiles[] = [];

        orderedLabels.forEach(label => {
            if (groupsMap.has(label)) {
                finalGroups.push({ label, items: groupsMap.get(label)! });
            }
        });

        return finalGroups;
    }, [files]);

    return (
        <div className="p-8 pb-32">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <Clock className="w-8 h-8 text-primary" /> Gần đây
            </h1>

            {isLoading ? (
                <div className="text-muted-foreground flex items-center justify-center p-12">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" /> Đang tải...
                </div>
            ) : recentGroups.length === 0 ? (
                <div className="text-muted-foreground text-center p-12">Chưa có tệp lưu trữ nào.</div>
            ) : (
                <div className="space-y-12">
                    {recentGroups.map((group, i) => (
                        <div key={i} className="space-y-4">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-sm font-bold bg-secondary px-4 py-1.5 rounded-full border border-border">{group.label}</span>
                                <div className="h-px flex-1 bg-border/50"></div>
                            </div>

                            <Grid columns={{ initial: "1", sm: "2", lg: "3", xl: "5" }} gap="4">
                                {group.items.map((item) => (
                                    <FileCard 
                                        key={item.file.id} 
                                        file={item.file as unknown as FileItem} 
                                        variant="grid" 
                                        subtitle={item.timeStr}
                                        showDirectActions 
                                        onDownload={() => {}}
                                        onShare={() => {}}
                                    />
                                ))}
                            </Grid>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

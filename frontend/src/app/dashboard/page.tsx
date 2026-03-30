"use client";

import { FileText, ImageIcon, Video, HardDrive, TrendingUp, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { useDashboardCategories, useDashboardRecentFiles } from "@/features/dashboard/queries";
import { formatBytes } from "@/lib/format";
import { Box, Flex, Grid, Card, Heading, Text, Container } from "@radix-ui/themes";
import { FileCard } from "@/features/files/components/FileCard";
import type { FileItem } from "@/features/files/schemas";

const categoryIcons: Record<string, { icon: React.ElementType, colorName: string }> = {
    "document": { icon: FileText, colorName: "gray" },
    "image": { icon: ImageIcon, colorName: "gray" },
    "video": { icon: Video, colorName: "gray" },
    "other": { icon: HardDrive, colorName: "gray" },
};

function getCategoryUIKey(type?: string): string {
    if (!type) return "other";
    const t = type.toLowerCase();
    if (t.includes("image") || t.includes("hình")) return "image";
    if (t.includes("video")) return "video";
    if (t.includes("document") || t.includes("tài liệu") || t.includes("pdf")) return "document";
    return "other";
}

export default function DashboardPage() {
    const { data: categories, isLoading: isCatLoading, error: catError } = useDashboardCategories();
    const { data: recentFiles, isLoading: isRecentLoading, error: recentError } = useDashboardRecentFiles();

    const isLoading = isCatLoading || isRecentLoading;
    const error = catError || recentError;

    if (isLoading) {
        return (
            <Flex align="center" justify="center" style={{ flex: 1, padding: "2rem" }}>
                <Loader2 className="w-8 h-8 animate-spin text-zinc-900 dark:text-zinc-100" style={{ color: "var(--gray-12)" }} />
            </Flex>
        );
    }

    if (error) {
        return (
            <Box p="8" style={{ textAlign: "center" }}>
                <Text color="gray">Không thể tải dữ liệu tổng quan.</Text>
            </Box>
        );
    }

    const cats = categories || [];
    const recent = recentFiles || [];

    return (
        <Box p="6" pb="9" style={{ height: "100%", overflowY: "auto" }}>
            <Container size="4">
                {/* Overview Header */}
                <Box mb="6">
                    <Heading size="6" mb="1" weight="bold" style={{ color: "var(--card-heading)" }}>Tổng quan</Heading>
                    <Text size="3" style={{ color: "var(--muted-foreground)" }}>Xem nhanh tình trạng lưu trữ và các hoạt động gần đây.</Text>
                </Box>

                {/* Category Cards */}
                <Grid columns={{ initial: "1", sm: "2", lg: "4" }} gap="5">
                    {cats.length > 0 ? cats.map((cat, i) => {
                        const uiKey = getCategoryUIKey(cat.title);
                        const meta = categoryIcons[uiKey] || categoryIcons["other"];
                        const Icon = meta.icon;
                        return (
                            <Card key={i} size="3" variant="surface" style={{ transition: "all 0.2s" }} className="group hover:-translate-y-1">
                                <Flex align="start" justify="between" mb="4">
                                    <Box p="3" style={{ borderRadius: "var(--radius-3)", backgroundColor: `var(--${meta.colorName}-a3)` }}>
                                        <Icon style={{ width: 24, height: 24, color: `var(--${meta.colorName}-11)` }} />
                                    </Box>
                                    <TrendingUp className="w-4 h-4 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Flex>
                                <Heading size="7" mb="1" weight="bold" style={{ color: "var(--card-heading)" }}>{cat.files}</Heading>
                                <Text as="div" size="2" weight="medium" style={{ color: "var(--muted-foreground)" }}>{cat.title}</Text>
                                <Text as="div" size="1" mt="1" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-geist-mono)" }}>{formatBytes(cat.size)}</Text>
                            </Card>
                        );
                    }) : (
                        // Mặc định tĩnh nếu chưa có data
                        ["Tài liệu", "Hình ảnh", "Video", "Khác"].map((defaultType, i) => {
                            const defaultKeys = ["document", "image", "video", "other"];
                            const uiKey = defaultKeys[i];
                            const meta = categoryIcons[uiKey];
                            const Icon = meta.icon;
                            return (
                                <Card key={i} size="3" variant="surface" style={{ opacity: 0.7, filter: "grayscale(30%)" }}>
                                    <Flex align="start" justify="between" mb="4">
                                        <Box p="3" style={{ borderRadius: "var(--radius-3)", backgroundColor: `var(--${meta.colorName}-a3)` }}>
                                            <Icon style={{ width: 24, height: 24, color: `var(--${meta.colorName}-11)` }} />
                                        </Box>
                                    </Flex>
                                    <Heading size="7" mb="1" weight="bold" style={{ color: "var(--card-heading)" }}>0</Heading>
                                    <Text as="div" size="2" weight="medium" style={{ color: "var(--muted-foreground)" }}>{defaultType}</Text>
                                    <Text as="div" size="1" mt="1" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-geist-mono)" }}>0 B</Text>
                                </Card>
                            )
                        })
                    )}
                </Grid>

                {/* Recent Files */}
                <Card size="4" variant="surface" mt="6" style={{ overflow: "hidden", padding: 0 }}>
                    <Flex align="center" justify="between" p="5" style={{ borderBottom: "1px solid var(--gray-a6)" }}>
                        <Heading size="5" style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--card-heading)" }}>
                            <Clock className="w-5 h-5" style={{ color: "var(--icon-storage)" }} /> Tệp gần đây
                        </Heading>
                        <Link href="/dashboard/recent">
                            <Text size="2" weight="bold" color="gray" style={{ cursor: "pointer" }}>Xem tất cả</Text>
                        </Link>
                    </Flex>

                    <Flex direction="column">
                        {recent.length === 0 ? (
                            <Box p="6" style={{ textAlign: "center" }}>
                                <Text style={{ color: "var(--muted-foreground)" }}>Chưa có tệp nào.</Text>
                            </Box>
                        ) : (
                            recent.slice(0, 5).map((file, i) => (
                                <FileCard 
                                    key={file.id} 
                                    file={file as unknown as FileItem} 
                                    variant="list" 
                                    subtitle={`${formatBytes(file.size)} • ${new Date(file.createdAt).toLocaleDateString("vi-VN")}`}
                                    style={{
                                        borderBottom: i !== Math.min(recent.length, 5) - 1 ? "1px solid var(--gray-a4)" : "none",
                                    }}
                                />
                            ))
                        )}
                    </Flex>
                </Card>
            </Container>
        </Box>
    );
}

"use client";

import {
    Search, User, Settings, LogOut, HelpCircle, Menu
} from "lucide-react";
import Link from "next/link";
import { useCurrentUser } from "@/features/auth/queries";
import { useLogout } from "@/features/auth/mutations";
import { NotificationBell } from "./NotificationBell";
import { Flex, Box, TextField, IconButton, DropdownMenu, Text } from "@radix-ui/themes";

interface DashboardHeaderProps {
    userName?: string;
    onMenuClick?: () => void;
}

export function DashboardHeader({ userName, onMenuClick }: DashboardHeaderProps) {
    const { data: user } = useCurrentUser();
    const logoutMutation = useLogout();

    const displayName = userName || user?.username || "Người dùng";
    const initials = displayName.charAt(0).toUpperCase();

    return (
        <header className="h-16 border-b border-border/50 bg-card/30 backdrop-blur-xl flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
            {/* Mobile menu toggle */}
            <Box display={{ initial: "block", lg: "none" }} mr="2">
                <IconButton variant="ghost" color="gray" size="2" onClick={onMenuClick}>
                    <Menu className="w-5 h-5" />
                </IconButton>
            </Box>

            {/* Search */}
            <Box style={{ flex: 1, maxWidth: "36rem" }}>
                <TextField.Root size="2" placeholder="Tìm kiếm tệp, thư mục..." variant="surface" radius="large">
                    <TextField.Slot>
                        <Search className="w-4 h-4 text-muted-foreground" />
                    </TextField.Slot>
                </TextField.Root>
            </Box>

            {/* Actions */}
            <Flex align="center" gap="3" ml="4">
                {/* Notifications */}
                <NotificationBell />

                {/* Profile */}
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                        <button className="flex items-center gap-2 hover:bg-secondary rounded-xl px-2 py-1.5 transition-colors outline-none cursor-pointer">
                            <Box style={{ width: "32px", height: "32px", borderRadius: "100%", background: "linear-gradient(to top right, var(--violet-9), var(--purple-9))" }}>
                                <Flex align="center" justify="center" width="100%" height="100%">
                                    <Text size="2" weight="bold" style={{ color: "white" }}>{initials}</Text>
                                </Flex>
                            </Box>
                            <Text size="2" weight="medium" className="hidden sm:block">{displayName}</Text>
                        </button>
                    </DropdownMenu.Trigger>

                    <DropdownMenu.Content variant="solid" size="2" align="end" style={{ minWidth: "220px" }}>
                        <Flex direction="column" gap="1" p="2" style={{ borderBottom: "1px solid var(--gray-a4)" }}>
                            <Text size="2" weight="bold" truncate>{displayName}</Text>
                            <Text size="1" color="gray" truncate>{user?.email || ""}</Text>
                        </Flex>

                        <DropdownMenu.Item asChild>
                            <Link href="/dashboard/profile" className="flex items-center gap-2 w-full cursor-pointer">
                                <User className="w-4 h-4" /> Hồ sơ
                            </Link>
                        </DropdownMenu.Item>
                        <DropdownMenu.Item asChild>
                            <Link href="/dashboard/settings" className="flex items-center gap-2 w-full cursor-pointer">
                                <Settings className="w-4 h-4" /> Cài đặt
                            </Link>
                        </DropdownMenu.Item>
                        <DropdownMenu.Item asChild>
                            <Link href="#" className="flex items-center gap-2 w-full cursor-pointer">
                                <HelpCircle className="w-4 h-4" /> Trợ giúp
                            </Link>
                        </DropdownMenu.Item>

                        <DropdownMenu.Separator />

                        <DropdownMenu.Item 
                            color="red" 
                            className="flex items-center gap-2 w-full cursor-pointer"
                            onClick={() => logoutMutation.mutate()}
                        >
                            <LogOut className="w-4 h-4" /> Đăng xuất
                        </DropdownMenu.Item>
                    </DropdownMenu.Content>
                </DropdownMenu.Root>
            </Flex>
        </header>
    );
}

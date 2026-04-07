"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
    FileText,
    CheckCircle2,
    Bell,
    Check,
    Filter,
} from "lucide-react";
import {
    Box,
    Container,
    Heading,
    Text,
    Flex,
    Button,
    Card,
    Badge,
    Tabs,
} from "@radix-ui/themes";
import {
    useNotifications,
} from "@/features/files/share-queries";
import { useMarkNotificationRead } from "@/features/files/share-mutations";

export function NotificationsPage() {
    const { data: notifications = [], isLoading } = useNotifications();
    const markReadMutation = useMarkNotificationRead();
    const [filter, setFilter] = useState("all"); // 'all', 'unread', 'read'

    const filteredNotifications = notifications.filter((n) => {
        if (filter === "unread") return !n.isRead;
        if (filter === "read") return n.isRead;
        return true;
    });

    const handleMarkAsRead = (id: string) => {
        markReadMutation.mutate(id);
    };

    const handleMarkAllAsRead = () => {
        const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
        // Ideally backend should have a mark-all API but for now we iterate
        unreadIds.forEach(id => {
            markReadMutation.mutate(id);
        });
    };

    return (
        <Container size="3" py="6" px="4">
            <Flex direction="column" gap="5">
                <Flex justify="between" align="center">
                    <Flex align="center" gap="2">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Bell className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <Heading size="5">Thông báo của bạn</Heading>
                            <Text size="2" color="gray">
                                Quản lý các hoạt động và chia sẻ mới nhất
                            </Text>
                        </div>
                    </Flex>

                    <Button
                        variant="soft"
                        onClick={handleMarkAllAsRead}
                        disabled={!notifications.some(n => !n.isRead)}
                    >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Đánh dấu tất cả đã đọc
                    </Button>
                </Flex>

                <Tabs.Root value={filter} onValueChange={setFilter}>
                    <Tabs.List size="2">
                        <Tabs.Trigger value="all">
                            Tất cả
                            <Badge size="1" radius="full" ml="2" color="gray">
                                {notifications.length}
                            </Badge>
                        </Tabs.Trigger>
                        <Tabs.Trigger value="unread">
                            Chưa đọc
                            <Badge size="1" radius="full" ml="2" color="blue">
                                {notifications.filter(n => !n.isRead).length}
                            </Badge>
                        </Tabs.Trigger>
                        <Tabs.Trigger value="read">
                            Đã đọc
                        </Tabs.Trigger>
                    </Tabs.List>
                </Tabs.Root>

                <Box>
                    {isLoading ? (
                        <Text color="gray" size="2">Đang tải thông báo...</Text>
                    ) : filteredNotifications.length === 0 ? (
                        <Card variant="surface" className="flex flex-col items-center justify-center p-12 text-center">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <Bell className="w-6 h-6 text-primary" />
                            </div>
                            <Heading size="4" mb="2">Không có thông báo nào</Heading>
                            <Text size="2" color="gray">
                                Bạn đã xem hết tất cả thông báo hiện tại. Quay lại sau nhé!
                            </Text>
                        </Card>
                    ) : (
                        <Flex direction="column" gap="3">
                            {filteredNotifications.map((n) => (
                                <Card
                                    key={n.id}
                                    variant={n.isRead ? "surface" : "classic"}
                                    className={`transition-colors ${!n.isRead ? 'border-primary/20 bg-primary/5' : ''}`}
                                >
                                    <Flex justify="between" align="start" gap="4">
                                        <Flex gap="3" flexGrow="1">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                <FileText className="w-5 h-5 text-primary" />
                                            </div>
                                            <Box>
                                                <Flex align="center" gap="2" mb="1">
                                                    <Text size="3" weight="bold">
                                                        {n.title}
                                                    </Text>
                                                    {!n.isRead && (
                                                        <Badge size="1" color="blue">Mới</Badge>
                                                    )}
                                                </Flex>
                                                <Text size="2" color="gray" className="block mb-2">
                                                    {n.message}
                                                </Text>
                                                <Text size="1" color="gray">
                                                    {formatDistanceToNow(new Date(n.createdAt), {
                                                        addSuffix: true,
                                                        locale: vi,
                                                    })}
                                                </Text>
                                            </Box>
                                        </Flex>
                                        {!n.isRead && (
                                            <Button
                                                variant="ghost"
                                                size="1"
                                                onClick={() => handleMarkAsRead(n.id)}
                                            >
                                                <Check className="w-4 h-4 mr-1" />
                                                Đánh dấu đã đọc
                                            </Button>
                                        )}
                                    </Flex>
                                </Card>
                            ))}
                        </Flex>
                    )}
                </Box>
            </Flex>
        </Container>
    );
}

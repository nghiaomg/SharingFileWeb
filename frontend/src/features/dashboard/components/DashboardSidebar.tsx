"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  Clock,
  Share2,
  Trash2,
  Settings,
  HardDrive,
  Crown,
  X,
  Zap,
  FileUp,
  QrCode,
} from "lucide-react";
import { useStorageUsage } from "@/features/auth/queries";
import { getCurrentUser } from "@/features/auth/api";
import { formatBytes } from "@/lib/format";
import { Box, Flex, Text, Button, IconButton } from "@radix-ui/themes";

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Tổng quan" },
  { href: "/dashboard/files", icon: FolderOpen, label: "Tệp của tôi" },
  { href: "/dashboard/recent", icon: Clock, label: "Gần đây" },
  { href: "/dashboard/shared", icon: Share2, label: "Được chia sẻ" },
  { href: "/dashboard/trash", icon: Trash2, label: "Thùng rác" },
  { href: "/dashboard/payment", icon: QrCode, label: "Nạp tiền" },
];

const bottomItems = [
  { href: "/dashboard/settings", icon: Settings, label: "Cài đặt" },
];

export function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { data: storageData } = useStorageUsage();
  const user = getCurrentUser();

  const usedStorage = storageData?.usedStorage || 0;
  const MAX_STORAGE = user?.maxStorage || 5 * 1024 * 1024 * 1024; // Mặc định 5GB nếu ko có
  const usagePercent = Math.min(
    100,
    Math.max(0, (usedStorage / MAX_STORAGE) * 100),
  );

  return (
    <>
      {/* Overlay on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
                fixed lg:static inset-y-0 left-0 z-50 w-72 flex flex-col
                transform transition-transform duration-300 ease-in-out lg:translate-x-0
                ${isOpen ? "translate-x-0" : "-translate-x-full"}
            `}
        style={{
          background: "var(--color-background)",
          borderRight: "1px solid var(--color-border)",
        }}
      >
        {/* Logo */}
        <Flex
          align="center"
          justify="between"
          px="6"
          style={{ height: "4rem", borderBottom: "1px solid var(--gray-a4)" }}
        >
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <Flex
              align="center"
              justify="center"
              style={{
                width: "36px",
                height: "36px",
                background: "var(--accent-logo)",
                borderRadius: "var(--radius-4)",
                transition: "transform 0.3s",
              }}
              className="group-hover:rotate-12"
            >
              <FileUp
                style={{
                  color: "var(--color-logo-icon)",
                  width: "20px",
                  height: "20px",
                }}
              />
            </Flex>
            <Text
              size="4"
              weight="bold"
              style={{
                letterSpacing: "-0.025em",
                color: "var(--color-foreground)",
              }}
            >
              FileFlow
            </Text>
          </Link>
          <Box display={{ initial: "block", lg: "none" }}>
            <IconButton variant="ghost" color="gray" onClick={onClose}>
              <X className="w-5 h-5" />
            </IconButton>
          </Box>
        </Flex>

        {/* Nav Items */}
        <Box p="4" style={{ flex: 1, overflowY: "auto" }}>
          <Flex direction="column" gap="1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    !isActive
                      ? "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      : ""
                  }`}
                  style={
                    isActive
                      ? { background: "var(--gray-12)", color: "white" }
                      : {}
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </Flex>
        </Box>

        {/* Bottom Section */}
        <Box p="4" style={{ borderTop: "1px solid var(--gray-a4)" }}>
          {/* Storage Usage */}
          <Box
            p="4"
            mb="4"
            style={{
              background: "var(--gray-a3)",
              borderRadius: "var(--radius-4)",
            }}
          >
            <Flex align="center" justify="between" mb="3">
              <Text
                size="2"
                weight="bold"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "var(--color-foreground)",
                }}
              >
                <HardDrive
                  className="w-4 h-4"
                  style={{ color: "var(--icon-storage)" }}
                />{" "}
                Lưu trữ
              </Text>
              <Text
                size="1"
                style={{
                  color: "var(--muted-foreground)",
                  fontFamily: "var(--font-geist-mono)",
                }}
              >
                {formatBytes(usedStorage)} / {formatBytes(MAX_STORAGE)}
              </Text>
            </Flex>
            <Box
              style={{
                height: "8px",
                background: "var(--color-background)",
                borderRadius: "9999px",
                overflow: "hidden",
                marginBottom: "12px",
              }}
            >
              <Box
                style={{
                  height: "100%",
                  width: `${usagePercent}%`,
                  background:
                    "linear-gradient(to right, var(--gray-12), var(--gray-11))",
                  borderRadius: "9999px",
                  transition: "width 0.5s ease-in-out",
                }}
              />
            </Box>
            <Button
              asChild
              size="2"
              variant="soft"
              color="gray"
              style={{ width: "100%" }}
            >
              <Link href="/dashboard/upgrade">
                <Crown className="w-4 h-4" /> Nâng cấp Pro
              </Link>
            </Button>
          </Box>

          <Flex direction="column" gap="1">
            {bottomItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    !isActive
                      ? "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      : ""
                  }`}
                  style={
                    isActive
                      ? { background: "var(--gray-12)", color: "white" }
                      : {}
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </Flex>

          <Flex align="center" justify="center" gap="1" mt="3" mb="1">
            <Zap className="w-3 h-3" style={{ color: "var(--icon-version)" }} />
            <Text size="1" style={{ color: "var(--muted-foreground)" }}>
              FileFlow v2.4.0
            </Text>
          </Flex>
        </Box>
      </aside>
    </>
  );
}

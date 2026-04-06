"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  File,
  Database,
  CreditCard,
  Crown,
  Share2,
  Bell,
  X,
  ShieldAlert,
  ArrowLeft,
} from "lucide-react";
import { Box, Flex, Text, IconButton } from "@radix-ui/themes";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Tổng quan" },
  { href: "/admin/users", icon: Users, label: "Người dùng" },
  { href: "/admin/storage", icon: Database, label: "Quản lý Storage" },
  { href: "/admin/subscriptions", icon: Crown, label: "Gói đăng ký" },
  { href: "/admin/orders", icon: CreditCard, label: "Thanh toán" },
  { href: "/admin/shares", icon: Share2, label: "Chia sẻ" },
  { href: "/admin/notifications", icon: Bell, label: "Thông báo" },
];

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
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
        <Flex
          align="center"
          justify="between"
          px="6"
          style={{ height: "4rem", borderBottom: "1px solid var(--gray-a4)" }}
        >
          <Link href="/admin" className="flex items-center gap-2 group">
            <Flex
              align="center"
              justify="center"
              style={{
                width: "36px",
                height: "36px",
                background: "var(--accent-solid)",
                borderRadius: "var(--radius-4)",
                transition: "transform 0.3s",
              }}
              className="bg-red-600 group-hover:rotate-12"
            >
              <ShieldAlert
                style={{
                  color: "white",
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
              FileFlow Admin
            </Text>
          </Link>
          <Box display={{ initial: "block", lg: "none" }}>
            <IconButton variant="ghost" color="gray" onClick={onClose}>
              <X className="w-5 h-5" />
            </IconButton>
          </Box>
        </Flex>

        <Box p="4" style={{ flex: 1, overflowY: "auto" }}>
          <Flex direction="column" gap="1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
 relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
 transition-all duration-200 group
 ${!isActive ? "text-muted-foreground hover:bg-secondary hover:text-foreground" : ""}
 `}
                  style={
                    isActive
                      ? {
                          background: "var(--gray-a3)",
                          color: "var(--color-foreground)",
                          boxShadow:
                            "inset 3px 0 0 0 var(--gray-11), 0 2px 8px rgba(0,0,0,0.06)",
                        }
                      : {}
                  }
                >
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                      style={{
                        background: "var(--gray-11)",
                      }}
                    />
                  )}
                  <item.icon
                    className="w-5 h-5 transition-transform duration-200 group-hover:scale-110"
                    style={isActive ? { color: "var(--color-foreground)" } : {}}
                  />
                  {item.label}
                </Link>
              );
            })}
          </Flex>
        </Box>

        <Box p="4" style={{ borderTop: "1px solid var(--gray-a4)" }}>
          <Flex direction="column" gap="1">
            <Link
              href="/dashboard"
              className={`
 relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
 transition-all duration-200 group text-muted-foreground hover:bg-gray-a2 hover:text-foreground
 `}
            >
              <ArrowLeft className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1" />
              Quay lại ứng dụng
            </Link>
          </Flex>

          <Flex align="center" justify="center" gap="1" mt="4" mb="1">
            <Text size="1" style={{ color: "var(--muted-foreground)" }}>
              Admin Portal
            </Text>
          </Flex>
        </Box>
      </aside>
    </>
  );
}

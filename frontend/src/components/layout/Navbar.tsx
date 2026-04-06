"use client";

import * as React from "react";
import Link from "next/link";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { FileUp, ChevronDown, Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className="fixed top-0 w-full z-50 glass border-b border-white/10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center border border-primary/30">
            <FileUp className="text-primary-foreground w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            FileFlow
          </span>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu.Root className="hidden md:flex relative z-10 flex-1 justify-center">
          <NavigationMenu.List className="flex list-none gap-2">
            <NavigationMenu.Item className="flex items-center">
              <NavigationMenu.Trigger className="group flex items-center h-full gap-1 px-4 py-2 text-sm font-medium hover:text-primary transition-colors">
                Sản phẩm{" "}
                <ChevronDown className="w-4 h-4 group-data-[state=open]:rotate-180 transition-transform duration-200" />
              </NavigationMenu.Trigger>
              <NavigationMenu.Content className="absolute top-full left-0 mt-2 p-4 glass rounded-2xl w-48 border border-border animate-in fade-in slide-in-from-top-2">
                <ul className="flex flex-col gap-2">
                  <li>
                    <Link
                      href="/products/file-sharing"
                      className="block p-2 text-sm hover:bg-primary/10 rounded-lg"
                    >
                      Chia sẻ file
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="block p-2 text-sm hover:bg-primary/10 rounded-lg"
                    >
                      Quản lý phiên bản
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="block p-2 text-sm hover:bg-primary/10 rounded-lg"
                    >
                      Bảo mật
                    </Link>
                  </li>
                </ul>
              </NavigationMenu.Content>
            </NavigationMenu.Item>

            <NavigationMenu.Item className="flex items-center">
              <NavigationMenu.Trigger className="group flex items-center h-full gap-1 px-4 py-2 text-sm font-medium hover:text-primary transition-colors">
                Giải pháp{" "}
                <ChevronDown className="w-4 h-4 group-data-[state=open]:rotate-180 transition-transform duration-200" />
              </NavigationMenu.Trigger>
              <NavigationMenu.Content className="absolute top-full left-0 mt-2 p-4 glass rounded-2xl w-48 border border-border animate-in fade-in slide-in-from-top-2">
                <ul className="flex flex-col gap-2">
                  <li>
                    <Link
                      href="#"
                      className="block p-2 text-sm hover:bg-primary/10 rounded-lg"
                    >
                      Cá nhân
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="block p-2 text-sm hover:bg-primary/10 rounded-lg"
                    >
                      Doanh nghiệp
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="block p-2 text-sm hover:bg-primary/10 rounded-lg"
                    >
                      Giáo dục
                    </Link>
                  </li>
                </ul>
              </NavigationMenu.Content>
            </NavigationMenu.Item>

            <NavigationMenu.Item className="flex items-center">
              <Link
                href="#features"
                className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors flex items-center h-full"
              >
                Tính năng
              </Link>
            </NavigationMenu.Item>

            <NavigationMenu.Item className="flex items-center">
              <Link
                href="#pricing"
                className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors flex items-center h-full"
              >
                Bảng giá
              </Link>
            </NavigationMenu.Item>

            <NavigationMenu.Item className="flex items-center">
              <Link
                href="/docs"
                className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors flex items-center h-full"
              >
                Tài liệu
              </Link>
            </NavigationMenu.Item>

            <NavigationMenu.Item className="flex items-center">
              <Link
                href="/contact"
                className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors flex items-center h-full"
              >
                Liên hệ
              </Link>
            </NavigationMenu.Item>
          </NavigationMenu.List>
        </NavigationMenu.Root>

        <div className="hidden md:flex items-center gap-4 shrink-0">
          <ThemeToggle />
          <Link
            href="/login"
            className="whitespace-nowrap text-sm font-medium hover:text-primary transition-colors px-4 py-2"
          >
            Đăng nhập
          </Link>
          <Link
            href="/login"
            className="whitespace-nowrap bg-primary text-primary-foreground text-sm font-medium px-6 py-2 rounded-full border border-primary/40 hover:bg-primary/90 hover:border-primary transition-all"
          >
            Bắt đầu ngay
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute top-full left-0 w-full bg-background border-b border-border p-4 flex flex-col gap-4"
        >
          <Link href="#" className="py-2 border-b border-border">
            Sản phẩm
          </Link>
          <Link href="#" className="py-2 border-b border-border">
            Giải pháp
          </Link>
          <Link href="#features" className="py-2 border-b border-border">
            Tính năng
          </Link>
          <Link href="#pricing" className="py-2 border-b border-border">
            Bảng giá
          </Link>
          <Link href="/docs" className="py-2 border-b border-border">
            Tài liệu
          </Link>
          <Link href="/contact" className="py-2 border-b border-border">
            Liên hệ
          </Link>
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Giao diện</span>
              <ThemeToggle />
            </div>
            <Link
              href="/login"
              className="w-full text-center py-2 rounded-lg border border-border"
            >
              Đăng nhập
            </Link>
            <Link
              href="/login"
              className="w-full text-center py-2 rounded-lg bg-primary text-primary-foreground"
            >
              Đăng ký
            </Link>
          </div>
        </motion.div>
      )}
    </header>
  );
}

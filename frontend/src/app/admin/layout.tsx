"use client";

import { useState, useEffect } from "react";
import { AdminSidebar } from "@/features/admin/components/AdminSidebar";
import { Menu } from "lucide-react";
import { IconButton } from "@radix-ui/themes";
import { getCurrentUser } from "@/features/auth/api";
import { usePathname, notFound } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setTimeout(() => {
      const user = getCurrentUser();
      if (user && user.roles?.includes("ROLE_ADMIN")) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    }, 0);
  }, [pathname]);

  if (isAdmin === null) {
    return <div className="flex-1 flex h-screen bg-background" />;
  }

  if (isAdmin === false) {
    notFound();
  }

  return (
    <div className="flex h-screen bg-background text-foreground antialiased selection:bg-primary/20">
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col min-w-0 h-full relative z-0">
        <header className="lg:hidden flex items-center p-4 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30">
          <IconButton
            variant="ghost"
            color="gray"
            size="3"
            onClick={() => setSidebarOpen(true)}
            className="mr-3"
          >
            <Menu className="w-6 h-6" />
          </IconButton>
          <div className="font-bold text-lg">Admin Portal</div>
        </header>

        <div className="flex-1 overflow-x-hidden overflow-y-auto w-full relative">
          <div className="absolute inset-0 max-w-full p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

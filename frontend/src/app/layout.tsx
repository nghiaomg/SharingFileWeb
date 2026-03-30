import type { Metadata } from "next";
import { DM_Sans, Geist_Mono } from "next/font/google";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Toaster } from "sonner";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | FileFlow",
    default: "FileFlow - Lưu trữ và chia sẻ tệp an toàn",
  },
  description: "Nền tảng lưu trữ, quản lý và chia sẻ tệp tốc độ cao, bảo mật, không giới hạn.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${geistMono.variable} antialiased dark`}
        suppressHydrationWarning
      >
        <QueryProvider>
          <Theme accentColor="gray" radius="large" scaling="100%" hasBackground={false}>
            {children}
            <Toaster position="bottom-right" richColors theme="system" />
          </Theme>
        </QueryProvider>
      </body>
    </html>
  );
}

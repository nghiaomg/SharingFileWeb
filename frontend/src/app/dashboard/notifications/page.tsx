"use client";

import { useState } from "react";
import {
  Bell,
  FileUp,
  Share2,
  AlertCircle,
  CheckCircle2,
  Settings,
  Trash2,
  MoreVertical,
  Star,
  ShieldCheck,
  MailOpen,
  LucideIcon,
} from "lucide-react";
import Link from "next/link";

interface Notification {
  id: string;
  type: "upload" | "share" | "alert" | "system" | "security";
  title: string;
  desc: string;
  time: string;
  isRead: boolean;
  icon: LucideIcon;
  color: string;
  bg: string;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "upload",
    title: "Tải lên tài liệu hoàn tất",
    desc: "Tệp 'Project_Media.zip' (2.4 GB) đã được tải lên thành công và mã hóa an toàn.",
    time: "2 phút trước",
    isRead: false,
    icon: FileUp,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    id: "2",
    type: "share",
    title: "Được chia sẻ mới",
    desc: "Nguyễn Thị B đã chia sẻ thư mục 'Marketing_Assets' với bạn kèm quyền chỉnh sửa.",
    time: "1 giờ trước",
    isRead: false,
    icon: Share2,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    id: "3",
    type: "alert",
    title: "Sắp đầy dung lượng lưu trữ",
    desc: "Bạn đã sử dụng 90% (4.5GB/5.0GB) dung lượng lưu trữ của thẻ Basic. Hãy cân nhắc nâng cấp.",
    time: "Hôm qua lúc 15:40",
    isRead: false,
    icon: AlertCircle,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    id: "4",
    type: "system",
    title: "Cập nhật ứng dụng thành công",
    desc: "Phiên bản FileFlow v2.4.0 đã hoàn tất triển khai. Bạn có thể tận hưởng công nghệ tăng tốc tải xuống mới.",
    time: "05 Th03, 10:20",
    isRead: true,
    icon: Star,
    color: "text-zinc-900 dark:text-zinc-100",
    bg: "bg-zinc-500/10",
  },
  {
    id: "5",
    type: "security",
    title: "Phát hiện đăng nhập thiết bị mới",
    desc: "Tài khoản của bạn vừa đăng nhập từ Mac OS (Trình duyệt Safari) tại Hồ Chí Minh, Việt Nam.",
    time: "04 Th03, 22:15",
    isRead: true,
    icon: ShieldCheck,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    id: "6",
    type: "upload",
    title: "Tải lên tài liệu hoàn tất",
    desc: "Tệp 'Q1_Financial_Report.xlsx' đã được tải lên thành công.",
    time: "02 Th03, 08:30",
    isRead: true,
    icon: FileUp,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    id: "7",
    type: "share",
    title: "Yêu cầu quyền truy cập File",
    desc: "Trần Anh Quân đang yêu cầu quyền truy cập thư mục 'Báo giá nội bộ'.",
    time: "28 Th02, 14:00",
    isRead: true,
    icon: Share2,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const displayNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="p-4 md:p-8 pb-32 w-full h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <Bell className="w-8 h-8 text-primary shrink-0" /> Tất cả thông báo
            {unreadCount > 0 && (
              <span className="bg-rose-500/10 text-rose-500 text-xs md:text-sm font-bold px-3 py-1 rounded-full border border-rose-500/20 whitespace-nowrap">
                {unreadCount} mới
              </span>
            )}
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={markAllAsRead}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground font-medium rounded-xl hover:bg-secondary/80 transition-colors shadow-sm text-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            disabled={unreadCount === 0}
          >
            <MailOpen className="w-4 h-4" /> Đánh dấu tất cả đã đọc
          </button>
          <Link
            href="/dashboard/settings"
            className="p-2.5 bg-background border border-border shadow-sm text-foreground rounded-xl hover:bg-secondary/80 transition-colors cursor-pointer shrink-0"
          >
            <Settings className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 border-b border-border/50 pb-4 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 text-sm font-bold rounded-full transition-colors cursor-pointer shrink-0 ${filter === "all" ? "bg-primary text-white shadow-md" : "bg-card text-muted-foreground hover:bg-secondary border border-border/50"}`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 text-sm font-bold rounded-full transition-colors flex items-center gap-2 cursor-pointer shrink-0 ${filter === "unread" ? "bg-primary text-white shadow-md" : "bg-card text-muted-foreground hover:bg-secondary border border-border/50"}`}
        >
          Chưa đọc
          <span
            className={`w-2 h-2 rounded-full ${filter === "unread" ? "bg-white" : "bg-rose-500"}`}
          ></span>
        </button>
      </div>

      {/* Notification List */}
      <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm flex-1">
        {displayNotifications.length > 0 ? (
          <div className="divide-y divide-border/50">
            {displayNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-5 flex gap-5 transition-colors group cursor-pointer ${notif.isRead ? "hover:bg-muted/20 opacity-80" : "bg-primary/5 hover:bg-primary/10"}`}
              >
                {/* Unread indicator dot */}
                <div className="mt-4 flex-shrink-0 w-2 h-2 rounded-full hidden sm:block">
                  {!notif.isRead && (
                    <div className="w-full h-full bg-rose-500 rounded-full animate-pulse"></div>
                  )}
                </div>

                <div
                  className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border border-border/50 shadow-sm ${notif.bg}`}
                >
                  <notif.icon className={`w-6 h-6 ${notif.color}`} />
                </div>

                <div className="flex-1 min-w-0 pr-4">
                  <h4
                    className={`text-base font-bold mb-1 ${notif.isRead ? "text-foreground/80" : "text-foreground"}`}
                  >
                    {notif.title}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {notif.desc}
                  </p>
                  <span className="text-xs font-semibold text-muted-foreground/70 bg-background px-2 py-1 rounded-md border border-border/50">
                    {notif.time}
                  </span>
                </div>

                <div className="hidden sm:flex shrink-0 flex-col justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 text-muted-foreground hover:text-foreground bg-background border border-border shadow-sm rounded-lg transition-colors cursor-pointer">
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  <div className="flex gap-2">
                    {!notif.isRead && (
                      <button
                        onClick={(e) => markAsRead(notif.id, e)}
                        className="p-2 hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-500 rounded-lg transition-colors tooltip-trigger cursor-pointer"
                        title="Đánh dấu đã đọc"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => deleteNotification(notif.id, e)}
                      className="p-2 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 rounded-lg transition-colors tooltip-trigger cursor-pointer"
                      title="Xóa thông báo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
              <Bell className="w-10 h-10 opacity-30" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              Chưa có thông báo nào
            </h3>
            <p className="max-w-sm text-center">
              Tất cả thông tin cập nhật, thư mục mới được chia sẻ sẽ hiển thị
              tại đây.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

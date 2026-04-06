"use client";

import {
  useAdminOverview,
  useAdminCharts,
  useAdminLoginMethods,
  useAdminRecentActions,
} from "../../hooks/useDashboardQuery";
import { PieChartDataDTO, ActionLogDTO } from "../../types/dashboard.types";
import {
  Loader2,
  Users,
  File,
  HardDrive,
  Banknote,
  AlertCircle,
  Clock,
  ChevronRight,
} from "lucide-react";
import { formatBytes } from "@/lib/format";
import { useState } from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// Util format currency if not exists
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export function AdminOverview() {
  const router = useRouter();
  const [days, setDays] = useState(7);

  const { data: overview, isLoading: loadingOverview } = useAdminOverview();
  const { data: charts, isLoading: loadingCharts } = useAdminCharts(days);
  const { data: loginMethods, isLoading: loadingLogin } =
    useAdminLoginMethods();
  const { data: actions, isLoading: loadingActions } = useAdminRecentActions();

  if (loadingOverview || loadingCharts || loadingLogin || loadingActions) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Tổng Users",
      value: overview?.totalUsers?.toLocaleString() || "0",
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "File đã tải lên",
      value: overview?.totalFiles?.toLocaleString() || "0",
      icon: File,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      title: "Dung lượng Cloud",
      value: formatBytes(overview?.totalStorageBytes || 0),
      icon: HardDrive,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "Tổng Doanh thu",
      value: formatCurrency(overview?.totalRevenue || 0),
      icon: Banknote,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="p-6 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors flex items-center gap-4 group"
          >
            <div
              className={`p-4 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}
            >
              <stat.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-1">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Tốc độ Tăng trưởng</h3>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="px-3 py-1.5 bg-secondary text-secondary-foreground text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value={7}>7 Ngày qua</option>
              <option value={14}>14 Ngày qua</option>
              <option value={30}>30 Ngày qua</option>
            </select>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={charts || []}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={(val) => {
                    const date = new Date(val);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="left"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ paddingTop: "20px" }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="uploadedFiles"
                  fill="#3b82f6"
                  name="Files Tải lên"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="newUsers"
                  stroke="#10b981"
                  name="Users Mới"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Login Methods Pie Chart */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-6">Phương thức Đăng nhập</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={loginMethods || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                >
                  {(loginMethods || []).map((entry: PieChartDataDTO, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Actions List */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-muted-foreground" />
          Lịch sử Hoạt động Gần đây
        </h3>

        {!actions || actions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Chưa có hoạt động nào.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {actions.map((action: ActionLogDTO) => (
              <div
                key={action.id + action.createdAt}
                onClick={() => router.push(action.url)}
                className="py-4 flex items-center justify-between cursor-pointer hover:bg-secondary/20 transition-colors px-2 rounded-lg group"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {action.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(action.createdAt), "HH:mm, dd/MM/yyyy", {
                      locale: vi,
                    })}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        )}
      </div>

      {!overview?.totalUsers && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 rounded-lg flex items-center gap-3 text-sm font-medium">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          Đang hiển thị dữ liệu Offline Fallback. (Yêu cầu trỏ Backend API
          `/admin-overview` để lấy 100% dữ liệu thực)
        </div>
      )}
    </div>
  );
}

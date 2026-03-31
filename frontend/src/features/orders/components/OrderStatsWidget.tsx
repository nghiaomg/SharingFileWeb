import React from "react";
import { useOrderStatsQuery } from "../hooks/useOrderStatsQuery";
import { DollarSign, Package, Clock, CheckCircle } from "lucide-react";

export const OrderStatsWidget = () => {
    const { data: stats, isLoading, isError } = useOrderStatsQuery();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse h-28"></div>
                ))}
            </div>
        );
    }

    if (isError || !stats) {
        return null;
    }

    const items = [
        {
            label: "Tổng doanh thu",
            value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalRevenue),
            icon: <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
            bg: "bg-emerald-100 dark:bg-emerald-900/30"
        },
        {
            label: "Tổng số đơn",
            value: stats.totalOrders.toLocaleString('vi-VN'),
            icon: <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
            bg: "bg-blue-100 dark:bg-blue-900/30"
        },
        {
            label: "Đơn chờ duyệt",
            value: stats.pendingOrders.toLocaleString('vi-VN'),
            icon: <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />,
            bg: "bg-yellow-100 dark:bg-yellow-900/30"
        },
        {
            label: "Đơn thành công",
            value: stats.confirmedOrders.toLocaleString('vi-VN'),
            icon: <CheckCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
            bg: "bg-indigo-100 dark:bg-indigo-900/30"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 relative z-10">
            {items.map((item, index) => (
                <div
                    key={index}
                    className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{item.label}</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</h3>
                        </div>
                        <div className={`p-3 rounded-full ${item.bg}`}>
                            {item.icon}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

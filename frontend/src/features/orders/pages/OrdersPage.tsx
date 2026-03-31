"use client";

import React from "react";
import { OrderFilters } from "../components/OrderFilters";
import { OrderStatsWidget } from "../components/OrderStatsWidget";
import { OrderTable } from "../components/OrderTable";
import { OrderDetailsModal } from "../components/OrderDetailsModal";

export default function OrdersPage() {
    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">

                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Quản lý Giao dịch
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Theo dõi doanh thu và trạng thái các đơn hàng mua gói dịch vụ
                    </p>
                </header>

                <OrderStatsWidget />
                <OrderFilters />

                <div className="relative z-0">
                    <OrderTable />
                </div>

                <OrderDetailsModal />
            </div>
        </div>
    );
}

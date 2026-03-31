import React, { useState } from "react";
import { useOrdersStore } from "../stores/orders.store";
import { Search } from "lucide-react";

export const OrderFilters = () => {
  const { filters, setFilters } = useOrdersStore();
  const [localUserId, setLocalUserId] = useState(filters.userId || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ userId: localUserId, page: 0 });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ status: e.target.value, page: 0 });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <form onSubmit={handleSearch} className="flex-1 relative">
        <label htmlFor="search" className="sr-only">
          Tìm kiếm theo User ID
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="search"
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
            placeholder="Tìm kiếm theo mã User ID..."
            value={localUserId}
            onChange={(e) => setLocalUserId(e.target.value)}
          />
        </div>
      </form>

      <div className="sm:w-48">
        <select
          aria-label="Filter by status"
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
          value={filters.status || ""}
          onChange={handleStatusChange}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="PENDING">Đang chờ (Pending)</option>
          <option value="CONFIRMED">Đã duyệt (Confirmed)</option>
          <option value="EXPIRED">Đã hủy/Hết hạn (Expired)</option>
        </select>
      </div>
    </div>
  );
};

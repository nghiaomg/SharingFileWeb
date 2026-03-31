export interface Order {
    id: string;
    userId: string;
    orderCode: string;
    planName: string;
    amount: number;
    status: 'PENDING' | 'CONFIRMED' | 'EXPIRED';
    transactionId?: string;
    createdAt: string;
    expiredAt: string;
    confirmedAt?: string;
}

export interface OrderStats {
    totalRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    confirmedOrders: number;
    expiredOrders: number;
}

export interface PaginatedOrders {
    orders: Order[];
    currentPage: number;
    totalItems: number;
    totalPages: number;
}

export interface OrderFilters {
    page: number;
    size: number;
    status?: string;
    userId?: string;
}

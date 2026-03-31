package com.sharingfileweb.payload.response;

import java.util.List;
import java.util.Map;

public class OrderStatsResponse {
    private long totalRevenue;
    private long totalOrders;
    private long pendingOrders;
    private long confirmedOrders;
    private long expiredOrders;
    // Có thể thêm doanh thu theo ngày/tháng
    
    public OrderStatsResponse() {}

    public OrderStatsResponse(long totalRevenue, long totalOrders, long pendingOrders, long confirmedOrders, long expiredOrders) {
        this.totalRevenue = totalRevenue;
        this.totalOrders = totalOrders;
        this.pendingOrders = pendingOrders;
        this.confirmedOrders = confirmedOrders;
        this.expiredOrders = expiredOrders;
    }

    // Getters and Setters
    public long getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(long totalRevenue) { this.totalRevenue = totalRevenue; }
    public long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }
    public long getPendingOrders() { return pendingOrders; }
    public void setPendingOrders(long pendingOrders) { this.pendingOrders = pendingOrders; }
    public long getConfirmedOrders() { return confirmedOrders; }
    public void setConfirmedOrders(long confirmedOrders) { this.confirmedOrders = confirmedOrders; }
    public long getExpiredOrders() { return expiredOrders; }
    public void setExpiredOrders(long expiredOrders) { this.expiredOrders = expiredOrders; }
}

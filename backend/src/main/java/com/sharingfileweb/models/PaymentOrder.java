package com.sharingfileweb.models;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "payment_orders")
public class PaymentOrder {
    @Id
    private String id;
    private String userId;
    private String orderCode;
    private String planName;
    private long amount;
    private String status; // PENDING, CONFIRMED, EXPIRED
    private String transactionId;
    
    private Instant createdAt = Instant.now();
    private Instant expiredAt;
    private Instant confirmedAt;

    public PaymentOrder() {
    }

    public PaymentOrder(String userId, String orderCode, String planName, long amount) {
        this.userId = userId;
        this.orderCode = orderCode;
        this.planName = planName;
        this.amount = amount;
        this.status = "PENDING";
        // Mặc định hết hạn sau 15 phút
        this.expiredAt = this.createdAt.plusSeconds(15 * 60); 
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getOrderCode() {
        return orderCode;
    }

    public void setOrderCode(String orderCode) {
        this.orderCode = orderCode;
    }

    public String getPlanName() {
        return planName;
    }

    public void setPlanName(String planName) {
        this.planName = planName;
    }

    public long getAmount() {
        return amount;
    }

    public void setAmount(long amount) {
        this.amount = amount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getExpiredAt() {
        return expiredAt;
    }

    public void setExpiredAt(Instant expiredAt) {
        this.expiredAt = expiredAt;
    }

    public Instant getConfirmedAt() {
        return confirmedAt;
    }

    public void setConfirmedAt(Instant confirmedAt) {
        this.confirmedAt = confirmedAt;
    }
}

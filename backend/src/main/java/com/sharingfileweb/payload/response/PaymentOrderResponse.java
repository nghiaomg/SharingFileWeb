package com.sharingfileweb.payload.response;

import java.time.Instant;

import com.sharingfileweb.models.PaymentOrder;

public class PaymentOrderResponse {
    private String id;
    private String orderCode;
    private String planName;
    private long amount;
    private String status;
    private String qrUrl;
    private Instant createdAt;
    private Instant expiredAt;

    public PaymentOrderResponse() {
    }

    public PaymentOrderResponse(PaymentOrder order, String qrUrl) {
        this.id = order.getId();
        this.orderCode = order.getOrderCode();
        this.planName = order.getPlanName();
        this.amount = order.getAmount();
        this.status = order.getStatus();
        this.qrUrl = qrUrl;
        this.createdAt = order.getCreatedAt();
        this.expiredAt = order.getExpiredAt();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public String getQrUrl() {
        return qrUrl;
    }

    public void setQrUrl(String qrUrl) {
        this.qrUrl = qrUrl;
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
}

package com.sharingfileweb.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

public class CreateSubscriptionPlanRequest {

    @NotBlank(message = "Tên gói cước không được để trống")
    private String name;

    @NotBlank(message = "Tên hiển thị không được để trống")
    private String displayName;

    private String description = "";

    @PositiveOrZero(message = "Dung lượng lưu trữ phải >= 0")
    private long maxStorage;

    @PositiveOrZero(message = "Kích thước file tối đa phải >= 0")
    private long maxFileSize;

    @PositiveOrZero(message = "Giá phải >= 0")
    private long price;

    private int durationDays = 30;
    private int sortOrder = 0;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public long getMaxStorage() {
        return maxStorage;
    }

    public void setMaxStorage(long maxStorage) {
        this.maxStorage = maxStorage;
    }

    public long getMaxFileSize() {
        return maxFileSize;
    }

    public void setMaxFileSize(long maxFileSize) {
        this.maxFileSize = maxFileSize;
    }

    public long getPrice() {
        return price;
    }

    public void setPrice(long price) {
        this.price = price;
    }

    public int getDurationDays() {
        return durationDays;
    }

    public void setDurationDays(int durationDays) {
        this.durationDays = durationDays;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(int sortOrder) {
        this.sortOrder = sortOrder;
    }
}

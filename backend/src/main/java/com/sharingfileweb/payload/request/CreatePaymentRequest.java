package com.sharingfileweb.payload.request;

import jakarta.validation.constraints.NotBlank;

public class CreatePaymentRequest {
    @NotBlank(message = "Tên gói cước không được để trống")
    private String planName;

    public String getPlanName() {
        return planName;
    }

    public void setPlanName(String planName) {
        this.planName = planName;
    }
}

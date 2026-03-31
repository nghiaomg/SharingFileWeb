package com.sharingfileweb.payload.request;

import jakarta.validation.constraints.NotBlank;

public class ZaloLoginRequest {

    @NotBlank
    private String code;

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}

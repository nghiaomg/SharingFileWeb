package com.sharingfileweb.payload.request;

import jakarta.validation.constraints.NotBlank;

import com.fasterxml.jackson.annotation.JsonProperty;

public class GoogleLoginRequest {
    @NotBlank
    @JsonProperty("id_token")
    private String idToken;

    public String getIdToken() {
        return idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }
}

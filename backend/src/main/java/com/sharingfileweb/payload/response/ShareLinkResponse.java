package com.sharingfileweb.payload.response;

import java.time.Instant;

public class ShareLinkResponse {
    private String id;
    private String token;
    private String fullUrl;
    private String permission;
    private boolean hasPassword;
    private Instant expiresAt;
    private boolean isRevoked;
    private Instant createdAt;

    public ShareLinkResponse(String id, String token, String fullUrl, String permission, boolean hasPassword, Instant expiresAt, boolean isRevoked, Instant createdAt) {
        this.id = id;
        this.token = token;
        this.fullUrl = fullUrl;
        this.permission = permission;
        this.hasPassword = hasPassword;
        this.expiresAt = expiresAt;
        this.isRevoked = isRevoked;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getFullUrl() { return fullUrl; }
    public void setFullUrl(String fullUrl) { this.fullUrl = fullUrl; }
    public String getPermission() { return permission; }
    public void setPermission(String permission) { this.permission = permission; }
    public boolean isHasPassword() { return hasPassword; }
    public void setHasPassword(boolean hasPassword) { this.hasPassword = hasPassword; }
    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
    public boolean isRevoked() { return isRevoked; }
    public void setRevoked(boolean revoked) { isRevoked = revoked; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

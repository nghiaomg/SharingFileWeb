package com.sharingfileweb.dto;

import java.time.Instant;

/**
 * Mở rộng ShareLinkResponse — thêm viewCount và remainingViews.
 * Dùng cho API trả về chi tiết link chia sẻ cho owner.
 */
public class ShareLinkDetailResponse {

    private String id;
    private String token;
    private String fullUrl;
    private String permission;
    private boolean hasPassword;
    private Instant expiresAt;
    private boolean isRevoked;
    private Instant createdAt;
    private Long viewCount;
    private Long remainingViews; // null = unlimited
    private Long expiresInSeconds;

    public ShareLinkDetailResponse() {}

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
    public void setRevoked(boolean revoked) { this.isRevoked = revoked; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Long getViewCount() { return viewCount; }
    public void setViewCount(Long viewCount) { this.viewCount = viewCount; }

    public Long getRemainingViews() { return remainingViews; }
    public void setRemainingViews(Long remainingViews) { this.remainingViews = remainingViews; }

    public Long getExpiresInSeconds() { return expiresInSeconds; }
    public void setExpiresInSeconds(Long expiresInSeconds) { this.expiresInSeconds = expiresInSeconds; }
}

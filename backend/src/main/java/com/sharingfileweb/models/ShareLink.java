package com.sharingfileweb.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "share_links")
public class ShareLink {
    @Id
    private String id;

    private String fileId;

    @Indexed(unique = true)
    private String token;

    private String ownerId;

    private String permission; // "VIEW", "DOWNLOAD"

    private String password; // BCrypt hash, nullable

    private Instant expiresAt; // nullable = never expires

    private boolean isRevoked;

    private Instant createdAt;

    // ─── NEW FIELDS ──────────────────────────────────────────────────────────

    /** Số lượt truy cập đã dùng — tăng mỗi lần validate. */
    private Long viewCount = 0L;

    /** Số lượt tối đa — null = không giới hạn. */
    private Long maxViews; // nullable

    // ─── END NEW FIELDS ──────────────────────────────────────────────────────

    public ShareLink() {}

    public ShareLink(String fileId, String token, String ownerId, String permission, String password, Instant expiresAt) {
        this.fileId = fileId;
        this.token = token;
        this.ownerId = ownerId;
        this.permission = permission;
        this.password = password;
        this.expiresAt = expiresAt;
        this.isRevoked = false;
        this.createdAt = Instant.now();
        this.viewCount = 0L;
        this.maxViews = null;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFileId() { return fileId; }
    public void setFileId(String fileId) { this.fileId = fileId; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getOwnerId() { return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }

    public String getPermission() { return permission; }
    public void setPermission(String permission) { this.permission = permission; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }

    public boolean isRevoked() { return isRevoked; }
    public void setRevoked(boolean revoked) { isRevoked = revoked; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    // ─── NEW GETTERS/SETTERS ──────────────────────────────────────────────

    public Long getViewCount() { return viewCount; }
    public void setViewCount(Long viewCount) { this.viewCount = viewCount; }

    public Long getMaxViews() { return maxViews; }
    public void setMaxViews(Long maxViews) { this.maxViews = maxViews; }

    /** Tính số lượt còn lại. Null nếu unlimited. */
    public Long getRemainingViews() {
        if (maxViews == null) return null;
        long remaining = maxViews - viewCount;
        return remaining < 0 ? 0L : remaining;
    }
}

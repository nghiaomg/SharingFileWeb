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
}

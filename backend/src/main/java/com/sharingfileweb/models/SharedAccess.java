package com.sharingfileweb.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "shared_access")
public class SharedAccess {
    @Id
    private String id;

    private String fileId;

    private String ownerId;

    private String ownerEmail;

    private String recipientEmail;

    private String permission; // "VIEW", "DOWNLOAD"

    private boolean isRevoked;

    private Instant createdAt;

    public SharedAccess() {}

    public SharedAccess(String fileId, String ownerId, String ownerEmail, String recipientEmail, String permission) {
        this.fileId = fileId;
        this.ownerId = ownerId;
        this.ownerEmail = ownerEmail;
        this.recipientEmail = recipientEmail;
        this.permission = permission;
        this.isRevoked = false;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFileId() { return fileId; }
    public void setFileId(String fileId) { this.fileId = fileId; }

    public String getOwnerId() { return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }

    public String getOwnerEmail() { return ownerEmail; }
    public void setOwnerEmail(String ownerEmail) { this.ownerEmail = ownerEmail; }

    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }

    public String getPermission() { return permission; }
    public void setPermission(String permission) { this.permission = permission; }

    public boolean isRevoked() { return isRevoked; }
    public void setRevoked(boolean revoked) { isRevoked = revoked; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

package com.sharingfileweb.payload.response;

import java.time.Instant;

public class SharedAccessResponse {
    private String id;
    private String fileId;
    private String fileName;
    private String fileType;
    private long fileSize;
    private String ownerEmail;
    private String recipientEmail;
    private String permission;
    private Instant createdAt;

    public SharedAccessResponse(String id, String fileId, String fileName, String fileType, long fileSize, String ownerEmail, String recipientEmail, String permission, Instant createdAt) {
        this.id = id;
        this.fileId = fileId;
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.ownerEmail = ownerEmail;
        this.recipientEmail = recipientEmail;
        this.permission = permission;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getFileId() { return fileId; }
    public void setFileId(String fileId) { this.fileId = fileId; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    public long getFileSize() { return fileSize; }
    public void setFileSize(long fileSize) { this.fileSize = fileSize; }
    public String getOwnerEmail() { return ownerEmail; }
    public void setOwnerEmail(String ownerEmail) { this.ownerEmail = ownerEmail; }
    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }
    public String getPermission() { return permission; }
    public void setPermission(String permission) { this.permission = permission; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

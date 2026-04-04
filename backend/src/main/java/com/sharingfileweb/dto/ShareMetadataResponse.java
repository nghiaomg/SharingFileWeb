package com.sharingfileweb.dto;

import java.time.Instant;

/**
 * Response cho GET /api/public/share/{token} —
 * trả metadata file mà không cần presigned URL.
 */
public class ShareMetadataResponse {

    private String fileName;
    private String fileType;
    private long fileSize;
    private String permission;  // "VIEW" | "DOWNLOAD"
    private Instant expiresAt;
    private Long remainingViews; // null = unlimited
    private boolean hasPassword;

    public ShareMetadataResponse() {}

    public ShareMetadataResponse(String fileName, String fileType, long fileSize,
                                 String permission, Instant expiresAt,
                                 Long remainingViews, boolean hasPassword) {
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.permission = permission;
        this.expiresAt = expiresAt;
        this.remainingViews = remainingViews;
        this.hasPassword = hasPassword;
    }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public long getFileSize() { return fileSize; }
    public void setFileSize(long fileSize) { this.fileSize = fileSize; }

    public String getPermission() { return permission; }
    public void setPermission(String permission) { this.permission = permission; }

    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }

    public Long getRemainingViews() { return remainingViews; }
    public void setRemainingViews(Long remainingViews) { this.remainingViews = remainingViews; }

    public boolean isHasPassword() { return hasPassword; }
    public void setHasPassword(boolean hasPassword) { this.hasPassword = hasPassword; }
}

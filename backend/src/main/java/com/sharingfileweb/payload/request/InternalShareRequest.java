package com.sharingfileweb.payload.request;

import java.time.Instant;
import java.util.List;

public class InternalShareRequest {
    private String fileId;
    private List<String> emails;
    private String permission; // "VIEW", "DOWNLOAD"
    /** Ngày hết hạn quyền chia sẻ — nullable = không hết hạn. */
    private Long expiresInDays;

    public String getFileId() { return fileId; }
    public void setFileId(String fileId) { this.fileId = fileId; }

    public List<String> getEmails() { return emails; }
    public void setEmails(List<String> emails) { this.emails = emails; }

    public String getPermission() { return permission; }
    public void setPermission(String permission) { this.permission = permission; }

    public Long getExpiresInDays() { return expiresInDays; }
    public void setExpiresInDays(Long expiresInDays) { this.expiresInDays = expiresInDays; }

    /** Convert expiresInDays to Instant. */
    public Instant getExpiresAt() {
        if (expiresInDays == null || expiresInDays <= 0) return null;
        return Instant.now().plusSeconds(expiresInDays * 86400);
    }
}

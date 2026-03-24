package com.sharingfileweb.payload.request;

public class CreateShareLinkRequest {
    private String fileId;
    private String permission; // "VIEW", "DOWNLOAD"
    private String password;   // nullable
    private Long expiresInDays; // nullable = never

    public String getFileId() { return fileId; }
    public void setFileId(String fileId) { this.fileId = fileId; }

    public String getPermission() { return permission; }
    public void setPermission(String permission) { this.permission = permission; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Long getExpiresInDays() { return expiresInDays; }
    public void setExpiresInDays(Long expiresInDays) { this.expiresInDays = expiresInDays; }
}

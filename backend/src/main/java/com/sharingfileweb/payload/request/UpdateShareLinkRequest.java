package com.sharingfileweb.payload.request;

public class UpdateShareLinkRequest {
    private String permission; // "VIEW", "DOWNLOAD"
    private String password;   // nullable (empty string to remove, null to keep existing)
    private Long expiresInDays; // nullable (null to keep existing, -1 to remove expiry)

    public String getPermission() { return permission; }
    public void setPermission(String permission) { this.permission = permission; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Long getExpiresInDays() { return expiresInDays; }
    public void setExpiresInDays(Long expiresInDays) { this.expiresInDays = expiresInDays; }
}

package com.sharingfileweb.payload.request;

public class UpdatePermissionRequest {
    private String permission; // "VIEW", "DOWNLOAD"

    public String getPermission() { return permission; }
    public void setPermission(String permission) { this.permission = permission; }
}

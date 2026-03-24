package com.sharingfileweb.payload.request;

import java.util.List;

public class InternalShareRequest {
    private String fileId;
    private List<String> emails;
    private String permission; // "VIEW", "DOWNLOAD"

    public String getFileId() { return fileId; }
    public void setFileId(String fileId) { this.fileId = fileId; }

    public List<String> getEmails() { return emails; }
    public void setEmails(List<String> emails) { this.emails = emails; }

    public String getPermission() { return permission; }
    public void setPermission(String permission) { this.permission = permission; }
}

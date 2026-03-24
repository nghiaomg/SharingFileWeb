package com.sharingfileweb.payload.request;

import java.util.List;

public class ShareFileRequest {
  private String accessMode; // "PRIVATE", "PUBLIC", "RESTRICTED"
  private List<String> sharedEmails;
  private Long expiresInDays; // Optional: số ngày hết hạn. null = vĩnh viễn

  public String getAccessMode() {
    return accessMode;
  }

  public void setAccessMode(String accessMode) {
    this.accessMode = accessMode;
  }

  public List<String> getSharedEmails() {
    return sharedEmails;
  }

  public void setSharedEmails(List<String> sharedEmails) {
    this.sharedEmails = sharedEmails;
  }

  public Long getExpiresInDays() {
    return expiresInDays;
  }

  public void setExpiresInDays(Long expiresInDays) {
    this.expiresInDays = expiresInDays;
  }
}

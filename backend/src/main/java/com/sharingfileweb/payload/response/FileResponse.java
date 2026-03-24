package com.sharingfileweb.payload.response;

import java.time.Instant;
import java.util.List;

public class FileResponse {
  private String id;
  private String name;
  private String type;
  private long size;
  private String folderId;
  private Instant createdAt;
  private boolean isPublic;
  private String accessMode;
  private List<String> sharedEmails;
  private Instant shareExpiresAt;

  public FileResponse(String id, String name, String type, long size, String folderId, Instant createdAt, boolean isPublic, String accessMode, List<String> sharedEmails, Instant shareExpiresAt) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.size = size;
    this.folderId = folderId;
    this.createdAt = createdAt;
    this.isPublic = isPublic;
    this.accessMode = accessMode;
    this.sharedEmails = sharedEmails;
    this.shareExpiresAt = shareExpiresAt;
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public long getSize() {
    return size;
  }

  public void setSize(long size) {
    this.size = size;
  }

  public String getFolderId() {
    return folderId;
  }

  public void setFolderId(String folderId) {
    this.folderId = folderId;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }

  public boolean isPublic() {
    return isPublic;
  }

  public void setPublic(boolean isPublic) {
    this.isPublic = isPublic;
  }

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

  public Instant getShareExpiresAt() {
    return shareExpiresAt;
  }

  public void setShareExpiresAt(Instant shareExpiresAt) {
    this.shareExpiresAt = shareExpiresAt;
  }
}

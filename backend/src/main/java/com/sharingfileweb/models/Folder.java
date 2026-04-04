package com.sharingfileweb.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "folders")
public class Folder {
  @Id
  private String id;

  private String name;

  private String ownerId;

  private String parentId; // null or empty means root folder

  private Instant createdAt;

  private Instant updatedAt;

  private boolean isDeleted;

  private Instant deletedAt;

  // ─── DEPRECATED SHARING FIELDS ──────────────────────────────────────────
  // Giữ lại cho backward compatibility — KHÔNG dùng trong logic phân quyền mới.
  // Dùng SharedAccess và ShareLink thay thế.

  /** @deprecated */
  @Deprecated
  private String accessMode = "PRIVATE";

  /** @deprecated */
  @Deprecated
  private java.util.List<String> sharedEmails = new java.util.ArrayList<>();

  /** @deprecated */
  @Deprecated
  private Instant shareExpiresAt;

  // ─── END DEPRECATED FIELDS ─────────────────────────────────────────────

  public Folder() {
  }

  public Folder(String name, String ownerId, String parentId) {
    this.name = name;
    this.ownerId = ownerId;
    this.parentId = parentId;
    this.createdAt = Instant.now();
    this.updatedAt = Instant.now();
    this.isDeleted = false;
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
    this.updatedAt = Instant.now();
  }

  public String getOwnerId() {
    return ownerId;
  }

  public void setOwnerId(String ownerId) {
    this.ownerId = ownerId;
  }

  public String getParentId() {
    return parentId;
  }

  public void setParentId(String parentId) {
    this.parentId = parentId;
    this.updatedAt = Instant.now();
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(Instant updatedAt) {
    this.updatedAt = updatedAt;
  }

  public boolean isDeleted() {
    return isDeleted;
  }

  public void setDeleted(boolean deleted) {
    isDeleted = deleted;
  }

  public Instant getDeletedAt() {
    return deletedAt;
  }

  public void setDeletedAt(Instant deletedAt) {
    this.deletedAt = deletedAt;
  }

  // ─── DEPRECATED GETTERS/SETTERS (backward compatibility only) ───────
  /** @deprecated */
  @Deprecated
  public String getAccessMode() { return accessMode; }
  /** @deprecated */
  @Deprecated
  public void setAccessMode(String accessMode) { this.accessMode = accessMode; }
  /** @deprecated */
  @Deprecated
  public java.util.List<String> getSharedEmails() { return sharedEmails; }
  /** @deprecated */
  @Deprecated
  public void setSharedEmails(java.util.List<String> sharedEmails) { this.sharedEmails = sharedEmails; }
  /** @deprecated */
  @Deprecated
  public Instant getShareExpiresAt() { return shareExpiresAt; }
  /** @deprecated */
  @Deprecated
  public void setShareExpiresAt(Instant shareExpiresAt) { this.shareExpiresAt = shareExpiresAt; }
}

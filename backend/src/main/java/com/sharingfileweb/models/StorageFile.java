package com.sharingfileweb.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;
import java.util.ArrayList;

@Document(collection = "storage_files")
public class StorageFile {
  @Id
  private String id;

  private String name;

  private String type; // MIME type

  private long size; // Bytes

  private String ownerId;

  private String folderId; // null or empty means root folder

  private String storedPath; // Physical path or relative path on server

  private Instant createdAt;

  private boolean isPublic; // Legacy, keep for backward compatibility or migrate

  private String accessMode; // "PRIVATE", "PUBLIC", "RESTRICTED"

  private List<String> sharedEmails;

  private Instant shareExpiresAt;

  private boolean isDeleted;

  private java.util.Date deletedAt;

  public StorageFile() {
  }

  public StorageFile(String name, String type, long size, String ownerId, String folderId, String storedPath) {
    this.name = name;
    this.type = type;
    this.size = size;
    this.ownerId = ownerId;
    this.folderId = folderId;
    this.storedPath = storedPath;
    this.createdAt = Instant.now();
    this.isPublic = false;
    this.accessMode = "PRIVATE";
    this.sharedEmails = new ArrayList<>();
    this.shareExpiresAt = null;
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

  public String getOwnerId() {
    return ownerId;
  }

  public void setOwnerId(String ownerId) {
    this.ownerId = ownerId;
  }

  public String getFolderId() {
    return folderId;
  }

  public void setFolderId(String folderId) {
    this.folderId = folderId;
  }

  public String getStoredPath() {
    return storedPath;
  }

  public void setStoredPath(String storedPath) {
    this.storedPath = storedPath;
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

  public boolean isDeleted() {
    return isDeleted;
  }

  public void setDeleted(boolean isDeleted) {
    this.isDeleted = isDeleted;
  }

  public java.util.Date getDeletedAt() {
    return deletedAt;
  }

  public void setDeletedAt(java.util.Date deletedAt) {
    this.deletedAt = deletedAt;
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

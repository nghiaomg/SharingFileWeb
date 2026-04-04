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

  private String storedPath; // DEPRECATED — giữ lại cho backward compatibility với data cũ

  private String b2FileId;   // Backblaze B2 file ID

  private String b2FileName; // Backblaze B2 file name (path in bucket: {ownerId}/{uuid}.ext)

  private Instant createdAt;

  /**
   * @deprecated Bỏ khỏi logic phân quyền — luôn dùng ShareLink và SharedAccess.
   *             Giữ lại cho backward compatibility.
   */
  @Deprecated
  private boolean isPublic;

  /**
   * @deprecated Bỏ khỏi logic phân quyền — tất cả file mới luôn là PRIVATE.
   *             Giữ lại cho backward compatibility.
   */
  @Deprecated
  private String accessMode; // "PRIVATE", "PUBLIC", "RESTRICTED"

  /**
   * @deprecated Bỏ khỏi logic phân quyền — dùng SharedAccess thay thế.
   */
  @Deprecated
  private List<String> sharedEmails;

  /**
   * @deprecated Bỏ khỏi logic phân quyền.
   */
  @Deprecated
  private Instant shareExpiresAt;

  // ─── NEW FIELDS ────────────────────────────────────────────────────────────

  /** Phiên bản file — tăng mỗi lần update (dùng cho cache busting). */
  private Long version = 1L;

  /** SHA-256 hex hash của nội dung file — set lúc upload. */
  private String contentHash;

  // ─── END NEW FIELDS ────────────────────────────────────────────────────────

  private boolean isDeleted;

  private java.util.Date deletedAt;

  public StorageFile() {
  }

  // Constructor legacy (disk storage)
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
    this.version = 1L;
    this.contentHash = null;
  }

  // Constructor mới cho B2 storage
  public StorageFile(String name, String type, long size, String ownerId, String folderId, String b2FileId, String b2FileName) {
    this.name = name;
    this.type = type;
    this.size = size;
    this.ownerId = ownerId;
    this.folderId = folderId;
    this.b2FileId = b2FileId;
    this.b2FileName = b2FileName;
    this.createdAt = Instant.now();
    this.isPublic = false;
    this.accessMode = "PRIVATE";
    this.sharedEmails = new ArrayList<>();
    this.shareExpiresAt = null;
    this.isDeleted = false;
    this.version = 1L;
    this.contentHash = null;
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

  public String getB2FileId() {
    return b2FileId;
  }

  public void setB2FileId(String b2FileId) {
    this.b2FileId = b2FileId;
  }

  public String getB2FileName() {
    return b2FileName;
  }

  public void setB2FileName(String b2FileName) {
    this.b2FileName = b2FileName;
  }

  // ─── NEW GETTERS/SETTERS ──────────────────────────────────────────────────

  public Long getVersion() {
    return version;
  }

  public void setVersion(Long version) {
    this.version = version;
  }

  public String getContentHash() {
    return contentHash;
  }

  public void setContentHash(String contentHash) {
    this.contentHash = contentHash;
  }
}

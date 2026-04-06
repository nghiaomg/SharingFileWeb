package com.sharingfileweb.payload.response;

import java.time.Instant;

public class FolderResponse {
  private String id;
  private String name;
  private String parentId;
  private Instant createdAt;
  private Instant updatedAt;
  private boolean isBanned;

  public FolderResponse(String id, String name, String parentId, Instant createdAt, Instant updatedAt, boolean isBanned) {
    this.id = id;
    this.name = name;
    this.parentId = parentId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.isBanned = isBanned;
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

  public String getParentId() {
    return parentId;
  }

  public void setParentId(String parentId) {
    this.parentId = parentId;
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

  public boolean isBanned() {
    return isBanned;
  }

  public void setBanned(boolean banned) {
    isBanned = banned;
  }
}

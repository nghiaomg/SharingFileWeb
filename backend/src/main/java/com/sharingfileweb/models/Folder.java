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

  public Folder() {
  }

  public Folder(String name, String ownerId, String parentId) {
    this.name = name;
    this.ownerId = ownerId;
    this.parentId = parentId;
    this.createdAt = Instant.now();
    this.updatedAt = Instant.now();
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
}

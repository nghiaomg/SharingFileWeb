package com.sharingfileweb.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateFolderRequest {
  @NotBlank
  @Size(max = 255)
  private String name;

  private String parentId; // Optional, null if root

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
}

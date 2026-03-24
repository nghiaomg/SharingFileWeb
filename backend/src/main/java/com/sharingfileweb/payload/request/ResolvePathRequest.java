package com.sharingfileweb.payload.request;

import jakarta.validation.constraints.NotBlank;

public class ResolvePathRequest {

    @NotBlank(message = "Path is required")
    private String path;

    private String parentId; // optional

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getParentId() {
        return parentId;
    }

    public void setParentId(String parentId) {
        this.parentId = parentId;
    }
}

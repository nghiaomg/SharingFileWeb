package com.sharingfileweb.payload.response;

import java.time.Instant;

public class RecentFileDTO {
    private String id;
    private String name;
    private long size;
    private String type;
    private Instant createdAt;
    private String category;

    public RecentFileDTO() {}

    public RecentFileDTO(String id, String name, long size, String type, Instant createdAt) {
        this.id = id;
        this.name = name;
        this.size = size;
        this.type = type;
        this.createdAt = createdAt;
        this.category = determineCategory(type);
    }

    private String determineCategory(String mimeType) {
        if (mimeType == null) return "Khác";
        if (mimeType.startsWith("image/")) return "Hình ảnh";
        if (mimeType.startsWith("video/")) return "Video";
        if (mimeType.contains("pdf") || mimeType.contains("document") || mimeType.contains("msword") || mimeType.contains("excel") || mimeType.contains("powerpoint") || mimeType.contains("text/")) {
            return "Tài liệu";
        }
        return "Khác";
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

    public long getSize() {
        return size;
    }

    public void setSize(long size) {
        this.size = size;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
        this.category = determineCategory(type);
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public String getCategory() {
        return category;
    }
}

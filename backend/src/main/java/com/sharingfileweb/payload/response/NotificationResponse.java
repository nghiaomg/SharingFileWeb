package com.sharingfileweb.payload.response;

import java.time.Instant;
import java.util.Map;

public class NotificationResponse {
    private String id;
    private String type;
    private String title;
    private String message;
    private Map<String, String> metadata;
    private boolean isRead;
    private Instant createdAt;

    public NotificationResponse(String id, String type, String title, String message, Map<String, String> metadata, boolean isRead, Instant createdAt) {
        this.id = id;
        this.type = type;
        this.title = title;
        this.message = message;
        this.metadata = metadata;
        this.isRead = isRead;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Map<String, String> getMetadata() { return metadata; }
    public void setMetadata(Map<String, String> metadata) { this.metadata = metadata; }
    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

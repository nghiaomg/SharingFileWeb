package com.sharingfileweb.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.Map;

@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;

    private String recipientEmail;

    private String type; // "FILE_SHARED"

    private String title;

    private String message;

    private Map<String, String> metadata; // fileId, fileName, senderName...

    private boolean isRead;

    private Instant createdAt;

    public Notification() {}

    public Notification(String recipientEmail, String type, String title, String message, Map<String, String> metadata) {
        this.recipientEmail = recipientEmail;
        this.type = type;
        this.title = title;
        this.message = message;
        this.metadata = metadata;
        this.isRead = false;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }

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

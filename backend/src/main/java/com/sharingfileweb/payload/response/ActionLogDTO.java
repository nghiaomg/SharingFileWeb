package com.sharingfileweb.payload.response;

import java.time.Instant;

public class ActionLogDTO {
    private String id;
    private String type; // USER, FILE, FOLDER, ORDER
    private String description;
    private String url;
    private Instant createdAt;

    public ActionLogDTO(String id, String type, String description, String url, Instant createdAt) {
        this.id = id;
        this.type = type;
        this.description = description;
        this.url = url;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

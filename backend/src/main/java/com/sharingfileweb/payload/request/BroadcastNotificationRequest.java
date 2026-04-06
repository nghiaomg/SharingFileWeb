package com.sharingfileweb.payload.request;

import jakarta.validation.constraints.NotBlank;
import java.util.Map;

public class BroadcastNotificationRequest {
    @NotBlank
    private String title;
    
    @NotBlank
    private String message;
    
    private String targetEmail; // "ALL" or specific email
    
    private String type; // e.g. "SYSTEM", "ALERT"
    
    private Map<String, String> metadata;

    public BroadcastNotificationRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getTargetEmail() { return targetEmail; }
    public void setTargetEmail(String targetEmail) { this.targetEmail = targetEmail; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Map<String, String> getMetadata() { return metadata; }
    public void setMetadata(Map<String, String> metadata) { this.metadata = metadata; }
}

package com.sharingfileweb.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * Audit log cho mọi lượt truy cập file (download/view/preview).
 * Phục vụ bảo mật và phân tích.
 */
@Document(collection = "access_logs")
public class AccessLog {

    public enum AccessType {
        DOWNLOAD,
        VIEW,
        PREVIEW
    }

    @Id
    private String id;

    @Indexed
    private String fileId;

    private String fileName;

    /**
     * userId nếu đã đăng nhập, "anonymous" nếu qua ShareLink không auth.
     */
    private String accessedBy;

    @Indexed
    private AccessType accessType;

    /**
     * Điền token nếu truy cập qua ShareLink.
     */
    @Indexed
    private String shareToken;

    @Indexed
    private Instant accessedAt;

    private String ipAddress;

    private String userAgent;

    public AccessLog() {}

    private AccessLog(Builder b) {
        this.fileId = b.fileId;
        this.fileName = b.fileName;
        this.accessedBy = b.accessedBy;
        this.accessType = b.accessType;
        this.shareToken = b.shareToken;
        this.accessedAt = b.accessedAt;
        this.ipAddress = b.ipAddress;
        this.userAgent = b.userAgent;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String fileId;
        private String fileName;
        private String accessedBy;
        private AccessType accessType;
        private String shareToken;
        private Instant accessedAt;
        private String ipAddress;
        private String userAgent;

        public Builder fileId(String v) { this.fileId = v; return this; }
        public Builder fileName(String v) { this.fileName = v; return this; }
        public Builder accessedBy(String v) { this.accessedBy = v; return this; }
        public Builder accessType(AccessType v) { this.accessType = v; return this; }
        public Builder shareToken(String v) { this.shareToken = v; return this; }
        public Builder accessedAt(Instant v) { this.accessedAt = v; return this; }
        public Builder ipAddress(String v) { this.ipAddress = v; return this; }
        public Builder userAgent(String v) { this.userAgent = v; return this; }

        public AccessLog build() {
            if (this.accessedAt == null) this.accessedAt = Instant.now();
            return new AccessLog(this);
        }
    }

    // Getters
    public String getId() { return id; }
    public String getFileId() { return fileId; }
    public String getFileName() { return fileName; }
    public String getAccessedBy() { return accessedBy; }
    public AccessType getAccessType() { return accessType; }
    public String getShareToken() { return shareToken; }
    public Instant getAccessedAt() { return accessedAt; }
    public String getIpAddress() { return ipAddress; }
    public String getUserAgent() { return userAgent; }
}

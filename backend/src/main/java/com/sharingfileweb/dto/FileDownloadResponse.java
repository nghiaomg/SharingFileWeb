package com.sharingfileweb.dto;

import java.time.Instant;

/**
 * Response trả về khi download file — chứa presigned URL tạm thời.
 */
public class FileDownloadResponse {

    private String url;
    private String fileName;
    private String fileType;
    private long fileSize;
    private Instant expiresAt;
    private Long version;

    public FileDownloadResponse() {}

    public FileDownloadResponse(String url, String fileName, String fileType,
                                long fileSize, Instant expiresAt, Long version) {
        this.url = url;
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.expiresAt = expiresAt;
        this.version = version;
    }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public long getFileSize() { return fileSize; }
    public void setFileSize(long fileSize) { this.fileSize = fileSize; }

    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }

    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }
}

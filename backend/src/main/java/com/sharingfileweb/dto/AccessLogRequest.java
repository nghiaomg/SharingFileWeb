package com.sharingfileweb.dto;

import com.sharingfileweb.entity.AccessLog;
import jakarta.servlet.http.HttpServletRequest;

/**
 * Request object passed to AccessLogService.logFileAccess().
 * Immutable — build via constructor or builder.
 */
public class AccessLogRequest {

    private final String fileId;
    private final String fileName;
    private final String accessedBy;
    private final AccessLog.AccessType accessType;
    private final String shareToken;
    private final String ipAddress;
    private final String userAgent;

    public AccessLogRequest(String fileId, String fileName, String accessedBy,
                            AccessLog.AccessType accessType, String shareToken,
                            String ipAddress, String userAgent) {
        this.fileId = fileId;
        this.fileName = fileName;
        this.accessedBy = accessedBy;
        this.accessType = accessType;
        this.shareToken = shareToken;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
    }

    public static AccessLogRequest fromServletRequest(
            String fileId, String fileName, String accessedBy,
            AccessLog.AccessType accessType, String shareToken,
            HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) ip = request.getRemoteAddr();
        return new AccessLogRequest(
                fileId, fileName, accessedBy, accessType, shareToken,
                ip, request.getHeader("User-Agent")
        );
    }

    public String getFileId() { return fileId; }
    public String getFileName() { return fileName; }
    public String getAccessedBy() { return accessedBy; }
    public AccessLog.AccessType getAccessType() { return accessType; }
    public String getShareToken() { return shareToken; }
    public String getIpAddress() { return ipAddress; }
    public String getUserAgent() { return userAgent; }

    public AccessLog toEntity() {
        return AccessLog.builder()
                .fileId(fileId)
                .fileName(fileName)
                .accessedBy(accessedBy)
                .accessType(accessType)
                .shareToken(shareToken)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .build();
    }
}

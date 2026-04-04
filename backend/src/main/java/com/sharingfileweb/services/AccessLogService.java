package com.sharingfileweb.services;

import com.sharingfileweb.dto.AccessLogRequest;
import com.sharingfileweb.entity.AccessLog;
import com.sharingfileweb.repository.AccessLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Async fire-and-forget access logging service.
 * Logs every file access (download/view/preview) without blocking the request.
 */
@Service
public class AccessLogService {

    private static final Logger log = LoggerFactory.getLogger(AccessLogService.class);

    @Autowired
    private AccessLogRepository accessLogRepository;

    /**
     * Async log — fire and forget.
     * Failures are silently swallowed to avoid impacting the user request.
     */
    @Async("accessLogExecutor")
    public void logFileAccess(String fileId, String fileName, String accessedBy,
                               AccessLog.AccessType accessType, String shareToken,
                               HttpServletRequest request) {
        try {
            AccessLogRequest req = AccessLogRequest.fromServletRequest(
                    fileId, fileName, accessedBy, accessType, shareToken, request
            );
            accessLogRepository.save(req.toEntity());
        } catch (Exception e) {
            // Silently log to app logs — don't let logging failures affect user requests
            log.warn("[AccessLog] Failed to log access for fileId={}: {}", fileId, e.getMessage());
        }
    }

    /**
     * Overload without HttpServletRequest (e.g., background jobs).
     */
    public void logFileAccess(String fileId, String fileName, String accessedBy,
                               AccessLog.AccessType accessType, String shareToken,
                               String ipAddress, String userAgent) {
        try {
            AccessLog entity = AccessLog.builder()
                    .fileId(fileId)
                    .fileName(fileName)
                    .accessedBy(accessedBy)
                    .accessType(accessType)
                    .shareToken(shareToken)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .build();
            accessLogRepository.save(entity);
        } catch (Exception e) {
            log.warn("[AccessLog] Failed to log access for fileId={}: {}", fileId, e.getMessage());
        }
    }
}

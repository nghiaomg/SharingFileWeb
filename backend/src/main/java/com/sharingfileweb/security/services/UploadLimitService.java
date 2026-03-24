package com.sharingfileweb.security.services;

import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Tracks active concurrent upload sessions per user.
 * Prevents API abuse (bypassing the frontend upload queue).
 *
 * Limits: Each user may have at most MAX_CONCURRENT_UPLOADS active
 * uploadId sessions at a time. Both chunk uploads and merge (complete)
 * operations count against this limit.
 */
@Service
public class UploadLimitService {

    private static final int MAX_CONCURRENT_UPLOADS = 3;

    // userId -> set of active uploadIds
    private final Map<String, Set<String>> activeUploads = new ConcurrentHashMap<>();

    /**
     * Try to register a new upload session for a user.
     *
     * @return true if allowed, false if the user already has too many concurrent uploads.
     */
    public boolean tryRegister(String userId, String uploadId) {
        Set<String> sessions = activeUploads.computeIfAbsent(
            userId, k -> Collections.newSetFromMap(new ConcurrentHashMap<>())
        );

        // If uploadId is already tracked, allow it (it's a resuming chunk)
        if (sessions.contains(uploadId)) {
            return true;
        }

        if (sessions.size() >= MAX_CONCURRENT_UPLOADS) {
            return false;
        }

        sessions.add(uploadId);
        return true;
    }

    /**
     * Release a finished/cancelled upload session for a user.
     */
    public void release(String userId, String uploadId) {
        Set<String> sessions = activeUploads.get(userId);
        if (sessions != null) {
            sessions.remove(uploadId);
            if (sessions.isEmpty()) {
                activeUploads.remove(userId);
            }
        }
    }

    public int getActiveCount(String userId) {
        Set<String> sessions = activeUploads.get(userId);
        return sessions == null ? 0 : sessions.size();
    }
}

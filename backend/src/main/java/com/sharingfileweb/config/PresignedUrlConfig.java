package com.sharingfileweb.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

/**
 * Centralized configuration for presigned URL expiration durations.
 * All presigned URLs now expire after 1 minute for security.
 * Values are configurable via application.properties:
 *   storage.presigned.preview=1m
 *   storage.presigned.download=1m
 *   storage.presigned.share-link-default=1m
 */
@Configuration
@ConfigurationProperties(prefix = "storage.presigned")
public class PresignedUrlConfig {

    /** Inline/preview URLs — 12 hours expiration for security. */
    private Duration preview = Duration.ofHours(12);

    /** Direct download URLs — 12 hours expiration for security. */
    private Duration download = Duration.ofHours(12);

    /** Default expiry for share links when no explicit expiry is set. */
    private Duration shareLinkDefault = Duration.ofHours(12);

    public Duration getPreview() { return preview; }
    public void setPreview(Duration preview) { this.preview = preview; }

    public Duration getDownload() { return download; }
    public void setDownload(Duration download) { this.download = download; }

    public Duration getShareLinkDefault() { return shareLinkDefault; }
    public void setShareLinkDefault(Duration shareLinkDefault) { this.shareLinkDefault = shareLinkDefault; }

    /** Convert Duration to seconds for B2 SDK. */
    public int getPreviewSeconds() { return (int) preview.toSeconds(); }
    public int getDownloadSeconds() { return (int) download.toSeconds(); }
    public int getShareLinkDefaultSeconds() { return (int) shareLinkDefault.toSeconds(); }
}

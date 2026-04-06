package com.sharingfileweb.config;

import org.junit.jupiter.api.Test;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for PresignedUrlConfig.
 * Verifies that all presigned URL durations are set to 1 minute (60 seconds).
 */
class PresignedUrlConfigTest {

    @Test
    void getPreview_shouldReturn1MinuteDuration() {
        PresignedUrlConfig config = new PresignedUrlConfig();
        config.setPreview(Duration.ofMinutes(1));

        Duration result = config.getPreview();

        assertEquals(Duration.ofMinutes(1), result);
        assertEquals(60, result.toSeconds());
    }

    @Test
    void getDownload_shouldReturn1MinuteDuration() {
        PresignedUrlConfig config = new PresignedUrlConfig();
        config.setDownload(Duration.ofMinutes(1));

        Duration result = config.getDownload();

        assertEquals(Duration.ofMinutes(1), result);
        assertEquals(60, result.toSeconds());
    }

    @Test
    void getShareLinkDefault_shouldReturn1MinuteDuration() {
        PresignedUrlConfig config = new PresignedUrlConfig();
        config.setShareLinkDefault(Duration.ofMinutes(1));

        Duration result = config.getShareLinkDefault();

        assertEquals(Duration.ofMinutes(1), result);
        assertEquals(60, result.toSeconds());
    }

    @Test
    void getPreviewSeconds_shouldReturn60() {
        PresignedUrlConfig config = new PresignedUrlConfig();
        config.setPreview(Duration.ofMinutes(1));

        int result = config.getPreviewSeconds();

        assertEquals(60, result);
    }

    @Test
    void getDownloadSeconds_shouldReturn60() {
        PresignedUrlConfig config = new PresignedUrlConfig();
        config.setDownload(Duration.ofMinutes(1));

        int result = config.getDownloadSeconds();

        assertEquals(60, result);
    }

    @Test
    void getShareLinkDefaultSeconds_shouldReturn60() {
        PresignedUrlConfig config = new PresignedUrlConfig();
        config.setShareLinkDefault(Duration.ofMinutes(1));

        int result = config.getShareLinkDefaultSeconds();

        assertEquals(60, result);
    }

    @Test
    void defaultValues_shouldBe1Minute() {
        // Test that default values in PresignedUrlConfig are 1 minute
        PresignedUrlConfig config = new PresignedUrlConfig();

        assertEquals(Duration.ofMinutes(1), config.getPreview());
        assertEquals(Duration.ofMinutes(1), config.getDownload());
        assertEquals(Duration.ofMinutes(1), config.getShareLinkDefault());
    }

    @Test
    void setters_shouldUpdateValues() {
        PresignedUrlConfig config = new PresignedUrlConfig();
        Duration customDuration = Duration.ofMinutes(5);

        config.setPreview(customDuration);
        config.setDownload(customDuration);
        config.setShareLinkDefault(customDuration);

        assertEquals(customDuration, config.getPreview());
        assertEquals(customDuration, config.getDownload());
        assertEquals(customDuration, config.getShareLinkDefault());
    }
}

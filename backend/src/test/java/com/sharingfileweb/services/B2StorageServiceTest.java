package com.sharingfileweb.services;

import com.backblaze.b2.client.B2StorageClient;
import com.backblaze.b2.client.structures.B2DownloadAuthorization;
import com.backblaze.b2.client.structures.B2GetDownloadAuthorizationRequest;
import com.backblaze.b2.client.exceptions.B2Exception;
import com.sharingfileweb.config.B2Config;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for B2StorageService.
 * Tests presigned URL generation with 1-minute expiration.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class B2StorageServiceTest {

    @Mock
    private B2StorageClient b2Client;

    @Mock
    private B2Config b2Config;

    @InjectMocks
    private B2StorageService b2StorageService;

    private static final String BUCKET_NAME = "test-bucket";
    private static final String BUCKET_ID = "test-bucket-id";
    private static final String B2_FILE_NAME = "user123/abc.pdf";
    private static final String ORIGINAL_FILE_NAME = "document.pdf";
    private static final String AUTH_TOKEN = "test-auth-token-12345";
    private static final String BASE_URL = "https://f005.backblazeb2.com/file/test-bucket/user123/abc.pdf";

    @BeforeEach
    void setUp() throws B2Exception {
        lenient().when(b2Config.getBucketName()).thenReturn(BUCKET_NAME);
        lenient().when(b2Config.getBucketId()).thenReturn(BUCKET_ID);
        lenient().when(b2Config.getDownloadUrlExpirationSeconds()).thenReturn(60);
        lenient().doReturn(BASE_URL).when(b2Client).getDownloadByNameUrl(BUCKET_NAME, B2_FILE_NAME);
    }

    private B2DownloadAuthorization createMockDownloadAuth(String token) {
        B2DownloadAuthorization mock = mock(B2DownloadAuthorization.class);
        lenient().when(mock.getAuthorizationToken()).thenReturn(token);
        return mock;
    }

    @Test
    void getPresignedDownloadUrl_with1MinuteInline_shouldGenerateValidUrl() throws B2Exception {
        B2DownloadAuthorization mockResponse = createMockDownloadAuth(AUTH_TOKEN);
        when(b2Client.getDownloadAuthorization(any(B2GetDownloadAuthorizationRequest.class)))
                .thenReturn(mockResponse);

        Duration duration = Duration.ofMinutes(1);

        String result = b2StorageService.getPresignedDownloadUrl(
                B2_FILE_NAME, ORIGINAL_FILE_NAME, true, duration);

        assertNotNull(result);
        assertTrue(result.contains("Authorization="));
        assertTrue(result.startsWith(BASE_URL));
        verify(b2Client).getDownloadAuthorization(any(B2GetDownloadAuthorizationRequest.class));
    }

    @Test
    void getPresignedDownloadUrl_with1MinuteAttachment_shouldGenerateValidUrl() throws B2Exception {
        B2DownloadAuthorization mockResponse = createMockDownloadAuth(AUTH_TOKEN);
        when(b2Client.getDownloadAuthorization(any(B2GetDownloadAuthorizationRequest.class)))
                .thenReturn(mockResponse);

        Duration duration = Duration.ofMinutes(1);

        String result = b2StorageService.getPresignedDownloadUrl(
                B2_FILE_NAME, ORIGINAL_FILE_NAME, false, duration);

        assertNotNull(result);
        assertTrue(result.contains("Authorization="));
        assertTrue(result.contains("b2ContentDisposition="));
        assertTrue(result.contains("attachment"));
        verify(b2Client).getDownloadAuthorization(any(B2GetDownloadAuthorizationRequest.class));
    }

    @Test
    void getPresignedDownloadUrl_inlineWithoutFilename_shouldNotContainContentDisposition() throws B2Exception {
        B2DownloadAuthorization mockResponse = createMockDownloadAuth(AUTH_TOKEN);
        when(b2Client.getDownloadAuthorization(any(B2GetDownloadAuthorizationRequest.class)))
                .thenReturn(mockResponse);

        Duration duration = Duration.ofMinutes(1);

        String result = b2StorageService.getPresignedDownloadUrl(
                B2_FILE_NAME, null, true, duration);

        assertNotNull(result);
        assertFalse(result.contains("b2ContentDisposition="));
    }

    @Test
    void getPresignedDownloadUrl_inlineWithEmptyFilename_shouldNotContainContentDisposition() throws B2Exception {
        B2DownloadAuthorization mockResponse = createMockDownloadAuth(AUTH_TOKEN);
        when(b2Client.getDownloadAuthorization(any(B2GetDownloadAuthorizationRequest.class)))
                .thenReturn(mockResponse);

        Duration duration = Duration.ofMinutes(1);

        String result = b2StorageService.getPresignedDownloadUrl(
                B2_FILE_NAME, "", true, duration);

        assertNotNull(result);
        assertFalse(result.contains("b2ContentDisposition="));
    }

    @Test
    void getPresignedDownloadUrl_attachmentWithFilename_shouldContainEncodedFilename() throws B2Exception {
        B2DownloadAuthorization mockResponse = createMockDownloadAuth(AUTH_TOKEN);
        when(b2Client.getDownloadAuthorization(any(B2GetDownloadAuthorizationRequest.class)))
                .thenReturn(mockResponse);

        Duration duration = Duration.ofMinutes(1);

        String result = b2StorageService.getPresignedDownloadUrl(
                B2_FILE_NAME, "simple.pdf", false, duration);

        assertNotNull(result);
        assertTrue(result.contains("b2ContentDisposition="));
        assertTrue(result.contains("attachment"));
        assertTrue(result.contains("simple.pdf"));
    }

    @Test
    void getPresignedDownloadUrl_nullDuration_shouldUseDefaultConfig() throws B2Exception {
        B2DownloadAuthorization mockResponse = createMockDownloadAuth(AUTH_TOKEN);
        when(b2Client.getDownloadAuthorization(any(B2GetDownloadAuthorizationRequest.class)))
                .thenReturn(mockResponse);

        String result = b2StorageService.getPresignedDownloadUrl(
                B2_FILE_NAME, ORIGINAL_FILE_NAME, true, null);

        assertNotNull(result);
        assertTrue(result.contains("Authorization="));
        verify(b2Config).getDownloadUrlExpirationSeconds();
    }

    @Test
    void getPresignedDownloadUrl_shouldURLEncodeAuthToken() throws B2Exception {
        B2DownloadAuthorization mockResponse = createMockDownloadAuth(AUTH_TOKEN);
        when(b2Client.getDownloadAuthorization(any(B2GetDownloadAuthorizationRequest.class)))
                .thenReturn(mockResponse);

        Duration duration = Duration.ofMinutes(1);

        String result = b2StorageService.getPresignedDownloadUrl(
                B2_FILE_NAME, ORIGINAL_FILE_NAME, true, duration);

        // Auth token should be URL encoded
        assertTrue(result.contains("Authorization=" + AUTH_TOKEN)
                || result.contains("Authorization=" + AUTH_TOKEN.replace("+", "%2B")));
    }

    @Test
    void getPresignedDownloadUrl_shouldPassCorrectExpirationSeconds() throws B2Exception {
        B2DownloadAuthorization mockResponse = createMockDownloadAuth(AUTH_TOKEN);
        when(b2Client.getDownloadAuthorization(any(B2GetDownloadAuthorizationRequest.class)))
                .thenReturn(mockResponse);

        Duration duration = Duration.ofMinutes(1);

        b2StorageService.getPresignedDownloadUrl(
                B2_FILE_NAME, ORIGINAL_FILE_NAME, true, duration);

        verify(b2Client).getDownloadAuthorization(any(B2GetDownloadAuthorizationRequest.class));
    }

    @Test
    void getPresignedDownloadUrl_60SecondsExact_shouldGenerateUrl() throws B2Exception {
        B2DownloadAuthorization mockResponse = createMockDownloadAuth(AUTH_TOKEN);
        when(b2Client.getDownloadAuthorization(any(B2GetDownloadAuthorizationRequest.class)))
                .thenReturn(mockResponse);

        Duration duration = Duration.ofSeconds(60);

        String result = b2StorageService.getPresignedDownloadUrl(
                B2_FILE_NAME, ORIGINAL_FILE_NAME, true, duration);

        assertNotNull(result);
        assertTrue(result.startsWith(BASE_URL + "?Authorization="));
    }
}

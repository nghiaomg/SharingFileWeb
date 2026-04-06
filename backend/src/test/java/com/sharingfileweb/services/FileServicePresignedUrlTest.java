package com.sharingfileweb.services;

import com.sharingfileweb.config.PresignedUrlConfig;
import com.sharingfileweb.dto.FileDownloadResponse;
import com.sharingfileweb.entity.AccessLog;
import com.sharingfileweb.models.StorageFile;
import com.sharingfileweb.repository.FileRepository;
import com.sharingfileweb.repository.SharedAccessRepository;
import com.sharingfileweb.repository.UserRepository;
import com.sharingfileweb.security.services.FileStorageService;
import com.sharingfileweb.security.services.UploadLimitService;
import com.sharingfileweb.security.services.UserDetailsImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.Duration;
import java.time.Instant;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for FileService download and preview methods.
 * Verifies that presigned URLs use 1-minute expiration.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class FileServicePresignedUrlTest {

    @Mock
    private FileStorageService fileStorageService;

    @Mock
    private B2StorageService b2StorageService;

    @Mock
    private UploadLimitService uploadLimitService;

    @Mock
    private FileRepository fileRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SharedAccessRepository sharedAccessRepository;

    @Mock
    private FilePermissionService filePermissionService;

    @Mock
    private AccessLogService accessLogService;

    @Mock
    private PresignedUrlConfig presignedUrlConfig;

    @InjectMocks
    private FileService fileService;

    private StorageFile testFile;
    private UserDetailsImpl testUser;

    private static final String FILE_ID = "file123";
    private static final String USER_ID = "user123";
    private static final String USER_EMAIL = "test@example.com";
    private static final String B2_FILE_NAME = "user123/uuid.pdf";
    private static final String FILE_NAME = "test-document.pdf";
    private static final String FILE_TYPE = "application/pdf";
    private static final long FILE_SIZE = 1024L * 1024; // 1MB
    private static final String PRESIGNED_URL = "https://f005.backblazeb2.com/file/bucket/path?Authorization=token";

    @BeforeEach
    void setUp() {
        // Setup test file
        testFile = new StorageFile();
        testFile.setId(FILE_ID);
        testFile.setName(FILE_NAME);
        testFile.setType(FILE_TYPE);
        testFile.setSize(FILE_SIZE);
        testFile.setOwnerId(USER_ID);
        testFile.setB2FileName(B2_FILE_NAME);
        testFile.setCreatedAt(Instant.now());
        testFile.setVersion(1L);

        // Setup test user using constructor
        testUser = new UserDetailsImpl(
                USER_ID,
                "testuser",
                USER_EMAIL,
                "password",
                "BASIC",
                1024L * 1024 * 1024,
                100L * 1024 * 1024,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
        );

        // Mock security context
        Authentication authentication = mock(Authentication.class);
        lenient().when(authentication.getPrincipal()).thenReturn(testUser);
        SecurityContext securityContext = mock(SecurityContext.class);
        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        // Mock file permission service
        lenient().when(filePermissionService.getAccessibleFile(eq(USER_ID), eq(USER_EMAIL), eq(FILE_ID), anyString()))
                .thenReturn(testFile);

        // Mock presigned URL config to return 1 minute
        lenient().when(presignedUrlConfig.getPreview()).thenReturn(Duration.ofMinutes(1));
        lenient().when(presignedUrlConfig.getDownload()).thenReturn(Duration.ofMinutes(1));

        // Mock B2 storage service
        lenient().when(b2StorageService.getPresignedDownloadUrl(eq(B2_FILE_NAME), eq(FILE_NAME), anyBoolean(), any(Duration.class)))
                .thenReturn(PRESIGNED_URL);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void downloadFile_shouldUse1MinuteExpiration() {
        // Act
        FileDownloadResponse response = fileService.downloadFile(FILE_ID, false);

        // Assert
        assertNotNull(response);
        assertEquals(PRESIGNED_URL, response.getUrl());
        assertEquals(FILE_NAME, response.getFileName());
        assertEquals(FILE_TYPE, response.getFileType());
        assertEquals(FILE_SIZE, response.getFileSize());

        // Verify 1 minute expiration (allow 5 seconds tolerance)
        long actualSeconds = Duration.between(Instant.now(), response.getExpiresAt()).toSeconds();
        assertTrue(Math.abs(actualSeconds - 60) < 5,
                "Expected ~60 seconds expiration, but got " + actualSeconds + " seconds");

        // Verify B2StorageService was called with 1 minute duration
        verify(b2StorageService).getPresignedDownloadUrl(
                eq(B2_FILE_NAME), eq(FILE_NAME), eq(false), eq(Duration.ofMinutes(1)));
    }

    @Test
    void downloadFile_withInlineTrue_shouldUseInlineDisposition() {
        // Act
        FileDownloadResponse response = fileService.downloadFile(FILE_ID, true);

        // Assert
        assertNotNull(response);

        // Verify B2StorageService was called with inline=true
        verify(b2StorageService).getPresignedDownloadUrl(
                eq(B2_FILE_NAME), eq(FILE_NAME), eq(true), eq(Duration.ofMinutes(1)));
    }

    @Test
    void previewFile_shouldUse1MinuteExpiration() {
        // Act
        FileDownloadResponse response = fileService.previewFile(FILE_ID);

        // Assert
        assertNotNull(response);
        assertEquals(PRESIGNED_URL, response.getUrl());
        assertEquals(FILE_NAME, response.getFileName());
        assertEquals(FILE_TYPE, response.getFileType());
        assertEquals(FILE_SIZE, response.getFileSize());

        // Verify 1 minute expiration (allow 5 seconds tolerance)
        long actualSeconds = Duration.between(Instant.now(), response.getExpiresAt()).toSeconds();
        assertTrue(Math.abs(actualSeconds - 60) < 5,
                "Expected ~60 seconds expiration, but got " + actualSeconds + " seconds");

        // Verify B2StorageService was called with 1 minute duration and inline=true
        verify(b2StorageService).getPresignedDownloadUrl(
                eq(B2_FILE_NAME), eq(FILE_NAME), eq(true), eq(Duration.ofMinutes(1)));
    }

    @Test
    void downloadFile_shouldLogAccess() {
        // Act
        fileService.downloadFile(FILE_ID, false);

        // Verify access log was created
        verify(accessLogService).logFileAccess(
                eq(FILE_ID), eq(FILE_NAME), eq(USER_ID),
                eq(AccessLog.AccessType.DOWNLOAD), isNull(), isNull(), isNull());
    }

    @Test
    void previewFile_shouldLogPreviewAccess() {
        // Act
        fileService.previewFile(FILE_ID);

        // Verify access log was created
        verify(accessLogService).logFileAccess(
                eq(FILE_ID), eq(FILE_NAME), eq(USER_ID),
                eq(AccessLog.AccessType.PREVIEW), isNull(), isNull(), isNull());
    }

    @Test
    void downloadFile_whenFileNotAccessible_shouldThrowException() {
        // Arrange
        when(filePermissionService.getAccessibleFile(eq(USER_ID), eq(USER_EMAIL), eq(FILE_ID), anyString()))
                .thenThrow(new RuntimeException("File not found or unauthorized"));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> fileService.downloadFile(FILE_ID, false));
    }

    @Test
    void downloadFile_whenFileNotOnCloudStorage_shouldThrowException() {
        // Arrange - remove B2 file name to trigger the exception in generateSignedUrl
        when(filePermissionService.getAccessibleFile(eq(USER_ID), eq(USER_EMAIL), eq(FILE_ID), anyString()))
                .thenAnswer(invocation -> {
                    testFile.setB2FileName(null);
                    return testFile;
                });

        // Act & Assert
        assertThrows(RuntimeException.class, () -> fileService.downloadFile(FILE_ID, false));
    }

    @Test
    void previewFile_whenFileNotAccessible_shouldThrowException() {
        // Arrange
        when(filePermissionService.getAccessibleFile(eq(USER_ID), eq(USER_EMAIL), eq(FILE_ID), anyString()))
                .thenThrow(new RuntimeException("File not found or unauthorized"));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> fileService.previewFile(FILE_ID));
    }

    @Test
    void downloadFile_responseShouldContainCorrectVersion() {
        // Act
        FileDownloadResponse response = fileService.downloadFile(FILE_ID, false);

        // Assert
        assertEquals(1L, response.getVersion());
    }

    @Test
    void previewFile_responseShouldContainCorrectVersion() {
        // Act
        FileDownloadResponse response = fileService.previewFile(FILE_ID);

        // Assert
        assertEquals(1L, response.getVersion());
    }
}

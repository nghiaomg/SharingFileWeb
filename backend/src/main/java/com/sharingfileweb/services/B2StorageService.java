package com.sharingfileweb.services;

import java.io.IOException;
import java.nio.file.Path;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.backblaze.b2.client.B2StorageClient;
import com.backblaze.b2.client.contentSources.B2ContentSource;
import com.backblaze.b2.client.contentSources.B2FileContentSource;
import com.backblaze.b2.client.structures.B2AuthorizeAccountRequest;
import com.backblaze.b2.client.structures.B2DeleteFileVersionRequest;
import com.backblaze.b2.client.structures.B2FileVersion;
import com.backblaze.b2.client.structures.B2GetDownloadAuthorizationRequest;
import com.backblaze.b2.client.structures.B2UploadFileRequest;
import com.backblaze.b2.client.exceptions.B2Exception;
import com.sharingfileweb.config.B2Config;

/**
 * Service quản lý tất cả thao tác với Backblaze B2 Cloud Storage.
 * Thay thế phần lưu trữ vĩnh viễn của FileStorageService (chỉ giữ temp/chunk trên disk).
 */
@Service
public class B2StorageService {

    @Autowired
    private B2StorageClient b2Client;

    @Autowired
    private B2Config b2Config;

    private final java.util.concurrent.ExecutorService largeFileExecutor = java.util.concurrent.Executors.newFixedThreadPool(4);

    /**
     * Upload file từ local disk lên B2.
     * 
     * @param localFile  Path file đã merge trên disk
     * @param b2FileName Tên file trên B2 (format: {ownerId}/{uuid}.ext)
     * @param mimeType   MIME type thực tế (từ Tika detection)
     * @return B2UploadResult chứa fileId, fileName, size
     */
    public B2UploadResult uploadFile(Path localFile, String b2FileName, String mimeType) {
        try {
            B2ContentSource source = B2FileContentSource.builder(localFile.toFile()).build();

            B2UploadFileRequest request = B2UploadFileRequest
                    .builder(b2Config.getBucketId(), b2FileName, mimeType, source)
                    .build();

            B2FileVersion fileVersion = b2Client.uploadSmallFile(request);

            return new B2UploadResult(
                    fileVersion.getFileId(),
                    fileVersion.getFileName(),
                    fileVersion.getContentLength());

        } catch (B2Exception e) {
            // KHÔNG log credentials hoặc B2 internal details ra client
            System.err.println("[B2] Upload failed for: " + b2FileName + " — " + e.getMessage());
            throw new RuntimeException("Không thể tải file lên cloud storage. Vui lòng thử lại.", e);
        }
    }

    /**
     * Upload file lớn (> 100MB) qua B2 Large File API.
     * Sử dụng khi file sau merge vượt quá giới hạn single upload.
     */
    public B2UploadResult uploadLargeFile(Path localFile, String b2FileName, String mimeType) {
        try {
            B2ContentSource source = B2FileContentSource.builder(localFile.toFile()).build();

            B2FileVersion fileVersion = b2Client.uploadLargeFile(
                    B2UploadFileRequest.builder(b2Config.getBucketId(), b2FileName, mimeType, source).build(),
                    largeFileExecutor
            );

            return new B2UploadResult(
                    fileVersion.getFileId(),
                    fileVersion.getFileName(),
                    fileVersion.getContentLength());

        } catch (B2Exception e) {
            System.err.println("[B2] Large file upload failed for: " + b2FileName + " — " + e.getMessage());
            throw new RuntimeException("Không thể tải file lớn lên cloud storage. Vui lòng thử lại.", e);
        }
    }

    /**
     * Tạo presigned download URL với thời hạn giới hạn.
     * Client sẽ download trực tiếp từ B2 CDN thay vì proxy qua server.
     *
     * @param b2FileName Tên file trên B2 (cần cho authorization prefix)
     * @return URL download có thời hạn
     */
    public String getPresignedDownloadUrl(String b2FileName) {
        try {
            // Lấy download authorization token
            String authToken = b2Client.getDownloadAuthorization(
                    B2GetDownloadAuthorizationRequest.builder(
                            b2Config.getBucketId(),
                            b2FileName,
                            b2Config.getDownloadUrlExpirationSeconds()
                    ).build()
            ).getAuthorizationToken();

            // Xây dựng URL download
            String downloadUrl = b2Client.getDownloadByNameUrl(b2Config.getBucketName(), b2FileName);
            return downloadUrl + "?Authorization=" + java.net.URLEncoder.encode(authToken, java.nio.charset.StandardCharsets.UTF_8);

        } catch (B2Exception e) {
            System.err.println("[B2] Failed to generate download URL for: " + b2FileName + " — " + e.getMessage());
            throw new RuntimeException("Không thể tạo liên kết tải xuống. Vui lòng thử lại.", e);
        }
    }

    /**
     * Xóa file vĩnh viễn trên B2.
     * Gọi khi permanent delete từ trash hoặc trash cleanup scheduler.
     *
     * @param b2FileId   B2 file ID
     * @param b2FileName B2 file name
     */
    public void deleteFile(String b2FileId, String b2FileName) {
        if (b2FileId == null || b2FileId.isEmpty()) {
            System.err.println("[B2] Skipping delete — b2FileId is null/empty for: " + b2FileName);
            return;
        }

        try {
            b2Client.deleteFileVersion(
                    B2DeleteFileVersionRequest.builder(b2FileName, b2FileId).build()
            );
            System.out.println("[B2] Deleted: " + b2FileName + " (id: " + b2FileId + ")");

        } catch (B2Exception e) {
            // Log nhưng không throw — tránh block quá trình delete metadata
            System.err.println("[B2] Failed to delete file: " + b2FileName + " (id: " + b2FileId + ") — " + e.getMessage());
            // TODO: Thêm vào dead-letter queue để retry sau
        }
    }

    /**
     * Kiểm tra file có tồn tại trên B2 không.
     */
    public boolean fileExists(String b2FileId) {
        if (b2FileId == null || b2FileId.isEmpty()) {
            return false;
        }
        try {
            b2Client.getFileInfoByName(b2Config.getBucketName(), b2FileId);
            return true;
        } catch (B2Exception e) {
            return false;
        }
    }

    /**
     * Lấy iterator danh sách toàn bộ file từ B2 để chạy đồng bộ (Sync Job)
     */
    public Iterable<B2FileVersion> listAllFiles() {
        try {
            return b2Client.fileNames(b2Config.getBucketId());
        } catch (B2Exception e) {
            System.err.println("[B2] Failed to list all files: " + e.getMessage());
            throw new RuntimeException("Không thể lấy danh sách B2 files để đồng bộ.", e);
        }
    }

    // ─── Inner class kết quả upload ───────────────────────────────────────────

    public static class B2UploadResult {
        private final String b2FileId;
        private final String b2FileName;
        private final long fileSize;

        public B2UploadResult(String b2FileId, String b2FileName, long fileSize) {
            this.b2FileId = b2FileId;
            this.b2FileName = b2FileName;
            this.fileSize = fileSize;
        }

        public String getB2FileId() {
            return b2FileId;
        }

        public String getB2FileName() {
            return b2FileName;
        }

        public long getFileSize() {
            return fileSize;
        }
    }
}

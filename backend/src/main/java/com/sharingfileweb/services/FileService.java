package com.sharingfileweb.services;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.sharingfileweb.config.PresignedUrlConfig;
import com.sharingfileweb.dto.FileDownloadResponse;
import com.sharingfileweb.entity.AccessLog;
import com.sharingfileweb.models.StorageFile;
import com.sharingfileweb.models.User;
import com.sharingfileweb.payload.request.RenameFileRequest;
import com.sharingfileweb.payload.request.ShareFileRequest;
import com.sharingfileweb.payload.response.FileResponse;
import com.sharingfileweb.repository.FileRepository;
import com.sharingfileweb.repository.UserRepository;
import com.sharingfileweb.security.services.FileStorageService;
import com.sharingfileweb.security.services.UploadLimitService;
import com.sharingfileweb.security.services.UserDetailsImpl;

@Service
public class FileService {

    @Autowired
    FileStorageService fileStorageService;

    @Autowired
    B2StorageService b2StorageService;

    @Autowired
    UploadLimitService uploadLimitService;

    @Autowired
    FileRepository fileRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    com.sharingfileweb.repository.SharedAccessRepository sharedAccessRepository;

    @Autowired
    FilePermissionService filePermissionService;

    @Autowired
    AccessLogService accessLogService;

    @Autowired
    PresignedUrlConfig presignedUrlConfig;

    // ─── Context Helpers ──────────────────────────────────────────────────────

    private String getCurrentUserId() {
        return getUserDetails().getId();
    }

    private String getCurrentUserEmail() {
        return getUserDetails().getEmail();
    }

    private UserDetailsImpl getUserDetails() {
        return (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
    }

    // ─── File Listing ─────────────────────────────────────────────────────────

    public List<FileResponse> getFiles(String folderId) {
        String userId = getCurrentUserId();
        List<StorageFile> files;
        if (folderId == null || folderId.trim().isEmpty() || "root".equals(folderId)) {
            files = fileRepository.findByOwnerIdAndIsDeletedFalse(userId).stream()
                    .filter(f -> f.getFolderId() == null || f.getFolderId().isEmpty())
                    .filter(f -> !f.isBanned())
                    .collect(Collectors.toList());
        } else {
            files = fileRepository.findByOwnerIdAndFolderIdAndIsDeletedFalse(userId, folderId)
                    .stream().filter(f -> !f.isBanned()).collect(Collectors.toList());
        }
        return files.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<FileResponse> getRecentFiles() {
        Pageable pageable = PageRequest.of(0, 50);
        return fileRepository
                .findByOwnerIdAndIsDeletedFalseOrderByCreatedAtDesc(getCurrentUserId(), pageable)
                .getContent()
                .stream().filter(f -> !f.isBanned()).map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<FileResponse> getSharedFiles() {
        return fileRepository.findSharedFiles(getCurrentUserId())
                .stream().filter(f -> !f.isBanned()).map(this::mapToResponse).collect(Collectors.toList());
    }

    // ─── Upload ───────────────────────────────────────────────────────────────

    public void storeChunk(MultipartFile file, int chunkIndex, String uploadId, Long totalFileSize) throws Exception {
        String userId = getCurrentUserId();
        if (!uploadLimitService.tryRegister(userId, uploadId)) {
            throw new RuntimeException("Bạn đang có " + uploadLimitService.getActiveCount(userId)
                    + " luồng tải lên đồng thời. Vui lòng chờ hoàn tất trước khi bắt đầu thêm.");
        }
        if (totalFileSize != null) {
            User user = userRepository.findById(userId).orElseThrow();
            if ("BASIC".equals(user.getSubscriptionPlan()) && user.getMaxFileSize() < 1024L * 1024 * 1024) {
                user.setMaxFileSize(1024L * 1024 * 1024);
                userRepository.save(user);
            }
            if (totalFileSize > user.getMaxFileSize()) {
                throw new RuntimeException("Kích thước tệp vượt quá giới hạn "
                        + (user.getMaxFileSize() / 1024 / 1024) + "MB của gói " + user.getSubscriptionPlan() + ".");
            }
        }
        fileStorageService.storeChunk(uploadId, chunkIndex, file);
    }

    public List<Integer> getUploadedChunks(String uploadId) {
        return fileStorageService.getUploadedChunks(uploadId);
    }

    public FileResponse completeUpload(String uploadId, String fileName, int totalChunks,
                                       String fileType, long fileSize, String folderId) throws Exception {
        String userId = getCurrentUserId();
        String normalizedFolderId = normalizeFolderId(folderId);
        User user = userRepository.findById(userId).orElseThrow();

        if ("BASIC".equals(user.getSubscriptionPlan()) && user.getMaxFileSize() < 1024L * 1024 * 1024) {
            user.setMaxFileSize(1024L * 1024 * 1024);
            userRepository.save(user);
        }
        if (fileSize > user.getMaxFileSize()) {
            throw new RuntimeException("Kích thước tệp vượt quá giới hạn "
                    + (user.getMaxFileSize() / 1024 / 1024) + "MB của gói " + user.getSubscriptionPlan() + ".");
        }
        Long usedStorage = fileRepository.sumSizeByOwnerId(userId);
        if (usedStorage == null) usedStorage = 0L;
        if (usedStorage + fileSize > user.getMaxStorage()) {
            throw new RuntimeException("Không đủ dung lượng lưu trữ trống. Vui lòng nâng cấp gói.");
        }

        String resolvedFileName = resolveFileName(userId, normalizedFolderId, fileName);

        try {
            java.util.concurrent.CompletableFuture<FileStorageService.B2MergedResult> future =
                    java.util.concurrent.CompletableFuture.supplyAsync(() -> {
                        try {
                            return fileStorageService.mergeChunksAndUploadB2(
                                    uploadId, resolvedFileName, totalChunks, userId);
                        } catch (Exception ex) {
                            throw new java.util.concurrent.CompletionException(ex);
                        }
                    });

            FileStorageService.B2MergedResult b2Result;
            try {
                b2Result = future.get(10, java.util.concurrent.TimeUnit.MINUTES);
            } catch (java.util.concurrent.TimeoutException ex) {
                future.cancel(true);
                throw new RuntimeException("Quá trình xử lý file bị treo quá lâu (Timeout), thao tác bị hủy.");
            } catch (java.util.concurrent.ExecutionException ex) {
                throw new RuntimeException(
                        ex.getCause() != null ? ex.getCause().getMessage() : "Lỗi xử lý file");
            } catch (InterruptedException ex) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Tiến trình gộp file bị gián đoạn.");
            }

            StorageFile storageFile = new StorageFile(
                    resolvedFileName,
                    b2Result.getRealMimeType(),
                    b2Result.getFinalSize(),
                    userId,
                    normalizedFolderId,
                    b2Result.getB2FileId(),
                    b2Result.getB2FileName()
            );
            storageFile.setVersion(1L);
            storageFile.setContentHash(b2Result.getContentHash());

            return mapToResponse(fileRepository.save(storageFile));
        } finally {
            uploadLimitService.release(userId, uploadId);
        }
    }

    // ─── ⭐ NEW: Download & Preview (Private Access) ─────────────────────────

    /**
     * Tải file về — chỉ owner hoặc người được chia sẻ mới được phép.
     * Trả về presigned URL tạm thời (mặc định 15 phút).
     *
     * @param fileId ID của file
     * @param inline true = xem trình duyệt (inline), false = tải về (attachment)
     * @return FileDownloadResponse chứa presigned URL
     */
    public FileDownloadResponse downloadFile(String fileId, boolean inline) {
        String userId = getCurrentUserId();
        String email = getCurrentUserEmail();

        StorageFile file = filePermissionService.getAccessibleFile(
                userId, email, fileId, "DOWNLOAD");

        java.time.Duration duration = presignedUrlConfig.getDownload();
        String presignedUrl = generateSignedUrl(file, inline, duration);

        // Async access log
        accessLogService.logFileAccess(
                file.getId(), file.getName(), userId,
                inline ? AccessLog.AccessType.PREVIEW : AccessLog.AccessType.DOWNLOAD,
                null, (String) null, (String) null);

        return new FileDownloadResponse(
                presignedUrl,
                file.getName(),
                file.getType(),
                file.getSize(),
                java.time.Instant.now().plus(duration),
                file.getVersion()
        );
    }

    /**
     * Xem file trực tiếp — presigned URL ngắn (mặc định 5 phút), inline disposition.
     */
    public FileDownloadResponse previewFile(String fileId) {
        String userId = getCurrentUserId();
        String email = getCurrentUserEmail();

        StorageFile file = filePermissionService.getAccessibleFile(
                userId, email, fileId, "VIEW");

        java.time.Duration duration = presignedUrlConfig.getPreview();
        String presignedUrl = generateSignedUrl(file, true, duration);

        accessLogService.logFileAccess(
                file.getId(), file.getName(), userId,
                AccessLog.AccessType.PREVIEW, null,
                (String) null, (String) null);

        return new FileDownloadResponse(
                presignedUrl,
                file.getName(),
                file.getType(),
                file.getSize(),
                java.time.Instant.now().plus(duration),
                file.getVersion()
        );
    }

    private String generateSignedUrl(StorageFile file, boolean inline, java.time.Duration duration) {
        if (file.getB2FileName() == null || file.getB2FileName().isEmpty()) {
            throw new RuntimeException("File chưa được migrate lên cloud storage. Vui lòng liên hệ admin.");
        }
        return b2StorageService.getPresignedDownloadUrl(
                file.getB2FileName(), file.getName(), inline, duration);
    }

    // ─── Legacy Download (backward compat) ────────────────────────────────────

    /**
     * @deprecated Dùng downloadFile(fileId, false) thay thế.
     */
    @Deprecated
    public String getPresignedDownloadUrl(String id, boolean inline) throws Exception {
        String userId = getCurrentUserId();
        String email = getCurrentUserEmail();
        StorageFile file = filePermissionService.getAccessibleFile(userId, email, id, "DOWNLOAD");
        if (file.getB2FileName() == null || file.getB2FileName().isEmpty()) {
            throw new Exception("File chưa được migrate lên cloud storage.");
        }
        return b2StorageService.getPresignedDownloadUrl(
                file.getB2FileName(), file.getName(), inline,
                presignedUrlConfig.getDownload());
    }

    /**
     * @deprecated Dùng FilePermissionService.getAccessibleFile thay thế.
     */
    @Deprecated
    public StorageFile getFileEntity(String id) throws Exception {
        String userId = getCurrentUserId();
        String email = getCurrentUserEmail();
        return filePermissionService.getAccessibleFile(userId, email, id, "VIEW");
    }

    // ─── File Operations ───────────────────────────────────────────────────────

    public void deleteFile(String id) {
        String userId = getCurrentUserId();
        StorageFile file = fileRepository.findByIdAndOwnerIdAndIsDeletedFalse(id, userId)
                .orElseThrow(() -> new RuntimeException("File not found"));
        file.setDeleted(true);
        file.setDeletedAt(new Date());
        fileRepository.save(file);
    }

    public FileResponse renameFile(String id, RenameFileRequest request) {
        String userId = getCurrentUserId();
        StorageFile file = fileRepository.findByIdAndOwnerIdAndIsDeletedFalse(id, userId)
                .orElseThrow(() -> new RuntimeException("File not found or unauthorized"));
        String newName = request.getName();
        if (newName == null || newName.trim().isEmpty()) {
            throw new RuntimeException("Name cannot be empty");
        }
        newName = newName.replaceAll("[<>\"'&]", "_");
        if (!file.getName().equals(newName) &&
                fileRepository.existsByNameAndOwnerIdAndFolderIdAndIsDeletedFalse(
                        newName, userId, file.getFolderId())) {
            throw new RuntimeException("Error: File name is already taken in this folder!");
        }
        file.setName(newName);
        return mapToResponse(fileRepository.save(file));
    }

    public FileResponse adminRenameFile(String id, RenameFileRequest request) {
        StorageFile file = fileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found"));
        String newName = request.getName();
        if (newName == null || newName.trim().isEmpty()) {
            throw new RuntimeException("Name cannot be empty");
        }
        newName = newName.replaceAll("[<>\"'&]", "_");
        file.setName(newName);
        return mapToResponse(fileRepository.save(file));
    }

    public FileResponse adminRevokeFile(String id) {
        StorageFile file = fileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found"));
        file.setBanned(!file.isBanned()); // Toggle: Thu hồi / Bỏ thu hồi
        return mapToResponse(fileRepository.save(file));
    }

    /**
     * @deprecated Dùng ShareLink/SharedAccess thay thế. Giữ lại cho backward compatibility.
     */
    @Deprecated
    public FileResponse shareFile(String id, ShareFileRequest payload) {
        String userId = getCurrentUserId();
        StorageFile file = fileRepository.findByIdAndOwnerIdAndIsDeletedFalse(id, userId)
                .orElseThrow(() -> new RuntimeException("File not found or unauthorized"));
        String mode = payload.getAccessMode() != null ? payload.getAccessMode() : "PRIVATE";
        file.setAccessMode(mode);
        file.setPublic("PUBLIC".equals(mode));
        List<String> emails = payload.getSharedEmails() != null
                ? payload.getSharedEmails() : new java.util.ArrayList<>();
        if (emails.size() > 50) {
            throw new RuntimeException("Không thể chia sẻ cho quá 50 người cùng lúc.");
        }
        file.setSharedEmails(emails);
        if (payload.getExpiresInDays() != null) {
            file.setShareExpiresAt(java.time.Instant.now()
                    .plus(payload.getExpiresInDays(), java.time.temporal.ChronoUnit.DAYS));
        } else {
            file.setShareExpiresAt(null);
        }
        return mapToResponse(fileRepository.save(file));
    }

    // ─── Public File (legacy — DEPRECATED) ────────────────────────────────────

    /** @deprecated Dùng PublicShareController + ShareLink thay thế. */
    @Deprecated
    public FileResponse getPublicFileMetadata(String id) {
        StorageFile file = fileRepository.findById(id).orElse(null);
        if (file == null || file.isDeleted()) throw new RuntimeException("File not found");
        return mapToResponse(file);
    }

    /** @deprecated Dùng PublicShareController + ShareLink thay thế. */
    @Deprecated
    public String getPublicPresignedDownloadUrl(String id, boolean inline) throws Exception {
        StorageFile file = fileRepository.findById(id).orElse(null);
        if (file == null || file.isDeleted()) throw new Exception("File not found");
        if (file.getB2FileName() == null || file.getB2FileName().isEmpty()) {
            throw new Exception("File chưa được migrate lên cloud storage.");
        }
        return b2StorageService.getPresignedDownloadUrl(
                file.getB2FileName(), file.getName(), inline,
                presignedUrlConfig.getDownload());
    }

    /** @deprecated Dùng FilePermissionService thay thế. */
    @Deprecated
    public StorageFile getPublicFileEntity(String id) throws Exception {
        return fileRepository.findById(id)
                .orElseThrow(() -> new Exception("File not found"));
    }

    // ─── Mapping ──────────────────────────────────────────────────────────────

    public FileResponse mapToResponse(StorageFile file) {
        return new FileResponse(
                file.getId(),
                file.getName(),
                file.getType(),
                file.getSize(),
                file.getFolderId(),
                file.getCreatedAt(),
                file.isPublic(),
                file.getAccessMode() != null ? file.getAccessMode() : "PRIVATE",
                file.getSharedEmails() != null ? file.getSharedEmails() : new java.util.ArrayList<>(),
                file.getShareExpiresAt(),
                file.isBanned()
        );
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────

    private String normalizeFolderId(String folderId) {
        if (folderId == null || folderId.trim().isEmpty() || "root".equals(folderId)) {
            return null;
        }
        return folderId;
    }

    private String resolveFileName(String userId, String folderId, String desiredName) {
        String baseName = desiredName;
        String extension = "";
        int dotIndex = desiredName.lastIndexOf('.');
        if (dotIndex > 0) {
            baseName = desiredName.substring(0, dotIndex);
            extension = desiredName.substring(dotIndex);
        }
        String actual = desiredName;
        int counter = 1;
        while (fileRepository.existsByNameAndOwnerIdAndFolderIdAndIsDeletedFalse(
                actual, userId, folderId)) {
            actual = baseName + " (" + counter + ")" + extension;
            counter++;
        }
        return actual;
    }
}

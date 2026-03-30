package com.sharingfileweb.services;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

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

    private String getCurrentUserId() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getId();
    }

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
                file.getShareExpiresAt()
        );
    }

    public List<FileResponse> getFiles(String folderId) {
        String userId = getCurrentUserId();
        List<StorageFile> files;

        if (folderId == null || folderId.trim().isEmpty() || "root".equals(folderId)) {
            files = fileRepository.findByOwnerIdAndIsDeletedFalse(userId).stream()
                    .filter(f -> f.getFolderId() == null || f.getFolderId().isEmpty())
                    .collect(Collectors.toList());
        } else {
            files = fileRepository.findByOwnerIdAndFolderIdAndIsDeletedFalse(userId, folderId);
        }

        return files.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<FileResponse> getRecentFiles() {
        String userId = getCurrentUserId();
        Pageable pageable = PageRequest.of(0, 50);
        List<StorageFile> recentFiles = fileRepository.findByOwnerIdAndIsDeletedFalseOrderByCreatedAtDesc(userId, pageable).getContent();

        return recentFiles.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<FileResponse> getSharedFiles() {
        String userId = getCurrentUserId();
        List<StorageFile> sharedFiles = fileRepository.findSharedFiles(userId);

        return sharedFiles.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public void storeChunk(MultipartFile file, int chunkIndex, String uploadId, Long totalFileSize) throws Exception {
        String userId = getCurrentUserId();

        if (!uploadLimitService.tryRegister(userId, uploadId)) {
            throw new RuntimeException("Bạn đang có " + uploadLimitService.getActiveCount(userId) + " luồng tải lên đồng thời. Vui lòng chờ hoàn tất trước khi bắt đầu thêm.");
        }

        if (totalFileSize != null) {
            User user = userRepository.findById(userId).orElseThrow();
            
            // Auto-upgrade legacy BASIC plan limits
            if ("BASIC".equals(user.getSubscriptionPlan()) && user.getMaxFileSize() < 1024L * 1024 * 1024) {
                user.setMaxFileSize(1024L * 1024 * 1024);
                userRepository.save(user);
            }

            if (totalFileSize > user.getMaxFileSize()) {
                throw new RuntimeException("Kích thước tệp vượt quá giới hạn " + (user.getMaxFileSize() / 1024 / 1024) + "MB của gói " + user.getSubscriptionPlan() + ".");
            }
        }
        fileStorageService.storeChunk(uploadId, chunkIndex, file);
    }

    public List<Integer> getUploadedChunks(String uploadId) {
        return fileStorageService.getUploadedChunks(uploadId);
    }

    public FileResponse completeUpload(String uploadId, String fileName, int totalChunks, String fileType, long fileSize, String folderId) throws Exception {
        String userId = getCurrentUserId();
        String normalizedFolderId = (folderId != null && (folderId.trim().isEmpty() || "root".equals(folderId))) ? null : folderId;

        User user = userRepository.findById(userId).orElseThrow();

        // Auto-upgrade legacy BASIC plan limits
        if ("BASIC".equals(user.getSubscriptionPlan()) && user.getMaxFileSize() < 1024L * 1024 * 1024) {
            user.setMaxFileSize(1024L * 1024 * 1024);
            userRepository.save(user);
        }

        if (fileSize > user.getMaxFileSize()) {
            throw new RuntimeException("Kích thước tệp vượt quá giới hạn " + (user.getMaxFileSize() / 1024 / 1024) + "MB của gói " + user.getSubscriptionPlan() + ".");
        }

        Long usedStorage = fileRepository.sumSizeByOwnerId(userId);
        if (usedStorage == null) usedStorage = 0L;

        if (usedStorage + fileSize > user.getMaxStorage()) {
            throw new RuntimeException("Không đủ dung lượng lưu trữ trống. Vui lòng nâng cấp gói.");
        }

        String baseName = fileName;
        String extension = "";
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex > 0) {
            baseName = fileName.substring(0, dotIndex);
            extension = fileName.substring(dotIndex);
        }

        String actualFileName = fileName;
        int counter = 1;
        while (fileRepository.existsByNameAndOwnerIdAndFolderIdAndIsDeletedFalse(actualFileName, userId, normalizedFolderId)) {
            actualFileName = baseName + " (" + counter + ")" + extension;
            counter++;
        }
        final String finalFileNameToUse = actualFileName;

        try {
            // Merge chunks → validate → upload B2 → cleanup local
            // Thêm Timeout bằng CompletableFuture để tránh treo vô hạn
            java.util.concurrent.CompletableFuture<FileStorageService.B2MergedResult> future = 
                java.util.concurrent.CompletableFuture.supplyAsync(() -> {
                    try {
                        return fileStorageService.mergeChunksAndUploadB2(uploadId, finalFileNameToUse, totalChunks, userId);
                    } catch (Exception ex) {
                        throw new java.util.concurrent.CompletionException(ex);
                    }
                });
            
            FileStorageService.B2MergedResult b2Result;
            try {
                // Timeout 10 phút (600 giây)
                b2Result = future.get(10, java.util.concurrent.TimeUnit.MINUTES);
            } catch (java.util.concurrent.TimeoutException ex) {
                future.cancel(true);
                throw new RuntimeException("Quá trình xử lý file bị treo quá lâu (Timeout), thao tác bị hủy.");
            } catch (java.util.concurrent.ExecutionException ex) {
                throw new RuntimeException(ex.getCause() != null ? ex.getCause().getMessage() : "Lỗi xử lý file");
            } catch (InterruptedException ex) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Tiến trình gộp file bị gián đoạn.");
            }
            
            // Lưu metadata với b2FileId + b2FileName thay vì storedPath
            StorageFile storageFile = new StorageFile(
                finalFileNameToUse, 
                b2Result.getRealMimeType(), 
                b2Result.getFinalSize(), 
                userId, 
                normalizedFolderId, 
                b2Result.getB2FileId(), 
                b2Result.getB2FileName()
            );
            StorageFile savedFile = fileRepository.save(storageFile);
            return mapToResponse(savedFile);
        } finally {
            // Always release the slot, even on error
            uploadLimitService.release(userId, uploadId);
        }
    }

    public void deleteFile(String id) {
        String userId = getCurrentUserId();
        StorageFile file = fileRepository.findByIdAndOwnerIdAndIsDeletedFalse(id, userId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        // Soft-delete: KHÔNG xóa file trên B2, chỉ đánh dấu deleted
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

        // Sanitize filename — chống XSS
        newName = newName.replaceAll("[<>\"'&]", "_");

        if (!file.getName().equals(newName) &&
                fileRepository.existsByNameAndOwnerIdAndFolderIdAndIsDeletedFalse(newName, userId, file.getFolderId())) {
            throw new RuntimeException("Error: File name is already taken in this folder!");
        }

        file.setName(newName);
        fileRepository.save(file);

        return mapToResponse(file);
    }

    public FileResponse shareFile(String id, ShareFileRequest payload) {
        String userId = getCurrentUserId();
        StorageFile file = fileRepository.findByIdAndOwnerIdAndIsDeletedFalse(id, userId)
                .orElseThrow(() -> new RuntimeException("File not found or unauthorized"));

        String mode = payload.getAccessMode() != null ? payload.getAccessMode() : "PRIVATE";
        file.setAccessMode(mode);
        file.setPublic("PUBLIC".equals(mode));
        
        List<String> emails = payload.getSharedEmails() != null ? payload.getSharedEmails() : new java.util.ArrayList<>();
        // Giới hạn số lượng shared emails (chống mass share)
        if (emails.size() > 50) {
            throw new RuntimeException("Không thể chia sẻ cho quá 50 người cùng lúc.");
        }
        file.setSharedEmails(emails);

        if (payload.getExpiresInDays() != null) {
            file.setShareExpiresAt(Instant.now().plus(payload.getExpiresInDays(), ChronoUnit.DAYS));
        } else {
            file.setShareExpiresAt(null);
        }

        fileRepository.save(file);

        return mapToResponse(file);
    }

    /**
     * Tạo presigned download URL cho file private (owner download).
     * Client sẽ nhận URL và download trực tiếp từ B2 CDN.
     */
    public String getPresignedDownloadUrl(String id) throws Exception {
        String userId = getCurrentUserId();
        StorageFile file = fileRepository.findByIdAndOwnerIdAndIsDeletedFalse(id, userId)
                .orElseThrow(() -> new Exception("File not found or deleted"));

        // Ưu tiên B2, fallback cho data cũ (storedPath)
        if (file.getB2FileName() != null && !file.getB2FileName().isEmpty()) {
            return b2StorageService.getPresignedDownloadUrl(file.getB2FileName());
        }

        // Fallback: file cũ vẫn trên disk — throw lỗi yêu cầu migration
        throw new Exception("File chưa được migrate lên cloud storage. Vui lòng liên hệ admin.");
    }

    public StorageFile getFileEntity(String id) throws Exception {
        String userId = getCurrentUserId();
        return fileRepository.findByIdAndOwnerIdAndIsDeletedFalse(id, userId)
                .orElseThrow(() -> new Exception("File not found or deleted"));
    }

    public FileResponse getPublicFileMetadata(String id) {
        StorageFile file = fileRepository.findById(id).orElse(null);

        if (file == null || file.isDeleted()) {
            throw new RuntimeException("File not found");
        }
        
        // Hết hạn: block
        if (file.getShareExpiresAt() != null && file.getShareExpiresAt().isBefore(Instant.now())) {
            throw new RuntimeException("Share link expired");
        }
        
        String mode = file.getAccessMode() != null ? file.getAccessMode() : (file.isPublic() ? "PUBLIC" : "PRIVATE");
        if ("PRIVATE".equals(mode)) {
            throw new RuntimeException("File not shared");
        }
        
        if ("RESTRICTED".equals(mode)) {
            org.springframework.security.core.Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                throw new RuntimeException("Unauthorized: Login is required to view this file");
            }
            UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
            if (file.getSharedEmails() == null || !file.getSharedEmails().contains(userDetails.getEmail())) {
                throw new RuntimeException("Forbidden: You are not invited to view this file");
            }
        }

        return mapToResponse(file);
    }

    /**
     * Tạo presigned download URL cho file public/shared.
     */
    public String getPublicPresignedDownloadUrl(String id) throws Exception {
        StorageFile file = fileRepository.findById(id)
                .orElseThrow(() -> new Exception("File not found"));

        if (file.isDeleted()) {
            throw new Exception("File not found");
        }
        
        if (file.getShareExpiresAt() != null && file.getShareExpiresAt().isBefore(Instant.now())) {
            throw new Exception("Share link expired");
        }
        
        String mode = file.getAccessMode() != null ? file.getAccessMode() : (file.isPublic() ? "PUBLIC" : "PRIVATE");
        if ("PRIVATE".equals(mode)) {
            throw new Exception("File not shared");
        }
        
        if ("RESTRICTED".equals(mode)) {
            org.springframework.security.core.Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                throw new Exception("Unauthorized: Login is required to download this file");
            }
            UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
            if (file.getSharedEmails() == null || !file.getSharedEmails().contains(userDetails.getEmail())) {
                throw new Exception("Forbidden: You are not invited to download this file");
            }
        }

        if (file.getB2FileName() != null && !file.getB2FileName().isEmpty()) {
            return b2StorageService.getPresignedDownloadUrl(file.getB2FileName());
        }

        throw new Exception("File chưa được migrate lên cloud storage.");
    }

    public StorageFile getPublicFileEntity(String id) throws Exception {
        StorageFile file = fileRepository.findById(id)
                .orElseThrow(() -> new Exception("File not found"));

        if (file.isDeleted()) {
            throw new Exception("File not found");
        }
        
        if (file.getShareExpiresAt() != null && file.getShareExpiresAt().isBefore(Instant.now())) {
            throw new Exception("Share link expired");
        }
        
        String mode = file.getAccessMode() != null ? file.getAccessMode() : (file.isPublic() ? "PUBLIC" : "PRIVATE");
        if ("PRIVATE".equals(mode)) {
            throw new Exception("File not shared");
        }
        
        if ("RESTRICTED".equals(mode)) {
            org.springframework.security.core.Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                throw new Exception("Unauthorized: Login is required to download this file");
            }
            UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
            if (file.getSharedEmails() == null || !file.getSharedEmails().contains(userDetails.getEmail())) {
                throw new Exception("Forbidden: You are not invited to download this file");
            }
        }

        return file;
    }
}

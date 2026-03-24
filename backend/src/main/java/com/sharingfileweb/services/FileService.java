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
import com.sharingfileweb.payload.request.ShareFileRequest;
import com.sharingfileweb.payload.response.FileResponse;
import com.sharingfileweb.repository.FileRepository;
import com.sharingfileweb.repository.UserRepository;
import com.sharingfileweb.security.services.FileStorageService;
import com.sharingfileweb.security.services.UserDetailsImpl;

@Service
public class FileService {

    @Autowired
    FileStorageService fileStorageService;

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
        if (totalFileSize != null) {
            User user = userRepository.findById(getCurrentUserId()).orElseThrow();
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

        if (fileSize > user.getMaxFileSize()) {
            throw new RuntimeException("Kích thước tệp vượt quá giới hạn " + (user.getMaxFileSize() / 1024 / 1024) + "MB của gói " + user.getSubscriptionPlan() + ".");
        }

        Long usedStorage = fileRepository.sumSizeByOwnerId(userId);
        if (usedStorage == null) usedStorage = 0L;

        if (usedStorage + fileSize > user.getMaxStorage()) {
            throw new RuntimeException("Không đủ dung lượng lưu trữ trống. Vui lòng nâng cấp gói.");
        }

        if (fileRepository.existsByNameAndOwnerIdAndFolderIdAndIsDeletedFalse(fileName, userId, normalizedFolderId)) {
            throw new RuntimeException("Lỗi: Đã tồn tại tệp có cùng tên trong thư mục này.");
        }

        String storedPath = fileStorageService.mergeChunks(uploadId, fileName, totalChunks, userId);

        StorageFile storageFile = new StorageFile(fileName, fileType, fileSize, userId, normalizedFolderId, storedPath);
        StorageFile savedFile = fileRepository.save(storageFile);

        return mapToResponse(savedFile);
    }

    public void deleteFile(String id) {
        String userId = getCurrentUserId();
        StorageFile file = fileRepository.findByIdAndOwnerIdAndIsDeletedFalse(id, userId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        file.setDeleted(true);
        file.setDeletedAt(new Date());
        fileRepository.save(file);
    }

    public FileResponse shareFile(String id, ShareFileRequest payload) {
        String userId = getCurrentUserId();
        StorageFile file = fileRepository.findByIdAndOwnerIdAndIsDeletedFalse(id, userId)
                .orElseThrow(() -> new RuntimeException("File not found or unauthorized"));

        String mode = payload.getAccessMode() != null ? payload.getAccessMode() : "PRIVATE";
        file.setAccessMode(mode);
        file.setPublic("PUBLIC".equals(mode));
        
        file.setSharedEmails(payload.getSharedEmails() != null ? payload.getSharedEmails() : new java.util.ArrayList<>());

        if (payload.getExpiresInDays() != null) {
            file.setShareExpiresAt(Instant.now().plus(payload.getExpiresInDays(), ChronoUnit.DAYS));
        } else {
            file.setShareExpiresAt(null);
        }

        fileRepository.save(file);

        return mapToResponse(file);
    }

    public org.springframework.core.io.Resource downloadPrivateFile(String id) throws Exception {
        String userId = getCurrentUserId();
        StorageFile file = fileRepository.findByIdAndOwnerIdAndIsDeletedFalse(id, userId)
                .orElseThrow(() -> new Exception("File not found or deleted"));

        return fileStorageService.loadFileAsResource(file);
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
        
        // Cũ: chỉ kiểm tra isPublic. Mới: nếu PRIVATE thì chặn, PUBLIC thì ok, RESTRICTED thì logic sau.
        // Hết hạn: block
        if (file.getShareExpiresAt() != null && file.getShareExpiresAt().isBefore(Instant.now())) {
            throw new RuntimeException("Share link expired");
        }
        
        String mode = file.getAccessMode() != null ? file.getAccessMode() : (file.isPublic() ? "PUBLIC" : "PRIVATE");
        if ("PRIVATE".equals(mode)) {
            throw new RuntimeException("File not shared");
        }
        
        if ("RESTRICTED".equals(mode)) {
            // Cần check Auth
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

    public org.springframework.core.io.Resource downloadPublicFile(StorageFile file) throws Exception {
        return fileStorageService.loadFileAsResource(file);
    }
}

package com.sharingfileweb.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.sharingfileweb.dto.FileDownloadResponse;
import com.sharingfileweb.models.StorageFile;
import com.sharingfileweb.payload.request.RenameFileRequest;
import com.sharingfileweb.payload.request.ShareFileRequest;
import com.sharingfileweb.payload.response.FileResponse;
import com.sharingfileweb.payload.response.StandardResponse;
import com.sharingfileweb.repository.FileRepository;
import com.sharingfileweb.services.B2StorageService;
import com.sharingfileweb.services.FileService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;


@RestController
@RequestMapping("/api/files")
@Tag(name = "File Management", description = "Các API quản lý tập tin: tải lên, tải xuống, chia sẻ, đổi tên, xóa.")
public class FileController {

    @Autowired
    FileService fileService;

    @Autowired
    private B2StorageService b2StorageService;

    // ─── File Listing ───────────────────────────────────────────────────────────

    @Operation(summary = "Lấy danh sách tệp")
    @GetMapping
    public ResponseEntity<?> getFiles(
            @Parameter(description = "ID thư mục (tùy chọn)") @RequestParam(required = false) String folderId) {
        return ResponseEntity.ok(StandardResponse.success(
                "Fetched files successfully", fileService.getFiles(folderId)));
    }

    @Operation(summary = "Tệp truy cập gần đây")
    @GetMapping("/recent")
    public ResponseEntity<?> getRecentFiles() {
        return ResponseEntity.ok(StandardResponse.success(
                "Fetched recent files successfully", fileService.getRecentFiles()));
    }

    @Operation(summary = "Tệp được chia sẻ")
    @GetMapping("/shared")
    public ResponseEntity<?> getSharedFiles() {
        return ResponseEntity.ok(StandardResponse.success(
                "Fetched shared files successfully", fileService.getSharedFiles()));
    }

    // ─── Upload ────────────────────────────────────────────────────────────────

    @Operation(summary = "Tải lên chunk (phân đoạn)",
               description = "Hỗ trợ file lớn và resume tải.")
    @PostMapping("/upload/chunk")
    public ResponseEntity<?> uploadChunk(
            @RequestParam("file") MultipartFile file,
            @RequestParam("chunkIndex") int chunkIndex,
            @RequestParam("uploadId") String uploadId,
            @RequestParam(value = "totalFileSize", required = false) Long totalFileSize) {
        try {
            fileService.storeChunk(file, chunkIndex, uploadId, totalFileSize);
            return ResponseEntity.ok(StandardResponse.success("Chunk " + chunkIndex + " uploaded successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(StandardResponse.error("Error uploading chunk: " + e.getMessage(), null));
        }
    }

    @Operation(summary = "Lấy trạng thái chunk đã tải")
    @GetMapping("/upload/status")
    public ResponseEntity<?> getUploadStatus(@RequestParam("uploadId") String uploadId) {
        return ResponseEntity.ok(StandardResponse.success(
                "Fetched upload status successfully", fileService.getUploadedChunks(uploadId)));
    }

    @Operation(summary = "Hoàn thành tải lên",
               description = "Gộp chunk → upload B2 → lưu metadata.")
    @PostMapping("/upload/complete")
    public ResponseEntity<?> completeUpload(
            @RequestParam("uploadId") String uploadId,
            @RequestParam("fileName") String fileName,
            @RequestParam("totalChunks") int totalChunks,
            @RequestParam("fileType") String fileType,
            @RequestParam("fileSize") long fileSize,
            @RequestParam(value = "folderId", required = false) String folderId) {
        try {
            FileResponse response = fileService.completeUpload(
                    uploadId, fileName, totalChunks, fileType, fileSize, folderId);
            return ResponseEntity.ok(StandardResponse.success("File uploaded successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(StandardResponse.error("Lỗi gộp file (merge): " + e.getMessage(), null));
        }
    }

    // ─── ⭐ NEW: Download & Preview ─────────────────────────────────────────

    /**
     * Tải file về — presigned URL 15 phút.
     * @deprecated Dùng endpoint mới: /api/files/{fileId}/download
     */
    @Deprecated
    @Operation(summary = "Tải xuống tệp nội bộ (legacy)",
               description = "Dùng endpoint mới: GET /api/files/{fileId}/download")
    @GetMapping("/download/{id}")
    public ResponseEntity<?> downloadPrivateFile(
            @PathVariable String id,
            @RequestParam(required = false, defaultValue = "false") boolean inline) {
        try {
            FileDownloadResponse resp = fileService.downloadFile(id, inline);
            return ResponseEntity.ok(StandardResponse.success("Download URL", java.util.Map.of(
                    "url", resp.getUrl(),
                    "fileName", resp.getFileName(),
                    "fileType", resp.getFileType(),
                    "fileSize", resp.getFileSize(),
                    "expiresAt", resp.getExpiresAt(),
                    "version", resp.getVersion()
            )));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(StandardResponse.error("Không thể tạo liên kết tải xuống: " + e.getMessage(), null));
        }
    }

    /**
     * Tải file về — presigned URL 15 phút.
     * @param fileId ID của file
     * @param inline true = xem trình duyệt, false = tải về
     */
    @Operation(summary = "Tải xuống tệp",
               description = "Lấy presigned URL tạm thời (15 phút) để tải file trực tiếp từ B2. Yêu cầu đăng nhập.")
    @GetMapping("/{fileId}/download")
    public ResponseEntity<?> downloadFile(
            @Parameter(description = "ID của file") @PathVariable String fileId,
            @Parameter(description = "true = xem trình duyệt, false = tải về") @RequestParam(required = false, defaultValue = "false") boolean inline) {
        try {
            FileDownloadResponse resp = fileService.downloadFile(fileId, inline);
            return ResponseEntity.ok(StandardResponse.success("Download URL", resp));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(StandardResponse.error("Không thể tạo liên kết tải xuống: " + e.getMessage(), null));
        }
    }

    /**
     * Xem file trực tiếp — presigned URL 5 phút, inline disposition.
     * Dùng để nhúng vào PDF viewer, img tag, video tag.
     */
    @Operation(summary = "Xem trước tệp",
               description = "Lấy presigned URL tạm thời (5 phút, inline) để xem file trực tiếp trên trình duyệt.")
    @GetMapping("/{fileId}/preview")
    public ResponseEntity<?> previewFile(
            @Parameter(description = "ID của file") @PathVariable String fileId) {
        try {
            FileDownloadResponse resp = fileService.previewFile(fileId);
            return ResponseEntity.ok(StandardResponse.success("Preview URL", resp));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(StandardResponse.error("Không thể tạo liên kết xem trước: " + e.getMessage(), null));
        }
    }

    // ─── File Operations ────────────────────────────────────────────────────

    @Operation(summary = "Chuyển tệp vào thùng rác (xóa mềm)")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFile(@PathVariable String id) {
        try {
            fileService.deleteFile(id);
            return ResponseEntity.ok(StandardResponse.success("Đã chuyển tệp vào thùng rác!", null));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Đổi tên tệp")
    @PutMapping("/{id}/rename")
    public ResponseEntity<?> renameFile(@PathVariable String id,
                                         @jakarta.validation.Valid @RequestBody RenameFileRequest payload) {
        try {
            FileResponse response = fileService.renameFile(id, payload);
            return ResponseEntity.ok(StandardResponse.success("Đã đổi tên tệp thành công", response));
        } catch (RuntimeException e) {
            if ("File not found or unauthorized".equals(e.getMessage())) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
        }
    }

    /**
     * @deprecated Dùng ShareLink/SharedAccess thay thế.
     *             Giữ lại cho backward compatibility.
     */
    @Operation(summary = "Chia sẻ tệp nội bộ (DEPRECATED)",
               description = "Dùng POST /api/share/internal hoặc POST /api/share/link thay thế.")
    @PutMapping("/{id}/share")
    @Deprecated
    public ResponseEntity<?> shareFile(@PathVariable String id, @RequestBody ShareFileRequest payload) {
        try {
            FileResponse response = fileService.shareFile(id, payload);
            return ResponseEntity.ok(StandardResponse.success("File share status updated successfully", response));
        } catch (RuntimeException e) {
            if ("File not found or unauthorized".equals(e.getMessage())) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.status(403)
                    .body(StandardResponse.error("You are not authorized to update this file.", null));
        }
    }

    /**
     * @deprecated Dùng GET /api/files/{fileId}/preview thay thế.
     */
    @Operation(summary = "Lấy thông tin tệp công khai (DEPRECATED)")
    @GetMapping("/public/{id}")
    @Deprecated
    public ResponseEntity<?> getPublicFileMetadata(@PathVariable String id) {
        try {
            FileResponse response = fileService.getPublicFileMetadata(id);
            return ResponseEntity.ok(StandardResponse.success("Fetched public file info", response));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * @deprecated Dùng GET /api/public/share/{token}/download thay thế.
     */
    @Operation(summary = "Tải xuống tệp công khai (DEPRECATED)")
    @GetMapping("/public/download/{id}")
    @Deprecated
    public ResponseEntity<?> downloadPublicFile(@PathVariable String id,
                                                 @RequestParam(required = false, defaultValue = "false") boolean inline) {
        try {
            StorageFile file = fileService.getPublicFileEntity(id);
            String downloadUrl = fileService.getPublicPresignedDownloadUrl(id, inline);
            return ResponseEntity.ok(StandardResponse.success("Download URL", java.util.Map.of(
                    "url", downloadUrl,
                    "fileName", file.getName(),
                    "fileType", file.getType(),
                    "fileSize", file.getSize()
            )));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ─── Admin ──────────────────────────────────────────────────────────────

    @Operation(summary = "Lấy tất cả tệp (Admin)")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<?> getAllFilesForAdmin(
            @RequestParam(required = false) String folderId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        org.springframework.data.domain.Page<StorageFile> pageResult;
        
        if (folderId == null || folderId.trim().isEmpty() || "root".equals(folderId)) {
            pageResult = fileRepository.findByFolderIdIsNullAndIsDeletedFalseOrderByCreatedAtDesc(pageable);
        } else {
            pageResult = fileRepository.findByFolderIdAndIsDeletedFalseOrderByCreatedAtDesc(folderId, pageable);
        }

        java.util.Map<String, Object> responseData = new java.util.HashMap<>();
        responseData.put("content", pageResult.getContent());
        responseData.put("currentPage", pageResult.getNumber());
        responseData.put("totalItems", pageResult.getTotalElements());
        responseData.put("totalPages", pageResult.getTotalPages());
        return ResponseEntity.ok(StandardResponse.success("Fetched files hierarchically", responseData));
    }

    @Operation(summary = "Xóa vĩnh viễn tệp (Admin)")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}/permanent")
    public ResponseEntity<?> deleteFilePermanentlyByAdmin(@PathVariable String id) {
        java.util.Optional<StorageFile> fileOpt = fileRepository.findById(id);
        if (fileOpt.isEmpty()) return ResponseEntity.notFound().build();

        StorageFile file = fileOpt.get();
        if (file.getB2FileId() != null && !file.getB2FileId().isEmpty()) {
            b2StorageService.deleteFile(file.getB2FileId(), file.getB2FileName());
        }
        fileRepository.deleteById(id);
        return ResponseEntity.ok(StandardResponse.success("File deleted permanently", null));
    }

    @Operation(summary = "Đổi tên tệp (Admin)")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/{id}")
    public ResponseEntity<?> renameFileByAdmin(@PathVariable String id, @RequestBody RenameFileRequest request) {
        try {
            FileResponse response = fileService.adminRenameFile(id, request);
            return ResponseEntity.ok(StandardResponse.success("File renamed by admin", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
        }
    }

    @Operation(summary = "Thu hồi/Bỏ thu hồi tệp (Admin)", description = "Admin cấm hoặc bỏ cấm tệp do vi phạm.")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/{id}/revoke")
    public ResponseEntity<?> revokeFileByAdmin(@PathVariable String id) {
        try {
            FileResponse response = fileService.adminRevokeFile(id);
            return ResponseEntity.ok(StandardResponse.success("Admin file revoked logic completed", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
        }
    }

    @Autowired
    private com.sharingfileweb.repository.FileRepository fileRepository;
}

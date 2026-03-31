package com.sharingfileweb.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.sharingfileweb.models.StorageFile;
import com.sharingfileweb.payload.response.FileResponse;
import com.sharingfileweb.payload.response.MessageResponse;
import com.sharingfileweb.payload.response.StandardResponse;
import com.sharingfileweb.payload.request.RenameFileRequest;
import com.sharingfileweb.payload.request.ShareFileRequest;
import com.sharingfileweb.repository.FileRepository;
import com.sharingfileweb.repository.UserRepository;
import com.sharingfileweb.models.User;
import com.sharingfileweb.security.services.UserDetailsImpl;
import com.sharingfileweb.services.B2StorageService;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import com.sharingfileweb.services.FileService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/files")
@Tag(name = "File Management", description = "Các API quản lý tập tin: tải lên, tải xuống, chia sẻ, đổi tên, xóa.")
public class FileController {

  @Autowired
  FileService fileService;

  @Autowired
  private B2StorageService b2StorageService;

  @Operation(summary = "Lấy danh sách tệp", description = "Lấy danh sách các tệp của người dùng hiện tại, có thể lọc theo thư mục.")
  @GetMapping
  public ResponseEntity<?> getFiles(@Parameter(description = "ID thư mục (tùy chọn)") @RequestParam(required = false) String folderId) {
    List<FileResponse> response = fileService.getFiles(folderId);
    return ResponseEntity.ok(StandardResponse.success("Fetched files successfully", response));
  }

  @Operation(summary = "Tệp truy cập gần đây", description = "Lấy danh sách tệp của người dùng vừa truy cập gần đây.")
  @GetMapping("/recent")
  public ResponseEntity<?> getRecentFiles() {
    List<FileResponse> response = fileService.getRecentFiles();
    return ResponseEntity.ok(StandardResponse.success("Fetched recent files successfully", response));
  }

  @Operation(summary = "Tệp được chia sẻ", description = "Lấy danh sách các tệp mà người dùng hiện tại được chia sẻ.")
  @GetMapping("/shared")
  public ResponseEntity<?> getSharedFiles() {
    List<FileResponse> response = fileService.getSharedFiles();
    return ResponseEntity.ok(StandardResponse.success("Fetched shared files successfully", response));
  }

  @Operation(summary = "Tải lên chunk (phân ảnh)", description = "Tải lên một chunk của tập tin để hỗ trợ file tải lớn và resume tải.")
  @PostMapping("/upload/chunk")
  public ResponseEntity<?> uploadChunk(
      @Parameter(description = "File chunk (Blob)") @RequestParam("file") MultipartFile file,
      @Parameter(description = "Thứ tự chunk") @RequestParam("chunkIndex") int chunkIndex,
      @Parameter(description = "ID upload session") @RequestParam("uploadId") String uploadId,
      @Parameter(description = "Tổng kích thước tệp") @RequestParam(value = "totalFileSize", required = false) Long totalFileSize) {
        
    try {
      fileService.storeChunk(file, chunkIndex, uploadId, totalFileSize);
      return ResponseEntity.ok(StandardResponse.success("Chunk " + chunkIndex + " uploaded successfully", null));
    } catch (Exception e) {
      return ResponseEntity.badRequest().body(StandardResponse.error("Error uploading chunk: " + e.getMessage(), null));
    }
  }

  @Operation(summary = "Lấy trạng thái chunk đã tải", description = "Lấy danh sách các chunk đã tải thành công theo uploadId để hỗ trợ tải tiếp.")
  @GetMapping("/upload/status")
  public ResponseEntity<?> getUploadStatus(@Parameter(description = "ID upload session") @RequestParam("uploadId") String uploadId) {
    List<Integer> uploadedChunks = fileService.getUploadedChunks(uploadId);
    return ResponseEntity.ok(StandardResponse.success("Fetched upload status successfully", uploadedChunks));
  }

  @Operation(summary = "Hoàn thành tải lên", description = "Gộp các chunk đã tải lên thành một tệp hoàn chỉnh và upload lên Backblaze B2.")
  @PostMapping("/upload/complete")
  public ResponseEntity<?> completeUpload(
      @Parameter(description = "ID upload session") @RequestParam("uploadId") String uploadId,
      @Parameter(description = "Tên tệp gốc") @RequestParam("fileName") String fileName,
      @Parameter(description = "Tổng số chunk") @RequestParam("totalChunks") int totalChunks,
      @Parameter(description = "Loại tệp MIME") @RequestParam("fileType") String fileType,
      @Parameter(description = "Kích thước tệp (bytes)") @RequestParam("fileSize") long fileSize,
      @Parameter(description = "ID thư mục mong muốn (tùy chọn)") @RequestParam(value = "folderId", required = false) String folderId) {

    try {
      FileResponse response = fileService.completeUpload(uploadId, fileName, totalChunks, fileType, fileSize, folderId);
      return ResponseEntity.ok(StandardResponse.success("File uploaded successfully", response));
    } catch (Exception e) {
       return ResponseEntity.badRequest().body(StandardResponse.error("Lỗi gộp file (merge): " + e.getMessage(), null));
    }
  }

    @Operation(summary = "Chuyển tệp vào thùng rác (xóa mềm)", description = "Chuyển tệp thuộc sở hữu hiện tại vào thùng rác thay vì xóa vĩnh viễn.")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFile(@Parameter(description = "ID của tệp") @PathVariable String id) {
        try {
            fileService.deleteFile(id);
            return ResponseEntity.ok(StandardResponse.success("Đã chuyển tệp vào thùng rác!", null));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Đổi tên tệp", description = "Đổi tên của tệp thuộc sở hữu người dùng.")
    @PutMapping("/{id}/rename")
    public ResponseEntity<?> renameFile(@Parameter(description = "ID của tệp") @PathVariable String id, @jakarta.validation.Valid @RequestBody RenameFileRequest payload) {
        try {
            FileResponse response = fileService.renameFile(id, payload);
            return ResponseEntity.ok(StandardResponse.success("Đã đổi tên tệp thành công", response));
        } catch (RuntimeException e) {
            if (e.getMessage().equals("File not found or unauthorized")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
        }
    }

  @Operation(summary = "Chia sẻ tệp nội bộ", description = "Thiết lập trạng thái Public hoặc chia sẻ tệp cho danh sách người dùng nhất định.")
  @PutMapping("/{id}/share")
  public ResponseEntity<?> shareFile(@Parameter(description = "ID của tệp") @PathVariable String id, @RequestBody ShareFileRequest payload) {
    try {
        FileResponse response = fileService.shareFile(id, payload);
        return ResponseEntity.ok(StandardResponse.success("File share status updated successfully", response));
    } catch (RuntimeException e) {
        if (e.getMessage().equals("File not found or unauthorized")) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.status(403).body(StandardResponse.error("You are not authorized to update this file.", null));
    }
  }

  /**
   * API download file nội bộ (Cần Auth).
   * Trả về presigned URL thay vì stream file qua server.
   */
  @Operation(summary = "Tải xuống tệp nội bộ", description = "Lấy presigned URL để tải xuống tệp trực tiếp từ cloud storage.")
  @GetMapping("/download/{id}")
  public ResponseEntity<?> downloadPrivateFile(
      @Parameter(description = "ID của tệp") @PathVariable String id,
      @Parameter(description = "Yêu cầu URL xem trước (inline view)") @RequestParam(required = false, defaultValue = "false") boolean inline) {
    try {
      StorageFile file = fileService.getFileEntity(id);
      String downloadUrl = fileService.getPresignedDownloadUrl(id, inline);

      return ResponseEntity.ok(StandardResponse.success("Download URL", Map.of(
          "url", downloadUrl,
          "fileName", file.getName(),
          "fileType", file.getType(),
          "fileSize", file.getSize()
      )));

    } catch (Exception e) {
       return ResponseEntity.status(500).body(StandardResponse.error("Không thể tạo liên kết tải xuống: " + e.getMessage(), null));
    }
  }

  @Operation(summary = "Lấy thông tin tệp công khai (Public)", description = "Dùng cho liên kết chia sẻ công khai không yêu cầu Auth.")
  @GetMapping("/public/{id}")
  public ResponseEntity<?> getPublicFileMetadata(@Parameter(description = "ID tệp public") @PathVariable String id) {
      try {
          FileResponse response = fileService.getPublicFileMetadata(id);
          return ResponseEntity.ok(StandardResponse.success("Fetched public file info", response));
      } catch (RuntimeException e) {
          return ResponseEntity.notFound().build();
      }
  }

  /**
   * API tải xuống Public.
   * Trả về presigned URL thay vì stream qua server.
   */
  @Operation(summary = "Tải xuống tệp công khai (Public)", description = "Lấy presigned URL để tải xuống tệp công khai trực tiếp từ cloud storage.")
  @GetMapping("/public/download/{id}")
  public ResponseEntity<?> downloadPublicFile(
      @Parameter(description = "ID tệp public") @PathVariable String id,
      @Parameter(description = "Yêu cầu URL xem trước (inline view)") @RequestParam(required = false, defaultValue = "false") boolean inline) {
    try {
      StorageFile file = fileService.getPublicFileEntity(id);
      String downloadUrl = fileService.getPublicPresignedDownloadUrl(id, inline);

      return ResponseEntity.ok(StandardResponse.success("Download URL", Map.of(
          "url", downloadUrl,
          "fileName", file.getName(),
          "fileType", file.getType(),
          "fileSize", file.getSize()
      )));

    } catch (Exception e) {
       return ResponseEntity.notFound().build();
    }
  }

  @Autowired
  private com.sharingfileweb.repository.FileRepository fileRepository;

  @Operation(summary = "Lấy tất cả tệp (Quyền Admin)", description = "Lấy danh sách tất cả tệp tải lên hệ thống.")
  @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
  @GetMapping("/all")
  public ResponseEntity<?> getAllFilesForAdmin() {
      List<StorageFile> files = fileRepository.findAll();
      return ResponseEntity.ok(StandardResponse.success("Fetched all files", files));
  }

  /**
   * Admin xóa vĩnh viễn: xóa cả metadata DB và file trên B2.
   */
  @Operation(summary = "Xóa vĩnh viễn tệp (Quyền Admin)", description = "Xóa hoàn toàn tệp khỏi DB và Backblaze B2.")
  @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
  @DeleteMapping("/{id}/permanent")
  public ResponseEntity<?> deleteFilePermanentlyByAdmin(@Parameter(description = "ID của tệp cần xóa") @PathVariable String id) {
      Optional<StorageFile> fileOpt = fileRepository.findById(id);
      if (fileOpt.isEmpty()) {
          return ResponseEntity.notFound().build();
      }

      StorageFile file = fileOpt.get();
      
      // Xóa file trên B2 trước
      if (file.getB2FileId() != null && !file.getB2FileId().isEmpty()) {
          b2StorageService.deleteFile(file.getB2FileId(), file.getB2FileName());
      }

      fileRepository.deleteById(id);
      return ResponseEntity.ok(StandardResponse.success("File deleted permanently", null));
  }
}

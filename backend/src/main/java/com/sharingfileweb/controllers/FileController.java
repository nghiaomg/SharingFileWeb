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
import com.sharingfileweb.security.services.FileStorageService;
import com.sharingfileweb.models.User;
import com.sharingfileweb.security.services.UserDetailsImpl;

import java.util.List;
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

  // Expect FormData: file (blob), chunkIndex, uploadId
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

  // Get uploaded chunks status to support resumption
  @Operation(summary = "Lấy trạng thái chunk đã tải", description = "Lấy danh sách các chunk đã tải thành công theo uploadId để hỗ trợ tải tiếp.")
  @GetMapping("/upload/status")
  public ResponseEntity<?> getUploadStatus(@Parameter(description = "ID upload session") @RequestParam("uploadId") String uploadId) {
    List<Integer> uploadedChunks = fileService.getUploadedChunks(uploadId);
    return ResponseEntity.ok(StandardResponse.success("Fetched upload status successfully", uploadedChunks));
  }

  // Complete upload request
  @Operation(summary = "Hoàn thành tải lên", description = "Gộp các chunk đã tải lên hành một tệp hoàn chỉnh.")
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

    // Đổi tên tệp
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

  // Đổi trạng thái Public/Share của File
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

  // API download file nội bộ (Cần Auth)
  @Operation(summary = "Tải xuống tệp nội bộ", description = "Tải xuống các tệp đang nắm quyền truy cập (thuộc bản thân, hoặc được chia sẻ).")
  @GetMapping("/download/{id}")
  public ResponseEntity<org.springframework.core.io.Resource> downloadPrivateFile(@Parameter(description = "ID của tệp") @PathVariable String id) {
    try {
      StorageFile file = fileService.getFileEntity(id);
      org.springframework.core.io.Resource resource = fileService.downloadPrivateFile(id);

      String contentDisposition = "attachment; filename=\"" + file.getName() + "\"";
      return ResponseEntity.ok()
          .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, contentDisposition)
          .contentType(org.springframework.http.MediaType.parseMediaType(file.getType()))
          .body(resource);

    } catch (Exception e) {
       return ResponseEntity.status(500).build();
    }
  }

  // API lấy Metadata public (Không cần Auth)
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

  // API tải xuống Public (Không cần Auth)
  @Operation(summary = "Tải xuống tệp công khai (Public)", description = "Tải xuống tệp được đặt chế độ chia sẻ công khai mà không yêu cầu JWT.")
  @GetMapping("/public/download/{id}")
  public ResponseEntity<org.springframework.core.io.Resource> downloadPublicFile(@Parameter(description = "ID tệp public") @PathVariable String id) {
    try {
      StorageFile file = fileService.getPublicFileEntity(id);
      org.springframework.core.io.Resource resource = fileService.downloadPublicFile(file);

      String contentDisposition = "attachment; filename=\"" + file.getName() + "\"";
      return ResponseEntity.ok()
          .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, contentDisposition)
          .contentType(org.springframework.http.MediaType.parseMediaType(file.getType()))
          .body(resource);

    } catch (Exception e) {
       return ResponseEntity.notFound().build();
    }
  }

  @Autowired
  private com.sharingfileweb.repository.FileRepository fileRepository;

  // GET /api/files?all=true  → Admin: lấy toàn bộ file hệ thống
  @Operation(summary = "Lấy tất cả tệp (Quyền Admin)", description = "Lấy danh sách tất cả tệp tải lên hệ thống.")
  @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
  @GetMapping("/all")
  public ResponseEntity<?> getAllFilesForAdmin() {
      List<StorageFile> files = fileRepository.findAll();
      return ResponseEntity.ok(StandardResponse.success("Fetched all files", files));
  }

  // DELETE /api/files/{id}?permanent=true  → Admin: xóa cứng
  @Operation(summary = "Xóa vĩnh viễn tệp (Quyền Admin)", description = "Xóa hoàn toàn tệp khỏi DB và Storage Storage.")
  @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
  @DeleteMapping("/{id}/permanent")
  public ResponseEntity<?> deleteFilePermanentlyByAdmin(@Parameter(description = "ID của tệp cần xóa") @PathVariable String id) {
      if (!fileRepository.existsById(id)) {
          return ResponseEntity.notFound().build();
      }
      fileRepository.deleteById(id);
      return ResponseEntity.ok(StandardResponse.success("File deleted permanently", null));
  }
}


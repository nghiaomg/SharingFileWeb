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

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/files")
public class FileController {

  @Autowired
  FileService fileService;

  @GetMapping
  public ResponseEntity<?> getFiles(@RequestParam(required = false) String folderId) {
    List<FileResponse> response = fileService.getFiles(folderId);
    return ResponseEntity.ok(StandardResponse.success("Fetched files successfully", response));
  }

  @GetMapping("/recent")
  public ResponseEntity<?> getRecentFiles() {
    List<FileResponse> response = fileService.getRecentFiles();
    return ResponseEntity.ok(StandardResponse.success("Fetched recent files successfully", response));
  }

  @GetMapping("/shared")
  public ResponseEntity<?> getSharedFiles() {
    List<FileResponse> response = fileService.getSharedFiles();
    return ResponseEntity.ok(StandardResponse.success("Fetched shared files successfully", response));
  }

  // Expect FormData: file (blob), chunkIndex, uploadId
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
      return ResponseEntity.badRequest().body(StandardResponse.error("Error uploading chunk: " + e.getMessage(), null));
    }
  }

  // Get uploaded chunks status to support resumption
  @GetMapping("/upload/status")
  public ResponseEntity<?> getUploadStatus(@RequestParam("uploadId") String uploadId) {
    List<Integer> uploadedChunks = fileService.getUploadedChunks(uploadId);
    return ResponseEntity.ok(StandardResponse.success("Fetched upload status successfully", uploadedChunks));
  }

  // Complete upload request
  @PostMapping("/upload/complete")
  public ResponseEntity<?> completeUpload(
      @RequestParam("uploadId") String uploadId,
      @RequestParam("fileName") String fileName,
      @RequestParam("totalChunks") int totalChunks,
      @RequestParam("fileType") String fileType,
      @RequestParam("fileSize") long fileSize,
      @RequestParam(value = "folderId", required = false) String folderId) {

    try {
      FileResponse response = fileService.completeUpload(uploadId, fileName, totalChunks, fileType, fileSize, folderId);
      return ResponseEntity.ok(StandardResponse.success("File uploaded successfully", response));
    } catch (Exception e) {
       return ResponseEntity.badRequest().body(StandardResponse.error("Lỗi gộp file (merge): " + e.getMessage(), null));
    }
  }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFile(@PathVariable String id) {
        try {
            fileService.deleteFile(id);
            return ResponseEntity.ok(StandardResponse.success("Đã chuyển tệp vào thùng rác!", null));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Đổi tên tệp
    @PutMapping("/{id}/rename")
    public ResponseEntity<?> renameFile(@PathVariable String id, @jakarta.validation.Valid @RequestBody RenameFileRequest payload) {
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
  @PutMapping("/{id}/share")
  public ResponseEntity<?> shareFile(@PathVariable String id, @RequestBody ShareFileRequest payload) {
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
  @GetMapping("/download/{id}")
  public ResponseEntity<org.springframework.core.io.Resource> downloadPrivateFile(@PathVariable String id) {
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
  @GetMapping("/public/{id}")
  public ResponseEntity<?> getPublicFileMetadata(@PathVariable String id) {
      try {
          FileResponse response = fileService.getPublicFileMetadata(id);
          return ResponseEntity.ok(StandardResponse.success("Fetched public file info", response));
      } catch (RuntimeException e) {
          return ResponseEntity.notFound().build();
      }
  }

  // API tải xuống Public (Không cần Auth)
  @GetMapping("/public/download/{id}")
  public ResponseEntity<org.springframework.core.io.Resource> downloadPublicFile(@PathVariable String id) {
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
}

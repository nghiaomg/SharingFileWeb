package com.sharingfileweb.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.sharingfileweb.models.StorageFile;
import com.sharingfileweb.payload.response.FileResponse;
import com.sharingfileweb.payload.response.MessageResponse;
import com.sharingfileweb.repository.FileRepository;
import com.sharingfileweb.security.services.FileStorageService;
import com.sharingfileweb.security.services.UserDetailsImpl;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/files")
public class FileController {

  @Autowired
  FileStorageService fileStorageService;

  @Autowired
  FileRepository fileRepository;

  private String getCurrentUserId() {
    UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    return userDetails.getId();
  }

  private FileResponse mapToResponse(StorageFile file) {
    return new FileResponse(
        file.getId(),
        file.getName(),
        file.getType(),
        file.getSize(),
        file.getFolderId(),
        file.getCreatedAt()
    );
  }

  @GetMapping
  public ResponseEntity<?> getFiles(@RequestParam(required = false) String folderId) {
    String userId = getCurrentUserId();
    List<StorageFile> files;

    if (folderId == null || folderId.trim().isEmpty()) {
      files = fileRepository.findByOwnerId(userId).stream()
          .filter(f -> f.getFolderId() == null || f.getFolderId().isEmpty())
          .collect(Collectors.toList());
    } else {
      files = fileRepository.findByOwnerIdAndFolderId(userId, folderId);
    }

    List<FileResponse> response = files.stream().map(this::mapToResponse).collect(Collectors.toList());
    return ResponseEntity.ok(response);
  }

  // Expect FormData: file (blob), chunkIndex, uploadId
  @PostMapping("/upload/chunk")
  public ResponseEntity<?> uploadChunk(
      @RequestParam("file") MultipartFile file,
      @RequestParam("chunkIndex") int chunkIndex,
      @RequestParam("uploadId") String uploadId) {
          
    try {
      fileStorageService.storeChunk(uploadId, chunkIndex, file);
      return ResponseEntity.ok(new MessageResponse("Chunk " + chunkIndex + " uploaded successfully"));
    } catch (Exception e) {
      return ResponseEntity.badRequest().body(new MessageResponse("Error uploading chunk: " + e.getMessage()));
    }
  }

  // Get uploaded chunks status to support resumption
  @GetMapping("/upload/status")
  public ResponseEntity<List<Integer>> getUploadStatus(@RequestParam("uploadId") String uploadId) {
    List<Integer> uploadedChunks = fileStorageService.getUploadedChunks(uploadId);
    return ResponseEntity.ok(uploadedChunks);
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

    String userId = getCurrentUserId();
    String normalizedFolderId = (folderId != null && folderId.trim().isEmpty()) ? null : folderId;

    try {
      // Check if file already exists
      if (fileRepository.existsByNameAndOwnerIdAndFolderId(fileName, userId, normalizedFolderId)) {
        return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Đã tồn tại tệp có cùng tên trong thư mục này."));
      }

      String storedPath = fileStorageService.mergeChunks(uploadId, fileName, totalChunks, userId);
      
      StorageFile storageFile = new StorageFile(fileName, fileType, fileSize, userId, normalizedFolderId, storedPath);
      StorageFile savedFile = fileRepository.save(storageFile);
      
      return ResponseEntity.ok(mapToResponse(savedFile));
    } catch (Exception e) {
       return ResponseEntity.badRequest().body(new MessageResponse("Lỗi gộp file (merge): " + e.getMessage()));
    }
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<?> deleteFile(@PathVariable String id) {
    String userId = getCurrentUserId();
    Optional<StorageFile> fileData = fileRepository.findByIdAndOwnerId(id, userId);

    if (fileData.isPresent()) {
      StorageFile file = fileData.get();
      fileStorageService.deleteFilePhysical(file.getStoredPath());
      fileRepository.deleteById(id);
      return ResponseEntity.ok(new MessageResponse("Deleted successfully"));
    } else {
      return ResponseEntity.notFound().build();
    }
  }
}

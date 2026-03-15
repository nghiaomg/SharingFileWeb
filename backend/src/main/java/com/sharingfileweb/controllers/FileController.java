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
        file.getCreatedAt(),
        file.isPublic()
    );
  }

  @GetMapping
  public ResponseEntity<?> getFiles(@RequestParam(required = false) String folderId) {
    String userId = getCurrentUserId();
    List<StorageFile> files;

    if (folderId == null || folderId.trim().isEmpty()) {
      files = fileRepository.findByOwnerIdAndIsDeletedFalse(userId).stream()
          .filter(f -> f.getFolderId() == null || f.getFolderId().isEmpty())
          .collect(Collectors.toList());
    } else {
      files = fileRepository.findByOwnerIdAndFolderIdAndIsDeletedFalse(userId, folderId);
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
      if (fileRepository.existsByNameAndOwnerIdAndFolderIdAndIsDeletedFalse(fileName, userId, normalizedFolderId)) {
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
    Optional<StorageFile> fileData = fileRepository.findByIdAndOwnerIdAndIsDeletedFalse(id, userId);

    if (fileData.isPresent()) {
      StorageFile file = fileData.get();
      file.setDeleted(true);
      file.setDeletedAt(new java.util.Date());
      fileRepository.save(file);
      return ResponseEntity.ok(new MessageResponse("Đã chuyển tệp vào thùng rác!"));
    } else {
      return ResponseEntity.notFound().build();
    }
  }

  // Đổi trạng thái Public của File
  @PutMapping("/{id}/share")
  public ResponseEntity<?> toggleShareFile(@PathVariable String id, @RequestBody java.util.Map<String, Boolean> payload) {
    UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    StorageFile file = fileRepository.findByIdAndOwnerIdAndIsDeletedFalse(id, userDetails.getId()).orElse(null);

    if (file == null) {
      return ResponseEntity.notFound().build();
    }

    if (!file.getOwnerId().equals(userDetails.getId())) {
      return ResponseEntity.status(403).body(new MessageResponse("You are not authorized to update this file."));
    }

    boolean isPublic = payload.getOrDefault("isPublic", false);
    file.setPublic(isPublic);
    fileRepository.save(file);

    return ResponseEntity.ok(mapToResponse(file));
  }

  // API download file nội bộ (Cần Auth)
  @GetMapping("/download/{id}")
  public ResponseEntity<org.springframework.core.io.Resource> downloadPrivateFile(@PathVariable String id) {
    UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    try {
      StorageFile file = fileRepository.findByIdAndOwnerIdAndIsDeletedFalse(id, userDetails.getId())
          .orElseThrow(() -> new Exception("File not found or deleted"));

      if (!file.getOwnerId().equals(userDetails.getId())) {
          return ResponseEntity.status(403).build();
      }

      org.springframework.core.io.Resource resource = fileStorageService.loadFileAsResource(file);

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
     StorageFile file = fileRepository.findById(id).orElse(null);
     
     if (file == null || !file.isPublic() || file.isDeleted()) {
        return ResponseEntity.notFound().build();
     }

     return ResponseEntity.ok(mapToResponse(file));
  }

  // API tải xuống Public (Không cần Auth)
  @GetMapping("/public/download/{id}")
  public ResponseEntity<org.springframework.core.io.Resource> downloadPublicFile(@PathVariable String id) {
    try {
      StorageFile file = fileRepository.findById(id)
          .orElseThrow(() -> new Exception("File not found"));

      if (!file.isPublic() || file.isDeleted()) {
          return ResponseEntity.status(403).build();
      }

      org.springframework.core.io.Resource resource = fileStorageService.loadFileAsResource(file);

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

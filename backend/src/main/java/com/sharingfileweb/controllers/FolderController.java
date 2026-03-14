package com.sharingfileweb.controllers;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.sharingfileweb.models.Folder;
import com.sharingfileweb.payload.request.CreateFolderRequest;
import com.sharingfileweb.payload.request.UpdateFolderRequest;
import com.sharingfileweb.payload.response.FolderResponse;
import com.sharingfileweb.payload.response.MessageResponse;
import com.sharingfileweb.repository.FolderRepository;
import com.sharingfileweb.repository.FileRepository;
import com.sharingfileweb.models.StorageFile;
import com.sharingfileweb.security.services.FileStorageService;
import com.sharingfileweb.security.services.UserDetailsImpl;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/folders")
public class FolderController {

  @Autowired
  FolderRepository folderRepository;

  @Autowired
  FileRepository fileRepository;

  @Autowired
  FileStorageService fileStorageService;

  private String getCurrentUserId() {
    UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    return userDetails.getId();
  }

  // Helper method to convert Entity to Response DTO
  private FolderResponse mapToResponse(Folder folder) {
    return new FolderResponse(
        folder.getId(),
        folder.getName(),
        folder.getParentId(),
        folder.getCreatedAt(),
        folder.getUpdatedAt()
    );
  }

  @GetMapping
  public ResponseEntity<?> getRootFolders() {
    String userId = getCurrentUserId();
    // Return folders where parentId is null or empty
    List<Folder> folders = folderRepository.findByOwnerId(userId)
                            .stream()
                            .filter(f -> f.getParentId() == null || f.getParentId().isEmpty())
                            .collect(Collectors.toList());

    List<FolderResponse> response = folders.stream().map(this::mapToResponse).collect(Collectors.toList());
    return ResponseEntity.ok(response);
  }

  @GetMapping("/{id}")
  public ResponseEntity<?> getFolderById(@PathVariable String id) {
    String userId = getCurrentUserId();
    Optional<Folder> folderData = folderRepository.findByIdAndOwnerId(id, userId);

    if (folderData.isPresent()) {
      return ResponseEntity.ok(mapToResponse(folderData.get()));
    } else {
      return ResponseEntity.notFound().build();
    }
  }

  @GetMapping("/{id}/children")
  public ResponseEntity<?> getFolderChildren(@PathVariable String id) {
    String userId = getCurrentUserId();
    List<Folder> folders = folderRepository.findByOwnerIdAndParentId(userId, id);
    List<FolderResponse> response = folders.stream().map(this::mapToResponse).collect(Collectors.toList());
    return ResponseEntity.ok(response);
  }

  @PostMapping
  public ResponseEntity<?> createFolder(@Valid @RequestBody CreateFolderRequest request) {
    String userId = getCurrentUserId();
    
    // Check if a folder with the same name exists at this level
    String parentId = request.getParentId();
    if (parentId != null && parentId.trim().isEmpty()) {
       parentId = null;
    }

    if (folderRepository.existsByNameAndOwnerIdAndParentId(request.getName(), userId, parentId)) {
      return ResponseEntity
          .badRequest()
          .body(new MessageResponse("Error: Folder name is already taken at this location!"));
    }

    Folder folder = new Folder(request.getName(), userId, parentId);
    Folder savedFolder = folderRepository.save(folder);

    return ResponseEntity.ok(mapToResponse(savedFolder));
  }

  @PutMapping("/{id}")
  public ResponseEntity<?> updateFolder(@PathVariable String id, @Valid @RequestBody UpdateFolderRequest request) {
    String userId = getCurrentUserId();

    Optional<Folder> folderData = folderRepository.findByIdAndOwnerId(id, userId);

    if (folderData.isPresent()) {
      Folder folder = folderData.get();
      
      // Check if new name exists
      if (!folder.getName().equals(request.getName()) && 
          folderRepository.existsByNameAndOwnerIdAndParentId(request.getName(), userId, folder.getParentId())) {
          return ResponseEntity
              .badRequest()
              .body(new MessageResponse("Error: Folder name is already taken at this location!"));
      }

      folder.setName(request.getName());
      Folder updatedFolder = folderRepository.save(folder);
      return ResponseEntity.ok(mapToResponse(updatedFolder));
    } else {
      return ResponseEntity.notFound().build();
    }
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<?> deleteFolder(@PathVariable String id) {
    String userId = getCurrentUserId();
    
    Optional<Folder> folderData = folderRepository.findByIdAndOwnerId(id, userId);
    
    if (folderData.isPresent()) {
      // NOTE: In a real application, you might want to recursively delete children folders and files
      // or prevent deletion if it contains files. For this phase, we simply delete the folder.
      // To prevent orphaned folders, let's recursively delete children.
      deleteFolderRecursively(id, userId);
      return ResponseEntity.ok(new MessageResponse("Folder deleted successfully!"));
    } else {
      return ResponseEntity.notFound().build();
    }
  }

  private void deleteFolderRecursively(String folderId, String userId) {
      // 1. Delete all files inside this folder
      List<StorageFile> filesInFolder = fileRepository.findByOwnerIdAndFolderId(userId, folderId);
      for (StorageFile file : filesInFolder) {
          fileStorageService.deleteFilePhysical(file.getStoredPath());
          fileRepository.deleteById(file.getId());
      }

      // 2. Delete sub-folders recursively
      List<Folder> children = folderRepository.findByOwnerIdAndParentId(userId, folderId);
      for (Folder child : children) {
          deleteFolderRecursively(child.getId(), userId);
      }
      folderRepository.deleteById(folderId);
  }
}

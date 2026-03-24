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
import com.sharingfileweb.payload.request.ResolvePathRequest;
import com.sharingfileweb.payload.response.FolderResponse;
import com.sharingfileweb.payload.response.MessageResponse;
import com.sharingfileweb.payload.response.StandardResponse;
import com.sharingfileweb.services.FolderService;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/folders")
public class FolderController {

  @Autowired
  FolderService folderService;

  @GetMapping
  public ResponseEntity<?> getRootFolders() {
    List<FolderResponse> response = folderService.getRootFolders();
    return ResponseEntity.ok(StandardResponse.success("Fetched root folders successfully", response));
  }

  @GetMapping("/{id}")
  public ResponseEntity<?> getFolderById(@PathVariable String id) {
    if ("root".equals(id)) {
        FolderResponse root = new FolderResponse("root", "Thư Mục Gốc", null, null, null);
        return ResponseEntity.ok(StandardResponse.success("Fetched folder successfully", root));
    }
    try {
        FolderResponse response = folderService.getFolderById(id);
        return ResponseEntity.ok(StandardResponse.success("Fetched folder successfully", response));
    } catch (RuntimeException e) {
        return ResponseEntity.notFound().build();
    }
  }

  @GetMapping("/{id}/children")
  public ResponseEntity<?> getFolderChildren(@PathVariable String id) {
    List<FolderResponse> response = folderService.getFolderChildren(id);
    return ResponseEntity.ok(StandardResponse.success("Fetched folder children successfully", response));
  }

  @PostMapping
  public ResponseEntity<?> createFolder(@Valid @RequestBody CreateFolderRequest request) {
    try {
        FolderResponse response = folderService.createFolder(request);
        return ResponseEntity.ok(StandardResponse.success("Folder created successfully", response));
    } catch (RuntimeException e) {
        return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
    }
  }

  @PostMapping("/resolve-path")
  public ResponseEntity<?> resolvePath(@Valid @RequestBody ResolvePathRequest request) {
    try {
        FolderResponse response = folderService.resolvePath(request.getPath(), request.getParentId());
        return ResponseEntity.ok(StandardResponse.success("Path resolved successfully", response));
    } catch (RuntimeException e) {
        return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
    }
  }

  @PutMapping("/{id}")
  public ResponseEntity<?> updateFolder(@PathVariable String id, @Valid @RequestBody UpdateFolderRequest request) {
    try {
        FolderResponse response = folderService.updateFolder(id, request);
        return ResponseEntity.ok(StandardResponse.success("Folder updated successfully", response));
    } catch (RuntimeException e) {
        if (e.getMessage().equals("Folder not found")) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
    }
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<?> deleteFolder(@PathVariable String id) {
    try {
        folderService.deleteFolder(id);
        return ResponseEntity.ok(StandardResponse.success("Folder moved to trash!", null));
    } catch (RuntimeException e) {
        return ResponseEntity.notFound().build();
    }
  }

  @Autowired
  private com.sharingfileweb.repository.FolderRepository folderRepository;

  @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
  @GetMapping("/admin/all")
  public ResponseEntity<?> getAllFoldersForAdmin() {
      List<Folder> folders = folderRepository.findAll();
      return ResponseEntity.ok(StandardResponse.success("Fetched all folders", folders));
  }

  @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
  @DeleteMapping("/admin/{id}")
  public ResponseEntity<?> deleteFolderPermanentlyByAdmin(@PathVariable String id) {
      if (!folderRepository.existsById(id)) {
          return ResponseEntity.notFound().build();
      }
      folderRepository.deleteById(id);
      return ResponseEntity.ok(StandardResponse.success("Folder deleted permanently", null));
  }
}


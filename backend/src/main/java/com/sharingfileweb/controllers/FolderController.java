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

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/folders")
@Tag(name = "Folder Management", description = "Các API quản lý thư mục: tạo, sửa, xóa, lấy danh sách.")
public class FolderController {

  @Autowired
  FolderService folderService;

  @Operation(summary = "Lấy danh sách thư mục gốc", description = "Lấy danh sách các thư mục ở Root level của người dùng hiện tại.")
  @GetMapping
  public ResponseEntity<?> getRootFolders() {
    List<FolderResponse> response = folderService.getRootFolders();
    return ResponseEntity.ok(StandardResponse.success("Fetched root folders successfully", response));
  }

  @Operation(summary = "Lấy chi tiết thư mục", description = "Lấy thông tin của một thư mục dựa theo ID.")
  @GetMapping("/{id}")
  public ResponseEntity<?> getFolderById(@Parameter(description = "ID thư mục") @PathVariable String id) {
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

  @Operation(summary = "Lấy danh sách thư mục con", description = "Lấy danh sách các thư mục con trực tiếp của một thư mục.")
  @GetMapping("/{id}/children")
  public ResponseEntity<?> getFolderChildren(@Parameter(description = "ID thư mục cha") @PathVariable String id) {
    List<FolderResponse> response = folderService.getFolderChildren(id);
    return ResponseEntity.ok(StandardResponse.success("Fetched folder children successfully", response));
  }

  @Operation(summary = "Tạo thư mục mới", description = "Tạo một thư mục mới trong thư mục gốc hoặc trong một thư mục khác.")
  @PostMapping
  public ResponseEntity<?> createFolder(@Valid @RequestBody CreateFolderRequest request) {
    try {
        FolderResponse response = folderService.createFolder(request);
        return ResponseEntity.ok(StandardResponse.success("Folder created successfully", response));
    } catch (RuntimeException e) {
        return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
    }
  }

  @Operation(summary = "Lấy đường dẫn (Breadcrumb)", description = "Tính ra mảng thư mục để làm Breadcrumb giao diện.")
  @PostMapping("/resolve-path")
  public ResponseEntity<?> resolvePath(@Valid @RequestBody ResolvePathRequest request) {
    try {
        FolderResponse response = folderService.resolvePath(request.getPath(), request.getParentId());
        return ResponseEntity.ok(StandardResponse.success("Path resolved successfully", response));
    } catch (RuntimeException e) {
        return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
    }
  }

  @Operation(summary = "Cập nhật thư mục", description = "Đổi tên thư mục.")
  @PutMapping("/{id}")
  public ResponseEntity<?> updateFolder(@Parameter(description = "ID thư mục") @PathVariable String id, @Valid @RequestBody UpdateFolderRequest request) {
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

  @Operation(summary = "Xóa thư mục (Xóa mềm)", description = "Chuyển thư mục vào thùng rác.")
  @DeleteMapping("/{id}")
  public ResponseEntity<?> deleteFolder(@Parameter(description = "ID thư mục") @PathVariable String id) {
    try {
        folderService.deleteFolder(id);
        return ResponseEntity.ok(StandardResponse.success("Folder moved to trash!", null));
    } catch (RuntimeException e) {
        return ResponseEntity.notFound().build();
    }
  }

  @Autowired
  private com.sharingfileweb.repository.FolderRepository folderRepository;

  @Autowired
  private com.sharingfileweb.repository.FileRepository fileRepository;

  @Operation(summary = "Lấy các tệp trong thư mục (Quyền Admin)", description = "Lấy danh sách các tệp của một thư mục cụ thể.")
  @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
  @GetMapping("/{id}/files")
  public ResponseEntity<?> getFilesInFolderForAdmin(@Parameter(description = "ID thư mục") @PathVariable String id) {
      if (!folderRepository.existsById(id)) {
          return ResponseEntity.notFound().build();
      }
      java.util.List<com.sharingfileweb.models.StorageFile> files = fileRepository.findByFolderIdAndIsDeletedFalse(id);
      return ResponseEntity.ok(StandardResponse.success("Fetched files for folder successfully", files));
  }

  // GET /api/folders/all  → Admin: lấy toàn bộ folder hệ thống
  @Operation(summary = "Lấy tất cả thư mục (Quyền Admin)", description = "Lấy danh sách tất cả thư mục trong hệ thống.")
  @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
  @GetMapping("/all")
  public ResponseEntity<?> getAllFoldersForAdmin() {
      List<Folder> folders = folderRepository.findAll();
      return ResponseEntity.ok(StandardResponse.success("Fetched all folders", folders));
  }

  // DELETE /api/folders/{id}/permanent  → Admin: xóa cứng
  @Operation(summary = "Xóa vĩnh viễn thư mục (Quyền Admin)", description = "Xóa hoàn toàn thư mục khỏi DB.")
  @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
  @DeleteMapping("/{id}/permanent")
  public ResponseEntity<?> deleteFolderPermanentlyByAdmin(@Parameter(description = "ID thư mục cần xóa") @PathVariable String id) {
      if (!folderRepository.existsById(id)) {
          return ResponseEntity.notFound().build();
      }
      folderRepository.deleteById(id);
      return ResponseEntity.ok(StandardResponse.success("Folder deleted permanently", null));
  }
}


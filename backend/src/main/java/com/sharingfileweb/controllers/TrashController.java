package com.sharingfileweb.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.sharingfileweb.models.Folder;
import com.sharingfileweb.models.StorageFile;
import com.sharingfileweb.payload.response.MessageResponse;
import com.sharingfileweb.repository.FileRepository;
import com.sharingfileweb.repository.FolderRepository;
import com.sharingfileweb.security.services.FileStorageService;
import com.sharingfileweb.security.services.UserDetailsImpl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/trash")
public class TrashController {

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

    // Lấy toàn bộ rác (File & Folder)
    @GetMapping
    public ResponseEntity<?> getTrashItems() {
        String userId = getCurrentUserId();

        List<Folder> deletedFolders = folderRepository.findByOwnerIdAndIsDeletedTrue(userId);
        List<StorageFile> deletedFiles = fileRepository.findByOwnerIdAndIsDeletedTrue(userId);

        Map<String, Object> response = new HashMap<>();
        response.put("folders", deletedFolders);
        response.put("files", deletedFiles);

        return ResponseEntity.ok(response);
    }

    // Khôi phục Folder hoặc File
    @PutMapping("/restore/{type}/{id}")
    public ResponseEntity<?> restoreItem(@PathVariable String type, @PathVariable String id) {
        String userId = getCurrentUserId();

        if (type.equals("folder")) {
            Optional<Folder> folderData = folderRepository.findByIdAndOwnerIdAndIsDeletedTrue(id, userId);
            if (folderData.isPresent()) {
                Folder folder = folderData.get();
                // Check if parent directory still exists if it's not root
                if (folder.getParentId() != null && !folder.getParentId().isEmpty()) {
                     Optional<Folder> parentOpt = folderRepository.findById(folder.getParentId());
                     if (parentOpt.isPresent() && parentOpt.get().isDeleted()) {
                         return ResponseEntity.badRequest().body(new MessageResponse("Không thể khôi phục vì thư mục gốc chứa nó cũng đang trong thùng rác!"));
                     }
                }
                
                folder.setDeleted(false);
                folder.setDeletedAt(null);
                folderRepository.save(folder);
                
                // Cũng khôi phục tất cả thư mục và file con lồng bên trong (Recursion Restore)
                restoreRecursively(folder.getId(), userId);

                return ResponseEntity.ok(new MessageResponse("Đã khôi phục thư mục!"));
            }
        } 
        else if (type.equals("file")) {
            Optional<StorageFile> fileData = fileRepository.findByIdAndOwnerIdAndIsDeletedTrue(id, userId);
            if (fileData.isPresent()) {
                StorageFile file = fileData.get();
                // Check if target folder still exists
                if (file.getFolderId() != null && !file.getFolderId().isEmpty()) {
                    Optional<Folder> parentOpt = folderRepository.findById(file.getFolderId());
                    if (parentOpt.isPresent() && parentOpt.get().isDeleted()) {
                         return ResponseEntity.badRequest().body(new MessageResponse("Không thể khôi phục tệp vì thư mục gốc chứa nó cũng đang trong thùng rác!"));
                    }
                }
                file.setDeleted(false);
                file.setDeletedAt(null);
                fileRepository.save(file);
                return ResponseEntity.ok(new MessageResponse("Đã khôi phục tệp!"));
            }
        }

        return ResponseEntity.notFound().build();
    }

    private void restoreRecursively(String folderId, String userId) {
        // Restore immediate files
        List<StorageFile> files = fileRepository.findByOwnerIdAndIsDeletedTrue(userId).stream()
                   .filter(f -> folderId.equals(f.getFolderId())).toList();
        for (StorageFile f : files) {
            f.setDeleted(false);
            f.setDeletedAt(null);
            fileRepository.save(f);
        }

        // Restore immediate subfolders and trace down
        List<Folder> folders = folderRepository.findByOwnerIdAndIsDeletedTrue(userId).stream()
                   .filter(f -> folderId.equals(f.getParentId())).toList();
        for (Folder f : folders) {
            f.setDeleted(false);
            f.setDeletedAt(null);
            folderRepository.save(f);
            restoreRecursively(f.getId(), userId);
        }
    }

    // Xóa vĩnh viễn
    @DeleteMapping("/permanent/{type}/{id}")
    public ResponseEntity<?> deletePermanent(@PathVariable String type, @PathVariable String id) {
        String userId = getCurrentUserId();

        if (type.equals("folder")) {
            Optional<Folder> folderData = folderRepository.findByIdAndOwnerIdAndIsDeletedTrue(id, userId);
            if (folderData.isPresent()) {
                deletePermanentRecursively(id, userId);
                return ResponseEntity.ok(new MessageResponse("Đã xóa vĩnh viễn thư mục!"));
            }
        } 
        else if (type.equals("file")) {
            Optional<StorageFile> fileData = fileRepository.findByIdAndOwnerIdAndIsDeletedTrue(id, userId);
            if (fileData.isPresent()) {
                StorageFile file = fileData.get();
                fileStorageService.deleteFilePhysical(file.getStoredPath());
                fileRepository.deleteById(file.getId());
                return ResponseEntity.ok(new MessageResponse("Đã xóa vĩnh viễn tệp!"));
            }
        }

        return ResponseEntity.notFound().build();
    }

    private void deletePermanentRecursively(String folderId, String userId) {
        // Xóa File Storage gốc
        List<StorageFile> files = fileRepository.findByOwnerIdAndIsDeletedTrue(userId).stream()
                   .filter(f -> folderId.equals(f.getFolderId())).toList();
        for (StorageFile f : files) {
            fileStorageService.deleteFilePhysical(f.getStoredPath());
            fileRepository.deleteById(f.getId());
        }

        // Đệ quy xóa thư mục dưới
        List<Folder> folders = folderRepository.findByOwnerIdAndIsDeletedTrue(userId).stream()
                   .filter(f -> folderId.equals(f.getParentId())).toList();
        for (Folder f : folders) {
             deletePermanentRecursively(f.getId(), userId);
        }

        // Xóa vỏ folder cuối
        folderRepository.deleteById(folderId);
    }
}

package com.sharingfileweb.services;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.sharingfileweb.models.Folder;
import com.sharingfileweb.models.StorageFile;
import com.sharingfileweb.repository.FileRepository;
import com.sharingfileweb.repository.FolderRepository;
import com.sharingfileweb.security.services.UserDetailsImpl;

@Service
public class TrashService {

    @Autowired
    FolderRepository folderRepository;

    @Autowired
    FileRepository fileRepository;

    @Autowired
    B2StorageService b2StorageService;

    private String getCurrentUserId() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getId();
    }

    public Map<String, Object> getTrashItems() {
        String userId = getCurrentUserId();

        List<Folder> deletedFolders = folderRepository.findByOwnerIdAndIsDeletedTrue(userId);
        List<StorageFile> deletedFiles = fileRepository.findByOwnerIdAndIsDeletedTrue(userId);

        Map<String, Object> response = new HashMap<>();
        response.put("folders", deletedFolders);
        response.put("files", deletedFiles);

        return response;
    }

    public void restoreItem(String type, String id) {
        String userId = getCurrentUserId();

        if (type.equals("folder")) {
            Folder folder = folderRepository.findByIdAndOwnerIdAndIsDeletedTrue(id, userId)
                    .orElseThrow(() -> new RuntimeException("Folder not found in trash"));

            if (folder.getParentId() != null && !folder.getParentId().isEmpty()) {
                Optional<Folder> parentOpt = folderRepository.findById(folder.getParentId());
                if (parentOpt.isPresent() && parentOpt.get().isDeleted()) {
                    throw new RuntimeException("Không thể khôi phục vì thư mục gốc chứa nó cũng đang trong thùng rác!");
                }
            }

            folder.setDeleted(false);
            folder.setDeletedAt(null);
            folderRepository.save(folder);

            restoreRecursively(folder.getId(), userId);

        } else if (type.equals("file")) {
            StorageFile file = fileRepository.findByIdAndOwnerIdAndIsDeletedTrue(id, userId)
                    .orElseThrow(() -> new RuntimeException("File not found in trash"));

            if (file.getFolderId() != null && !file.getFolderId().isEmpty()) {
                Optional<Folder> parentOpt = folderRepository.findById(file.getFolderId());
                if (parentOpt.isPresent() && parentOpt.get().isDeleted()) {
                    throw new RuntimeException("Không thể khôi phục tệp vì thư mục gốc chứa nó cũng đang trong thùng rác!");
                }
            }
            file.setDeleted(false);
            file.setDeletedAt(null);
            fileRepository.save(file);
        } else {
            throw new IllegalArgumentException("Invalid type: " + type);
        }
    }

    private void restoreRecursively(String folderId, String userId) {
        List<StorageFile> files = fileRepository.findByOwnerIdAndIsDeletedTrue(userId).stream()
                .filter(f -> folderId.equals(f.getFolderId())).toList();
        for (StorageFile f : files) {
            f.setDeleted(false);
            f.setDeletedAt(null);
            fileRepository.save(f);
        }

        List<Folder> folders = folderRepository.findByOwnerIdAndIsDeletedTrue(userId).stream()
                .filter(f -> folderId.equals(f.getParentId())).toList();
        for (Folder f : folders) {
            f.setDeleted(false);
            f.setDeletedAt(null);
            folderRepository.save(f);
            restoreRecursively(f.getId(), userId);
        }
    }

    public void deletePermanent(String type, String id) {
        String userId = getCurrentUserId();

        if (type.equals("folder")) {
            Folder folder = folderRepository.findByIdAndOwnerIdAndIsDeletedTrue(id, userId)
                    .orElseThrow(() -> new RuntimeException("Folder not found in trash"));
            deletePermanentRecursively(id, userId);

        } else if (type.equals("file")) {
            StorageFile file = fileRepository.findByIdAndOwnerIdAndIsDeletedTrue(id, userId)
                    .orElseThrow(() -> new RuntimeException("File not found in trash"));
            
            // Xóa trên B2 trước khi xóa metadata
            deleteB2File(file);
            fileRepository.deleteById(file.getId());
        } else {
            throw new IllegalArgumentException("Invalid type: " + type);
        }
    }

    private void deletePermanentRecursively(String folderId, String userId) {
        List<StorageFile> files = fileRepository.findByOwnerIdAndIsDeletedTrue(userId).stream()
                .filter(f -> folderId.equals(f.getFolderId())).toList();
        for (StorageFile f : files) {
            deleteB2File(f);
            fileRepository.deleteById(f.getId());
        }

        List<Folder> folders = folderRepository.findByOwnerIdAndIsDeletedTrue(userId).stream()
                .filter(f -> folderId.equals(f.getParentId())).toList();
        for (Folder f : folders) {
            deletePermanentRecursively(f.getId(), userId);
        }

        folderRepository.deleteById(folderId);
    }

    public void emptyTrash() {
        String userId = getCurrentUserId();
        
        // Xóa tất cả files đã deleted (xóa B2 + DB)
        List<StorageFile> deletedFiles = fileRepository.findByOwnerIdAndIsDeletedTrue(userId);
        for (StorageFile file : deletedFiles) {
            deleteB2File(file);
            fileRepository.deleteById(file.getId());
        }

        // Xóa tất cả folders đã deleted
        List<Folder> deletedFolders = folderRepository.findByOwnerIdAndIsDeletedTrue(userId);
        for (Folder folder : deletedFolders) {
            deletePermanentRecursively(folder.getId(), userId);
        }
    }

    /**
     * Helper xóa file trên B2. Tách riêng để tái sử dụng và xử lý cả legacy (storedPath).
     */
    private void deleteB2File(StorageFile file) {
        if (file.getB2FileId() != null && !file.getB2FileId().isEmpty()) {
            b2StorageService.deleteFile(file.getB2FileId(), file.getB2FileName());
        }
        // Legacy files (storedPath) — không có B2 → skip, chỉ xóa metadata
    }
}

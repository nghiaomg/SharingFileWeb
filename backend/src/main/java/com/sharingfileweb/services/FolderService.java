package com.sharingfileweb.services;

import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.sharingfileweb.models.Folder;
import com.sharingfileweb.models.StorageFile;
import com.sharingfileweb.payload.request.CreateFolderRequest;
import com.sharingfileweb.payload.request.UpdateFolderRequest;
import com.sharingfileweb.payload.response.FolderResponse;
import com.sharingfileweb.repository.FileRepository;
import com.sharingfileweb.repository.FolderRepository;
import com.sharingfileweb.security.services.UserDetailsImpl;

@Service
public class FolderService {

    @Autowired
    FolderRepository folderRepository;

    @Autowired
    FileRepository fileRepository;

    @Autowired
    private B2StorageService b2StorageService;

    private String getCurrentUserId() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getId();
    }

    private FolderResponse mapToResponse(Folder folder) {
        return new FolderResponse(
                folder.getId(),
                folder.getName(),
                folder.getParentId(),
                folder.getCreatedAt(),
                folder.getUpdatedAt()
        );
    }

    public List<FolderResponse> getRootFolders() {
        String userId = getCurrentUserId();
        List<Folder> folders = folderRepository.findByOwnerIdAndIsDeletedFalse(userId)
                .stream()
                .filter(f -> f.getParentId() == null || f.getParentId().isEmpty())
                .collect(Collectors.toList());
        return folders.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public FolderResponse getFolderById(String id) {
        String userId = getCurrentUserId();
        return folderRepository.findByIdAndOwnerIdAndIsDeletedFalse(id, userId)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Folder not found"));
    }

    public List<FolderResponse> getFolderChildren(String id) {
        String userId = getCurrentUserId();
        if ("root".equals(id)) {
            return getRootFolders();
        }
        List<Folder> folders = folderRepository.findByOwnerIdAndParentIdAndIsDeletedFalse(userId, id);
        return folders.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public FolderResponse createFolder(CreateFolderRequest request) {
        String userId = getCurrentUserId();
        String parentId = request.getParentId();
        if (parentId != null && (parentId.trim().isEmpty() || "root".equals(parentId))) {
            parentId = null;
        }

        if (folderRepository.existsByNameAndOwnerIdAndParentIdAndIsDeletedFalse(request.getName(), userId, parentId)) {
            throw new RuntimeException("Error: Folder name is already taken at this location!");
        }

        Folder folder = new Folder(request.getName(), userId, parentId);
        Folder savedFolder = folderRepository.save(folder);
        return mapToResponse(savedFolder);
    }

    public FolderResponse updateFolder(String id, UpdateFolderRequest request) {
        String userId = getCurrentUserId();
        Folder folder = folderRepository.findByIdAndOwnerIdAndIsDeletedFalse(id, userId)
                .orElseThrow(() -> new RuntimeException("Folder not found"));

        if (!folder.getName().equals(request.getName()) &&
                folderRepository.existsByNameAndOwnerIdAndParentIdAndIsDeletedFalse(request.getName(), userId, folder.getParentId())) {
            throw new RuntimeException("Error: Folder name is already taken at this location!");
        }

        folder.setName(request.getName());
        Folder updatedFolder = folderRepository.save(folder);
        return mapToResponse(updatedFolder);
    }

    public synchronized FolderResponse resolvePath(String path, String rootParentId) {
        if (path == null || path.trim().isEmpty()) {
            throw new RuntimeException("Path cannot be empty");
        }
        String userId = getCurrentUserId();
        String currentParentId = (rootParentId != null && !rootParentId.trim().isEmpty() && !"root".equals(rootParentId)) ? rootParentId : null;
        
        String[] parts = path.split("/");
        Folder currentFolder = null;
        
        for (String part : parts) {
            String folderName = part.trim();
            if (folderName.isEmpty()) continue;
            
            // Check if folder exists
            Optional<Folder> existingFolder = folderRepository.findByNameAndOwnerIdAndParentIdAndIsDeletedFalse(folderName, userId, currentParentId);
            if (existingFolder.isPresent()) {
                currentFolder = existingFolder.get();
            } else {
                // Determine if there happens to be a conflict in the time we checked? 
                // Using synchronized will help prevent race conditions for identical paths on the same server instance.
                Folder newFolder = new Folder(folderName, userId, currentParentId);
                currentFolder = folderRepository.save(newFolder);
            }
            currentParentId = currentFolder.getId();
        }
        
        if (currentFolder == null) {
            if (rootParentId != null && !"root".equals(rootParentId)) {
                return getFolderById(rootParentId); // If path was essentially empty and resolved to parent
            }
            throw new RuntimeException("Could not resolve path");
        }
        
        return mapToResponse(currentFolder);
    }
    
    // ─── ADMIN CRUD ────────────────────────────────────────────────────────

    public FolderResponse adminCreateFolder(CreateFolderRequest request) {
        String parentId = request.getParentId();
        if (parentId != null && (parentId.trim().isEmpty() || "root".equals(parentId))) {
            parentId = null;
        }

        // Determine ownerId: if parent exists, inherit. Else admin's ID
        String ownerId = getCurrentUserId();
        if (parentId != null) {
            Folder parent = folderRepository.findById(parentId).orElseThrow(() -> new RuntimeException("Parent folder not found"));
            ownerId = parent.getOwnerId();
        }

        Folder folder = new Folder(request.getName(), ownerId, parentId);
        return mapToResponse(folderRepository.save(folder));
    }

    public FolderResponse adminUpdateFolder(String id, UpdateFolderRequest request) {
        Folder folder = folderRepository.findById(id).orElseThrow(() -> new RuntimeException("Folder not found"));
        folder.setName(request.getName());
        return mapToResponse(folderRepository.save(folder));
    }

    public void deleteFolder(String id) {
        String userId = getCurrentUserId();
        Folder folder = folderRepository.findByIdAndOwnerIdAndIsDeletedFalse(id, userId)
                .orElseThrow(() -> new RuntimeException("Folder not found"));
        deleteFolderRecursively(id, userId);
    }

    private void deleteFolderRecursively(String folderId, String userId) {
        Date now = new Date();
        Instant nowInstant = Instant.now();

        // 1. Soft delete all files inside this folder
        List<StorageFile> filesInFolder = fileRepository.findByOwnerIdAndFolderIdAndIsDeletedFalse(userId, folderId);
        for (StorageFile file : filesInFolder) {
            file.setDeleted(true);
            file.setDeletedAt(now);
            fileRepository.save(file);
        }

        // 2. Soft delete sub-folders recursively
        List<Folder> children = folderRepository.findByOwnerIdAndParentIdAndIsDeletedFalse(userId, folderId);
        for (Folder child : children) {
            deleteFolderRecursively(child.getId(), userId);
        }

        // Soft Delete the requested folder
        Folder folder = folderRepository.findById(folderId).orElse(null);
        if (folder != null) {
            folder.setDeleted(true);
            folder.setDeletedAt(nowInstant);
            folderRepository.save(folder);
        }
    }

    public void deleteFolderPermanentlyByAdmin(String folderId) {
        // Find all files in this folder (including soft-deleted)
        List<StorageFile> filesInFolder = fileRepository.findByFolderId(folderId);
        for (StorageFile file : filesInFolder) {
            if (file.getB2FileId() != null && !file.getB2FileId().isEmpty()) {
                try {
                    b2StorageService.deleteFile(file.getB2FileId(), file.getB2FileName());
                } catch (Exception e) {
                    System.err.println("Failed to delete B2 file: " + e.getMessage());
                }
            }
            fileRepository.delete(file);
        }

        // Find subfolders
        List<Folder> children = folderRepository.findByParentId(folderId);
        for (Folder child : children) {
            deleteFolderPermanentlyByAdmin(child.getId());
        }

        folderRepository.deleteById(folderId);
    }
}

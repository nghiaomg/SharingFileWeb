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
        List<Folder> folders = folderRepository.findByOwnerIdAndParentIdAndIsDeletedFalse(userId, id);
        return folders.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public FolderResponse createFolder(CreateFolderRequest request) {
        String userId = getCurrentUserId();
        String parentId = request.getParentId();
        if (parentId != null && parentId.trim().isEmpty()) {
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
}

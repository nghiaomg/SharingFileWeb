package com.sharingfileweb.services;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.sharingfileweb.models.SharedAccess;
import com.sharingfileweb.models.StorageFile;
import com.sharingfileweb.models.User;
import com.sharingfileweb.payload.response.FileResponse;
import com.sharingfileweb.payload.response.SharedAccessResponse;
import com.sharingfileweb.repository.FileRepository;
import com.sharingfileweb.repository.SharedAccessRepository;
import com.sharingfileweb.repository.UserRepository;
import com.sharingfileweb.security.services.UserDetailsImpl;

@Service
public class SharedAccessService {

    @Autowired
    private SharedAccessRepository sharedAccessRepository;

    @Autowired
    private FileRepository fileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    private String getCurrentUserId() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getId();
    }

    private String getCurrentUserEmail() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getEmail();
    }

    public List<SharedAccessResponse> shareWithUsers(String fileId, List<String> emails, String permission) {
        String userId = getCurrentUserId();
        String userEmail = getCurrentUserEmail();

        StorageFile file = fileRepository.findByIdAndOwnerIdAndIsDeletedFalse(fileId, userId)
                .orElseThrow(() -> new RuntimeException("File không tồn tại hoặc bạn không có quyền"));

        User owner = userRepository.findById(userId).orElseThrow();
        List<SharedAccessResponse> results = new ArrayList<>();

        for (String recipientEmail : emails) {
            if (recipientEmail.equalsIgnoreCase(userEmail)) continue;

            // Check if already shared
            var existing = sharedAccessRepository.findByFileIdAndRecipientEmailAndIsRevokedFalse(fileId, recipientEmail);
            if (existing.isPresent()) {
                // Update permission
                SharedAccess access = existing.get();
                access.setPermission(permission != null ? permission : "VIEW");
                sharedAccessRepository.save(access);
                results.add(mapToResponse(access, file));
                continue;
            }

            SharedAccess access = new SharedAccess(fileId, userId, userEmail, recipientEmail, permission != null ? permission : "VIEW");
            SharedAccess saved = sharedAccessRepository.save(access);
            results.add(mapToResponse(saved, file));

            // Send notification
            Map<String, String> metadata = new HashMap<>();
            metadata.put("fileId", fileId);
            metadata.put("fileName", file.getName());
            metadata.put("senderName", owner.getUsername());
            metadata.put("senderEmail", userEmail);
            metadata.put("permission", permission != null ? permission : "VIEW");

            notificationService.createNotification(
                    recipientEmail,
                    "FILE_SHARED",
                    "Có tệp được chia sẻ với bạn",
                    owner.getUsername() + " đã chia sẻ tệp \"" + file.getName() + "\" với bạn.",
                    metadata
            );
        }

        return results;
    }

    public List<SharedAccessResponse> getSharedWithMe() {
        String email = getCurrentUserEmail();
        List<SharedAccess> accesses = sharedAccessRepository.findByRecipientEmailAndIsRevokedFalse(email);

        return accesses.stream().map(access -> {
            StorageFile file = fileRepository.findById(access.getFileId()).orElse(null);
            if (file == null || file.isDeleted()) return null;
            return mapToResponse(access, file);
        }).filter(r -> r != null).collect(Collectors.toList());
    }

    public List<SharedAccessResponse> getSharedByMe() {
        String userId = getCurrentUserId();
        List<SharedAccess> accesses = sharedAccessRepository.findByOwnerIdAndIsRevokedFalse(userId);

        return accesses.stream().map(access -> {
            StorageFile file = fileRepository.findById(access.getFileId()).orElse(null);
            if (file == null || file.isDeleted()) return null;
            return mapToResponse(access, file);
        }).filter(r -> r != null).collect(Collectors.toList());
    }

    public List<SharedAccessResponse> getAccessesForFile(String fileId) {
        String userId = getCurrentUserId();
        // Verify ownership
        fileRepository.findByIdAndOwnerIdAndIsDeletedFalse(fileId, userId)
                .orElseThrow(() -> new RuntimeException("File không tồn tại hoặc bạn không có quyền"));

        List<SharedAccess> accesses = sharedAccessRepository.findByFileIdAndIsRevokedFalse(fileId);
        return accesses.stream().map(access -> {
            StorageFile file = fileRepository.findById(access.getFileId()).orElse(null);
            return file != null ? mapToResponse(access, file) : null;
        }).filter(r -> r != null).collect(Collectors.toList());
    }

    public SharedAccessResponse updatePermission(String accessId, String newPermission) {
        String userId = getCurrentUserId();
        SharedAccess access = sharedAccessRepository.findByIdAndOwnerId(accessId, userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy quyền truy cập"));
        access.setPermission(newPermission);
        sharedAccessRepository.save(access);

        StorageFile file = fileRepository.findById(access.getFileId()).orElse(null);
        return mapToResponse(access, file);
    }

    public void revokeAccess(String accessId) {
        String userId = getCurrentUserId();
        SharedAccess access = sharedAccessRepository.findByIdAndOwnerId(accessId, userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy quyền truy cập"));
        access.setRevoked(true);
        sharedAccessRepository.save(access);
    }

    public void revokeAllForFile(String fileId) {
        String userId = getCurrentUserId();
        fileRepository.findByIdAndOwnerIdAndIsDeletedFalse(fileId, userId)
                .orElseThrow(() -> new RuntimeException("File không tồn tại hoặc bạn không có quyền"));

        List<SharedAccess> accesses = sharedAccessRepository.findByFileIdAndIsRevokedFalse(fileId);
        for (SharedAccess access : accesses) {
            access.setRevoked(true);
            sharedAccessRepository.save(access);
        }
    }

    public List<FileResponse> getSharedFolderContent(String accessId) {
        String email = getCurrentUserEmail();
        SharedAccess access = sharedAccessRepository.findById(accessId)
                .orElseThrow(() -> new RuntimeException("Truy cập không tồn tại"));

        if (!access.getRecipientEmail().equals(email) && !email.equals(access.getOwnerEmail())) {
            throw new RuntimeException("Bạn không có quyền truy cập");
        }
        if (access.isRevoked()) {
            throw new RuntimeException("Quyền truy cập đã bị thu hồi");
        }

        StorageFile folder = fileRepository.findById(access.getFileId())
                .orElseThrow(() -> new RuntimeException("Thư mục không tồn tại"));

        if (!"folder".equals(folder.getType())) {
            throw new RuntimeException("Đây không phải là thư mục");
        }

        List<StorageFile> children = fileRepository.findByOwnerIdAndFolderIdAndIsDeletedFalse(folder.getOwnerId(), folder.getId());
        
        return children.stream().map(file -> new FileResponse(
                file.getId(), file.getName(), file.getType(), file.getSize(),
                file.getFolderId(), file.getCreatedAt(), file.isPublic(),
                access.getPermission(), new ArrayList<>(), null
        )).collect(Collectors.toList());
    }

    private SharedAccessResponse mapToResponse(SharedAccess access, StorageFile file) {
        return new SharedAccessResponse(
                access.getId(),
                access.getFileId(),
                file != null ? file.getName() : "Unknown",
                file != null ? file.getType() : "",
                file != null ? file.getSize() : 0,
                access.getOwnerEmail(),
                access.getRecipientEmail(),
                access.getPermission(),
                access.getCreatedAt()
        );
    }
}

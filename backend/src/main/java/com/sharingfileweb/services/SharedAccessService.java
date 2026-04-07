package com.sharingfileweb.services;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
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

    @Autowired
    private EmailService emailService;

    private String getCurrentUserId() {
        return ((UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal()).getId();
    }

    private String getCurrentUserEmail() {
        return ((UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal()).getEmail();
    }

    // ─── Create Shared Access ──────────────────────────────────────────────────

    /**
     * Chia sẻ file với danh sách email.
     *
     * @param fileId      ID của file cần chia sẻ
     * @param emails      Danh sách email người nhận
     * @param permission  "VIEW" hoặc "DOWNLOAD"
     * @param expiresInDays Số ngày hết hạn — nullable = không hết hạn
     */
    public List<SharedAccessResponse> shareWithUsers(String fileId, List<String> emails,
                                                      String permission, Long expiresInDays) {
        String userId = getCurrentUserId();
        String userEmail = getCurrentUserEmail();

        StorageFile fileToShare = fileRepository.findByIdAndOwnerIdAndIsDeletedFalse(fileId, userId)
                .orElseThrow(() -> new RuntimeException("File không tồn tại hoặc bạn không có quyền"));

        User owner = userRepository.findById(userId).orElseThrow();

        Instant expiresAt = null;
        if (expiresInDays != null && expiresInDays > 0) {
            expiresAt = Instant.now().plus(expiresInDays, ChronoUnit.DAYS);
        }

        List<SharedAccessResponse> results = new ArrayList<>();

        for (String recipientEmail : emails) {
            if (recipientEmail.equalsIgnoreCase(userEmail)) continue;

            // Update existing if already shared
            Optional<SharedAccess> existing = sharedAccessRepository
                    .findByFileIdAndRecipientEmailAndIsRevokedFalse(fileId, recipientEmail);

            if (existing.isPresent()) {
                SharedAccess access = existing.get();
                access.setPermission(permission != null ? permission : "VIEW");
                access.setExpiresAt(expiresAt);
                sharedAccessRepository.save(access);
                results.add(mapToResponse(access, fileRepository.findById(fileId).orElse(null)));
                continue;
            }

            SharedAccess access = new SharedAccess(
                    fileId, userId, userEmail, recipientEmail,
                    permission != null ? permission : "VIEW");
            access.setExpiresAt(expiresAt);

            SharedAccess saved = sharedAccessRepository.save(access);
            results.add(mapToResponse(saved, fileRepository.findById(fileId).orElse(null)));

            // Send notification
            Map<String, String> metadata = new HashMap<>();
            metadata.put("fileId", fileId);
            metadata.put("fileName", owner.getUsername());
            metadata.put("senderEmail", userEmail);
            metadata.put("permission", permission != null ? permission : "VIEW");
            metadata.put("expiresAt", expiresAt != null ? expiresAt.toString() : "never");

            notificationService.createNotification(
                    recipientEmail,
                    "FILE_SHARED",
                    "Có tệp được chia sẻ với bạn",
                    owner.getUsername() + " đã chia sẻ tệp \"" + fileToShare.getName() + "\" với bạn.",
                    metadata
            );

            emailService.sendShareInvitationEmail(recipientEmail, owner.getUsername(),
                    fileToShare.getName(), fileId);
        }

        return results;
    }

    // ─── Query ─────────────────────────────────────────────────────────────────

    /** Files được chia sẻ cho tôi. */
    public List<SharedAccessResponse> getSharedWithMe() {
        String email = getCurrentUserEmail();
        return sharedAccessRepository.findByRecipientEmailAndIsRevokedFalse(email).stream()
                .filter(access -> !isExpired(access))
                .map(access -> mapToResponse(access,
                        fileRepository.findById(access.getFileId()).orElse(null)))
                .collect(Collectors.toList());
    }

    /** Files tôi đã chia sẻ cho người khác. */
    public List<SharedAccessResponse> getSharedByMe() {
        String userId = getCurrentUserId();
        return sharedAccessRepository.findByOwnerIdAndIsRevokedFalse(userId).stream()
                .filter(access -> !isExpired(access))
                .map(access -> mapToResponse(access,
                        fileRepository.findById(access.getFileId()).orElse(null)))
                .collect(Collectors.toList());
    }

    /** Ai đang có quyền truy cập file này. */
    public List<SharedAccessResponse> getAccessesForFile(String fileId) {
        String userId = getCurrentUserId();
        fileRepository.findByIdAndOwnerIdAndIsDeletedFalse(fileId, userId)
                .orElseThrow(() -> new RuntimeException("File không tồn tại hoặc bạn không có quyền"));

        return sharedAccessRepository.findByFileIdAndIsRevokedFalse(fileId).stream()
                .map(access -> mapToResponse(access,
                        fileRepository.findById(access.getFileId()).orElse(null)))
                .collect(Collectors.toList());
    }

    /** Cập nhật permission của một SharedAccess. */
    public SharedAccessResponse updatePermission(String accessId, String newPermission) {
        String userId = getCurrentUserId();
        SharedAccess access = sharedAccessRepository.findByIdAndOwnerId(accessId, userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy quyền truy cập"));
        access.setPermission(newPermission);
        sharedAccessRepository.save(access);
        return mapToResponse(access, fileRepository.findById(access.getFileId()).orElse(null));
    }

    /** Thu hồi một quyền truy cập. */
    public void revokeAccess(String accessId) {
        String userId = getCurrentUserId();
        SharedAccess access = sharedAccessRepository.findByIdAndOwnerId(accessId, userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy quyền truy cập"));
        access.setRevoked(true);
        sharedAccessRepository.save(access);
    }

    /** Thu hồi tất cả quyền truy cập của một file. */
    public void revokeAllForFile(String fileId) {
        String userId = getCurrentUserId();
        fileRepository.findByIdAndOwnerIdAndIsDeletedFalse(fileId, userId)
                .orElseThrow(() -> new RuntimeException("File không tồn tại hoặc bạn không có quyền"));

        sharedAccessRepository.findByFileIdAndIsRevokedFalse(fileId)
                .forEach(access -> {
                    access.setRevoked(true);
                    sharedAccessRepository.save(access);
                });
    }

    /** Lấy nội dung thư mục được chia sẻ. */
    public List<FileResponse> getSharedFolderContent(String accessId) {
        String email = getCurrentUserEmail();
        SharedAccess access = sharedAccessRepository.findById(accessId)
                .orElseThrow(() -> new RuntimeException("Truy cập không tồn tại"));

        if (!access.getRecipientEmail().equals(email) && !email.equals(access.getOwnerEmail())) {
            throw new RuntimeException("Bạn không có quyền truy cập");
        }
        if (access.isRevoked() || isExpired(access)) {
            throw new RuntimeException("Quyền truy cập đã bị thu hồi hoặc hết hạn");
        }

        StorageFile folder = fileRepository.findById(access.getFileId())
                .orElseThrow(() -> new RuntimeException("Thư mục không tồn tại"));

        if (!"folder".equals(folder.getType())) {
            throw new RuntimeException("Đây không phải là thư mục");
        }

        List<StorageFile> children = fileRepository
                .findByOwnerIdAndFolderIdAndIsDeletedFalse(folder.getOwnerId(), folder.getId());

        return children.stream().map(file -> new FileResponse(
                file.getId(), file.getName(), file.getType(), file.getSize(),
                file.getFolderId(), file.getCreatedAt(), file.isPublic(),
                access.getPermission(), new ArrayList<>(), null, false
        )).collect(Collectors.toList());
    }

    // ─── Access Validation ─────────────────────────────────────────────────────

    /**
     * Kiểm tra recipient có quyền truy cập file hay không.
     * @return SharedAccess nếu hợp lệ
     */
    public Optional<SharedAccess> canAccessFile(String recipientEmail, String fileId) {
        return sharedAccessRepository
                .findByFileIdAndRecipientEmailAndIsRevokedFalse(fileId, recipientEmail)
                .filter(access -> !isExpired(access));
    }

    // ─── Private Helpers ───────────────────────────────────────────────────────

    private boolean isExpired(SharedAccess access) {
        return access.getExpiresAt() != null
                && access.getExpiresAt().isBefore(Instant.now());
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

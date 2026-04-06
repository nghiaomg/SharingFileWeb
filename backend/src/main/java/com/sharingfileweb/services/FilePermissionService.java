package com.sharingfileweb.services;

import com.sharingfileweb.exception.FileAccessDeniedException;
import com.sharingfileweb.models.SharedAccess;
import com.sharingfileweb.models.ShareLink;
import com.sharingfileweb.models.StorageFile;
import com.sharingfileweb.repository.FileRepository;
import com.sharingfileweb.repository.SharedAccessRepository;
import com.sharingfileweb.repository.ShareLinkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

/**
 * ⭐ Single source of truth cho mọi quyền truy cập file/folder.
 *
 * <p>Quyền truy cập file chỉ có 2 nguồn:
 * <ol>
 *   <li>Owner — người sở hữu file</li>
 *   <li>SharedAccess — được chia sẻ với email trong hệ thống</li>
 * </ol>
 *
 * <p>Legacy fields trên StorageFile (accessMode, isPublic, sharedEmails)
 * KHÔNG được đọc trong bất kỳ logic phân quyền nào ở đây.
 */
@Service
public class FilePermissionService {

    @Autowired
    private FileRepository fileRepository;

    @Autowired
    private SharedAccessRepository sharedAccessRepository;

    @Autowired
    private ShareLinkRepository shareLinkRepository;

    // ─── File Access Checks ────────────────────────────────────────────────────

    /**
     * Kiểm tra user có quyền truy cập file hay không.
     * Quyền hợp lệ: OWNER > DOWNLOAD > VIEW.
     *
     * @param userId            ID của user hiện tại
     * @param email             Email của user hiện tại (lấy từ UserDetailsImpl)
     * @param fileId            ID của file cần kiểm tra
     * @param requiredPermission "VIEW" hoặc "DOWNLOAD"
     * @return true nếu có quyền
     */
    public boolean canAccessFile(String userId, String email, String fileId, String requiredPermission) {
        if (userId == null || fileId == null) return false;

        // 1. Owner = full quyền
        if (isOwner(userId, fileId)) return true;

        // 2. SharedAccess = kiểm tra permission + expiry
        return hasSharedAccess(email, fileId, requiredPermission);
    }

    /**
     * Convenience: overload nhận email = userId.
     * Dùng khi SharedAccess lưu userId trong recipientEmail.
     */
    public boolean canAccessFileById(String userId, String fileId, String requiredPermission) {
        return canAccessFile(userId, userId, fileId, requiredPermission);
    }

    /**
     * Kiểm tra user có quyền truy cập folder hay không.
     */
    public boolean canAccessFolder(String userId, String folderId) {
        if (userId == null || folderId == null) return false;
        return fileRepository.findByIdAndOwnerIdAndIsDeletedFalse(folderId, userId).isPresent();
    }

    /**
     * Chỉ owner mới được tạo share link.
     */
    public boolean canCreateShareLink(String userId, String fileId) {
        if (userId == null || fileId == null) return false;
        return isOwner(userId, fileId);
    }

    /**
     * Convenience wrapper — ném exception nếu không có quyền.
     */
    public void checkFileAccess(String userId, String email, String fileId, String requiredPermission) {
        if (!canAccessFile(userId, email, fileId, requiredPermission)) {
            throw new FileAccessDeniedException("Bạn không có quyền truy cập file này.");
        }
    }

    public void checkFileAccessById(String userId, String fileId, String requiredPermission) {
        checkFileAccess(userId, userId, fileId, requiredPermission);
    }

    /**
     * Lấy StorageFile nếu user có quyền, ném exception nếu không.
     */
    public StorageFile getAccessibleFile(String userId, String email,
                                          String fileId, String requiredPermission) {
        checkFileAccess(userId, email, fileId, requiredPermission);
        StorageFile file = fileRepository.findById(fileId)
                .orElseThrow(() -> new FileAccessDeniedException("File not found"));
        if (file.isBanned()) {
            throw new FileAccessDeniedException("File này đang bị tạm khóa hoặc chặn do vi phạm.");
        }
        return file;
    }

    // ─── ShareLink Access Checks ────────────────────────────────────────────────

    /**
     * Kiểm tra share token còn hợp lệ để truy cập với required permission.
     *
     * <p>Check tuần tự:
     * <ol>
     *   <li>Token tồn tại?</li>
     *   <li>Link đã bị revoke?</li>
     *   <li>Link đã hết hạn?</li>
     *   <li>Đã đạt maxViews?</li>
     *   <li>Permission đủ (VIEW link không cho DOWNLOAD)?</li>
     * </ol>
     */
    public boolean canAccessFileViaLink(String token, String requiredPermission) {
        if (token == null) return false;

        Optional<ShareLink> linkOpt = shareLinkRepository.findByToken(token);
        if (linkOpt.isEmpty()) return false;

        return isLinkValidForPermission(linkOpt.get(), requiredPermission);
    }

    /**
     * Lấy ShareLink nếu token hợp lệ.
     * Không kiểm tra permission — chỉ kiểm tra token tồn tại và chưa bị revoke/expire.
     */
    public Optional<ShareLink> getValidShareLink(String token) {
        if (token == null) return Optional.empty();
        return shareLinkRepository.findByToken(token)
                .filter(link -> !link.isRevoked()
                        && (link.getExpiresAt() == null || link.getExpiresAt().isAfter(Instant.now()))
                        && !isMaxViewsExceeded(link));
    }

    // ─── Private Helpers ───────────────────────────────────────────────────────

    private boolean isOwner(String userId, String fileId) {
        return fileRepository.findByIdAndOwnerIdAndIsDeletedFalse(fileId, userId).isPresent();
    }

    /**
     * Kiểm tra SharedAccess: tồn tại, không revoked, chưa hết hạn,
     * và permission đủ (DOWNLOAD >= VIEW).
     */
    private boolean hasSharedAccess(String email, String fileId, String requiredPermission) {
        Optional<SharedAccess> accessOpt = sharedAccessRepository
                .findByFileIdAndRecipientEmailAndIsRevokedFalse(fileId, email);

        if (accessOpt.isEmpty()) return false;

        SharedAccess access = accessOpt.get();

        // Hết hạn = không có quyền
        if (access.getExpiresAt() != null && access.getExpiresAt().isBefore(Instant.now())) {
            return false;
        }

        // Kiểm tra permission level
        return permissionSatisfies(access.getPermission(), requiredPermission);
    }

    /**
     * Kiểm tra ShareLink có hợp lệ cho requiredPermission hay không.
     * KHÔNG tăng viewCount ở đây — caller phải tự tăng.
     */
    private boolean isLinkValidForPermission(ShareLink link, String requiredPermission) {
        if (link.isRevoked()) return false;
        if (link.getExpiresAt() != null && link.getExpiresAt().isBefore(Instant.now())) return false;
        if (isMaxViewsExceeded(link)) return false;
        if (!permissionSatisfies(link.getPermission(), requiredPermission)) return false;
        return true;
    }

    private boolean isMaxViewsExceeded(ShareLink link) {
        if (link.getMaxViews() == null) return false; // unlimited
        return link.getViewCount() >= link.getMaxViews();
    }

    /**
     * DOWNLOAD satisfies VIEW (vì download = view + save).
     * VIEW does NOT satisfy DOWNLOAD.
     */
    private boolean permissionSatisfies(String actual, String required) {
        if (actual == null) return false;
        if ("DOWNLOAD".equals(required)) return "DOWNLOAD".equals(actual);
        // VIEW required: both VIEW and DOWNLOAD satisfy
        return "VIEW".equals(actual) || "DOWNLOAD".equals(actual);
    }
}

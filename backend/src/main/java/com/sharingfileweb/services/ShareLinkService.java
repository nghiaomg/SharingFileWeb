package com.sharingfileweb.services;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.sharingfileweb.config.PresignedUrlConfig;
import com.sharingfileweb.dto.ShareLinkDetailResponse;
import com.sharingfileweb.exception.ShareLinkExpiredException;
import com.sharingfileweb.exception.ShareLinkMaxViewsExceededException;
import com.sharingfileweb.exception.ShareLinkRequiresPasswordException;
import com.sharingfileweb.exception.ShareLinkRevokedException;
import com.sharingfileweb.models.ShareLink;
import com.sharingfileweb.models.StorageFile;
import com.sharingfileweb.payload.response.FileResponse;
import com.sharingfileweb.payload.response.ShareLinkResponse;
import com.sharingfileweb.repository.FileRepository;
import com.sharingfileweb.repository.ShareLinkRepository;
import com.sharingfileweb.security.services.UserDetailsImpl;

@Service
public class ShareLinkService {

    @Autowired
    private ShareLinkRepository shareLinkRepository;

    @Autowired
    private FileRepository fileRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private PresignedUrlConfig presignedUrlConfig;

    private String getCurrentUserId() {
        return ((UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal()).getId();
    }

    @Autowired
    private B2StorageService b2StorageService;

    // ─── Create / Update ─────────────────────────────────────────────────────

    /**
     * Tạo share link mới.
     * @param fileId     ID của file
     * @param permission "VIEW" hoặc "DOWNLOAD"
     * @param rawPassword Mật khẩu bảo vệ link — nullable
     * @param expiresInDays Số ngày hết hạn — nullable = never
     * @param maxViews   Số lượt truy cập tối đa — nullable = unlimited
     */
    public ShareLinkResponse createLink(String fileId, String permission, String rawPassword,
                                        Long expiresInDays, Long maxViews) {
        String userId = getCurrentUserId();

        StorageFile file = fileRepository.findByIdAndOwnerIdAndIsDeletedFalse(fileId, userId)
                .orElseThrow(() -> new RuntimeException("File không tồn tại hoặc bạn không có quyền"));

        String token = UUID.randomUUID().toString();
        String hashedPassword = (rawPassword != null && !rawPassword.trim().isEmpty())
                ? passwordEncoder.encode(rawPassword) : null;

        Instant expiresAt = (expiresInDays != null && expiresInDays > 0)
                ? Instant.now().plus(expiresInDays, ChronoUnit.DAYS) : null;

        ShareLink link = new ShareLink(
                fileId, token, userId,
                permission != null ? permission : "VIEW",
                hashedPassword, expiresAt);
        link.setViewCount(0L);
        link.setMaxViews(maxViews);

        return mapToResponse(shareLinkRepository.save(link));
    }

    /**
     * Cập nhật share link.
     */
    public ShareLinkResponse updateLink(String linkId, String permission,
                                       String rawPassword, Long expiresInDays) {
        String userId = getCurrentUserId();
        ShareLink link = shareLinkRepository.findByIdAndOwnerId(linkId, userId)
                .orElseThrow(() -> new RuntimeException("Link không tồn tại hoặc bạn không có quyền"));

        if (permission != null && !permission.trim().isEmpty()) {
            link.setPermission(permission);
        }
        if (rawPassword != null) {
            link.setPassword(rawPassword.trim().isEmpty() ? null
                    : passwordEncoder.encode(rawPassword));
        }
        if (expiresInDays != null) {
            if (expiresInDays == -1) {
                link.setExpiresAt(null);
            } else if (expiresInDays > 0) {
                link.setExpiresAt(Instant.now().plus(expiresInDays, ChronoUnit.DAYS));
            }
        }
        return mapToResponse(shareLinkRepository.save(link));
    }

    /**
     * Thu hồi share link.
     */
    public void revokeLink(String linkId) {
        String userId = getCurrentUserId();
        ShareLink link = shareLinkRepository.findByIdAndOwnerId(linkId, userId)
                .orElseThrow(() -> new RuntimeException("Link không tồn tại"));
        link.setRevoked(true);
        shareLinkRepository.save(link);
    }

    // ─── Validate & Access ────────────────────────────────────────────────────

    /**
     * Validate share token và tăng viewCount atomically.
     *
     * <p>Ném exception thay vì trả về nếu không hợp lệ:
     * <ul>
     *   <li>REQUIRES_PASSWORD — cần mật khẩu</li>
     *   <li>Link đã hết hạn</li>
     *   <li>Link đã bị thu hồi</li>
     *   <li>Đã đạt maxViews</li>
     * </ul>
     *
     * @return ShareLink nếu hợp lệ (viewCount đã được tăng)
     */
    public ShareLink validateLink(String token, String rawPassword) {
        ShareLink link = shareLinkRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Link không tồn tại"));

        // 1. Revoked check
        if (link.isRevoked()) {
            throw new ShareLinkRevokedException("Link đã bị thu hồi");
        }

        // 2. Expiry check
        if (link.getExpiresAt() != null && link.getExpiresAt().isBefore(Instant.now())) {
            throw new ShareLinkExpiredException("Link đã hết hạn");
        }

        // 3. Password check
        if (link.getPassword() != null) {
            if (rawPassword == null || rawPassword.isEmpty()) {
                throw new ShareLinkRequiresPasswordException("REQUIRES_PASSWORD");
            }
            if (!passwordEncoder.matches(rawPassword, link.getPassword())) {
                throw new RuntimeException("Mật khẩu không đúng");
            }
        }

        // 4. Max views check (trước khi tăng)
        if (link.getMaxViews() != null && link.getViewCount() >= link.getMaxViews()) {
            throw new ShareLinkMaxViewsExceededException(
                    "Link đã đạt số lượt truy cập tối đa (" + link.getMaxViews() + ")");
        }

        // 5. Atomic increment viewCount
        incrementViewCount(token);

        // Refresh link from DB to get updated viewCount
        return shareLinkRepository.findByToken(token).orElse(link);
    }

    /**
     * Atomic increment viewCount bằng MongoDB $inc operator.
     */
    private void incrementViewCount(String token) {
        Query query = new Query(Criteria.where("token").is(token));
        Update update = new Update().inc("viewCount", 1);
        mongoTemplate.updateFirst(query, update, ShareLink.class);
    }

    /**
     * Tạo presigned URL cho share link.
     * Dùng trong PublicShareController.
     */
    public String getPresignedUrlForShareLink(ShareLink link, boolean inline) {
        StorageFile file = fileRepository.findById(link.getFileId()).orElse(null);
        if (file == null || file.isDeleted()) {
            throw new RuntimeException("File không tồn tại");
        }
        if (file.getB2FileName() == null || file.getB2FileName().isEmpty()) {
            throw new RuntimeException("File chưa được migrate lên cloud storage.");
        }

        // Tính effective duration = min(config, link.expiresAt)
        java.time.Duration duration = presignedUrlConfig.getDownload();
        if (link.getExpiresAt() != null) {
            java.time.Duration remaining = java.time.Duration.between(
                    Instant.now(), link.getExpiresAt());
            if (remaining.isNegative() || remaining.isZero()) {
                throw new ShareLinkExpiredException("Link đã hết hạn");
            }
            if (remaining.compareTo(duration) < 0) {
                duration = remaining;
            }
        }

        return b2StorageService.getPresignedDownloadUrl(
                file.getB2FileName(), file.getName(), inline, duration);
    }

    // ─── Listings ─────────────────────────────────────────────────────────────

    /** Lấy danh sách links của một file. */
    public List<ShareLinkResponse> getLinksForFile(String fileId) {
        String userId = getCurrentUserId();
        return shareLinkRepository.findByFileIdAndOwnerIdAndIsRevokedFalse(fileId, userId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    /** Lấy chi tiết link (bao gồm viewCount, remainingViews) cho owner. */
    public List<ShareLinkDetailResponse> getLinkDetailsForFile(String fileId) {
        String userId = getCurrentUserId();
        return shareLinkRepository.findByFileIdAndOwnerIdAndIsRevokedFalse(fileId, userId)
                .stream().map(this::mapToDetailResponse).collect(Collectors.toList());
    }

    /** Lấy nội dung thư mục qua share link. */
    public List<FileResponse> getPublicFolderContent(String token, String rawPassword) {
        ShareLink link = validateLink(token, rawPassword);
        StorageFile folder = fileRepository.findById(link.getFileId())
                .orElseThrow(() -> new RuntimeException("Thư mục không tồn tại"));
        if (!"folder".equals(folder.getType())) {
            throw new RuntimeException("Đây không phải là thư mục");
        }
        List<StorageFile> children = fileRepository
                .findByOwnerIdAndFolderIdAndIsDeletedFalse(folder.getOwnerId(), folder.getId());
        return children.stream().map(file -> new FileResponse(
                file.getId(), file.getName(), file.getType(), file.getSize(),
                file.getFolderId(), file.getCreatedAt(), true,
                link.getPermission(), new java.util.ArrayList<>(), null
        )).collect(Collectors.toList());
    }

    // ─── Mapping ──────────────────────────────────────────────────────────────

    private ShareLinkResponse mapToResponse(ShareLink link) {
        return new ShareLinkResponse(
                link.getId(),
                link.getToken(),
                "/shared/" + link.getToken(),
                link.getPermission(),
                link.getPassword() != null,
                link.getExpiresAt(),
                link.isRevoked(),
                link.getCreatedAt()
        );
    }

    private ShareLinkDetailResponse mapToDetailResponse(ShareLink link) {
        ShareLinkDetailResponse r = new ShareLinkDetailResponse();
        r.setId(link.getId());
        r.setToken(link.getToken());
        r.setFullUrl("/shared/" + link.getToken());
        r.setPermission(link.getPermission());
        r.setHasPassword(link.getPassword() != null);
        r.setExpiresAt(link.getExpiresAt());
        r.setRevoked(link.isRevoked());
        r.setCreatedAt(link.getCreatedAt());
        r.setViewCount(link.getViewCount());
        r.setRemainingViews(link.getRemainingViews()); // null = unlimited
        if (link.getExpiresAt() != null) {
            long seconds = java.time.Duration.between(Instant.now(), link.getExpiresAt()).getSeconds();
            r.setExpiresInSeconds(Math.max(0, seconds));
        }
        return r;
    }
}

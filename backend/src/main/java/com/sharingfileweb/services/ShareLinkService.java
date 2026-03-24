package com.sharingfileweb.services;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
    private PasswordEncoder passwordEncoder;

    private String getCurrentUserId() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getId();
    }

    public ShareLinkResponse createLink(String fileId, String permission, String rawPassword, Long expiresInDays) {
        String userId = getCurrentUserId();

        // Verify file ownership
        StorageFile file = fileRepository.findByIdAndOwnerIdAndIsDeletedFalse(fileId, userId)
                .orElseThrow(() -> new RuntimeException("File không tồn tại hoặc bạn không có quyền"));

        String token = UUID.randomUUID().toString();
        String hashedPassword = (rawPassword != null && !rawPassword.trim().isEmpty())
                ? passwordEncoder.encode(rawPassword) : null;
        Instant expiresAt = (expiresInDays != null && expiresInDays > 0)
                ? Instant.now().plus(expiresInDays, ChronoUnit.DAYS) : null;

        ShareLink link = new ShareLink(fileId, token, userId, permission != null ? permission : "VIEW", hashedPassword, expiresAt);
        ShareLink saved = shareLinkRepository.save(link);

        return mapToResponse(saved);
    }

    public ShareLink validateLink(String token, String rawPassword) {
        ShareLink link = shareLinkRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Link không tồn tại"));

        if (link.isRevoked()) {
            throw new RuntimeException("Link đã bị thu hồi");
        }

        if (link.getExpiresAt() != null && link.getExpiresAt().isBefore(Instant.now())) {
            throw new RuntimeException("Link đã hết hạn");
        }

        if (link.getPassword() != null) {
            if (rawPassword == null || rawPassword.isEmpty()) {
                throw new RuntimeException("REQUIRES_PASSWORD");
            }
            if (!passwordEncoder.matches(rawPassword, link.getPassword())) {
                throw new RuntimeException("Mật khẩu không đúng");
            }
        }

        return link;
    }

    public void revokeLink(String linkId) {
        String userId = getCurrentUserId();
        ShareLink link = shareLinkRepository.findByIdAndOwnerId(linkId, userId)
                .orElseThrow(() -> new RuntimeException("Link không tồn tại"));
        link.setRevoked(true);
        shareLinkRepository.save(link);
    }

    public ShareLinkResponse updateLink(String linkId, String permission, String rawPassword, Long expiresInDays) {
        String userId = getCurrentUserId();
        ShareLink link = shareLinkRepository.findByIdAndOwnerId(linkId, userId)
                .orElseThrow(() -> new RuntimeException("Link không tồn tại hoặc bạn không có quyền"));

        if (permission != null && !permission.trim().isEmpty()) {
            link.setPermission(permission);
        }

        if (rawPassword != null) {
            if (rawPassword.trim().isEmpty()) {
                link.setPassword(null); // remove password
            } else {
                link.setPassword(passwordEncoder.encode(rawPassword)); // update password
            }
        }

        if (expiresInDays != null) {
            if (expiresInDays == -1) {
                link.setExpiresAt(null); // remove expiry
            } else if (expiresInDays > 0) {
                link.setExpiresAt(Instant.now().plus(expiresInDays, ChronoUnit.DAYS));
            }
        }

        ShareLink saved = shareLinkRepository.save(link);
        return mapToResponse(saved);
    }

    public List<ShareLinkResponse> getLinksForFile(String fileId) {
        String userId = getCurrentUserId();
        return shareLinkRepository.findByFileIdAndOwnerIdAndIsRevokedFalse(fileId, userId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<FileResponse> getPublicFolderContent(String token, String rawPassword) {
        ShareLink link = validateLink(token, rawPassword);

        StorageFile folder = fileRepository.findById(link.getFileId())
                .orElseThrow(() -> new RuntimeException("Thư mục không tồn tại"));

        if (!"folder".equals(folder.getType())) {
            throw new RuntimeException("Đây không phải là thư mục");
        }

        List<StorageFile> children = fileRepository.findByOwnerIdAndFolderIdAndIsDeletedFalse(folder.getOwnerId(), folder.getId());

        return children.stream().map(file -> new FileResponse(
                file.getId(), file.getName(), file.getType(), file.getSize(),
                file.getFolderId(), file.getCreatedAt(), true,
                link.getPermission(), new java.util.ArrayList<>(), null
        )).collect(Collectors.toList());
    }

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
}

package com.sharingfileweb.controllers;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.sharingfileweb.payload.request.InternalShareRequest;
import com.sharingfileweb.payload.request.CreateShareLinkRequest;
import com.sharingfileweb.payload.request.UpdateShareLinkRequest;
import com.sharingfileweb.payload.request.UpdatePermissionRequest;
import com.sharingfileweb.payload.response.ShareLinkResponse;
import com.sharingfileweb.payload.response.SharedAccessResponse;
import com.sharingfileweb.payload.response.StandardResponse;
import com.sharingfileweb.services.ShareLinkService;
import com.sharingfileweb.services.SharedAccessService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/share")
@Tag(name = "Sharing", description = "Các API chia sẻ tệp/thư mục nội bộ và tạo link chia sẻ công khai.")
public class ShareController {

    @Autowired
    private SharedAccessService sharedAccessService;

    @Autowired
    private ShareLinkService shareLinkService;

    // ─── Internal Share ────────────────────────────────────────────────────────

    @Operation(summary = "Chia sẻ nội bộ cho nhiều người", description = "Chia sẻ quyền truy cập tệp/thư mục cho các email người dùng khác trong hệ thống.")
    @PostMapping("/internal")
    public ResponseEntity<?> shareWithUsers(@RequestBody InternalShareRequest request) {
        try {
            List<SharedAccessResponse> results = sharedAccessService.shareWithUsers(
                    request.getFileId(), request.getEmails(), request.getPermission());
            return ResponseEntity.ok(StandardResponse.success("Đã chia sẻ thành công", results));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
        }
    }

    @Operation(summary = "Được chia sẻ với tôi", description = "Danh sách các tệp/thư mục người khác chia sẻ cho tôi.")
    @GetMapping("/with-me")
    public ResponseEntity<?> getSharedWithMe() {
        List<SharedAccessResponse> results = sharedAccessService.getSharedWithMe();
        return ResponseEntity.ok(StandardResponse.success("Fetched shared-with-me files", results));
    }

    @Operation(summary = "Tôi đã chia sẻ", description = "Danh sách các tệp/thư mục mà tôi đã chia sẻ cho người khác.")
    @GetMapping("/by-me")
    public ResponseEntity<?> getSharedByMe() {
        List<SharedAccessResponse> results = sharedAccessService.getSharedByMe();
        return ResponseEntity.ok(StandardResponse.success("Fetched shared-by-me files", results));
    }

    @Operation(summary = "Danh sách người được chia sẻ của 1 tệp", description = "Danh sách chi tiết các người dùng đang có quyền truy cập tệp/thư mục này.")
    @GetMapping("/access/file/{fileId}")
    public ResponseEntity<?> getAccessesForFile(@PathVariable String fileId) {
        try {
            List<SharedAccessResponse> results = sharedAccessService.getAccessesForFile(fileId);
            return ResponseEntity.ok(StandardResponse.success("Fetched accesses for file", results));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
        }
    }

    @PutMapping("/access/{id}")
    public ResponseEntity<?> updatePermission(@PathVariable String id, @RequestBody UpdatePermissionRequest request) {
        try {
            SharedAccessResponse result = sharedAccessService.updatePermission(id, request.getPermission());
            return ResponseEntity.ok(StandardResponse.success("Permission updated", result));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
        }
    }

    @DeleteMapping("/access/{id}")
    public ResponseEntity<?> revokeAccess(@PathVariable String id) {
        try {
            sharedAccessService.revokeAccess(id);
            return ResponseEntity.ok(StandardResponse.success("Đã thu hồi quyền truy cập", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
        }
    }

    @DeleteMapping("/access/file/{fileId}")
    public ResponseEntity<?> revokeAllForFile(@PathVariable String fileId) {
        try {
            sharedAccessService.revokeAllForFile(fileId);
            return ResponseEntity.ok(StandardResponse.success("Đã thu hồi tất cả quyền truy cập", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
        }
    }

    @GetMapping("/access/folder/{id}")
    public ResponseEntity<?> getSharedFolderContent(@PathVariable String id) {
        try {
            List<com.sharingfileweb.payload.response.FileResponse> results = sharedAccessService.getSharedFolderContent(id);
            return ResponseEntity.ok(StandardResponse.success("Fetched folder content", results));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
        }
    }

    // ─── Share Link ────────────────────────────────────────────────────────────

    @Operation(summary = "Tạo link chia sẻ công khai", description = "Tạo một link để chia sẻ tệp/thư mục ra ngoài (có thể cài mật khẩu, ngày hết hạn).")
    @PostMapping("/link")
    public ResponseEntity<?> createLink(@RequestBody CreateShareLinkRequest request) {
        try {
            ShareLinkResponse result = shareLinkService.createLink(
                    request.getFileId(), request.getPermission(), request.getPassword(), request.getExpiresInDays());
            return ResponseEntity.ok(StandardResponse.success("Đã tạo link chia sẻ", result));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
        }
    }

    @GetMapping("/link/file/{fileId}")
    public ResponseEntity<?> getLinksForFile(@PathVariable String fileId) {
        List<ShareLinkResponse> results = shareLinkService.getLinksForFile(fileId);
        return ResponseEntity.ok(StandardResponse.success("Fetched links for file", results));
    }

    @PutMapping("/link/{id}")
    public ResponseEntity<?> updateLink(@PathVariable String id, @RequestBody UpdateShareLinkRequest request) {
        try {
            ShareLinkResponse result = shareLinkService.updateLink(
                    id, request.getPermission(), request.getPassword(), request.getExpiresInDays());
            return ResponseEntity.ok(StandardResponse.success("Đã cập nhật link chia sẻ", result));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
        }
    }

    @DeleteMapping("/link/{id}")
    public ResponseEntity<?> revokeLink(@PathVariable String id) {
        try {
            shareLinkService.revokeLink(id);
            return ResponseEntity.ok(StandardResponse.success("Đã thu hồi link", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
        }
    }

    @Autowired
    private com.sharingfileweb.repository.ShareLinkRepository shareLinkRepository;

    // GET /api/share/links → Admin: lấy toàn bộ share links
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/links")
    public ResponseEntity<?> getAllShareLinksForAdmin() {
        List<com.sharingfileweb.models.ShareLink> shareLinks = shareLinkRepository.findAll();
        shareLinks.forEach(link -> link.setPassword(null));
        return ResponseEntity.ok(StandardResponse.success("Fetched all share links", shareLinks));
    }

    @Operation(summary = "Thu hồi link chia sẻ (Quyền Admin)", description = "Admin xóa các link chia sẻ rác.")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/links/{id}")
    public ResponseEntity<?> revokeShareLinkByAdmin(@PathVariable String id) {
        if (!shareLinkRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        shareLinkRepository.deleteById(id);
        return ResponseEntity.ok(StandardResponse.success("Share link revoked permanently", null));
    }
}
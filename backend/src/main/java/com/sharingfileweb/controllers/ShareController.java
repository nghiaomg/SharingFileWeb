package com.sharingfileweb.controllers;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.sharingfileweb.dto.ShareLinkDetailResponse;
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


@RestController
@RequestMapping("/api/share")
@Tag(name = "Sharing", description = "Các API chia sẻ tệp/thư mục nội bộ và tạo link chia sẻ công khai.")
public class ShareController {

    @Autowired
    private SharedAccessService sharedAccessService;

    @Autowired
    private ShareLinkService shareLinkService;

    // ─── Internal Share ────────────────────────────────────────────────────────

    @Operation(summary = "Chia sẻ nội bộ cho nhiều người",
               description = "Chia sẻ quyền truy cập tệp/thư mục cho các email người dùng khác trong hệ thống.")
    @PostMapping("/internal")
    public ResponseEntity<?> shareWithUsers(@RequestBody @Valid InternalShareRequest request) {
        try {
            List<SharedAccessResponse> results = sharedAccessService.shareWithUsers(
                    request.getFileId(),
                    request.getEmails(),
                    request.getPermission(),
                    request.getExpiresInDays());
            return ResponseEntity.ok(StandardResponse.success("Đã chia sẻ thành công", results));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
        }
    }

    @Operation(summary = "Được chia sẻ với tôi")
    @GetMapping("/with-me")
    public ResponseEntity<?> getSharedWithMe() {
        return ResponseEntity.ok(StandardResponse.success(
                "Fetched shared-with-me files", sharedAccessService.getSharedWithMe()));
    }

    @Operation(summary = "Tôi đã chia sẻ")
    @GetMapping("/by-me")
    public ResponseEntity<?> getSharedByMe() {
        return ResponseEntity.ok(StandardResponse.success(
                "Fetched shared-by-me files", sharedAccessService.getSharedByMe()));
    }

    @Operation(summary = "Danh sách người được chia sẻ của 1 tệp")
    @GetMapping("/access/file/{fileId}")
    public ResponseEntity<?> getAccessesForFile(@PathVariable String fileId) {
        try {
            return ResponseEntity.ok(StandardResponse.success(
                    "Fetched accesses for file", sharedAccessService.getAccessesForFile(fileId)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
        }
    }

    @PutMapping("/access/{id}")
    public ResponseEntity<?> updatePermission(@PathVariable String id,
                                              @RequestBody UpdatePermissionRequest request) {
        try {
            return ResponseEntity.ok(StandardResponse.success(
                    "Permission updated", sharedAccessService.updatePermission(id, request.getPermission())));
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
            return ResponseEntity.ok(StandardResponse.success(
                    "Fetched folder content", sharedAccessService.getSharedFolderContent(id)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
        }
    }

    // ─── Share Link ────────────────────────────────────────────────────────────

    @Operation(summary = "Tạo link chia sẻ công khai",
               description = "Tạo link để chia sẻ file/thư mục ra ngoài (mật khẩu, ngày hết hạn, số lượt truy cập tối đa).")
    @PostMapping("/link")
    public ResponseEntity<?> createLink(@RequestBody @Valid CreateShareLinkRequest request) {
        try {
            ShareLinkResponse result = shareLinkService.createLink(
                    request.getFileId(),
                    request.getPermission(),
                    request.getPassword(),
                    request.getExpiresInDays(),
                    request.getMaxViews());
            return ResponseEntity.ok(StandardResponse.success("Đã tạo link chia sẻ", result));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
        }
    }

    @Operation(summary = "Danh sách link của một file (chi tiết — có viewCount)",
               description = "Trả về chi tiết bao gồm số lượt truy cập đã dùng và còn lại.")
    @GetMapping("/link/file/{fileId}")
    public ResponseEntity<?> getLinksForFile(@PathVariable String fileId) {
        List<ShareLinkDetailResponse> results = shareLinkService.getLinkDetailsForFile(fileId);
        return ResponseEntity.ok(StandardResponse.success("Fetched links for file", results));
    }

    @PutMapping("/link/{id}")
    public ResponseEntity<?> updateLink(@PathVariable String id,
                                        @RequestBody UpdateShareLinkRequest request) {
        try {
            return ResponseEntity.ok(StandardResponse.success(
                    "Đã cập nhật link chia sẻ",
                    shareLinkService.updateLink(id, request.getPermission(),
                            request.getPassword(), request.getExpiresInDays())));
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

    // ─── Admin ────────────────────────────────────────────────────────────────

    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/links")
    public ResponseEntity<?> getAllShareLinksForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        org.springframework.data.domain.Page<com.sharingfileweb.models.ShareLink> pageResult = shareLinkRepository.findAll(pageable);
        pageResult.getContent().forEach(link -> link.setPassword(null));
        java.util.Map<String, Object> responseData = new java.util.HashMap<>();
        responseData.put("content", pageResult.getContent());
        responseData.put("currentPage", pageResult.getNumber());
        responseData.put("totalItems", pageResult.getTotalElements());
        responseData.put("totalPages", pageResult.getTotalPages());
        return ResponseEntity.ok(StandardResponse.success("Fetched all share links", responseData));
    }

    @Operation(summary = "Thu hồi link chia sẻ (Quyền Admin)")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/links/{id}")
    public ResponseEntity<?> revokeShareLinkByAdmin(@PathVariable String id) {
        if (!shareLinkRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        shareLinkRepository.deleteById(id);
        return ResponseEntity.ok(StandardResponse.success("Share link revoked permanently", null));
    }

    @Autowired
    private com.sharingfileweb.repository.ShareLinkRepository shareLinkRepository;
}

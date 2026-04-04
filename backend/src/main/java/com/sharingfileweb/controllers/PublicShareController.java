package com.sharingfileweb.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.sharingfileweb.dto.ShareMetadataResponse;
import com.sharingfileweb.entity.AccessLog;
import com.sharingfileweb.exception.ShareLinkViewOnlyException;
import com.sharingfileweb.models.ShareLink;
import com.sharingfileweb.models.StorageFile;
import com.sharingfileweb.payload.response.StandardResponse;
import com.sharingfileweb.repository.FileRepository;
import com.sharingfileweb.services.AccessLogService;
import com.sharingfileweb.services.ShareLinkService;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/public/share")
@Tag(name = "Public Sharing", description = "Truy cập file/thư mục qua link chia sẻ công khai (không yêu cầu đăng nhập).")
public class PublicShareController {

    @Autowired
    private ShareLinkService shareLinkService;

    @Autowired
    private FileRepository fileRepository;

    @Autowired
    private AccessLogService accessLogService;

    /**
     * Lấy metadata file qua share token.
     * Trả thêm permission, remainingViews để client biết mình có thể làm gì.
     */
    @Operation(summary = "Lấy thông tin file qua Link",
               description = "Lấy tên file, kích thước, permission... từ token của link chia sẻ.")
    @GetMapping("/{token}")
    public ResponseEntity<?> getFileMetadataByToken(
            @Parameter(description = "Mã token của link chia sẻ") @PathVariable String token,
            @Parameter(description = "Mật khẩu (nếu có yêu cầu)") @RequestParam(required = false) String password) {

        try {
            // validateLink sẽ throw nếu password sai
            ShareLink link = shareLinkService.validateLink(token, password);

            StorageFile file = fileRepository.findById(link.getFileId()).orElse(null);
            if (file == null || file.isDeleted()) {
                return ResponseEntity.notFound().build();
            }

            ShareMetadataResponse meta = new ShareMetadataResponse(
                    file.getName(),
                    file.getType(),
                    file.getSize(),
                    link.getPermission(),
                    link.getExpiresAt(),
                    link.getRemainingViews(),
                    link.getPassword() != null
            );

            return ResponseEntity.ok(StandardResponse.success("File info", meta));

        } catch (Exception e) {
            String msg = e.getMessage();
            if ("REQUIRES_PASSWORD".equals(msg)) {
                return ResponseEntity.status(403)
                        .body(StandardResponse.error("REQUIRES_PASSWORD", null));
            }
            return ResponseEntity.badRequest().body(StandardResponse.error(msg, null));
        }
    }

    /**
     * Preview file — cho phép cả VIEW và DOWNLOAD links.
     * Trả presigned URL với inline disposition (xem trực tiếp trên trình duyệt).
     */
    @Operation(summary = "Xem file trước qua Link",
               description = "Trả presigned URL để xem file trực tiếp (inline). Áp dụng cho cả VIEW và DOWNLOAD links.")
    @GetMapping("/{token}/preview")
    public ResponseEntity<?> previewFileByToken(
            @Parameter(description = "Mã token của link chia sẻ") @PathVariable String token,
            @Parameter(description = "Mật khẩu (nếu có yêu cầu)") @RequestParam(required = false) String password) {

        try {
            ShareLink link = shareLinkService.validateLink(token, password);

            StorageFile file = fileRepository.findById(link.getFileId()).orElse(null);
            if (file == null || file.isDeleted()) {
                return ResponseEntity.notFound().build();
            }

            // Tạo presigned URL với inline=true
            String presignedUrl = shareLinkService.getPresignedUrlForShareLink(link, true);

            // Access log
            accessLogService.logFileAccess(
                    file.getId(), file.getName(), "anonymous",
                    AccessLog.AccessType.PREVIEW, token,
                    (String) null, (String) null);

            return ResponseEntity.ok(StandardResponse.success("Preview URL", java.util.Map.of(
                    "url", presignedUrl,
                    "fileName", file.getName(),
                    "fileType", file.getType(),
                    "fileSize", file.getSize()
            )));

        } catch (Exception e) {
            if ("REQUIRES_PASSWORD".equals(e.getMessage())) {
                return ResponseEntity.status(403)
                        .body(StandardResponse.error("REQUIRES_PASSWORD", null));
            }
            return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
        }
    }

    /**
     * Download file — chỉ cho DOWNLOAD links.
     * VIEW links sẽ nhận 403 VIEW_ONLY_LINK.
     */
    @Operation(summary = "Tải xuống file qua Link",
               description = "Trả presigned URL để tải file. Chỉ áp dụng cho links có permission=DOWNLOAD.")
    @GetMapping("/{token}/download")
    public ResponseEntity<?> downloadFileByToken(
            @Parameter(description = "Mã token của link chia sẻ") @PathVariable String token,
            @Parameter(description = "Mật khẩu (nếu có yêu cầu)") @RequestParam(required = false) String password,
            @Parameter(description = "Yêu cầu inline (xem trực tiếp)") @RequestParam(required = false, defaultValue = "false") boolean inline) {

        try {
            ShareLink link = shareLinkService.validateLink(token, password);

            // VIEW-only link: không cho download
            if (!"DOWNLOAD".equals(link.getPermission())) {
                throw new ShareLinkViewOnlyException(
                        "Link này chỉ cho phép xem, không cho tải xuống");
            }

            StorageFile file = fileRepository.findById(link.getFileId()).orElse(null);
            if (file == null || file.isDeleted()) {
                return ResponseEntity.notFound().build();
            }

            String presignedUrl = shareLinkService.getPresignedUrlForShareLink(link, inline);

            // Access log
            accessLogService.logFileAccess(
                    file.getId(), file.getName(), "anonymous",
                    AccessLog.AccessType.DOWNLOAD, token,
                    (String) null, (String) null);

            return ResponseEntity.ok(StandardResponse.success("Download URL", java.util.Map.of(
                    "url", presignedUrl,
                    "fileName", file.getName(),
                    "fileType", file.getType(),
                    "fileSize", file.getSize()
            )));

        } catch (ShareLinkViewOnlyException e) {
            return ResponseEntity.status(403)
                    .body(StandardResponse.error("VIEW_ONLY_LINK", e.getMessage()));
        } catch (Exception e) {
            if ("REQUIRES_PASSWORD".equals(e.getMessage())) {
                return ResponseEntity.status(403)
                        .body(StandardResponse.error("REQUIRES_PASSWORD", null));
            }
            return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
        }
    }

    @Operation(summary = "Lấy nội dung thư mục public")
    @GetMapping("/{token}/folder")
    public ResponseEntity<?> getPublicFolderContent(
            @Parameter(description = "Mã token của thư mục") @PathVariable String token,
            @Parameter(description = "Mật khẩu (nếu có yêu cầu)") @RequestParam(required = false) String password) {
        try {
            List<?> results = shareLinkService.getPublicFolderContent(token, password);
            return ResponseEntity.ok(StandardResponse.success("Fetched folder content", results));
        } catch (Exception e) {
            if ("REQUIRES_PASSWORD".equals(e.getMessage())) {
                return ResponseEntity.status(403)
                        .body(StandardResponse.error("REQUIRES_PASSWORD", null));
            }
            return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
        }
    }
}

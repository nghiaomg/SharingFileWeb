package com.sharingfileweb.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.sharingfileweb.models.ShareLink;
import com.sharingfileweb.models.StorageFile;
import com.sharingfileweb.payload.response.FileResponse;
import com.sharingfileweb.payload.response.StandardResponse;
import com.sharingfileweb.repository.FileRepository;
import com.sharingfileweb.security.services.FileStorageService;
import com.sharingfileweb.services.ShareLinkService;

import java.util.ArrayList;
import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/public/share")
@Tag(name = "Public Sharing", description = "Các API truy cập tệp/thư mục qua link chia sẻ công khai (Không yêu cầu đăng nhập).")
public class PublicShareController {

    @Autowired
    private ShareLinkService shareLinkService;

    @Autowired
    private FileRepository fileRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Operation(summary = "Lấy thông tin tệp qua Link", description = "Lấy tên tệp, kích thước... từ mã token của link chia sẻ.")
    @GetMapping("/{token}")
    public ResponseEntity<?> getFileMetadataByToken(
            @Parameter(description = "Mã token của link chia sẻ") @PathVariable String token,
            @Parameter(description = "Mật khẩu (nếu có yêu cầu)") @RequestParam(required = false) String password) {
        try {
            ShareLink link = shareLinkService.validateLink(token, password);
            StorageFile file = fileRepository.findById(link.getFileId()).orElse(null);

            if (file == null || file.isDeleted()) {
                return ResponseEntity.notFound().build();
            }

            FileResponse response = new FileResponse(
                    file.getId(), file.getName(), file.getType(), file.getSize(),
                    file.getFolderId(), file.getCreatedAt(), true,
                    link.getPermission(),
                    new ArrayList<>(), null
            );

            return ResponseEntity.ok(StandardResponse.success("File info", response));
        } catch (RuntimeException e) {
            if ("REQUIRES_PASSWORD".equals(e.getMessage())) {
                return ResponseEntity.status(403).body(StandardResponse.error("REQUIRES_PASSWORD", null));
            }
            return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
        }
    }

    @Operation(summary = "Tải xuống tệp qua Link", description = "Tải xuống tệp thực tế từ link chia sẻ, yêu cầu mật khẩu nếu link có bảo mật.")
    @GetMapping("/{token}/download")
    public ResponseEntity<?> downloadFileByToken(
            @Parameter(description = "Mã token của link chia sẻ") @PathVariable String token,
            @Parameter(description = "Mật khẩu (nếu có yêu cầu)") @RequestParam(required = false) String password) {
        try {
            ShareLink link = shareLinkService.validateLink(token, password);

            // Only allow download if permission is DOWNLOAD
            if ("VIEW".equals(link.getPermission())) {
                return ResponseEntity.status(403).body(StandardResponse.error("Link này chỉ cho phép xem, không cho tải xuống", null));
            }

            StorageFile file = fileRepository.findById(link.getFileId()).orElse(null);
            if (file == null || file.isDeleted()) {
                return ResponseEntity.notFound().build();
            }

            org.springframework.core.io.Resource resource = fileStorageService.loadFileAsResource(file);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getName() + "\"")
                    .contentType(MediaType.parseMediaType(file.getType()))
                    .body(resource);
        } catch (RuntimeException e) {
            if ("REQUIRES_PASSWORD".equals(e.getMessage())) {
                return ResponseEntity.status(403).body(StandardResponse.error("REQUIRES_PASSWORD", null));
            }
            return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(StandardResponse.error("Lỗi khi tải xuống: " + e.getMessage(), null));
        }
    }

    @Operation(summary = "Lấy nội dung thư mục public", description = "Lấy danh sách các tệp/thư mục con bên trong thư mục được chia sẻ công khai.")
    @GetMapping("/{token}/folder")
    public ResponseEntity<?> getPublicFolderContent(
            @Parameter(description = "Mã token của thư mục") @PathVariable String token,
            @Parameter(description = "Mật khẩu (nếu có yêu cầu)") @RequestParam(required = false) String password) {
        try {
            List<FileResponse> results = shareLinkService.getPublicFolderContent(token, password);
            return ResponseEntity.ok(StandardResponse.success("Fetched folder content", results));
        } catch (RuntimeException e) {
            if ("REQUIRES_PASSWORD".equals(e.getMessage())) {
                return ResponseEntity.status(403).body(StandardResponse.error("REQUIRES_PASSWORD", null));
            }
            return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
        }
    }
}

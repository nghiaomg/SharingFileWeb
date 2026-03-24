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

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/public/share")
public class PublicShareController {

    @Autowired
    private ShareLinkService shareLinkService;

    @Autowired
    private FileRepository fileRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping("/{token}")
    public ResponseEntity<?> getFileMetadataByToken(
            @PathVariable String token,
            @RequestParam(required = false) String password) {
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

    @GetMapping("/{token}/download")
    public ResponseEntity<?> downloadFileByToken(
            @PathVariable String token,
            @RequestParam(required = false) String password) {
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

    @GetMapping("/{token}/folder")
    public ResponseEntity<?> getPublicFolderContent(
            @PathVariable String token,
            @RequestParam(required = false) String password) {
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

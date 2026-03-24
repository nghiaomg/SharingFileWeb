package com.sharingfileweb.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.sharingfileweb.models.Folder;
import com.sharingfileweb.models.StorageFile;
import com.sharingfileweb.payload.response.MessageResponse;
import com.sharingfileweb.payload.response.StandardResponse;
import com.sharingfileweb.repository.FileRepository;
import com.sharingfileweb.repository.FolderRepository;
import com.sharingfileweb.security.services.FileStorageService;
import com.sharingfileweb.security.services.UserDetailsImpl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.sharingfileweb.services.TrashService;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/trash")
public class TrashController {

    @Autowired
    TrashService trashService;

    // Lấy toàn bộ rác (File & Folder)
    @GetMapping
    public ResponseEntity<?> getTrashItems() {
        Map<String, Object> response = trashService.getTrashItems();
        return ResponseEntity.ok(StandardResponse.success("Fetched trash items successfully", response));
    }

    // Khôi phục Folder hoặc File
    @PutMapping("/restore/{type}/{id}")
    public ResponseEntity<?> restoreItem(@PathVariable String type, @PathVariable String id) {
        try {
            trashService.restoreItem(type, id);
            return ResponseEntity.ok(StandardResponse.success("Đã khôi phục thành công!", null));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
        }
    }

    // Xóa vĩnh viễn
    @DeleteMapping("/permanent/{type}/{id}")
    public ResponseEntity<?> deletePermanent(@PathVariable String type, @PathVariable String id) {
        try {
            trashService.deletePermanent(type, id);
            return ResponseEntity.ok(StandardResponse.success("Đã xóa vĩnh viễn thành công!", null));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Dọn sạch thùng rác
    @DeleteMapping("/empty")
    public ResponseEntity<?> emptyTrash() {
        try {
            trashService.emptyTrash();
            return ResponseEntity.ok(StandardResponse.success("Dọn sạch thùng rác thành công!", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(StandardResponse.error("Lỗi khi dọn thùng rác: " + e.getMessage(), null));
        }
    }
}

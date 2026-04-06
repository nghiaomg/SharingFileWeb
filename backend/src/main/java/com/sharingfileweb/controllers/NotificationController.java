package com.sharingfileweb.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.sharingfileweb.payload.response.NotificationResponse;
import com.sharingfileweb.payload.response.StandardResponse;
import com.sharingfileweb.services.NotificationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;


@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "Các API quản lý thông báo của người dùng.")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Operation(summary = "Lấy danh sách thông báo", description = "Lấy lịch sử thông báo của người dùng hiện tại.")
    @GetMapping
    public ResponseEntity<?> getNotifications() {
        List<NotificationResponse> results = notificationService.getNotifications();
        return ResponseEntity.ok(StandardResponse.success("Fetched notifications", results));
    }

    @Operation(summary = "Đánh dấu đã đọc", description = "Đánh dấu một thông báo là đã đọc.")
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable String id) {
        try {
            notificationService.markAsRead(id);
            return ResponseEntity.ok(StandardResponse.success("Marked as read", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
        }
    }

    @Operation(summary = "Đếm số thông báo chưa đọc", description = "Lấy số lượng thông báo mà người dùng chưa đọc.")
    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount() {
        long count = notificationService.getUnreadCount();
        return ResponseEntity.ok(StandardResponse.success("Unread count", count));
    }

    // ─── ADMIN ENDPOINTS ────────────────────────────────────────────────────────
    
    @Autowired
    private com.sharingfileweb.repository.UserRepository userRepository;

    @Autowired
    private com.sharingfileweb.repository.NotificationRepository notificationRepository;

    @Operation(summary = "Gửi thông báo (Admin Broadcast)")
    @PostMapping("/admin/broadcast")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> broadcastNotification(@RequestBody @jakarta.validation.Valid com.sharingfileweb.payload.request.BroadcastNotificationRequest request) {
        try {
            if (request.getTargetEmail() == null || "ALL".equalsIgnoreCase(request.getTargetEmail())) {
                java.util.List<com.sharingfileweb.models.User> users = userRepository.findAll();
                for (com.sharingfileweb.models.User u : users) {
                    notificationService.createNotification(u.getEmail(), request.getType(), request.getTitle(), request.getMessage(), request.getMetadata());
                }
            } else {
                notificationService.createNotification(request.getTargetEmail(), request.getType(), request.getTitle(), request.getMessage(), request.getMetadata());
            }
            return ResponseEntity.ok(StandardResponse.success("Broadcast successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
        }
    }

    @Operation(summary = "Lấy tất cả thông báo hệ thống (Admin)")
    @GetMapping("/admin/all")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllNotificationsAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        org.springframework.data.domain.Page<com.sharingfileweb.models.Notification> pageResult = notificationRepository.findAll(pageable);
        java.util.Map<String, Object> responseData = new java.util.HashMap<>();
        responseData.put("content", pageResult.getContent());
        responseData.put("currentPage", pageResult.getNumber());
        responseData.put("totalItems", pageResult.getTotalElements());
        responseData.put("totalPages", pageResult.getTotalPages());
        return ResponseEntity.ok(StandardResponse.success("Fetched all notifications", responseData));
    }

    @Operation(summary = "Xóa thông báo (Admin)")
    @DeleteMapping("/admin/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteNotificationAdmin(@PathVariable String id) {
        notificationRepository.deleteById(id);
        return ResponseEntity.ok(StandardResponse.success("Deleted notification", null));
    }
}

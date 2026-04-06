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
}

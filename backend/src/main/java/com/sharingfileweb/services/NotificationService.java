package com.sharingfileweb.services;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.sharingfileweb.models.Notification;
import com.sharingfileweb.payload.response.NotificationResponse;
import com.sharingfileweb.repository.NotificationRepository;
import com.sharingfileweb.security.services.UserDetailsImpl;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    private String getCurrentUserEmail() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getEmail();
    }

    public void createNotification(String recipientEmail, String type, String title, String message, Map<String, String> metadata) {
        Notification notification = new Notification(recipientEmail, type, title, message, metadata);
        notificationRepository.save(notification);
    }

    public List<NotificationResponse> getNotifications() {
        String email = getCurrentUserEmail();
        return notificationRepository.findByRecipientEmailOrderByCreatedAtDesc(email)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public void markAsRead(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Thông báo không tồn tại"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public long getUnreadCount() {
        String email = getCurrentUserEmail();
        return notificationRepository.countByRecipientEmailAndIsReadFalse(email);
    }

    private NotificationResponse mapToResponse(Notification n) {
        return new NotificationResponse(
                n.getId(), n.getType(), n.getTitle(), n.getMessage(),
                n.getMetadata(), n.isRead(), n.getCreatedAt()
        );
    }
}

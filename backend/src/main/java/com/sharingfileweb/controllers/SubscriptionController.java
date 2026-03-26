package com.sharingfileweb.controllers;

import com.sharingfileweb.models.User;
import com.sharingfileweb.payload.response.StandardResponse;
import com.sharingfileweb.repository.UserRepository;
import com.sharingfileweb.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.sharingfileweb.services.SubscriptionPlanService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/subscription")
@Tag(name = "Subscription", description = "Các API quản lý gói cước (Upgrade lên PRO).")
public class SubscriptionController {

    @Autowired
    SubscriptionPlanService subscriptionPlanService;

    @Operation(summary = "Nâng cấp gói cước", description = "Nâng cấp gói cước của người dùng hiện tại lên PRO (mở rộng thêm dung lượng).")
    @PostMapping("/upgrade")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> upgradePlan() {
        try {
            subscriptionPlanService.upgradePlan();
            return ResponseEntity.ok(StandardResponse.success("Successfully upgraded to PRO package!", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
        }
    }

}
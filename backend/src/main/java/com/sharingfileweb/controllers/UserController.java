package com.sharingfileweb.controllers;

import java.util.List;
import java.util.stream.Collectors;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sharingfileweb.models.User;
import com.sharingfileweb.payload.request.UpdateProfileRequest;
import com.sharingfileweb.payload.response.MessageResponse;
import com.sharingfileweb.payload.response.StandardResponse;
import com.sharingfileweb.payload.response.UserProfileResponse;
import com.sharingfileweb.services.UserService;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class UserController {

  @Autowired
  UserService userService;

  @GetMapping("/auth/me")
  public ResponseEntity<?> getCurrentUser() {
    UserProfileResponse response = userService.getCurrentUserProfile();
    return ResponseEntity.ok(StandardResponse.success("Fetched user profile successfully", response));
  }

  @PutMapping("/user/profile")
  public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
    try {
        userService.updateProfile(request);
        return ResponseEntity.ok(StandardResponse.success("Profile updated successfully!", null));
    } catch (RuntimeException e) {
        return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
    }
  }

  @GetMapping("/user/storage")
  public ResponseEntity<?> getStorageUsage() {
    Map<String, Object> response = userService.getStorageUsage();
    return ResponseEntity.ok(StandardResponse.success("Fetched storage usage successfully", response));
  }
}

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
import com.sharingfileweb.payload.response.UserProfileResponse;
import com.sharingfileweb.repository.UserRepository;
import com.sharingfileweb.security.services.UserDetailsImpl;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class UserController {

  @Autowired
  UserRepository userRepository;

  @GetMapping("/auth/me")
  public ResponseEntity<?> getCurrentUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
    
    List<String> roles = userDetails.getAuthorities().stream()
        .map(item -> item.getAuthority())
        .collect(Collectors.toList());

    return ResponseEntity.ok(new UserProfileResponse(
        userDetails.getId(),
        userDetails.getUsername(),
        userDetails.getEmail(),
        roles
    ));
  }

  @PutMapping("/user/profile")
  public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

    User user = userRepository.findById(userDetails.getId()).orElse(null);
    if (user == null) {
      return ResponseEntity.badRequest().body(new MessageResponse("User not found!"));
    }

    if (request.getEmail() != null && !request.getEmail().isEmpty()) {
      if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
        return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
      }
      user.setEmail(request.getEmail());
    }

    userRepository.save(user);
    return ResponseEntity.ok(new MessageResponse("Profile updated successfully!"));
  }
}

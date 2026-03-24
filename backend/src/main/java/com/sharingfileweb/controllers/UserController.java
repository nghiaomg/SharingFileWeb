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

  @Autowired
  private com.sharingfileweb.repository.UserRepository userRepository;

  @Autowired
  private com.sharingfileweb.repository.RoleRepository roleRepository;

  @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
  @GetMapping("/admin/users")
  public ResponseEntity<?> getAllUsers() {
      List<User> users = userRepository.findAll();
      users.forEach(u -> u.setPassword(null));
      return ResponseEntity.ok(StandardResponse.success("Fetched all users", users));
  }

  @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
  @GetMapping("/admin/users/{id}")
  public ResponseEntity<?> getUser(@org.springframework.web.bind.annotation.PathVariable String id) {
      return userRepository.findById(id)
              .map(user -> {
                  user.setPassword(null);
                  return ResponseEntity.ok(StandardResponse.success("Fetched user", user));
              })
              .orElse(ResponseEntity.notFound().build());
  }

  @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
  @PutMapping("/admin/users/{id}")
  public ResponseEntity<?> updateUser(@org.springframework.web.bind.annotation.PathVariable String id, @RequestBody Map<String, Object> updates) {
      return userRepository.findById(id).map(user -> {
          if (updates.containsKey("roles")) {
              List<String> strRoles = (List<String>) updates.get("roles");
              java.util.Set<com.sharingfileweb.models.Role> roles = new java.util.HashSet<>();
              for (String role : strRoles) {
                  com.sharingfileweb.models.Role mappedRole = roleRepository.findByName(com.sharingfileweb.models.ERole.valueOf(role))
                          .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                  roles.add(mappedRole);
              }
              user.setRoles(roles);
          }
          if (updates.containsKey("subscriptionPlan")) {
              user.setSubscriptionPlan((String) updates.get("subscriptionPlan"));
          }
          if (updates.containsKey("maxStorage")) {
              user.setMaxStorage(((Number) updates.get("maxStorage")).longValue());
          }
          if (updates.containsKey("maxFileSize")) {
              user.setMaxFileSize(((Number) updates.get("maxFileSize")).longValue());
          }
          userRepository.save(user);
          user.setPassword(null);
          return ResponseEntity.ok(StandardResponse.success("User updated", user));
      }).orElse(ResponseEntity.notFound().build());
  }

  @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
  @org.springframework.web.bind.annotation.DeleteMapping("/admin/users/{id}")
  public ResponseEntity<?> deleteUser(@org.springframework.web.bind.annotation.PathVariable String id) {
      if (!userRepository.existsById(id)) {
          return ResponseEntity.notFound().build();
      }
      userRepository.deleteById(id);
      return ResponseEntity.ok(StandardResponse.success("User deleted", null));
  }
}


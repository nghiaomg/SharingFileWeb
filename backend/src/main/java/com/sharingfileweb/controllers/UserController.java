package com.sharingfileweb.controllers;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.sharingfileweb.models.User;
import com.sharingfileweb.payload.request.UpdateProfileRequest;
import com.sharingfileweb.payload.request.ChangePasswordRequest;
import com.sharingfileweb.payload.response.StandardResponse;
import com.sharingfileweb.payload.response.UserProfileResponse;
import com.sharingfileweb.services.UserService;
import java.util.Map;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
@Tag(name = "User Profile", description = "Các API quản lý thông tin tài khoản và dung lượng người dùng.")
public class UserController {

  @Autowired
  UserService userService;

  @Operation(summary = "Lấy thông tin người dùng", description = "Lấy Profile của người dùng đang đăng nhập.")
  @GetMapping("/auth/me")
  public ResponseEntity<?> getCurrentUser() {
    UserProfileResponse response = userService.getCurrentUserProfile();
    return ResponseEntity.ok(StandardResponse.success("Fetched user profile successfully", response));
  }

  @Operation(summary = "Cập nhật Profile", description = "Cập nhật tên và ảnh đại diện.")
  @PutMapping("/user/profile")
  public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
    try {
        userService.updateProfile(request);
        return ResponseEntity.ok(StandardResponse.success("Profile updated successfully!", null));
    } catch (RuntimeException e) {
        return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
    }
  }

  @Operation(summary = "Đổi mật khẩu", description = "Đổi mật khẩu tài khoản đang đăng nhập.")
  @PutMapping("/user/password")
  public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
    try {
        userService.changePassword(request);
        return ResponseEntity.ok(StandardResponse.success("Đổi mật khẩu thành công!", null));
    } catch (RuntimeException e) {
        return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
    }
  }

  @Operation(summary = "Lấy thông tin dung lượng", description = "Lấy trạng thái sử dụng dung lượng lưu trữ hiện tại.")
  @GetMapping("/user/storage")
  public ResponseEntity<?> getStorageUsage() {
    Map<String, Object> response = userService.getStorageUsage();
    return ResponseEntity.ok(StandardResponse.success("Fetched storage usage successfully", response));
  }

  @Autowired
  private com.sharingfileweb.repository.UserRepository userRepository;

  @Autowired
  private com.sharingfileweb.repository.RoleRepository roleRepository;

  // GET /api/users → Admin: lấy toàn bộ người dùng
  @Operation(summary = "Lấy tất cả người dùng (Quyền Admin)", description = "Lấy danh sách người dùng trên hệ thống.")
  @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
  @GetMapping("/users")
  public ResponseEntity<?> getAllUsers() {
      List<User> users = userRepository.findAll();
      users.forEach(u -> u.setPassword(null));
      return ResponseEntity.ok(StandardResponse.success("Fetched all users", users));
  }

  // GET /api/users/{id} → Admin: lấy người dùng theo id
  @Operation(summary = "Chi tiết người dùng (Quyền Admin)", description = "Lấy thông tin chi tiết một người dùng.")
  @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
  @GetMapping("/users/{id}")
  public ResponseEntity<?> getUser(@Parameter(description = "ID người dùng") @PathVariable String id) {
      return userRepository.findById(id)
              .map(user -> {
                  user.setPassword(null);
                  return ResponseEntity.ok(StandardResponse.success("Fetched user", user));
              })
              .orElse(ResponseEntity.notFound().build());
  }

  // PUT /api/users/{id} → Admin: cập nhật người dùng
  @Operation(summary = "Cập nhật người dùng (Quyền Admin)", description = "Thay đổi quyền, gói cước và giới hạn dung lượng.")
  @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
  @PutMapping("/users/{id}")
  public ResponseEntity<?> updateUser(@Parameter(description = "ID người dùng") @PathVariable String id, @RequestBody Map<String, Object> updates) {
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

  // DELETE /api/users/{id} → Admin: xóa người dùng
  @Operation(summary = "Xóa người dùng (Quyền Admin)", description = "Xóa hoàn toàn tài khoản người dùng.")
  @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
  @DeleteMapping("/users/{id}")
  public ResponseEntity<?> deleteUser(@Parameter(description = "ID người dùng cần xóa") @PathVariable String id) {
      if (!userRepository.existsById(id)) {
          return ResponseEntity.notFound().build();
      }
      userRepository.deleteById(id);
      return ResponseEntity.ok(StandardResponse.success("User deleted", null));
  }
}

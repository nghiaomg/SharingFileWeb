package com.sharingfileweb.controllers;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sharingfileweb.models.ERole;
import com.sharingfileweb.models.Role;
import com.sharingfileweb.models.User;
import com.sharingfileweb.payload.request.GoogleLoginRequest;
import com.sharingfileweb.payload.request.LoginRequest;
import com.sharingfileweb.payload.request.SignupRequest;
import com.sharingfileweb.payload.request.TokenRefreshRequest;
import com.sharingfileweb.payload.response.JwtResponse;
import com.sharingfileweb.payload.response.MessageResponse;
import com.sharingfileweb.payload.response.StandardResponse;
import com.sharingfileweb.payload.response.TokenRefreshResponse;
import com.sharingfileweb.repository.RoleRepository;
import com.sharingfileweb.repository.UserRepository;
import com.sharingfileweb.security.jwt.JwtUtils;
import com.sharingfileweb.security.services.RefreshTokenService;
import com.sharingfileweb.security.services.UserDetailsImpl;
import com.sharingfileweb.models.RefreshToken;
import com.sharingfileweb.exception.TokenRefreshException;

import com.sharingfileweb.services.AuthService;
import com.sharingfileweb.services.TurnstileService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Các API xác thực, đăng nhập và đăng ký người dùng")
public class AuthController {
  
  @Autowired
  AuthService authService;

  @Autowired
  TurnstileService turnstileService;

  @Operation(summary = "Đăng nhập", description = "Đăng nhập bằng username và mật khẩu để nhận Access Token và Refresh Token.")
  @PostMapping("/signin")
  public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
    if (!turnstileService.verifyToken(loginRequest.getTurnstileToken())) {
        return ResponseEntity.badRequest().body(StandardResponse.error("Xác minh Captcha thất bại. Vui lòng thử lại.", null));
    }
    JwtResponse response = authService.authenticateUser(loginRequest);
    return ResponseEntity.ok(StandardResponse.success("Login successful", response));
  }

  @Operation(summary = "Đăng nhập Google", description = "Đăng nhập sử dụng Google ID Token.")
  @PostMapping("/google")
  public ResponseEntity<?> googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
    try {
        JwtResponse response = authService.loginWithGoogle(request.getIdToken());
        return ResponseEntity.ok(StandardResponse.success("Google login successful", response));
    } catch (RuntimeException e) {
        return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
    }
  }

  @Operation(summary = "Đăng ký tải khoản", description = "Tạo tài khoản mới trong hệ thống.")
  @PostMapping("/signup")
  public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
    if (!turnstileService.verifyToken(signUpRequest.getTurnstileToken())) {
        return ResponseEntity.badRequest().body(StandardResponse.error("Xác minh Captcha thất bại. Vui lòng thử lại.", null));
    }
    try {
        authService.registerUser(signUpRequest);
        return ResponseEntity.ok(StandardResponse.success("User registered successfully!", null));
    } catch (RuntimeException e) {
        return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
    }
  }

  @Operation(summary = "Làm mới Access Token", description = "Sử dụng Refresh Token để lấy lại Access Token mới khi JWT hết hạn.")
  @PostMapping("/refreshtoken")
  public ResponseEntity<?> refreshtoken(@Valid @RequestBody TokenRefreshRequest request) {
    try {
        TokenRefreshResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(StandardResponse.success("Token refreshed successfully", response));
    } catch (TokenRefreshException e) {
        return ResponseEntity.status(403).body(StandardResponse.error(e.getMessage(), null));
    }
  }
  
  @Operation(summary = "Đăng xuất", description = "Đăng xuất người dùng hiện tại (xóa Refresh Token).")
  @PostMapping("/logout")
  public ResponseEntity<?> logoutUser() {
    authService.logoutUser();
    return ResponseEntity.ok(StandardResponse.success("Log out successful!", null));
  }
}

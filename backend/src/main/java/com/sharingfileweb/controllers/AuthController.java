package com.sharingfileweb.controllers;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sharingfileweb.payload.request.GoogleLoginRequest;
import com.sharingfileweb.payload.request.LoginRequest;
import com.sharingfileweb.payload.request.TokenRefreshRequest;
import com.sharingfileweb.payload.response.JwtResponse;
import com.sharingfileweb.payload.response.StandardResponse;
import com.sharingfileweb.payload.response.TokenRefreshResponse;
import com.sharingfileweb.security.services.RefreshTokenService;
import com.sharingfileweb.exception.TokenRefreshException;

import com.sharingfileweb.services.AuthService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Các API xác thực và đăng nhập người dùng")
public class AuthController {

  @Autowired
  AuthService authService;

  @Operation(summary = "Đăng nhập", description = "Đăng nhập bằng username và mật khẩu để nhận Access Token và Refresh Token.")
  @PostMapping("/signin")
  public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
    try {
      JwtResponse response = authService.authenticateUser(loginRequest);
      return ResponseEntity.ok(StandardResponse.success("Login successful", response));
    } catch (RuntimeException e) {
      return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
    }
  }

  @Operation(summary = "Đăng nhập Google", description = "Đăng nhập sử dụng Google OAuth Code.")
  @PostMapping("/google")
  public ResponseEntity<?> googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
    try {
        JwtResponse response = authService.loginWithGoogle(request.getCode(), request.getRedirectUri());
        return ResponseEntity.ok(StandardResponse.success("Google login successful", response));
    } catch (RuntimeException e) {
        return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
    }
  }

  @Operation(summary = "Đăng nhập GitHub", description = "Đăng nhập sử dụng GitHub OAuth Code.")
  @PostMapping("/github")
  public ResponseEntity<?> githubLogin(@Valid @RequestBody com.sharingfileweb.payload.request.GithubLoginRequest request) {
    try {
        JwtResponse response = authService.loginWithGithub(request.getCode(), request.getRedirectUri());
        return ResponseEntity.ok(StandardResponse.success("GitHub login successful", response));
    } catch (RuntimeException e) {
        return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
    }
  }

  @Operation(summary = "Đăng nhập Dribbble", description = "Đăng nhập sử dụng Dribbble OAuth Code.")
  @PostMapping("/dribbble")
  public ResponseEntity<?> dribbbleLogin(@Valid @RequestBody com.sharingfileweb.payload.request.DribbbleLoginRequest request) {
    try {
        JwtResponse response = authService.loginWithDribbble(request.getCode(), request.getRedirectUri());
        return ResponseEntity.ok(StandardResponse.success("Dribbble login successful", response));
    } catch (RuntimeException e) {
        return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
    }
  }

  @Operation(summary = "Đăng nhập Zalo", description = "Đăng nhập sử dụng Zalo OAuth Code.")
  @PostMapping("/zalo")
  public ResponseEntity<?> zaloLogin(@Valid @RequestBody com.sharingfileweb.payload.request.ZaloLoginRequest request) {
    try {
        JwtResponse response = authService.loginWithZalo(request.getCode(), request.getRedirectUri());
        return ResponseEntity.ok(StandardResponse.success("Zalo login successful", response));
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
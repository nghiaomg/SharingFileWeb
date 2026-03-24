# Case 02 — Xác thực JWT + Refresh Token + Google OAuth

## Mô tả vấn đề

Hệ thống cần:
1. **Đăng nhập bằng username/password** hoặc **Google OAuth**
2. **Access token** ngắn hạn (15 phút) — dùng cho mọi API call
3. **Refresh token** dài hạn — lưu MongoDB để có thể revoke từ xa
4. **Logout** thu hồi refresh token, đăng nhập lại buộc phải xác thực lại

---

## Flow đăng nhập Username/Password

```
POST /auth/signin  { username, password }
  → AuthController.signin()
  → AuthService.authenticateUser()
```

```java
// AuthService.java - authenticateUser()
public JwtResponse authenticateUser(LoginRequest loginRequest) {
    // 1. Spring Security xác thực credentials
    Authentication authentication = authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(username, password)
    );
    // → Gọi UserDetailsServiceImpl.loadUserByUsername()
    // → So sánh password hash bằng BCrypt

    // 2. Set SecurityContext cho request hiện tại
    SecurityContextHolder.getContext().setAuthentication(authentication);

    // 3. Tạo Access Token (JWT, ngắn hạn)
    String jwt = jwtUtils.generateJwtToken(authentication);

    // 4. Tạo Refresh Token (lưu MongoDB, dài hạn)
    RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getId());

    // 5. Trả về JwtResponse
    return new JwtResponse(jwt, refreshToken.getToken(), userId, username, email, roles, plan, maxStorage, maxFileSize);
}
```

**Files:** `AuthController.java`, `AuthService.java`, `JwtUtils.java`, `RefreshTokenService.java`

---

## Flow đăng nhập Google OAuth

```
POST /auth/google  { idToken: "..." }
  → AuthController.googleLogin()
  → AuthService.loginWithGoogle()
```

```java
// AuthService.java - loginWithGoogle()
public JwtResponse loginWithGoogle(String idToken) {
    // 1. Verify token với Google API
    GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(...)
        .setAudience(Collections.singletonList(googleClientId))
        .build();
    GoogleIdToken googleIdToken = verifier.verify(idToken);

    // 2. Lấy email + tên từ payload
    String email = payload.getEmail();
    String name = (String) payload.get("name");

    // 3. Tìm user theo email — tạo mới nếu lần đầu đăng nhập
    User user = userRepository.findByEmail(email).orElseGet(() -> {
        User newUser = new User(
            name.toLowerCase() + "_" + UUID.randomUUID().substring(0,6),
            email,
            encoder.encode(UUID.randomUUID().toString()) // password ngẫu nhiên
        );
        newUser.setSubscriptionPlan("BASIC");
        newUser.setMaxStorage(5GB);
        newUser.setMaxFileSize(1GB);
        return userRepository.save(newUser);
    });

    // 4. Tạo JWT + Refresh Token giống flow thường
    String jwt = jwtUtils.generateTokenFromUsername(user.getUsername());
    RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());
    return new JwtResponse(...);
}
```

**Config:** `application.properties` → `sharingfileweb.app.googleClientId`

---

## Flow Refresh Token

```
POST /auth/refreshtoken  { refreshToken: "..." }
  → AuthController.refreshtoken()
  → AuthService.refreshToken()
```

```java
// AuthService.java - refreshToken()
public TokenRefreshResponse refreshToken(TokenRefreshRequest request) {
    return refreshTokenService.findByToken(requestRefreshToken)
        .map(refreshTokenService::verifyExpiration)   // Kiểm tra hết hạn
        .map(RefreshToken::getUser)                    // Lấy User entity
        .map(user -> {
            String newJwt = jwtUtils.generateTokenFromUsername(user.getUsername());
            return new TokenRefreshResponse(newJwt, requestRefreshToken);
        })
        .orElseThrow(() -> new TokenRefreshException(...));
}
```

**RefreshTokenService.java — `verifyExpiration()`:**
```java
// Nếu hết hạn: xóa khỏi DB và ném exception
if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
    refreshTokenRepository.delete(token);
    throw new TokenRefreshException(token.getToken(), "Refresh token đã hết hạn. Vui lòng đăng nhập lại.");
}
```

---

## Flow Logout

```
POST /auth/logout
  → AuthController.logoutUser()
  → AuthService.logoutUser()
```

```java
// AuthService.java - logoutUser()
public void logoutUser() {
    String userId = getCurrentUserId(); // từ SecurityContext
    refreshTokenService.deleteByUserId(userId);
    // → RefreshTokenRepository.deleteByUserId(userId)
}
```

Sau logout, refresh token cũ **không còn dùng được**. Nếu access token cũ vẫn còn hạn → **vẫn có thể dùng** (known: không có token blacklist).

---

## Filter xác thực mọi request

```java
// AuthTokenFilter.java (chạy trước mọi request protected)
String jwt = parseJwt(request);  // Lấy từ header Authorization: Bearer {token}
if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
    String username = jwtUtils.getUserNameFromJwtToken(jwt);
    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
    // Set vào SecurityContext để các Service gọi getCurrentUserId()
    SecurityContextHolder.getContext().setAuthentication(authToken);
}
```

---

## Các file liên quan

| File | Vai trò |
|------|---------|
| `AuthController.java` | Endpoint: `/auth/signin`, `/signup`, `/refreshtoken`, `/logout`, `/google` |
| `AuthService.java` | Business logic xác thực, Google verify, tạo token |
| `JwtUtils.java` | Tạo / validate / parse JWT |
| `RefreshTokenService.java` | CRUD refresh token trong MongoDB |
| `AuthTokenFilter.java` | Spring Security filter — chạy trước mọi request |
| `WebSecurityConfig.java` | Cấu hình route public vs protected |
| `UserDetailsImpl.java` | Wrapper User thành Spring Security UserDetails |
| `RefreshToken.java` (model) | Collection `refreshtokens` trong MongoDB |

---

## Edge Cases quan trọng

| Tình huống | Xử lý |
|-----------|-------|
| Google user đăng nhập lần đầu | Auto-create account với random password |
| Refresh token hết hạn | Xóa khỏi DB, trả 403, buộc đăng nhập lại |
| Logout nhưng access token cũ còn hạn | Không bị block (không có blacklist JWT) |
| Đăng nhập nhiều thiết bị | Mỗi lần login tạo 1 refresh token mới trong DB |
| `deleteByUserId()` xóa tất cả refresh tokens | Logout toàn bộ thiết bị cùng lúc |

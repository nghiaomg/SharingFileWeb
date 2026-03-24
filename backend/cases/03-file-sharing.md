# Case 03 — Chia sẻ file: Share Link vs Direct Access

## Mô tả vấn đề

Dự án có **2 cơ chế chia sẻ song song**:

| Cơ chế | Mô tả | Service |
|--------|-------|---------|
| **Share Link** | Tạo URL ngẫu nhiên, ai có link là truy cập được | `ShareLinkService` |
| **Direct Access** | Chia sẻ theo email cụ thể, chỉ người được mời | `SharedAccessService` |

---

## Cơ chế 1 — Share Link (Public URL)

### Tạo link mới

```
POST /shares/links/{fileId}
  Body: { permission: "VIEW|DOWNLOAD", password?: "...", expiresInDays?: 7 }
  → ShareController → ShareLinkService.createLink()
```

```java
// ShareLinkService.java - createLink()
public ShareLinkResponse createLink(String fileId, String permission, String rawPassword, Long expiresInDays) {
    // 1. Kiểm tra ownership
    fileRepository.findByIdAndOwnerIdAndIsDeletedFalse(fileId, userId).orElseThrow();

    // 2. Tạo token ngẫu nhiên (UUID)
    String token = UUID.randomUUID().toString();

    // 3. Hash password nếu có (BCrypt)
    String hashedPassword = (rawPassword != null) ? passwordEncoder.encode(rawPassword) : null;

    // 4. Tính thời hạn hết hạn
    Instant expiresAt = (expiresInDays != null) ? Instant.now().plus(expiresInDays, ChronoUnit.DAYS) : null;

    ShareLink link = new ShareLink(fileId, token, userId, permission, hashedPassword, expiresAt);
    shareLinkRepository.save(link);

    // URL trả về: /shared/{token}
    return mapToResponse(link);
}
```

### Truy cập qua link

```
GET /public/share/{token}?password=...
  → PublicShareController → ShareLinkService.validateLink() → FileService.getPublicFileMetadata()
```

```java
// ShareLinkService.java - validateLink()
public ShareLink validateLink(String token, String rawPassword) {
    ShareLink link = shareLinkRepository.findByToken(token).orElseThrow();

    // Kiểm tra revoked
    if (link.isRevoked()) throw new RuntimeException("Link đã bị thu hồi");

    // Kiểm tra hết hạn
    if (link.getExpiresAt() != null && link.getExpiresAt().isBefore(Instant.now()))
        throw new RuntimeException("Link đã hết hạn");

    // Kiểm tra password
    if (link.getPassword() != null) {
        if (rawPassword == null) throw new RuntimeException("REQUIRES_PASSWORD");
        if (!passwordEncoder.matches(rawPassword, link.getPassword()))
            throw new RuntimeException("Mật khẩu không đúng");
    }

    return link;
}
```

### Thu hồi link

```java
// ShareLinkService.java - revokeLink()
link.setRevoked(true);
shareLinkRepository.save(link);
```

---

## Cơ chế 2 — Direct Access (Chia sẻ theo email)

### Chia sẻ với người dùng cụ thể

```
POST /shares/access/{fileId}
  Body: { emails: ["a@b.com", "c@d.com"], permission: "VIEW|DOWNLOAD|EDIT" }
  → ShareController → SharedAccessService.shareWithUsers()
```

```java
// SharedAccessService.java - shareWithUsers()
for (String recipientEmail : emails) {
    if (recipientEmail.equalsIgnoreCase(userEmail)) continue; // Bỏ qua chính mình

    // Nếu đã share trước đó → chỉ cập nhật permission
    var existing = sharedAccessRepository.findByFileIdAndRecipientEmailAndIsRevokedFalse(fileId, recipientEmail);
    if (existing.isPresent()) {
        existing.get().setPermission(permission);
        sharedAccessRepository.save(existing.get());
        continue;
    }

    // Tạo SharedAccess record mới
    SharedAccess access = new SharedAccess(fileId, userId, userEmail, recipientEmail, permission);
    sharedAccessRepository.save(access);

    // Gửi notification cho người nhận
    notificationService.createNotification(
        recipientEmail,
        "FILE_SHARED",
        "Có tệp được chia sẻ với bạn",
        owner.getUsername() + " đã chia sẻ tệp \"" + file.getName() + "\" với bạn.",
        metadata
    );
}
```

### Xem danh sách file được chia sẻ với mình

```
GET /shares/with-me
  → SharedAccessService.getSharedWithMe()
```

```java
// Tìm theo email của user hiện tại (không phải userId)
List<SharedAccess> accesses = sharedAccessRepository.findByRecipientEmailAndIsRevokedFalse(email);
// Lọc bỏ file đã bị xóa
return accesses.stream()
    .filter(access -> {
        StorageFile file = fileRepository.findById(access.getFileId()).orElse(null);
        return file != null && !file.isDeleted();
    })
    .map(this::mapToResponse)
    .collect(Collectors.toList());
```

---

## Phân biệt 2 loại "accessMode" trong StorageFile

`StorageFile` có field `accessMode` (kiểm soát truy cập public):

| accessMode | Ý nghĩa |
|-----------|---------|
| `PRIVATE` | Chỉ owner mới xem được |
| `PUBLIC` | Ai cũng xem được (không cần login) |
| `RESTRICTED` | Phải đăng nhập + email phải có trong `sharedEmails[]` |

```java
// FileService.java - getPublicFileMetadata()
if ("RESTRICTED".equals(mode)) {
    // Kiểm tra user đang đăng nhập
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || "anonymousUser".equals(auth.getPrincipal()))
        throw new RuntimeException("Unauthorized: Login is required");

    // Kiểm tra email trong danh sách được phép
    UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
    if (!file.getSharedEmails().contains(userDetails.getEmail()))
        throw new RuntimeException("Forbidden: You are not invited");
}
```

---

## Các file liên quan

| File | Vai trò |
|------|---------|
| `ShareController.java` | Endpoint quản lý share link + direct access |
| `PublicShareController.java` | Endpoint công khai: xem/tải file qua link |
| `ShareLinkService.java` | CRUD ShareLink, validate token, password, expiry |
| `SharedAccessService.java` | CRUD SharedAccess, gửi notification khi share |
| `FileService.java` | `getPublicFileMetadata()` — kiểm tra accessMode |
| `ShareLink.java` (model) | Collection `sharelinks`: token, password(hashed), expiresAt, isRevoked |
| `SharedAccess.java` (model) | Collection `sharedaccesses`: fileId, ownerEmail, recipientEmail, permission |
| `NotificationService.java` | Tạo thông báo khi file được chia sẻ |

---

## Edge Cases quan trọng

| Tình huống | Xử lý |
|-----------|-------|
| Share link đã được thu hồi | `isRevoked = true` → 403 |
| Link hết hạn | Kiểm tra `expiresAt.isBefore(now())` → 403 |
| Link có password → client không gửi | Ném `"REQUIRES_PASSWORD"` → frontend hiện form nhập |
| Share cho email không có account | Vẫn tạo SharedAccess, notification gửi theo email |
| Owner share cho chính mình | Bị skip trong vòng lặp emails |
| Update permission đã share | `findByFileIdAndRecipientEmailAndIsRevokedFalse()` → chỉ cập nhật permission |

# Revoke File URL — Chi tiết kỹ thuật

> Tài liệu mô tả toàn bộ luồng revoke file URL khi chuyển file từ chế độ công khai sang riêng tư trong hệ thống SharingFileWeb.
>
> **Ngày cập nhật:** 2026-04-04
>
> **Ngôn ngữ code:** Java (Spring Boot) + MongoDB + Backblaze B2

---

## Mục lục

1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Hai cơ chế chia sẻ độc lập](#2-hai-cơ-chế-chia-sẻ-độc-lập)
3. [Cơ chế 1 — ShareLink (Link công khai)](#3-cơ-chế-1--sharelink-link-công-khai)
   - 3.1. [Model — ShareLink.java](#31-model--sharelinkjava)
   - 3.2. [Service — ShareLinkService.java](#32-service--sharelinkservicejava)
   - 3.3. [Controller — ShareController.java](#33-controller--sharecontrollerjava)
   - 3.4. [Controller công khai — PublicShareController.java](#34-controller-công-khai--publicsharecontrollerjava)
   - 3.5. [API Endpoints](#35-api-endpoints)
   - 3.6. [Presigned URL — B2StorageService.java](#36-presigned-url--b2storageservicejava)
4. [Cơ chế 2 — SharedAccess (Chia sẻ qua email)](#4-cơ-chế-2--sharedaccess-chia-sẻ-qua-email)
   - 4.1. [Model — SharedAccess.java](#41-model--sharedaccessjava)
   - 4.2. [Service — SharedAccessService.java](#42-service--sharedaccessservicejava)
   - 4.3. [Permission Gate — FilePermissionService.java](#43-permission-gate--filepermissionservicejava)
   - 4.4. [API Endpoints](#44-api-endpoints)
5. [Cơ chế Legacy — isPublic / accessMode](#5-cơ-chế-legacy--ispublic--accessmode)
6. [Cấu hình Presigned URL TTL](#6-cấu-hình-presigned-url-ttl)
7. [Scheduled Jobs (Không liên quan)](#7-scheduled-jobs-không-liên-quan)
8. [Luồng end-to-end khi revoke](#8-luồng-end-to-end-khi-revoke)
9. [Hạn chế của hệ thống](#9-hạn-chế-của-hệ-thống)
10. [Frontend API](#10-frontend-api)
11. [Checklist kiểm tra](#11-checklist-kiểm-tra)

---

## 1. Tổng quan kiến trúc

Hệ thống sử dụng **2 cơ chế chia sẻ độc lập**, cả hai đều dùng **presigned URL** từ Backblaze B2:

| Cơ chế | Mục đích | Token |
|--------|----------|-------|
| **ShareLink** | Tạo link công khai (public link) — ai có link đều truy cập được | UUID token trong URL |
| **SharedAccess** | Chia sẻ qua email — chỉ người được cấp quyền mới truy cập | Email + role |

**Nguyên tắc cốt lõi:** Presigned URL được **tạo mới mỗi lần request**, không lưu trữ. Revoke chỉ cần set flag `isRevoked = true` → lần truy cập tiếp theo bị chặn trước khi URL được tạo.

**Không có background scheduled job** cho URL expiration — enforcement hoàn toàn **on-demand** tại thời điểm request.

---

## 2. Hai cơ chế chia sẻ độc lập

```
┌─────────────────────────────────────────────────┐
│              Hệ thống chia sẻ file               │
├─────────────────────┬───────────────────────────┤
│   ShareLink         │   SharedAccess             │
│   (Link công khai)  │   (Chia sẻ qua email)      │
├─────────────────────┼───────────────────────────┤
│ ai có link đều truy │ chỉ email được cấp mới    │
│ cập được            │ truy cập                  │
│ UUID token trong    │ email + role (VIEWER/      │
│ URL                 │ EDITOR/ COMMENTER)         │
│ revokable via API   │ revokable via API          │
└─────────────────────┴───────────────────────────┘
```

---

## 3. Cơ chế 1 — ShareLink (Link công khai)

### 3.1. Model — ShareLink.java

**Đường dẫn:** `backend/src/main/java/com/sharingfileweb/models/ShareLink.java`

```java
@Document(collection = "share_links")
public class ShareLink {

    @Id
    private String id;                          // MongoDB ObjectId

    @Indexed(unique = true)
    private String token;                        // UUID public identifier — dùng trong URL công khai

    private String fileId;                      // File được chia sẻ
    private String ownerId;                      // Chủ sở hữu link

    private String password;                    // BCrypt-hashed password (optional)

    private Instant expiresAt;                   // Thời điểm hết hạn (optional)

    private boolean isRevoked;                   // ⚠️ Flag revoke — true = vĩnh viễn bị vô hiệu hóa

    // Usage-based expiry
    private long viewCount;                     // Số lượt xem hiện tại
    private long maxViews;                       // Giới hạn lượt xem (-1 = không giới hạn)

    private Instant createdAt;
}
```

**Giải thích các trường:**

| Trường | Mục đích |
|--------|----------|
| `token` | UUID ngẫu nhiên, được embed vào URL công khai (VD: `/api/public/share/{token}`). Indexed unique để lookup nhanh. |
| `isRevoked` | Flag quan trọng nhất — khi `true`, mọi truy cập bị chặn tại `validateLink()`. Không bị xóa, chỉ disable. |
| `expiresAt` | Hết hạn theo thời gian. Optional — nếu `null` thì link không bao giờ tự hết hạn. |
| `maxViews` | Hết hạn theo lượt xem. Optional — nếu `-1` thì không giới hạn. |
| `password` | Nếu set, người truy cập phải nhập password trước khi xem/download. BCrypt hashed. |

---

### 3.2. Service — ShareLinkService.java

**Đường dẫn:** `backend/src/main/java/com/sharingfileweb/services/ShareLinkService.java`

#### 3.2.1. Tạo ShareLink

```java
public ShareLink createShareLink(String fileId, ShareLinkRequest request) {
    // 1. Xác thực file thuộc về user hiện tại
    StorageFile file = storageFileRepository.findByIdAndOwnerId(fileId, getCurrentUserId())
            .orElseThrow(() -> new RuntimeException("File không tồn tại"));

    // 2. Tạo link mới
    ShareLink link = new ShareLink();
    link.setToken(UUID.randomUUID().toString());         // UUID ngẫu nhiên
    link.setFileId(fileId);
    link.setOwnerId(getCurrentUserId());
    link.setPassword(bcryptEncode(request.getPassword()));// null nếu không có password
    link.setExpiresAt(request.getExpiresAt());           // null = không hết hạn
    link.setMaxViews(request.getMaxViews());             // -1 = không giới hạn
    link.setIsRevoked(false);                             // Mặc định = chưa revoke

    return shareLinkRepository.save(link);
}
```

#### 3.2.2. Revoke Link — Điểm then chốt

```java
// Dòng 121-127
public void revokeLink(String linkId) {
    String userId = getCurrentUserId();

    // 1. Tìm link, đảm bảo user hiện tại là chủ sở hữu
    ShareLink link = shareLinkRepository.findByIdAndOwnerId(linkId, userId)
            .orElseThrow(() -> new RuntimeException("Link không tồn tại"));

    // 2. ⚠️ Set flag isRevoked = true — KHÔNG xóa record
    link.setRevoked(true);
    shareLinkRepository.save(link);

    // 3. Không cần revoke trên B2 vì presigned URL không được lưu trữ
}
```

> **Lưu ý:** Record không bị hard-delete. Việc giữ lại record cho phép audit, thống kê, và hiển thị lịch sử revoke cho user.

#### 3.2.3. Validate Link — Enforcement point

Đây là điểm kiểm tra **mọi lần** có người truy cập qua link công khai.

```java
// Dòng 144-179
public ShareLink validateLink(String token) {
    ShareLink link = shareLinkRepository.findByToken(token)
            .orElseThrow(() -> new RuntimeException("Link không tồn tại"));

    // ─── CHECK 1: Revoked ───
    if (link.isRevoked()) {
        throw new ShareLinkRevokedException("Link đã bị thu hồi");  // HTTP 403
    }

    // ─── CHECK 2: Expired by time ───
    if (link.getExpiresAt() != null && link.getExpiresAt().isBefore(Instant.now())) {
        throw new ShareLinkExpiredException("Link đã hết hạn");      // HTTP 410
    }

    // ─── CHECK 3: Max views ───
    if (link.getMaxViews() > 0 && link.getViewCount() >= link.getMaxViews()) {
        throw new ShareLinkExpiredException("Đã đạt giới hạn lượt xem");
    }

    // ─── CHECK 4: Password (nếu có) ───
    if (link.getPassword() != null) {
        // Password được kiểm tra tại controller, không phải ở đây
    }

    // ─── CHECK 5: Atomic increment viewCount ───
    // Đảm bảo không có race condition khi nhiều người truy cập cùng lúc
    AtomicReference<Long> newCount = new AtomicReference<>();
    shareLinkRepository.atomicIncrementViewCount(link.getId(), newCount);

    // Sau khi increment, kiểm tra lại nếu vượt maxViews
    if (link.getMaxViews() > 0 && newCount.get() > link.getMaxViews()) {
        throw new ShareLinkExpiredException("Đã đạt giới hạn lượt xem");
    }

    return link;
}
```

#### 3.2.4. Tạo Presigned URL cho ShareLink

```java
// Dòng 194-218
public String getPresignedUrlForShareLink(String token, String fileId, boolean inline) {
    // 1. Validate link (bao gồm kiểm tra revoked, expired, v.v.)
    ShareLink link = validateLink(token);

    // 2. Lấy file từ MongoDB
    StorageFile file = storageFileRepository.findById(fileId)
            .orElseThrow(() -> new RuntimeException("File không tồn tại"));

    // 3. Tính duration — KHÔNG BAO GIỜ tạo URL vượt quá thời gian sống của link
    java.time.Duration duration = presignedUrlConfig.getDownload();  // default: 15 phút
    if (link.getExpiresAt() != null) {
        java.time.Duration remaining = Duration.between(Instant.now(), link.getExpiresAt());
        if (remaining.compareTo(duration) < 0) {
            duration = remaining;  // ⚠️ Cắt duration nếu link sắp hết hạn
        }
    }

    // 4. Tạo presigned URL mới từ B2 — URL này KHÔNG được lưu trữ
    return b2StorageService.getPresignedDownloadUrl(
            file.getB2FileName(),
            file.getName(),
            inline,      // true = preview (inline), false = force download
            duration
    );
}
```

> **Tại sao presigned URL được tạo mới mỗi lần?**
>
> - B2 presigned URL có TTL ngắn (mặc định 15 phút). Lưu trữ chúng không có giá trị vì chúng sẽ hết hạn sớm.
> - Revoke có hiệu lực **ngay lập tức** — vì mỗi request đều phải qua `validateLink()` trước khi tạo URL mới.
> - Không cần revoke token trên B2 vì B2 không có cơ chế revoke token riêng (token chỉ có TTL).

---

### 3.3. Controller — ShareController.java

**Đường dẫn:** `backend/src/main/java/com/sharingfileweb/controllers/ShareController.java`

```java
// ═══════════════════════════════════════════════════════
// REVOKE SHARE LINK — Người dùng revoke link của mình
// ═══════════════════════════════════════════════════════
// DELETE /api/share/link/{id}
// Dòng: 162-170
@DeleteMapping("/link/{id}")
public ResponseEntity<?> revokeLink(@PathVariable String id) {
    try {
        shareLinkService.revokeLink(id);    // ⚠️ set isRevoked = true
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Link đã được thu hồi thành công"
        ));
    } catch (RuntimeException e) {
        return ResponseEntity.status(404).body(Map.of(
            "success", false,
            "message", e.getMessage()
        ));
    }
}

// ═══════════════════════════════════════════════════════
// LIST SHARE LINKS — Liệt kê links của một file
// GET /api/share/link/file/{fileId}
// Dòng: 143-147
// ═══════════════════════════════════════════════════════
// Trả về danh sách links, đã lọc revoked (hoặc hiển thị trạng thái revoked)
// Tùy business requirement: có thể hiển thị tất cả kể cả revoked để user biết
```

```java
// ═══════════════════════════════════════════════════════
// ADMIN: Hard delete ShareLink
// DELETE /api/share/links/{id}
// Dòng: 186-191
// ═══════════════════════════════════════════════════════
@DeleteMapping("/links/{id}")    // ⚠️ /links/ (số nhiều) — Admin only
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<?> adminDeleteLink(@PathVariable String id) {
    shareLinkRepository.deleteById(id);  // ⚠️ Hard delete — KHÔNG chỉ revoke
    return ResponseEntity.ok(Map.of("success", true));
}
```

---

### 3.4. Controller công khai — PublicShareController.java

**Đường dẫn:** `backend/src/main/java/com/sharingfileweb/controllers/PublicShareController.java`

Đây là các endpoint **không yêu cầu đăng nhập** — ai có link đều truy cập được:

```java
// ═══════════════════════════════════════════════════════
// Lấy metadata file — ai cũng gọi được nếu có link
// GET /api/public/share/{token}
// Dòng: 44-78
// ═══════════════════════════════════════════════════════
@GetMapping("/{token}")
public ResponseEntity<?> getSharedFileInfo(
        @PathVariable String token,
        @RequestParam(required = false) String password) {

    ShareLink link = shareLinkService.validateLink(token);  // ⚠️ Revoke check ở đây

    if (link.getPassword() != null) {
        // Kiểm tra password nếu link được bảo vệ
        if (password == null || !bcryptEncoder.matches(password, link.getPassword())) {
            return ResponseEntity.status(401).body(Map.of(
                "requiresPassword", true,
                "message", "Link này được bảo vệ bằng mật khẩu"
            ));
        }
    }

    StorageFile file = storageFileService.getFileById(link.getFileId());
    return ResponseEntity.ok(buildShareLinkResponse(link, file));
}
```

```java
// ═══════════════════════════════════════════════════════
// Lấy presigned URL preview — gọi B2 tạo URL mới
// GET /api/public/share/{token}/preview
// Dòng: 86-122
// ═══════════════════════════════════════════════════════
@GetMapping("/{token}/preview")
public ResponseEntity<?> previewFile(
        @PathVariable String token,
        @RequestParam(required = false) String password) {

    // validateLink() được gọi → kiểm tra revoked, expired, maxViews
    ShareLink link = shareLinkService.validateLink(token);

    String presignedUrl = shareLinkService.getPresignedUrlForShareLink(
            token,
            link.getFileId(),
            true    // inline = preview
    );

    return ResponseEntity.ok(Map.of("url", presignedUrl));
}
```

```java
// ═══════════════════════════════════════════════════════
// Lấy presigned URL download
// GET /api/public/share/{token}/download
// Dòng: 130-175
// ═══════════════════════════════════════════════════════
@GetMapping("/{token}/download")
public ResponseEntity<?> downloadFile(@PathVariable String token) {
    ShareLink link = shareLinkService.validateLink(token);  // ⚠️ Revoke check

    String presignedUrl = shareLinkService.getPresignedUrlForShareLink(
            token,
            link.getFileId(),
            false   // inline = false → force download
    );

    // Redirect đến presigned URL trên B2
    return ResponseEntity.status(302)
            .header(HttpHeaders.LOCATION, presignedUrl)
            .build();
}
```

---

### 3.5. API Endpoints

| Method | Path | Handler | Mô tả |
|--------|------|---------|-------|
| `POST` | `/api/share/link` | Tạo link mới | Body: fileId, expiresAt, maxViews, password |
| `GET` | `/api/share/link/file/{fileId}` | Liệt kê links | Trả về danh sách link của file |
| `DELETE` | `/api/share/link/{id}` | Revoke link | ⚠️ **User revoke link của mình** — set `isRevoked=true` |
| `DELETE` | `/api/share/links/{id}` | Xóa link | ⚠️ Admin hard-delete |
| `GET` | `/api/public/share/{token}` | Xem metadata | Không cần auth — kiểm tra revoke |
| `GET` | `/api/public/share/{token}/preview` | Lấy URL preview | Kiểm tra revoke → tạo presigned URL mới |
| `GET` | `/api/public/share/{token}/download` | Download file | Kiểm tra revoke → redirect đến presigned URL |

---

### 3.6. Presigned URL — B2StorageService.java

**Đường dẫn:** `backend/src/main/java/com/sharingfileweb/services/B2StorageService.java`

```java
/**
 * Tạo presigned download URL từ Backblaze B2.
 *
 * @param b2FileName  Tên file trên B2 (internal)
 * @param originalName Tên file gốc (dùng trong Content-Disposition header)
 * @param inline       true = preview (Content-Disposition: inline)
 *                      false = download (Content-Disposition: attachment)
 * @param duration     Thời gian URL có hiệu lực (capped ≤ 15 phút cho download)
 */
public String getPresignedDownloadUrl(
        String b2FileName,
        String originalName,
        boolean inline,
        java.time.Duration duration) {

    // 1. Gọi B2 API để lấy presigned URL
    // 2. B2 trả về URL đã sign với query params: expiration, signature
    // 3. URL này được trả về cho client và dùng để GET/PUT trực tiếp từ B2

    // ⚠️ Presigned URL chỉ có giá trị trong `duration`
    // ⚠️ Không có cách revoke URL này trên B2 — chỉ có TTL tự hết hạn
    // ⚠️ Revoke thực chất là chặn ở validateLink(), KHÔNG phải ở B2
}
```

---

## 4. Cơ chế 2 — SharedAccess (Chia sẻ qua email)

### 4.1. Model — SharedAccess.java

**Đường dẫn:** `backend/src/main/java/com/sharingfileweb/models/SharedAccess.java`

```java
@Document(collection = "shared_accesses")
public class SharedAccess {

    @Id
    private String id;

    private String fileId;                    // File được chia sẻ
    private String ownerId;                   // Chủ file
    private String recipientEmail;            // Email người được chia sẻ

    private String role;                       // VIEWER | EDITOR | COMMENTER

    private boolean isRevoked;                 // ⚠️ Flag revoke — true = thu hồi quyền truy cập

    private Instant expiresAt;                // Optional: thời điểm hết hạn quyền truy cập

    private Instant createdAt;
    private Instant updatedAt;
}
```

---

### 4.2. Service — SharedAccessService.java

**Đường dẫn:** `backend/src/main/java/com/sharingfileweb/services/SharedAccessService.java`

#### 4.2.1. Revoke một SharedAccess

```java
// Dòng 173-179
public void revokeAccess(String accessId) {
    String userId = getCurrentUserId();

    SharedAccess access = sharedAccessRepository
            .findByIdAndOwnerId(accessId, userId)   // Chỉ chủ file mới revoke được
            .orElseThrow(() -> new RuntimeException("Không tìm thấy quyền truy cập"));

    // ⚠️ Set flag isRevoked = true
    access.setRevoked(true);
    sharedAccessRepository.save(access);
}
```

#### 4.2.2. Revoke TẤT CẢ SharedAccess của một file

```java
// Dòng 182-192
public void revokeAllForFile(String fileId) {
    String userId = getCurrentUserId();

    // Tìm tất cả SharedAccess của file này mà user hiện tại là chủ
    List<SharedAccess> accesses = sharedAccessRepository
            .findByFileIdAndOwnerId(fileId, userId);

    // Set all to revoked
    for (SharedAccess access : accesses) {
        access.setRevoked(true);
    }
    sharedAccessRepository.saveAll(accesses);
}
```

#### 4.2.3. Query lọc revoked

```java
// Dòng 155-156
// Query này được dùng trong mọi kiểm tra quyền truy cập
.findByFileIdAndRecipientEmailAndIsRevokedFalse(fileId, email)
```

> **Sử dụng filter ở query level** (thay vì check ở application level) giúp:
> - **Index-friendly:** MongoDB có thể dùng index trên `(fileId, recipientEmail, isRevoked)`
> - **Không tải record đã revoked** vào memory
> - **Performance tốt hơn** khi có nhiều revoked records

---

### 4.3. Permission Gate — FilePermissionService.java

**Đường dẫn:** `backend/src/main/java/com/sharingfileweb/services/FilePermissionService.java`

Đây là **single gate** cho tất cả quyết định truy cập file (kể cả SharedAccess):

```java
// Dòng 154-169
public boolean hasSharedAccess(String fileId, String email) {
    Optional<SharedAccess> accessOpt = sharedAccessRepository
            .findByFileIdAndRecipientEmailAndIsRevokedFalse(fileId, email);  // ⚠️

    if (accessOpt.isEmpty()) {
        return false;
    }

    SharedAccess access = accessOpt.get();

    // Kiểm tra thời gian hết hạn
    if (access.getExpiresAt() != null && access.getExpiresAt().isBefore(Instant.now())) {
        return false;
    }

    return true;
}
```

---

### 4.4. API Endpoints

| Method | Path | Handler | Mô tả |
|--------|------|---------|-------|
| `POST` | `/api/share/access` | Chia sẻ qua email | Body: fileId, email, role, expiresAt |
| `GET` | `/api/share/access/file/{fileId}` | Liệt kê quyền | Trả về danh sách người được chia sẻ |
| `DELETE` | `/api/share/access/{id}` | Revoke 1 quyền | ⚠️ **Revoke quyền của 1 người** |
| `DELETE` | `/api/share/access/file/{fileId}` | Revoke tất cả | ⚠️ **Revoke mọi quyền trên 1 file** |

---

## 5. Cơ chế Legacy — isPublic / accessMode

**Đường dẫn:** `backend/src/main/java/com/sharingfileweb/models/StorageFile.java`

```java
// Các trường legacy trên StorageFile
private boolean isPublic;           // line 38 — true = công khai (đã deprecated)
private String accessMode;           // "PRIVATE" | "PUBLIC" | "RESTRICTED"
private List<String> sharedEmails;  // Danh sách email được chia sẻ (RESTRICTED)
private Instant shareExpiresAt;      // Optional expiry
```

**`FileService.java`** (line 324-345): Khi switch từ public sang private → set `accessMode = "PRIVATE"` và `isPublic = false`.

**`FileService.java`** (line 359-368) `getPublicPresignedDownloadUrl()`: ⚠️ **Hạn chế bảo mật:**
- Không có revoke gate riêng
- Ai biết `fileId` đều có thể lấy presigned URL
- Chỉ có B2 token TTL (15 phút) tự bảo vệ

> **Khuyến nghị:** Nên deprecate hoàn toàn cơ chế `isPublic` / `accessMode`, chuyển hoàn toàn sang ShareLink/SharedAccess.

---

## 6. Cấu hình Presigned URL TTL

**Đường dẫn:** `backend/src/main/java/com/sharingfileweb/config/PresignedUrlConfig.java`

```java
@Configuration
public class PresignedUrlConfig {

    @Value("${storage.presigned.preview:300}")   // seconds
    private long previewDurationSeconds;         // Default: 5 phút

    @Value("${storage.presigned.download:900}")  // seconds
    private long downloadDurationSeconds;        // Default: 15 phút

    @Value("${storage.presigned.share-link-default:3600}") // seconds
    private long shareLinkDefaultDurationSeconds; // Default: 1 giờ

    public java.time.Duration getPreview() {
        return java.time.Duration.ofSeconds(previewDurationSeconds);
    }

    public java.time.Duration getDownload() {
        return java.time.Duration.ofSeconds(downloadDurationSeconds);
    }

    public java.time.Duration getShareLinkDefault() {
        return java.time.Duration.ofSeconds(shareLinkDefaultDurationSeconds);
    }
}
```

| Loại URL | Default | Config key |
|----------|---------|------------|
| Preview (inline) | **5 phút** | `storage.presigned.preview` |
| Download | **15 phút** | `storage.presigned.download` |
| ShareLink default | **1 giờ** | `storage.presigned.share-link-default` |

**Lưu ý:** ShareLink duration luôn bị cap bởi `min(config, remaining until expiresAt)` — không bao giờ tạo presigned URL vượt quá thời gian sống của link.

**File `.env`:**

```env
# Presigned URL TTL (seconds)
STORAGE_PRESIGNED_PREVIEW=300        # 5 phút
STORAGE_PRESIGNED_DOWNLOAD=900       # 15 phút
STORAGE_PRESIGNED_SHARE_LINK_DEFAULT=3600  # 1 giờ
```

---

## 7. Scheduled Jobs (Không liên quan)

Có 3 `@Scheduled` jobs trong hệ thống, **không có job nào** liên quan đến URL revocation:

| Job | File | Schedule | Mục đích |
|-----|------|----------|----------|
| `PaymentVerificationScheduler` | `security/services/` | Mỗi 30s | Xác minh thanh toán Stripe/PayOS |
| `TrashCleanupScheduler` | `security/services/` | 2AM hàng ngày + mỗi 6h | Permanently delete files trong trash |
| `B2SyncScheduler` | `security/services/` | 3AM hàng ngày | Đồng bộ B2 ↔ MongoDB |

→ Không có job "xóa expired links" vì:
1. Expired/Revoked links vẫn có giá trị audit
2. Revoke hoàn toàn là on-demand — không cần job chạy định kỳ

---

## 8. Luồng end-to-end khi revoke

### Kịch bản: User chuyển file từ công khai sang riêng tư

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User gọi API revoke trên frontend                            │
│    revokeShareLink(linkId) / revokeAllFileAccess(fileId)         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. DELETE /api/share/link/{id}  HOẶC                            │
│    DELETE /api/share/access/file/{fileId}                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Service: shareLinkService.revokeLink(id)                      │
│    HOẶC: sharedAccessService.revokeAllForFile(fileId)           │
│                                                                  │
│    MongoDB: set isRevoked = true on ShareLink / SharedAccess     │
│    (record vẫn tồn tại, KHÔNG bị xóa)                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Lần truy cập TIẾP THEO qua link/file:                        │
│                                                                  │
│    ShareLink path:                                               │
│    PublicShareController → validateLink() → link.isRevoked()?   │
│    → ShareLinkRevokedException (HTTP 403) → KHÔNG tạo URL       │
│                                                                  │
│    SharedAccess path:                                            │
│    FilePermissionService → hasSharedAccess()                     │
│    → Query: isRevoked == false → access denied                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Kết quả:                                                      │
│    ✅ Link bị vô hiệu hóa ngay lập tức                          │
│    ✅ Không presigned URL mới được tạo                          │
│    ⚠️ B2 presigned URL đã phát trước đó (trong vòng 15 phút)    │
│       vẫn còn hoạt động cho đến khi B2 token tự hết hạn        │
└─────────────────────────────────────────────────────────────────┘
```

### Chi tiết từng bước

```
User revoke
    │
    ├─→ ShareLinkService.revokeLink(id)
    │       └─→ shareLinkRepository.save(link.setRevoked(true))
    │               └─→ MongoDB: { isRevoked: true }
    │
    ├─→ SharedAccessService.revokeAccess(id)
    │       └─→ sharedAccessRepository.save(access.setRevoked(true))
    │               └─→ MongoDB: { isRevoked: true }
    │
    └─→ SharedAccessService.revokeAllForFile(fileId)
            └─→ sharedAccessRepository.saveAll(accesses)
                    └─→ MongoDB: ALL { isRevoked: true }
```

---

## 9. Hạn chế của hệ thống

### 9.1. Presigned URL đã phát hành vẫn hoạt động

```
┌────────────────────────────────────────────────────────────────┐
│ ⚠️  HẠN CHẾ QUAN TRỌNG                                        │
│                                                                │
│ Revoke chỉ chặn VIỆC TẠO URL mới.                            │
│ Presigned URL đã phát hành (trong vòng ≤15 phút) vẫn         │
│ hoạt động cho đến khi B2 token tự hết hạn.                    │
│                                                                │
│ Nguyên nhân: B2 không có API revoke individual token.         │
│                                                                │
│ Giải pháp hiện tại:                                           │
│ - TTL ngắn (15 phút) → giới hạn thiệt hại                     │
│ - Trong ngữ cảnh file sharing, đây là compromise chấp       │
│   nhận được (URL chỉ cần share trong thời gian ngắn)          │
│                                                                │
│ Giải pháp thay thế (nếu cần):                                 │
│ - Proxy tất cả download qua backend (backend fetch từ B2     │
│   rồi stream về client) → revoke có hiệu lực ngay            │
│   → Nhược điểm: Tăng bandwidth/load trên backend              │
│ - Dùng B2 Bucket Rules để revoke theo prefix                  │
└────────────────────────────────────────────────────────────────┘
```

### 9.2. Không revoke được token cũ trên B2

Backblaze B2 không cung cấp API để revoke một presigned URL/token cụ thể. Chỉ có:
- **Download authorization tokens** — có thể revoke được, nhưng dùng cho authenticated B2 access, không phải presigned URL
- **Presigned URL** — chỉ có TTL-based expiration

### 9.3. Race condition nhỏ ở maxViews

```java
// Atomic increment đã giải quyết phần lớn race condition
shareLinkRepository.atomicIncrementViewCount(link.getId(), newCount);

// Tuy nhiên vẫn có khoảng trống nhỏ:
// Thread A: read viewCount=99, maxViews=100
// Thread B: read viewCount=99, maxViews=100
// Thread A: validateLink() pass (99 < 100)
// Thread B: validateLink() pass (99 < 100)
// Thread A: atomicIncrement → viewCount=100
// Thread B: atomicIncrement → viewCount=101 (một người thừa)

// Giải pháp: dùng MongoDB transaction / findAndModify atomic
```

---

## 10. Frontend API

**Đường dẫn:** `frontend/src/features/files/api.ts`

```typescript
// ═══════════════════════════════════════════════════════
// Revoke ShareLink
// Dòng 335
// ═══════════════════════════════════════════════════════
export const revokeShareLink = (linkId: string) => {
    return api.delete(`/share/link/${linkId}`);
};

// ═══════════════════════════════════════════════════════
// Revoke 1 SharedAccess
// Dòng 303
// ═══════════════════════════════════════════════════════
export const revokeAccess = (accessId: string) => {
    return api.delete(`/share/access/${accessId}`);
};

// ═══════════════════════════════════════════════════════
// Revoke tất cả SharedAccess của một file
// Dòng 307
// ═══════════════════════════════════════════════════════
export const revokeAllFileAccess = (fileId: string) => {
    return api.delete(`/share/access/file/${fileId}`);
};
```

---

## 11. Checklist kiểm tra

### Khi revoke thành công

- [ ] API trả về `200 OK` với `success: true`
- [ ] MongoDB record có `isRevoked = true`
- [ ] GET `/api/public/share/{token}` trả về `403 ShareLinkRevokedException`
- [ ] GET `/api/public/share/{token}/preview` trả về `403`
- [ ] GET `/api/public/share/{token}/download` trả về `403`
- [ ] Presigned URL mới **không** được tạo cho link đã revoke

### Khi revoke SharedAccess

- [ ] `hasSharedAccess(fileId, email)` trả về `false`
- [ ] Query `findByFileIdAndRecipientEmailAndIsRevokedFalse()` không trả về record đã revoke
- [ ] Người dùng không thể truy cập file qua email đã revoke

### Bảo mật

- [ ] Chỉ chủ file (`ownerId`) mới revoke được link/access
- [ ] User A không thể revoke link/access của User B
- [ ] Admin có thể hard-delete link (`/api/share/links/{id}`)
- [ ] Endpoint công khai (`/api/public/share/{token}`) không yêu cầu auth
- [ ] Password link được BCrypt hashed, không plain text

### Performance

- [ ] `token` field trên ShareLink có index unique (lookup nhanh)
- [ ] `(fileId, recipientEmail, isRevoked)` có compound index (access check nhanh)
- [ ] Presigned URL không được lưu trữ (tiết kiệm storage)
- [ ] View count dùng atomic increment (tránh race condition)

---

## Tóm tắt kiến trúc

```
┌──────────────────────────────────────────────────────────┐
│                    Frontend (React)                       │
│  revokeShareLink(linkId) / revokeAllFileAccess(fileId)   │
└────────────────────────┬─────────────────────────────────┘
                         │ HTTP DELETE
                         ▼
┌────────────────────────────────────────────────────────┐
│          ShareController.java                          │
│  DELETE /api/share/link/{id}                           │
│  DELETE /api/share/access/{id}                         │
│  DELETE /api/share/access/file/{fileId}                │
└────────────────────────┬───────────────────────────────┘
                         │ calls
                         ▼
┌────────────────────────────────────────────────────────┐
│         ShareLinkService.java                          │
│  revokeLink() → set isRevoked = true                   │
│         SharedAccessService.java                       │
│  revokeAccess() → set isRevoked = true                │
└────────────────────────┬───────────────────────────────┘
                         │ save to
                         ▼
┌────────────────────────────────────────────────────────┐
│                    MongoDB                              │
│  ShareLink { token, isRevoked, expiresAt, ... }       │
│  SharedAccess { fileId, email, isRevoked, ... }      │
└────────────────────────┬───────────────────────────────┘
                         │ on every public access:
                         ▼
┌────────────────────────────────────────────────────────┐
│     PublicShareController.java / FilePermissionService │
│  validateLink() / hasSharedAccess()                    │
│     ↓                                                 │
│  if (isRevoked) → throw ShareLinkRevokedException     │
│     ↓                                                 │
│  if (valid) → b2StorageService.getPresignedUrl()      │
└────────────────────────┬───────────────────────────────┘
                         │ call B2 API
                         ▼
┌────────────────────────────────────────────────────────┐
│              Backblaze B2                             │
│  Phát hành presigned URL với TTL (≤15 phút)          │
│  ⚠️ Không có API revoke individual token              │
└────────────────────────────────────────────────────────┘
```

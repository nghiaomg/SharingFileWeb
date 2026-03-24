# Case 06 — Subscription Plan & Storage Quota

## Mô tả vấn đề

Mỗi user có một gói đăng ký (`subscriptionPlan`) quyết định:
- **Tổng dung lượng lưu trữ** (`maxStorage`) — bao nhiêu GB được phép dùng
- **Kích thước file tối đa** (`maxFileSize`) — file đơn lẻ không được vượt quá

Mọi upload phải qua 2 lớp kiểm tra này trước khi được phép lưu.

---

## Cấu trúc dữ liệu trong MongoDB

```java
// User.java (model)
String subscriptionPlan;    // "BASIC" | "PRO" | "ENTERPRISE"
Long maxStorage;            // bytes - ví dụ: 5GB = 5L * 1024 * 1024 * 1024
Long maxFileSize;           // bytes - ví dụ: 1GB = 1024L * 1024 * 1024
```

### Giá trị mặc định khi đăng ký

| Plan | maxStorage | maxFileSize |
|------|-----------|------------|
| BASIC | 5 GB | 1 GB |
| PRO | (tùy cấu hình) | (tùy cấu hình) |

```java
// AuthService.java - registerUser()
user.setSubscriptionPlan("BASIC");
user.setMaxStorage(5L * 1024 * 1024 * 1024);  // 5GB
user.setMaxFileSize(1024L * 1024 * 1024);       // 1GB
```

---

## Kiểm tra khi upload chunk (lần đầu)

```java
// FileService.java - storeChunk()
if (totalFileSize != null) {
    User user = userRepository.findById(userId).orElseThrow();

    // ⚙️ Auto-upgrade: User BASIC cũ (giới hạn < 1GB) → nâng lên 1GB tự động
    if ("BASIC".equals(user.getSubscriptionPlan()) && user.getMaxFileSize() < 1024L * 1024 * 1024) {
        user.setMaxFileSize(1024L * 1024 * 1024);
        userRepository.save(user);
    }

    // Kiểm tra kích thước file đơn lẻ
    if (totalFileSize > user.getMaxFileSize()) {
        throw new RuntimeException(
            "Kích thước tệp vượt quá giới hạn " +
            (user.getMaxFileSize() / 1024 / 1024) + "MB của gói " + user.getSubscriptionPlan() + "."
        );
    }
}
```

> Frontend gửi `totalFileSize` ngay từ chunk đầu tiên (chunkIndex=0) để server có thể từ chối sớm, không lãng phí băng thông.

---

## Kiểm tra khi hoàn tất upload (merge)

```java
// FileService.java - completeUpload()
User user = userRepository.findById(userId).orElseThrow();

// Auto-upgrade lần 2 (double-check)
if ("BASIC".equals(user.getSubscriptionPlan()) && user.getMaxFileSize() < 1GB) {
    user.setMaxFileSize(1GB);
    userRepository.save(user);
}

// Kiểm tra file size lần nữa (tránh race condition)
if (fileSize > user.getMaxFileSize()) {
    throw new RuntimeException("Vượt giới hạn kích thước file của gói ...");
}

// Kiểm tra tổng dung lượng đã dùng
Long usedStorage = fileRepository.sumSizeByOwnerId(userId); // Query aggregate MongoDB
if (usedStorage == null) usedStorage = 0L;

if (usedStorage + fileSize > user.getMaxStorage()) {
    throw new RuntimeException("Không đủ dung lượng lưu trữ trống. Vui lòng nâng cấp gói.");
}
```

### `sumSizeByOwnerId()` — Query MongoDB

```java
// FileRepository.java (custom query)
@Query("{ 'ownerId': ?0, 'isDeleted': false }")
// Aggregate: sum tất cả fileSize của owner, chỉ file chưa xóa
Long sumSizeByOwnerId(String ownerId);
```

---

## Nâng cấp Plan

```
POST /subscriptions/upgrade
  → SubscriptionController
  → SubscriptionPlanService (cập nhật plan, maxStorage, maxFileSize)
```

---

## Dashboard: Hiển thị quota đã dùng

```
GET /dashboard/overview
  → DashboardController
  → DashboardService.getOverview()
```

```java
// DashboardService.java - getOverview()
Long usedStorage = fileRepository.sumSizeByOwnerId(userId);
long storageLimit = user.getMaxStorage();

return new DashboardOverviewDTO(
    totalFiles,
    usedStorage,
    storageLimit,
    recentFiles,
    storageByCategory
);
```

---

## Flow kiểm tra đầy đủ

```
Upload Request (chunkIndex=0, totalFileSize=500MB)
    │
    ├─ UploadLimitService.tryRegister() → slot OK
    │
    ├─ FileService.storeChunk()
    │   └─ Kiểm tra maxFileSize: 500MB < 1GB → ✅ OK
    │
    │  ...các chunks tiếp theo...
    │
    └─ FileService.completeUpload()
        ├─ Kiểm tra maxFileSize lần nữa → ✅ OK
        ├─ sumSizeByOwnerId(): usedStorage = 4.6GB
        ├─ 4.6GB + 500MB = 5.1GB > 5GB → ❌ REJECT
        └─ throw "Không đủ dung lượng lưu trữ"
```

---

## Các file liên quan

| File | Vai trò |
|------|---------|
| `User.java` (model) | `subscriptionPlan`, `maxStorage`, `maxFileSize` |
| `FileService.java` | Validation trong `storeChunk()` và `completeUpload()` |
| `FileRepository.java` | `sumSizeByOwnerId()` — tính storage đã dùng |
| `SubscriptionController.java` | Endpoint upgrade plan |
| `SubscriptionPlanService.java` | Logic nâng cấp plan, cập nhật giới hạn |
| `DashboardService.java` | Tổng hợp thống kê quota cho dashboard |
| `DashboardOverviewDTO.java` | Response chứa `storageUsed`, `storageLimit`, `totalFiles` |
| `AuthService.java` | Set giá trị mặc định khi đăng ký / đăng nhập Google |

---

## Edge Cases quan trọng

| Tình huống | Xử lý |
|-----------|-------|
| User BASIC cũ có `maxFileSize` < 1GB | Auto-upgrade lên 1GB cả trong `storeChunk()` và `completeUpload()` |
| Upload đến chunk cuối mới phát hiện hết quota | Tất cả chunks đã upload bị mất (không rollback), user phải nâng cấp rồi upload lại |
| `sumSizeByOwnerId()` trả `null` (user chưa có file) | Xử lý: `if (usedStorage == null) usedStorage = 0L` |
| File trong trash có tính vào quota không? | `sumSizeByOwnerId()` lọc `isDeleted=false` → **file trong trash KHÔNG tính quota** |
| Race condition: 2 upload đồng thời cùng dẫn đến hết quota | `UploadLimitService` giới hạn 3 concurrent, nhưng về mặt lý thuyết vẫn có thể xảy ra |

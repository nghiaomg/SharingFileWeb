# Case 05 — Kiểm soát Concurrent Uploads (Giới hạn Upload Đồng thời)

## Mô tả vấn đề

Vì frontend có thể bị bypass (gọi API trực tiếp), một user xấu có thể tự viết script để spam hàng chục/trăm upload đồng thời, gây quá tải server.

**Giải pháp:** `UploadLimitService` — theo dõi số lượng session upload đang active per user, giới hạn tối đa **3 luồng đồng thời**.

---

## Kiến trúc

```
POST /files/upload/chunk
  → FileService.storeChunk()
      → UploadLimitService.tryRegister(userId, uploadId)   ← GATE
          ├── true  → cho phép, tiếp tục storeChunk
          └── false → ném RuntimeException (HTTP 500)
```

---

## Cơ chế hoạt động

```java
// UploadLimitService.java
@Service
public class UploadLimitService {

    private static final int MAX_CONCURRENT_UPLOADS = 3;

    // userId → Set<uploadId>  (thread-safe: ConcurrentHashMap)
    private final Map<String, Set<String>> activeUploads = new ConcurrentHashMap<>();

    public boolean tryRegister(String userId, String uploadId) {
        Set<String> sessions = activeUploads.computeIfAbsent(
            userId, k -> Collections.newSetFromMap(new ConcurrentHashMap<>())
        );

        // Nếu uploadId đã được đăng ký → đây là chunk tiếp theo của upload đang resume
        if (sessions.contains(uploadId)) return true;

        // Nếu đã đủ 3 slot → từ chối
        if (sessions.size() >= MAX_CONCURRENT_UPLOADS) return false;

        sessions.add(uploadId);
        return true;
    }

    public void release(String userId, String uploadId) {
        Set<String> sessions = activeUploads.get(userId);
        if (sessions != null) {
            sessions.remove(uploadId);
            if (sessions.isEmpty()) activeUploads.remove(userId); // GC
        }
    }

    public int getActiveCount(String userId) {
        Set<String> sessions = activeUploads.get(userId);
        return sessions == null ? 0 : sessions.size();
    }
}
```

---

## Điểm tích hợp trong FileService

### Đăng ký khi bắt đầu chunk

```java
// FileService.java - storeChunk()
if (!uploadLimitService.tryRegister(userId, uploadId)) {
    throw new RuntimeException(
        "Bạn đang có " + uploadLimitService.getActiveCount(userId) +
        " luồng tải lên đồng thời. Vui lòng chờ hoàn tất trước khi bắt đầu thêm."
    );
}
// → Cho phép tiếp tục → lưu chunk
fileStorageService.storeChunk(uploadId, chunkIndex, file);
```

### Giải phóng khi hoàn tất hoặc lỗi

```java
// FileService.java - completeUpload()
try {
    String storedPath = fileStorageService.mergeChunks(uploadId, fileName, totalChunks, userId);
    StorageFile storageFile = new StorageFile(...);
    fileRepository.save(storageFile);
    return mapToResponse(savedFile);
} finally {
    // LUÔN giải phóng, kể cả khi merge lỗi
    uploadLimitService.release(userId, uploadId);
}
```

---

## Sequence Diagram

```
User A                    Server (UploadLimitService)
  |                              |
  |-- Upload 1 (id=aaa) -------->| tryRegister("userA", "aaa") → true, slots: {aaa}
  |-- Upload 2 (id=bbb) -------->| tryRegister("userA", "bbb") → true, slots: {aaa, bbb}
  |-- Upload 3 (id=ccc) -------->| tryRegister("userA", "ccc") → true, slots: {aaa, bbb, ccc}
  |-- Upload 4 (id=ddd) -------->| tryRegister("userA", "ddd") → FALSE (size=3)
  |<-- 500 "Quá nhiều luồng" ---|
  |                              |
  |-- Complete upload aaa ------->| mergeChunks() success
  |                              | release("userA", "aaa") → slots: {bbb, ccc}
  |-- Upload 4 retry (id=ddd) -->| tryRegister("userA", "ddd") → true, slots: {bbb, ccc, ddd}
```

---

## Các file liên quan

| File | Vai trò |
|------|---------|
| `UploadLimitService.java` | State machine quản lý active uploads (in-memory) |
| `FileService.java` | `storeChunk()` — gọi `tryRegister()`; `completeUpload()` — gọi `release()` trong `finally` |
| `FileController.java` | Expose endpoint `/files/upload/chunk` và `/files/upload/complete` |

---

## Limitations & Risks

| Vấn đề | Chi tiết |
|--------|---------|
| **State in-memory** | Khi server restart, tất cả active sessions bị reset. Một upload đang dở sẽ không chiếm slot sau restart. |
| **Không distributed** | Nếu có nhiều instance server (load balancer), mỗi instance có map riêng → không chia sẻ giới hạn |
| **Không persistent** | Nếu `completeUpload()` không được gọi (client crash), slot tồn tại mãi trong RAM cho đến khi restart |
| **Giải pháp nâng cấp** | Chuyển sang Redis Sorted Set hoặc database để track active sessions globally |

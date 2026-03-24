# Case 01 — Chunked Upload (Tải file theo từng phần)

## Mô tả vấn đề

Khi user tải file lớn (tối đa 1GB), không thể gửi toàn bộ trong 1 request HTTP duy nhất vì:
- Giới hạn timeout của server
- Mất kết nối giữa chừng ⇒ phải bắt đầu lại từ đầu
- Bộ nhớ RAM frontend không đủ

**Giải pháp:** Chia file thành nhiều chunk nhỏ, tải từng phần, sau đó merge lại ở server.

---

## Các bước thực hiện

### Bước 1 — Frontend chia file thành chunks

Frontend tự chia `File` object thành các blob nhỏ và gán `uploadId` (UUID duy nhất cho session upload đó).

### Bước 2 — Tải từng chunk lên server

```
POST /files/upload/chunk
  ?uploadId={uuid}
  ?chunkIndex={0,1,2,...}
  ?totalFileSize={bytes}
  Body: multipart/form-data  (chunk binary)
```

**Controller:** `FileController.uploadChunk()`  
**Service:** `FileService.storeChunk()`

```java
// FileService.java - storeChunk()
public void storeChunk(MultipartFile file, int chunkIndex, String uploadId, Long totalFileSize) {
    String userId = getCurrentUserId();

    // 1. Kiểm tra giới hạn concurrent upload
    if (!uploadLimitService.tryRegister(userId, uploadId)) {
        throw new RuntimeException("Quá nhiều luồng upload đồng thời");
    }

    // 2. Kiểm tra kích thước file theo plan
    if (totalFileSize != null) {
        User user = userRepository.findById(userId).orElseThrow();
        // Auto-upgrade BASIC plan cũ lên 1GB
        if ("BASIC".equals(user.getSubscriptionPlan()) && user.getMaxFileSize() < 1GB) {
            user.setMaxFileSize(1GB);
            userRepository.save(user);
        }
        if (totalFileSize > user.getMaxFileSize()) {
            throw new RuntimeException("Vượt giới hạn kích thước");
        }
    }

    // 3. Lưu chunk vào disk
    fileStorageService.storeChunk(uploadId, chunkIndex, file);
}
```

**FileStorageService.java — `storeChunk()`:**
```java
// Chunk được lưu vào: uploads/temp/{uploadId}/{chunkIndex}
String chunkDirPath = TEMP_DIR + File.separator + uploadId;
Path chunkPath = Paths.get(chunkDirPath, String.valueOf(chunkIndex));
file.transferTo(chunkPath.toFile());
```

### Bước 3 — Resume: Kiểm tra chunks đã tải

Nếu upload bị gián đoạn, frontend truy vấn:
```
GET /files/upload/chunks?uploadId={uuid}
```

**Service:** `FileService.getUploadedChunks()` → `FileStorageService.getUploadedChunks()`

```java
// Quét thư mục uploads/temp/{uploadId}/ và trả về danh sách index đã có
Files.list(chunkDir)
     .filter(Files::isRegularFile)
     .forEach(path -> uploadedChunks.add(Integer.parseInt(path.getFileName().toString())));
```

Frontend chỉ tải lại những chunk còn thiếu → **resume upload**.

### Bước 4 — Hoàn tất: Merge chunks thành file hoàn chỉnh

```
POST /files/upload/complete
  Body: { uploadId, fileName, totalChunks, fileType, fileSize, folderId }
```

**Service:** `FileService.completeUpload()`

```java
// FileService.java - completeUpload()
public FileResponse completeUpload(...) {
    // 1. Kiểm tra quota lưu trữ
    Long usedStorage = fileRepository.sumSizeByOwnerId(userId);
    if (usedStorage + fileSize > user.getMaxStorage()) {
        throw new RuntimeException("Hết dung lượng lưu trữ");
    }

    // 2. Kiểm tra trùng tên trong folder
    if (fileRepository.existsByNameAndOwnerIdAndFolderIdAndIsDeletedFalse(...)) {
        throw new RuntimeException("Tên file đã tồn tại");
    }

    // 3. Merge tất cả chunk thành file hoàn chỉnh
    String storedPath = fileStorageService.mergeChunks(uploadId, fileName, totalChunks, userId);

    // 4. Lưu metadata vào MongoDB
    StorageFile storageFile = new StorageFile(fileName, fileType, fileSize, userId, folderId, storedPath);
    fileRepository.save(storageFile);

    // 5. Giải phóng slot upload
    uploadLimitService.release(userId, uploadId);
}
```

**FileStorageService.java — `mergeChunks()`:**
```java
// File đích: uploads/files/{userId}/{timestamp}_{fileName}
String uniqueFileName = System.currentTimeMillis() + "_" + fileName;
Path mergedFilePath = Paths.get(ownerDirPath, uniqueFileName);

// Ghép từng chunk theo thứ tự index 0 → N
for (int i = 0; i < totalChunks; i++) {
    Path chunkPath = Paths.get(chunkDirPath, String.valueOf(i));
    Files.copy(chunkPath, outputStream);
}

// Dọn dẹp thư mục temp sau khi merge xong
deleteDirectoryRecursively(chunkDir);
```

---

## Cấu trúc thư mục trên disk

```
uploads/
├── temp/
│   └── {uploadId}/         ← Chunks tạm thời trong quá trình upload
│       ├── 0
│       ├── 1
│       └── 2
└── files/
    └── {userId}/           ← File hoàn chỉnh sau khi merge
        └── 1700000000000_myfile.mp4
```

---

## Các file liên quan

| File | Vai trò |
|------|---------|
| `FileController.java` | Endpoint HTTP: `/files/upload/chunk`, `/complete`, `/chunks` |
| `FileService.java` | Orchestrate: validate quota, kiểm tra plan, gọi storage |
| `FileStorageService.java` | I/O thực tế: lưu chunk, merge, dọn temp |
| `UploadLimitService.java` | Giới hạn concurrent upload per user |
| `FileRepository.java` | `sumSizeByOwnerId()`, `existsByName...`, `save()` |
| `UserRepository.java` | Đọc `maxFileSize`, `maxStorage`, auto-upgrade plan |

---

## Edge Cases quan trọng

| Tình huống | Xử lý |
|-----------|-------|
| Upload bị ngắt giữa chừng | Frontend gọi `GET /chunks` → chỉ upload chunk còn thiếu |
| Chunk thiếu khi merge | `mergeChunks()` ném `RuntimeException("Missing chunk index: N")` |
| File vượt quota storage | `completeUpload()` kiểm tra `usedStorage + fileSize > maxStorage` |
| File trùng tên | `existsByNameAndOwnerIdAndFolderIdAndIsDeletedFalse()` trả `true` → lỗi |
| Slot upload cũ bị rò rỉ (server crash) | `UploadLimitService` giữ state in-memory → mất sau restart (known limitation) |

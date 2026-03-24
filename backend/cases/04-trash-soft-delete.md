# Case 04 — Soft Delete, Trash & Auto Cleanup

## Mô tả vấn đề

Files không bị xóa ngay khi người dùng nhấn "Xóa". Hệ thống dùng **soft delete** với cơ chế:
1. Đánh dấu `isDeleted=true` → file vào Thùng rác
2. Sau 30 ngày → `@Scheduled` job tự động xóa vĩnh viễn
3. User có thể xóa vĩnh viễn thủ công hoặc khôi phục trước deadline

---

## Bước 1 — Soft Delete (Xóa vào Thùng rác)

### Xóa file

```
DELETE /files/{id}
  → FileController.deleteFile()
  → FileService.deleteFile()
```

```java
// FileService.java - deleteFile()
public void deleteFile(String id) {
    String userId = getCurrentUserId();
    StorageFile file = fileRepository.findByIdAndOwnerIdAndIsDeletedFalse(id, userId)
            .orElseThrow(() -> new RuntimeException("File not found"));

    file.setDeleted(true);         // Đánh dấu đã xóa
    file.setDeletedAt(new Date()); // Ghi timestamp để tính 30 ngày
    fileRepository.save(file);
    // File vật lý vẫn còn trên disk!
}
```

### Xóa folder (bao gồm tất cả nội dung)

```
DELETE /folders/{id}
  → FolderController.deleteFolder()
  → FolderService (soft delete folder + đệ quy nội dung)
```

---

## Bước 2 — Xem Thùng rác

```
GET /trash
  → TrashController.getTrashItems()
  → TrashService.getTrashItems()
```

```java
// TrashService.java - getTrashItems()
public Map<String, Object> getTrashItems() {
    String userId = getCurrentUserId();
    List<Folder> deletedFolders = folderRepository.findByOwnerIdAndIsDeletedTrue(userId);
    List<StorageFile> deletedFiles = fileRepository.findByOwnerIdAndIsDeletedTrue(userId);

    Map<String, Object> response = new HashMap<>();
    response.put("folders", deletedFolders);
    response.put("files", deletedFiles);
    return response;
}
```

---

## Bước 3 — Khôi phục từ Thùng rác

```
POST /trash/restore/{type}/{id}   (type = "file" | "folder")
  → TrashController.restoreItem()
  → TrashService.restoreItem()
```

### Khôi phục File

```java
// TrashService.java - restoreItem() cho file
StorageFile file = fileRepository.findByIdAndOwnerIdAndIsDeletedTrue(id, userId).orElseThrow();

// Kiểm tra folder cha còn trong trash không?
if (file.getFolderId() != null) {
    Optional<Folder> parentOpt = folderRepository.findById(file.getFolderId());
    if (parentOpt.isPresent() && parentOpt.get().isDeleted()) {
        throw new RuntimeException("Không thể khôi phục vì thư mục gốc cũng đang trong thùng rác!");
    }
}

file.setDeleted(false);
file.setDeletedAt(null);
fileRepository.save(file);
```

### Khôi phục Folder (đệ quy)

```java
// TrashService.java - restoreItem() cho folder
folder.setDeleted(false);
folder.setDeletedAt(null);
folderRepository.save(folder);

// Đệ quy khôi phục nội dung bên trong
restoreRecursively(folder.getId(), userId);
```

```java
// TrashService.java - restoreRecursively()  [PRIVATE method]
private void restoreRecursively(String folderId, String userId) {
    // 1. Khôi phục tất cả files trong folder
    fileRepository.findByOwnerIdAndIsDeletedTrue(userId).stream()
        .filter(f -> folderId.equals(f.getFolderId()))
        .forEach(f -> {
            f.setDeleted(false);
            f.setDeletedAt(null);
            fileRepository.save(f);
        });

    // 2. Đệ quy vào sub-folders
    folderRepository.findByOwnerIdAndIsDeletedTrue(userId).stream()
        .filter(f -> folderId.equals(f.getParentId()))
        .forEach(f -> {
            f.setDeleted(false);
            f.setDeletedAt(null);
            folderRepository.save(f);
            restoreRecursively(f.getId(), userId); // Đệ quy
        });
}
```

---

## Bước 4 — Xóa vĩnh viễn thủ công

```
DELETE /trash/{type}/{id}   → TrashService.deletePermanent()
DELETE /trash/empty         → TrashService.emptyTrash()
```

```java
// TrashService.java - deletePermanent() cho file
fileStorageService.deleteFilePhysical(file.getStoredPath()); // Xóa trên disk
fileRepository.deleteById(file.getId());                      // Xóa trong MongoDB
```

```java
// TrashService.java - deletePermanentRecursively() cho folder  [PRIVATE]
private void deletePermanentRecursively(String folderId, String userId) {
    // 1. Xóa tất cả files trong folder
    files.forEach(f -> {
        fileStorageService.deleteFilePhysical(f.getStoredPath());
        fileRepository.deleteById(f.getId());
    });

    // 2. Đệ quy vào sub-folders
    subFolders.forEach(f -> deletePermanentRecursively(f.getId(), userId));

    // 3. Xóa folder khỏi MongoDB (sau khi nội dung đã xóa hết)
    folderRepository.deleteById(folderId);
}
```

---

## Bước 5 — Auto Cleanup hằng ngày (Scheduler)

```java
// TrashCleanupScheduler.java
@Scheduled(cron = "0 0 2 * * ?")  // Chạy lúc 2:00 AM mỗi ngày
public void cleanupOldTrashItems() {
    Instant thirtyDaysAgo = Instant.now().minus(30, ChronoUnit.DAYS);

    // Xóa files quá 30 ngày
    List<StorageFile> filesToDelete = fileRepository.findByIsDeletedTrueAndDeletedAtBefore(thirtyDaysAgoDate);
    for (StorageFile file : filesToDelete) {
        fileStorageService.deleteFilePhysical(file.getStoredPath()); // Disk
        fileRepository.deleteById(file.getId());                      // MongoDB
    }

    // Xóa folders quá 30 ngày
    List<Folder> foldersToDelete = folderRepository.findByIsDeletedTrueAndDeletedAtBefore(thirtyDaysAgo);
    for (Folder folder : foldersToDelete) {
        folderRepository.deleteById(folder.getId());
    }
}
```

> ⚠️ **Lưu ý:** Scheduler chỉ xóa folder record, **không đệ quy xóa nội dung bên trong**. Files bên trong folder đã xóa quá 30 ngày sẽ được xóa riêng ở vòng lặp files.

---

## Các file liên quan

| File | Vai trò |
|------|---------|
| `FileController.java` | `DELETE /files/{id}` |
| `TrashController.java` | `GET /trash`, `POST /trash/restore`, `DELETE /trash` |
| `FileService.java` | `deleteFile()` — soft delete |
| `TrashService.java` | `getTrashItems()`, `restoreItem()`, `deletePermanent()`, `emptyTrash()` |
| `TrashCleanupScheduler.java` | `@Scheduled` — auto cleanup lúc 2AM |
| `FileStorageService.java` | `deleteFilePhysical()` — xóa file khỏi disk |
| `FileRepository.java` | `findByOwnerIdAndIsDeletedTrue()`, `findByIsDeletedTrueAndDeletedAtBefore()` |
| `FolderRepository.java` | `findByOwnerIdAndIsDeletedTrue()`, `findByIsDeletedTrueAndDeletedAtBefore()` |

---

## Edge Cases quan trọng

| Tình huống | Xử lý |
|-----------|-------|
| Khôi phục file khi folder cha vẫn trong trash | Từ chối với thông báo rõ ràng |
| Khôi phục folder → khôi phục toàn bộ nội dung | `restoreRecursively()` đệ quy |
| File vật lý bị mất trên disk khi xóa vĩnh viễn | `deleteFilePhysical()` dùng `Files.deleteIfExists()` — không throw nếu không tìm thấy |
| Scheduler chạy chồng lên nhau | Cron hằng ngày, ít xảy ra; không có lock cơ chế nào |
| emptyTrash có thể xóa trùng (folder + files bên trong) | Tiềm ẩn bug: files được xóa 2 lần nếu vừa có trong `deletedFiles` vừa là con của `deletedFolders` |

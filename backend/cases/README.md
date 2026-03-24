# SharingFileWeb — Cases Documentation

Thư mục này chứa các tài liệu giải thích chi tiết các **case phức tạp** trong backend Spring Boot của dự án. Mỗi file mô tả đầy đủ: luồng xử lý, các file/hàm liên quan, và edge cases cần chú ý.

---

## Danh sách Cases

| # | File | Mô tả |
|---|------|-------|
| 01 | [01-chunked-upload.md](./01-chunked-upload.md) | Tải file theo từng chunk, resume upload, merge chunks |
| 02 | [02-auth-jwt-refresh.md](./02-auth-jwt-refresh.md) | Xác thực JWT, refresh token, Google OAuth, logout |
| 03 | [03-file-sharing.md](./03-file-sharing.md) | Chia sẻ file: Share Link (public URL) vs Direct Access (theo email) |
| 04 | [04-trash-soft-delete.md](./04-trash-soft-delete.md) | Soft delete, thùng rác, khôi phục đệ quy, auto cleanup 30 ngày |
| 05 | [05-concurrent-upload-limit.md](./05-concurrent-upload-limit.md) | Giới hạn 3 upload đồng thời per user, chống API spam |
| 06 | [06-subscription-quota.md](./06-subscription-quota.md) | Kiểm tra quota lưu trữ và kích thước file theo plan |

---

## Sơ đồ các case phụ thuộc nhau

```
Upload File (case 01)
    ├── Concurrent Limit check (case 05)     ← tryRegister()
    ├── Subscription Quota check (case 06)   ← maxFileSize, maxStorage  
    └── Lưu metadata → có thể share (case 03)
                            └── Soft delete → vào trash (case 04)

Đăng nhập (case 02)
    └── Cung cấp JWT → mọi request khác đều cần
```

---

## Kiến trúc phân tầng nhanh

```
HTTP Request
│
├─ [Security] AuthTokenFilter → validate JWT → set SecurityContext
│
├─ [Controller] Nhận request, gọi Service
├─ [Service]    Business logic, validate, orchestrate
├─ [Repository] MongoDB queries
│
└─ [Disk] FileStorageService → uploads/files/{userId}/
```

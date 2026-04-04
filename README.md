# SharingFileWeb

Hệ thống quản lý, chia sẻ và lưu trữ tập tin mạnh mẽ, hỗ trợ **tải lên phân mảnh (resumable)** với dung lượng lên đến 1GB mỗi file. Xây dựng theo mô hình Client-Server với frontend **Next.js (App Router)** và backend **Spring Boot**.

---

## Tổng Quan Kiến Trúc

| Layer | Công nghệ | Vai trò |
|---|---|---|
| **Frontend** | Next.js 14+ (App Router), TypeScript, TailwindCSS, TanStack React Query v5, Zod | Giao diện, trạng thái, tương tác người dùng |
| **Backend** | Spring Boot 3.x, Spring Security (JWT), Spring Data MongoDB | Xác thực, API, nghiệp vụ |
| **Lưu trữ file** | Backblaze B2 (Cloud S3-compatible) | Lưu trữ blob, presigned URL cho download/preview |
| **Cơ sở dữ liệu** | MongoDB | User, Folder, File metadata, Share, Notification, Payment |

---

## API Backend — Tổng quan

Tất cả endpoint trả về wrapper `StandardResponse<T>`:

```json
{
  "success": true,
  "msg": "Thành công",
  "data": { ... }
}
```

`api-client.ts` tự động unwrap trường `data` trước khi trả về cho caller.

### Auth — `/api/auth`

| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/auth/signin` | Đăng nhập username/password |
| `POST` | `/auth/signup` | Đăng ký tài khoản mới |
| `POST` | `/auth/google` | OAuth — Google |
| `POST` | `/auth/github` | OAuth — GitHub |
| `POST` | `/auth/zalo` | OAuth — Zalo |
| `POST` | `/auth/dribbble` | OAuth — Dribbble |
| `POST` | `/auth/refreshtoken` | Refresh JWT access token |
| `POST` | `/auth/logout` | Đăng xuất |
| `GET` | `/auth/me` | Lấy thông tin user hiện tại |

### Files — `/api/files`

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/files` | Danh sách file (theo `folderId`) |
| `GET` | `/files/recent` | File truy cập gần đây |
| `GET` | `/files/shared` | File được chia sẻ với tôi |
| `POST` | `/files/upload/chunk` | Upload 1 chunk |
| `GET` | `/files/upload/status` | Lấy trạng thái chunk đã upload |
| `POST` | `/files/upload/complete` | Hoàn thành upload — merge → B2 |
| `GET` | `/files/{fileId}/download` | Presigned URL download (15 phút) |
| `GET` | `/files/{fileId}/preview` | Presigned URL inline preview (5 phút) |
| `PUT` | `/files/{id}/rename` | Đổi tên file |
| `DELETE` | `/files/{id}` | Xóa mềm (Soft Delete) |

### Folders — `/api/folders`

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/folders` | Danh sách thư mục gốc |
| `GET` | `/folders/{id}` | Chi tiết thư mục (`id="root"` → thư mục gốc ảo) |
| `GET` | `/folders/{id}/children` | Thư mục con + file trong thư mục |
| `POST` | `/folders` | Tạo thư mục |
| `PUT` | `/folders/{id}` | Đổi tên thư mục |
| `DELETE` | `/folders/{id}` | Xóa mềm thư mục |
| `POST` | `/folders/resolve-path` | Resolve breadcrumb path |

### Share — `/api/share`

| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/share/internal` | Chia sẻ qua email (VIEW/DOWNLOAD) |
| `GET` | `/share/with-me` | File được chia sẻ với tôi |
| `GET` | `/share/by-me` | File tôi đã chia sẻ |
| `GET` | `/share/access/file/{fileId}` | Danh sách quyền truy cập file |
| `PUT` | `/share/access/{id}` | Cập nhật quyền |
| `DELETE` | `/share/access/{id}` | Thu hồi quyền truy cập |
| `POST` | `/share/link` | Tạo public share link |
| `GET` | `/share/link/file/{fileId}` | Danh sách link đã tạo |
| `PUT` | `/share/link/{id}` | Cập nhật link |
| `DELETE` | `/share/link/{id}` | Thu hồi link |

### Public Share — `/api/public/share`

Không yêu cầu JWT auth. Truy cập qua **share token**.

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/public/share/{token}` | Lấy metadata file |
| `GET` | `/public/share/{token}/preview` | Presigned URL xem trước |
| `GET` | `/public/share/{token}/download` | Presigned URL tải xuống |
| `GET` | `/public/share/{token}/folder` | Nội dung thư mục chia sẻ |

### Trash — `/api/trash`

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/trash` | Danh sách file/thư mục đã xóa |
| `PUT` | `/trash/restore/{type}/{id}` | Khôi phục |
| `DELETE` | `/trash/permanent/{type}/{id}` | Xóa vĩnh viễn |
| `DELETE` | `/trash/empty` | Xóa sạch thùng rác |

---

## Các Tính Năng Quan Trọng

### 1. Tải Lên Phân Mảnh (Resumable Chunked Upload)

Hỗ trợ file lên đến 1GB, tự động resume khi mất kết nối hoặc F5:

```
Client:  [chunk 0] ─→ POST /files/upload/chunk
         [chunk 1] ─→ POST /files/upload/chunk
         [chunk N] ─→ POST /files/upload/chunk
                        ↓
Server:  merge chunks → upload B2 → lưu metadata
         ← FileResponse
```

- **Chunk size**: 5MB
- **Resume**: Gọi `GET /files/upload/status?uploadId=...` để biết chunks đã upload
- **Dừng/Pause**: Frontend kiểm tra `checkIsPaused()` trước mỗi chunk

### 2. Chia Sẻ File

Hai cơ chế chia sẻ:

| Loại | Endpoint | Người nhận cần |
|---|---|---|
| **Internal (email)** | `POST /share/internal` | Tài khoản trên hệ thống |
| **Public Link** | `POST /share/link` | Bất kỳ ai (có hoặc không có mật khẩu) |

Link public: `GET /public/share/{token}/download` — không cần đăng nhập.

### 3. OAuth Authentication

Hỗ trợ 4 nhà cung cấp: **Google**, **GitHub**, **Zalo**, **Dribbble**. Luồng:

```
Client → OAuth Provider (redirect) → code callback
  → POST /auth/{provider} { code, redirectUri }
  → { accessToken, refreshToken, user }
```

### 4. Kiến Trúc Frontend

```
src/
├── lib/
│   └── api-client.ts          ← Axios instance, StandardResponse unwrap, token refresh
├── features/
│   ├── files/
│   │   ├── api.ts             ← Tất cả API calls cho file/folder/share
│   │   ├── queries.ts         ← useQuery, queryOptions (TanStack v5)
│   │   ├── mutations.ts       ← useMutation hooks
│   │   └── schemas.ts         ← Zod validation schemas
│   └── auth/
└── app/
    ├── dashboard/             ← Protected routes
    └── shared/                ← Public share pages (không cần auth)
```

- **Server Prefetching**: `page.tsx` gọi `prefetchQuery` → `<HydrationBoundary>` → không loading spinner ở first paint
- **Optimistic Updates**: `onMutate` cập nhật UI ngay, rollback nếu server lỗi
- **Cache**: `staleTime` 5 phút, `invalidateQueries` ở `onSettled`

---

## Khởi Chạy Dự Án

### Yêu cầu

- **JDK** 17+
- **Maven** 3.8+
- **MongoDB** (port mặc định `localhost:27017`)
- **Node.js** 18+
- **Backblaze B2** account (S3-compatible credentials trong `.env`)

### 1. Backend

Tạo file `backend/.env`:

```properties
MONGO_URI=mongodb://localhost:27017/sharingfileweb
MONGO_DATABASE=sharingfileweb
JWT_SECRET=SharingFileWebSecretKeyLongEnoughMin256Bits
JWT_EXPIRATION_MS=86400000
JWT_REFRESH_EXPIRATION_MS=604800000

# Backblaze B2
B2_ACCOUNT_ID=your_account_id
B2_APP_KEY=your_app_key
B2_BUCKET_NAME=your_bucket_name
B2_ENDPOINT=s3.us-east-005.backblazeb2.com
B2_REGION=us-east-005

# OAuth (tùy chọn)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
ZALO_APP_ID=your_zalo_app_id
ZALO_APP_SECRET=your_zalo_app_secret
DRIBBBLE_CLIENT_ID=your_dribbble_client_id
DRIBBBLE_CLIENT_SECRET=your_dribbble_client_secret

# Frontend URL (cho OAuth redirect)
FRONTEND_URL=http://localhost:3000
```

Chạy:

```bash
cd backend
mvn clean spring-boot:run
# Server chạy tại http://localhost:8080
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# Ứng dụng tại http://localhost:3000
```

### 3. Auto-start (Windows)

Chạy `start.bat` ở thư mục gốc — tự động mở 2 cửa sổ cmd cho backend và frontend.

---

## Cấu Trúc Response mẫu

### File download/preview

```json
// GET /api/files/{fileId}/download
{
  "success": true,
  "msg": "Download URL",
  "data": {
    "url": "https://f005.backblazeb2.com/...",
    "fileName": "report.pdf",
    "fileType": "application/pdf",
    "fileSize": 1048576,
    "expiresAt": "2026-04-04T12:00:00Z",
    "version": 1
  }
}
```

### Public share metadata

```json
// GET /api/public/share/{token}
{
  "success": true,
  "msg": "Share metadata",
  "data": {
    "fileName": "report.pdf",
    "fileType": "application/pdf",
    "fileSize": 1048576,
    "permission": "DOWNLOAD",
    "expiresAt": "2026-04-10T00:00:00Z",
    "remainingViews": 42,
    "hasPassword": false
  }
}
```

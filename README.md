# SharingFileWeb

Hệ thống quản lý, chia sẻ, và lưu trữ tập tin mạnh mẽ, hỗ trợ Tải Lên Phân Mảnh (Resumable Chunked Upload) với giới hạn dung lượng lên đến 1GB cho mỗi file. Ứng dụng được xây dựng theo mô hình Client-Server với frontend **Next.js (App Router)** và backend **Spring Boot**.

## Tổng Quan Kiến Trúc

- **Frontend**: Next.js 14+ (App Router), React, TypeScript, TailwindCSS, **TanStack React Query v5**, Zod. Áp dụng kiến trúc Server Components, Prefetching và Optimistic Updates dể tối ưu hóa trải nghiệm người dùng và mang lại hiệu suất cao chuẩn Production.
- **Backend**: Spring Boot, Spring Security (JWT), Spring Data MongoDB. Đảm nhiệm chức năng xử lý I/O luồng tĩnh, tiếp nhận tệp tạm thời từ Client, lưu trữ trên đĩa, quản lý siêu dữ liệu (Metadata) qua MongoDB và cuối cùng hợp nhất các mảng rời rạc.
- **Cơ Sở Dữ Liệu**: MongoDB dành cho người dùng, phân quyền, cấu trúc thư mục (Folder Hierarchy) và File Metadata.

## Cách Hoạt Động Của Các Tính Năng Quan Trọng

### 1. Kiến Trúc Frontend (Next.js App Router & React Query)
Hệ thống áp dụng các best practice hiện đại để đảm bảo hiệu năng và dễ bảo trì:
- **Server Prefetching (SSR)**: Các trang danh sách tệp/thư mục sử dụng Server Components (`page.tsx`) để gọi trước dữ liệu trên server (`prefetchQuery`), sau đó cấp cho Client state thông qua `<HydrationBoundary>`. Người dùng sẽ không thấy bất kỳ loading spinner nào ở lần tải trang đầu tiên (First Paint).
- **Quản lý Cache & Trạng Thái**: Sử dụng React Query (`useQuery` và API Client wrapper) làm trung tâm lưu trữ state thay vì Zustand hay Redux. Cache dữ liệu được cấu hình bằng `staleTime` hạn chế số lần phải gọi lại API.
- **Cập nhật Giao Diện Ngay Lập Tức (Optimistic Updates)**: Với các thao tác liên quan tới cập nhật và thay đổi file/thư mục (tạo mới, đổi tên, xoá), giao diện sẽ phản hồi thành công ngay lập tức thông qua hook `onMutate`. Nếu server báo lỗi, state sẽ auto rollback. Bất kể thành công hay thất bại, Queries đều tự động `invalidate` vào pha `onSettled` nhằm đồng bộ lại cấu trúc mới nhất.
- **Clean Architecture theo Feature**: Codebase frontend được nhóm theo Domain (ví dụ: `features/files/`, `features/folders/`). Mỗi feature cung cấp các file logic độc lập nhằm dễ nâng cấp (gồm `api.ts`, `queries.ts`, `mutations.ts`, `schemas.ts` có validate Zod).

### 2. Quản lý Thư Mục & Phân Cấp (Folder Hierarchy)
- **Tạo, Đổi Tên, Xóa Thư Mục**: Lưu trữ trên cấu trúc Database NoSQL với thuộc tính `parentId` cho phép lồng ghép thư mục con bên trong thư mục cha vô hạn cấp. Frontend dùng query keys như `folderKeys.detail(id)` để tận dụng cache từ Server Component khi người dùng thực hiện điều hướng thư mục.
- **Xóa Đệ Quy**: Khi xoá một thư mục, hệ thống sẽ thực hiện xóa đệ quy toàn bộ thư mục con và các tập tin vật lý, Metadata nằm bên trong (để giải phóng Storage). Giao diện (ClientUI) loại bỏ phần cây này tức thì do xử lý mutation logic.

### 3. Tải Lên Phân Mảnh (Resumable Chunked Uploads 1GB)
Hệ thống cho phép Tải tiếp tiến trình (Resume) ngay cả khi mất kết nối mạng hoặc người dùng nhấp F5 vô tình:
- **Cắt Gói Dữ Liệu Client-Side**: Frontend sử dụng JavaScript `File API` (`Blob.slice`), chủ động chia file lớn (VD: 1GB) thành nhiều Chunk nhỏ độc lập (VD: 5MB/chunk) hỗ trợ gửi đa luồng hoặc ngắt quãng.
- **Khôi Phục Theo Định Danh Xác Định (Deterministic ID)**: F5 trình duyệt không làm thay đổi ID đại diện File tải lên nhờ cơ chế lấy Base64 của `[Tên file] + [Kích thước] + [Thời điểm Edit cuối]`.
- **Hành Vi Skip Chunks (Bỏ Qua Các Phần Đã Tải)**: Trước khi gửi một file mới, Browser sẽ hỏi thăm Backend qua API về các Chunk ID đã được lưu hoàn chỉnh trên đĩa, từ đó Frontend chỉ Upload các phần còn thiếu. UI Progress Bar sẽ nhảy vọt ảo đúng theo tỷ lệ % Server phản hồi từ trước (VD: Tự động lên 50% xong chạy tiếp).
- **Hợp Nhất Tệp Phía Server**: Sau khi các chuỗi byte cuối cùng cập bến hệ thống, Spring Boot nhận tín hiệu và Merges lại thành 1 file duy nhất. 

### 4. Hệ Thống Chia Sẻ Tập Tin (Public Links)
Chia sẻ nhanh tệp/thư mục với bất kỳ ai thông qua đường link công khai an toàn được hệ thống cung cấp trực tiếp.
- **Backend Model Flagging**: Cờ thuộc tính Document `isPublic` thiết lập phân quyền mở trên Mongo. Backend cho phép luồng Download File hoặc gọi Database Metadata mà không yêu cầu JWT Auth cho các User chưa đăng nhập.
- **Trang Access Tách Biệt Server-Side**: Render giao diện cô lập hoàn toàn trên Next.js `[id]/page.tsx`, tối ưu tính năng SSR để chia sẻ cho Bot hoặc Crawler khi gán Meta Tags về Link tệp (Tiêu đề, Thumbnail riêng biệt).
- **Frontend Clipboard API**: Tính năng tạo Context Menu và lưu URL vào khay nhớ đệm (`/shared/file/:id`) thông qua Browser Clipboard.

## Khởi Chạy Dự Án

Bạn có thể chạy tự động cả 2 server (Backend & Frontend) bằng cách chạy lệnh hoặc mở tệp tin `start.bat` tại thư mục gốc. Hệ thống tính toán sẽ tự cấp phát 2 cửa sổ cmd độc lập.

### Backend (Spring Boot)
Yêu cầu: JDK 17+, Maven, MongoDB (Port mặc định `localhost:27017`)

1. Tạo file `.env` tại thư mục `backend/` với nội dung cơ bản sau:
   ```properties
   MONGO_URI=mongodb://localhost:27017/sharingfileweb
   MONGO_DATABASE=sharingfileweb
   JWT_SECRET=SharingFileWebSecretKeyLongEnoughMin256Bits
   JWT_EXPIRATION_MS=86400000
   JWT_REFRESH_EXPIRATION_MS=604800000
   ```
2. Chạy Server:
```bash
cd backend
mvn clean spring-boot:run
```

### Frontend (Next.js App Router)
Yêu cầu: Node.js 18+
```bash
cd frontend
npm install
npm run dev
```

Vào `http://localhost:3000` để bắt đầu trải nghiệm hệ thống!
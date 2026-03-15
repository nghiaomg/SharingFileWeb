# SharingFileWeb

Hệ thống quản lý, chia sẻ, và lưu trữ tập tin mạnh mẽ, hỗ trợ Tải Lên Phân Mảnh (Resumable Chunked Upload) với giới hạn dung lượng lên đến 1GB cho mỗi file. Ứng dụng được xây dựng theo mô hình Client-Server với frontend **Next.js** và backend **Spring Boot**.

## Tổng Quan Kiến Trúc

- **Frontend**: Next.js, React, TypeScript, TailwindCSS, Axios. Xử lý chia nhỏ file (file slicing) trên trình duyệt, gọi tuần tự và tracking tiến trình thời gian thực.
- **Backend**: Spring Boot, Spring Security (JWT), Spring Data MongoDB. Đảm nhiệm chức năng xử lý I/O luồng tĩnh, tiếp nhận tệp tạm thời từ Client, lưu trữ trên đĩa, quản lý siêu dữ liệu (Metadata) qua MongoDB và cuối cùng hợp nhất các mảng rời rạc.
- **Cơ Sở Dữ Liệu**: MongoDB dành cho người dùng, phân quyền, cấu trúc thư mục (Folder Hierarchy) và File Metadata.

## Tính Năng Nổi Bật

### 1. Quản lý Thư Mục & Phân Cấp (Folder Hierarchy)
- **Tạo, Đổi Tên, Xóa Thư Mục**: Lưu trữ trên cấu trúc Database NoSQL với thuộc tính `parentId` cho phép lồng ghép thư mục con bên trong thư mục cha (Child/Parent hierarchy) vô hạn cấp.
- **Xóa Đệ Quy**: Khi Xóa một thư mục, hệ thống sẽ thực hiện xóa đệ quy toàn bộ thư mục con và các tập tin vật lý + Metadata nằm bên trong nó để giải phóng Storage.

### 2. Tải Lên Phân Mảnh (Chunked Uploads 1GB)
- **Cắt Gói Dữ Liệu Client-Side**: Khi upload 1 file lớn với Javascript `File API` (`Blob.slice`), Frontend chủ động chia file thành nhiều Chunk nhỏ (ví dụ 5MB/chunk).
- **Hợp Nhất Tệp Phía Server**: Sau khi các chuỗi byte cuối cùng cập bến hệ thống, Spring Boot sẽ xác nhận và Merge lại thành 1 file duy nhất trên Storage. Nhằm đảm bảo an toàn, server sẽ giới hạn dung lượng cứng <1GB sau khi hợp nhất.
- **Tiến Trình Thời Gian Thực (Progress Tracking)**: Hook nối `Axios onUploadProgress` hiển thị chính xác tiến độ upload. Giảm tải bớt gánh nặng Timeout/Overload Request với Server.

### 3. Khôi Phục Tải Lên Thông Minh (Resumable Uploads)
Hệ thống cho phép Tải tiếp tiến trình (Resume) ngay cả khi mất kết nối mạng hoặc người dùng nhấp phím F5 vô tình:
- **Tạo Định Danh File Độc Nhất (Deterministic ID)**: Sinh mã Base64 dựa trên `[Tên file] + [Kích thước] + [Thời điểm Edit cuối]` để phân biệt duy nhất từng tập tin được gửi. Trình duyệt F5 không làm thay đổi ID này.
- **Hành Vi Skip Chunks (Bỏ Qua Các Phần Đã Tải)**: Trước khi gửi `Chunk 0`, FrontEnd mở port `GET /api/files/upload/status` hỏi thăm Backend các Chunk id đã thành công và xác nhận (đã lưu vật lý ổ đĩa).
- **Phục Hồi Điểm Nghẽn Tiến Trình Giả**: Nếu Frontend phát hiện backend đã giữ 1 nửa file, UI Progress Bar tự động gán nhảy vọt đúng với 50% hoàn thành chứ không cần gửi hay hiển thị tải lại từ số 0. Tiết kiệm lượng lớn băng thông HTTP.

### 4. Hệ Thống Chia Sẻ Tập Tin (Public Links)
Chia sẻ nhanh tệp với bất kỳ ai thông qua đường link công khai an toàn được hệ thống cung cấp trực tiếp.
- **Backend Model Flagging**: Spring Data cấu trúc cờ `isPublic` (Boolean) dành cho tài liệu trong Mongo. Cung cấp API thay đổi trạng thái, tải file Stream, và gửi Public File Metadata mà không yêu cầu JWT Auth (Bearer).
- **Frontend Clipboard API**: Tính năng tạo Context Menu và lưu URL vào khay nhớ đệm (`/shared/file/:id`) thông qua Browser Clipboard.
- **Trang Tải Trực Tuyến Giao Diện Tách Biệt**: Render giao diện Next.js `[id]/page.tsx` cho phép người dùng có Link tự do xem Thumbnail cấu trúc và Tải file từ Server Node. 

## Khởi Chạy Dự Án

Bạn có thể chạy tự động cả 2 server (Backend & Frontend) bằng cách chạy tệp tin `start.bat` tại thư mục gốc. Hệ thống sẽ tự cấp phát 2 cửa sổ cmd độc lập.

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

### Frontend (Next.js)
Yêu cầu: Node.js 18+
```bash
cd frontend
npm install
npm run dev
```

Vào `http://localhost:3000` để bắt đầu trải nghiệm hệ thống!

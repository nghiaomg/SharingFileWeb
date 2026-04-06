# SharingFileWeb

Hệ thống quản lý, chia sẻ và lưu trữ tập tin mạnh mẽ, hỗ trợ **tải lên phân mảnh (resumable)** với dung lượng lên đến 1GB mỗi file. Hệ thống được xây dựng theo mô hình Client-Server với frontend **Next.js (App Router)** và backend **Spring Boot**. 

Đây là một giải pháp giống "Google Drive", cung cấp các gói lưu trữ đa dạng cùng tính năng phân quyền hệ thống chặt chẽ, tối ưu trải nghiệm người dùng và dễ dàng mở rộng.

---

## 🚀 Công Nghệ Sử Dụng (Tech Stack)

### **Frontend**
- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **State Management:** TanStack React Query v5 (Server state), Zustand (Client state)
- **Styling & UI:** TailwindCSS v4, Radix UI Themes, Framer Motion
- **Tiện ích:** Axios (API Client), Zod (Validation), React Hook Form, Sonner (Toasts)

### **Backend**
- **Framework & Core:** Spring Boot 3.x/4.x, Java 17
- **Database:** MongoDB (Spring Data MongoDB)
- **Bảo mật:** Spring Security, JWT, OAuth2 (Google API Client)
- **Lưu trữ Blob:** Backblaze B2 (Tương thích S3 API, Presigned URL)
- **Xử lý Tệp:** Apache Tika (Detect Magic Bytes)
- **Email & Rate Limit:** Resend API, Bucket4j

---

## 🌟 Toàn Bộ Tính Năng Trong Dự Án (Tính Năng Chi Tiết)

Hệ thống cung cấp trải nghiệm phân quyền sâu rộng, bao gồm 3 đối tượng sử dụng chính: **Guest (Khách chưa đăng nhập), User (Người dùng đăng ký) và Admin (Quản trị viên).**

### 1. Tính Năng Dành Cho Khách (Guest)
- **Trang chủ (Landing Page):** Giới thiệu sản phẩm, các gói dịch vụ (Plans), tính năng nổi bật.
- **Xem / Tải File Chia Sẻ (Public Share):** Được phép truy cập vào các đường link public mà thành viên đã tạo ra.
  - Tải xuống và xem trước tệp ngay trên web (không cần tài khoản).
  - Có yêu cầu nhập **Mật khẩu** nếu người chia sẻ thiết lập chế độ bảo mật link.
- **Tài liệu & Chính sách:** Xem các trang Hỗ trợ (Docs), Chính sách bảo mật (Privacy), và Điều khoản dịch vụ (Terms).

### 2. Tính Năng Dành Cho Người Dùng Đăng Ký (User)

**A. Xác Thực & Tài Khoản (Authentication & Profile)**
- **Đăng ký / Đăng nhập:** Đăng ký bằng Email & Mật khẩu cơ bản.
- **Đăng nhập Mạng Web3 / OAuth2:** Hỗ trợ đăng nhập nhanh bằng **Google, GitHub, Zalo, Dribbble**.
- **Quản lý Token:** Tự động Refresh Token JWT ngầm trên frontend qua Interceptor, gia hạn phiên mà không cần F5.
- **Tài khoản cá nhân:** Xem User Profile, đổi tên, avatar, theo dõi dung lượng đã sử dụng trên tổng gói.

**B. Quản Lý Tệp & Thư Mục (Files & Folders Management)**
- **Upload Phân mảnh Thông Minh (Resumable Upload):**  
  - Cho phép tải tệp lớn (lên đến 1GB) mà không sợ rớt mạng. Tệp được cắt nhỏ thành các chunk 5MB và nối lại trên server. 
  - Tự động bắt đầu lại điểm dừng nếu Refresh trang, hoặc mạng lỗi (Pause/Resume Upload dễ dàng).
- **Phân cấp Thư mục:** Tự do tạo số lượng thư mục lồng nhau không giới hạn. Resolve Breadcrumbs path chuẩn xác (`My Files > Projects > 2026`).
- **File Preview:** Hỗ trợ Presigned URL cho phép **xem trước an toàn** (Preview Inline) hình ảnh, PDF trong 5 phút. Download URL tạo động trong 15 phút chống lộ file.
- **Đổi tên & Xóa:** Quản lý đổi tên dễ dàng, xóa mềm file/folder.

**C. Chia Sẻ Hiện Đại (Sharing System)**
- **Chia sẻ Nội bộ (Internal Sharing):** Cấp quyền cho một tài khoản trong hệ thống thông qua Email. Các quyền gồm: VIEW (Chỉ xem) hoặc DOWNLOAD (Cho phép tải).
- **Public Link (Tạo Link chia sẻ ra ngoài):**
  - Tự động sinh ID link khó đoán.
  - Hỗ trợ gán Mật Khẩu (Password protection) cho link.
  - Có thể tuỳ chỉnh Quyền trên link.
  - Tra cứu các lượt truy cập / xoá link, theo dõi file đã chia sẻ (`Shared by Me`) và được chia sẻ (`Shared with Me`).

**D. Thùng Rác (Trash / Cycle Bin)**
- **Xóa mềm (Soft Delete):** Mọi file/thư mục xóa từ Dashboard đều đưa vào Trash thay vì xóa vĩnh viễn trực tiếp, phòng ngừa lỡ tay.
- **Khôi phục (Restore):** Phục hồi tệp về đúng thư mục cha ban đầu.
- **Xóa Vĩnh Viễn:** Duyệt file cần xóa hẳn khỏi hệ thống lưu trữ (B2 Storage) để hoàn lại dung lượng. Dọn rác nhanh với `Empty Trash`.

**E. Dịch Vụ Thanh Toán & Gói Cước (Subscriptions & Payments)**
- **Sản phẩm đa dạng:** Cho phép xem thông tin 3 gói chính: `BASIC`, `PRO`, `PREMIUM` kèm tính hạn mức bộ nhớ.
- **Nâng cấp gói (Upgrade Plan):**
  - Thực hiện lệnh Nâng cấp, tự sinh **Mã QR Thanh Toán (Gateway: SePay)** cực tiện lợi. 
  - Khả năng kiểm tra trạng thái thanh toán (Banking Notification/Check status) và tự động cập nhật gói cước khi đơn hàng PENDING thành SUCCESS.
  - Lịch sử Transaction rõ ràng, hủy lệnh đang mua dễ dàng.

**F. Giao Diện Nhắn Gửi & Dashboard**
- **Dashboard Tổng Quan:** Hiển thị lưu lượng Data, theo dõi file truy cập gần nhất (Gần đây/Recent files).
- **Thông báo (Notifications):** Nhận thông báo trong hệ thống về tình trạng thanh toán, chia sẻ,...

### 3. Tính Năng Dành Cho Quản Trị Viên (Admin)
Mọi tính năng của User, được mở rộng thêm:
- **Admin Dashboard:** Trung tâm điều khiển toàn bộ web.
- **Quản Lý Gói Cước (Plan Management):**
  - Cấu hình Gói (Tạo gói mới `Custom`, nâng/hạ dung lượng tối đa).
  - Khởi tạo mặc định các gói. Sửa đổi thông tin, giá lập tức.
- **Quản lý Đơn Thanh Toán (Order Admin):** Tra cứu toàn bộ các giao dịch thành công / thất bại của tất cả hệ thống.
- **Quản trị User (Phân quyền):** Set `MODERATOR` / `ADMIN` cho các user khác. Cấp đặc quyền xử lý file.

---

## ⚙️ Sơ Đồ Logic Nổi Bật

### 1. Luồng Upload Phân Mảnh Băng Thông Lớn
```text
Client (Trình duyệt)                   Backend (Spring Boot)                  Storage (Backblaze B2)
        |                                       |                                        |
        |--- 1. Kiểm tra Chunk Status --------->| (Status đã tải đến Chunk #)            |
        |<-- 2. Trả về Chunk cần resume --------|                                        |
        |                                       |                                        |
        |--- 3. Bơm Chunk N (POST 5MB) -------->| (Lưu tạm vào /uploads)-------------    |
        |--- 4. Bơm Chunk N+1 ----------------->|                                        |
        |                                       |                                        |
        |--- 5. Done --> Merge Chunks Request ->| Tiến hành gộp file ------------------->| Stream byte / Upload B2
        |                                       |                                        |
        |<-- 6. Trả về StandardResponse --------| Lưu Meta vào MongoDB <-----------------| Trả về fileId & URL B2
```

### 2. Mô hình gọi API an toàn của Frontend
- **Hành vi First Load:** `page.tsx (Server Components)` dùng tệp `prefetchQuery` → nạp dữ liệu ở Server → Gửi giao diện HTML đã hoàn thiện xuống User (Giữ chuẩn SEO, Không rác layout Loading Spinner).
- **Chỉnh sửa / Xoá File Optimistic Updates:** Client tự thay đổi giao diện theo định hướng kết quả giả lập (vd: Gỡ icon File khỏi grid ngay khi ấn xóa), nếu API báo lỗi thì Rollback khôi phục lập tức.

---

## 🛠 Hướng Dẫn Cài Đặt (Run Locally)

### 1. Yêu cầu môi trường
- **JDK 17+** & **Maven 3.8+**
- **MongoDB** (Port `localhost:27017`)
- **Node.js 18+** & pnpm/npm
- **Backblaze B2** account (Nhận `B2_APP_KEY`, `B2_ACCOUNT_ID` thiết lập làm S3).

### 2. Khởi tạo Backend (Spring Boot)
1. Truy cập thư mục `backend/`
2. Tạo tệp `.env` cấu hình Database, JWT, Backblaze B2 & OAuth keys dựa trên `.env.example`.
   ```properties
   MONGO_URI=mongodb://localhost:27017/sharingfileweb
   JWT_SECRET=SharingFileWebSecretKeyLongEnoughMin256Bits
   B2_ENDPOINT=s3.us-east-005.backblazeb2.com
   B2_ACCOUNT_ID=...
   B2_APP_KEY=...
   FRONTEND_URL=http://localhost:3000
   ```
3. Khởi chạy:
   ```bash
   mvn clean spring-boot:run
   ```
   *Mặc định hệ thống Server API chạy tại cổng* `http://localhost:8080`.

### 3. Khởi tạo Frontend (Next.js)
1. Truy cập thư mục `frontend/`
2. Tạo `.env` theo `example.env` cung cấp `NEXT_PUBLIC_API_URL=http://localhost:8080/api`
3. Cài các package & chạy Dev:
   ```bash
   npm install
   npm run dev
   ```
   *Quá trình xem giao diện ở cổng:* `http://localhost:3000`.

### 4. Bật tự động trên Windows
Dự án có cung cấp một file `start.bat` tại thư mục root. Nhấp đúp chuột, nó sẽ chia 2 tác vụ CMD để start đồng thời toàn bộ Stack trong 1 nút bấm.

---

## 🛡️ Response Wrapper Chung 
Hệ thống được thiết kế gói gém JSON thống nhất ở bất cứ API nào (`StandardResponse`), việc bắt Exception/lỗi sẽ chuẩn hóa không bị vỡ giao diện:
```json
{
  "success": true,
  "msg": "Lấy thông tin đơn hàng thành công",
  "data": {
    "planName": "PRO",
    "amountRegex": 50000,
    "status": "PENDING",
    "qrCodeUrl": "https://sepay.vn/qr/..."
  }
}
```
*`api-client.ts` Axios hook đã được setup Interceptor để tự unwrap vỏ `data` chỉ mang kết quả Object vào render giúp Typescript bắt chính xác Model.*

---
*Dự án được xây dựng với mục tiêu trải nghiệm Premium, chuẩn Clean Code và áp dụng sâu sắc các thiết kế React Query, Zustand & Spring Security tân tiến.*
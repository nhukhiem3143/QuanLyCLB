# 🎓 Hệ Thống Quản Lý CLB - TNUT

Hệ thống quản lý câu lạc bộ Trường Đại học Kỹ thuật Công nghiệp - ĐH Thái Nguyên.

## 🛠 Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| Database | MySQL |
| Auth | JWT + bcryptjs |
| Charts | Recharts |

## 📁 Cấu trúc thư mục

```
clb-management/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # Kết nối MySQL
│   │   ├── controllers/
│   │   │   ├── authController.js  # Đăng nhập, đăng ký, profile
│   │   │   ├── clbController.js   # CRUD CLB, thành viên
│   │   │   ├── suKienController.js# CRUD sự kiện, điểm danh
│   │   │   ├── adminController.js # Quản lý admin
│   │   │   ├── taiChinhController.js # Tài chính
│   │   │   ├── thongBaoController.js # Thông báo
│   │   │   └── yeuCauController.js   # Yêu cầu tham gia
│   │   ├── middleware/
│   │   │   └── auth.js            # JWT middleware, phân quyền
│   │   ├── routes/
│   │   │   └── index.js           # Tất cả routes API
│   │   └── server.js              # Entry point
│   ├── uploads/                   # File uploads
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── common/
    │   │       └── Layout.jsx     # Sidebar + Topbar
    │   ├── context/
    │   │   └── AuthContext.jsx    # Auth state management
    │   ├── pages/
    │   │   ├── admin/             # Trang Admin
    │   │   │   ├── Dashboard.jsx
    │   │   │   ├── Users.jsx
    │   │   │   ├── Clubs.jsx
    │   │   │   ├── ClubRequests.jsx
    │   │   │   ├── Events.jsx
    │   │   │   └── Stats.jsx
    │   │   ├── chunhiem/          # Trang Chủ nhiệm
    │   │   │   ├── Dashboard.jsx
    │   │   │   ├── Members.jsx
    │   │   │   ├── Events.jsx
    │   │   │   ├── Finance.jsx
    │   │   │   └── Notifications.jsx
    │   │   └── user/              # Trang Sinh viên / Thành viên
    │   │       ├── ClubList.jsx
    │   │       ├── ClubDetail.jsx
    │   │       ├── EventList.jsx
    │   │       ├── MyEvents.jsx
    │   │       ├── MyScore.jsx
    │   │       ├── MyRequests.jsx
    │   │       ├── Notifications.jsx
    │   │       └── Profile.jsx
    │   ├── utils/
    │   │   └── api.js             # Axios config
    │   ├── App.jsx                # Routes
    │   ├── main.jsx
    │   └── index.css              # Global styles (white/blue theme)
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## 🚀 Cài đặt và chạy

### 1. Chuẩn bị Database

```sql
-- Import file data.sql vào MySQL
mysql -u root -p < data.sql
```

Hoặc dùng phpMyAdmin để import file `data.sql`.

### 2. Cấu hình Backend

```bash
cd backend
cp .env.example .env
# Chỉnh sửa .env với thông tin DB của bạn
npm install
npm run dev
```

Nội dung `.env`:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=quanly_clb
JWT_SECRET=clb_secret_key_2025_very_secure
JWT_EXPIRES_IN=7d
```

### 3. Chạy Frontend

```bash
cd frontend
npm install
npm run dev
```

Mở trình duyệt: **http://localhost:5173**

## 👤 Tài khoản mẫu

| Vai trò | Tên đăng nhập | Mật khẩu gốc (đã hash) |
|---|---|---|
| Admin | `admin1` | `Admin@123` |
| Chủ nhiệm | `chunhiem1` | `Cn@123` |
| Thành viên | `thanhvien1` | `Tv@123` |
| Sinh viên | `sinhvien1` | `Sv@123` |

> **Lưu ý:** Mật khẩu trong DB đã được hash bằng bcrypt ($2y format từ PHP).  
> Bạn cần reset mật khẩu hoặc tạo tài khoản mới qua trang đăng ký.

### Tạo tài khoản admin mới (nếu cần):

```bash
# Chạy script tạo admin
node -e "
const bcrypt = require('bcryptjs');
bcrypt.hash('Admin@123', 10).then(h => console.log(h));
"
# Copy hash và INSERT vào DB
```

## 🔐 Phân quyền

| Vai trò | Quyền |
|---|---|
| **Admin** | Toàn quyền: CRUD CLB, duyệt yêu cầu, quản lý tài khoản, thống kê |
| **Chủ nhiệm** | Quản lý CLB mình, thành viên, sự kiện, tài chính, thông báo |
| **Thành viên** | Xem CLB, đăng ký sự kiện, xem điểm tích lũy |
| **Sinh viên** | Xem CLB, gửi yêu cầu tham gia, theo dõi sự kiện công khai |

## 📋 API Endpoints chính

```
POST /api/auth/login          # Đăng nhập
POST /api/auth/register       # Đăng ký

GET  /api/clubs               # Danh sách CLB
POST /api/clubs               # Tạo CLB (admin)
GET  /api/clubs/:id/members   # Thành viên CLB

GET  /api/events              # Danh sách sự kiện
POST /api/events              # Tạo sự kiện (admin/cn)
POST /api/events/register     # Đăng ký sự kiện
POST /api/events/attendance   # Điểm danh

GET  /api/finance/:clb_id     # Tài chính CLB
POST /api/finance             # Thêm giao dịch

GET  /api/notifications       # Thông báo của tôi
POST /api/notifications       # Gửi thông báo (cn/admin)

POST /api/join-requests       # Gửi yêu cầu tham gia CLB
GET  /api/admin/stats         # Thống kê (admin)
```

## ✨ Tính năng

### Admin
- ✅ Dashboard với thống kê tổng quan
- ✅ Quản lý tài khoản (thêm, khóa/mở khóa, phân quyền)
- ✅ Quản lý CLB (thêm, sửa, xóa, kích hoạt/tạm ngừng)
- ✅ Duyệt yêu cầu lập CLB mới
- ✅ Duyệt/từ chối sự kiện từ CLB
- ✅ Thống kê biểu đồ (Recharts)

### Chủ nhiệm CLB
- ✅ Dashboard CLB tổng quan
- ✅ Quản lý thành viên (duyệt/từ chối yêu cầu, xóa thành viên)
- ✅ Quản lý sự kiện (tạo, điểm danh thành viên)
- ✅ Quản lý tài chính (thu/chi, tổng hợp)
- ✅ Gửi thông báo đến tất cả thành viên

### Thành viên / Sinh viên
- ✅ Xem danh sách CLB, lọc theo lĩnh vực
- ✅ Xem chi tiết CLB (thông tin, thành viên, sự kiện)
- ✅ Gửi yêu cầu tham gia CLB
- ✅ Gửi yêu cầu lập CLB mới
- ✅ Đăng ký / hủy đăng ký sự kiện
- ✅ Theo dõi sự kiện công khai
- ✅ Xem lịch sử tham gia, điểm tích lũy
- ✅ Nhận và đọc thông báo
- ✅ Cập nhật hồ sơ, đổi mật khẩu

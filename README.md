# 📚 BookeeShop — E-commerce Book Store Website

> **BookeeShop** là một ứng dụng web thương mại điện tử bán sách trực tuyến, bao gồm hai phân hệ chính: giao diện mua sắm dành cho khách hàng và hệ thống quản trị dành cho admin/nhân viên.

🌐 **Live Demo:** [https://bookeeshop.vercel.app/](https://bookeeshop.vercel.app/)

---

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng](#-tính-năng)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Cơ sở dữ liệu](#-cơ-sở-dữ-liệu)
- [Cài đặt & Chạy dự án](#-cài-đặt--chạy-dự-án)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Tài liệu API](#-tài-liệu-api)
- [Hướng dẫn sử dụng](#-hướng-dẫn-sử-dụng)
- [Screenshots](#-screenshots)
- [Deploy](#-deploy)

---

## 🎯 Giới thiệu

**BookeeShop** là một hệ thống thương mại điện tử bán sách trực tuyến. Hệ thống được chia thành hai phân hệ rõ ràng:

- **Phân hệ khách hàng (Client):** Cho phép người dùng tìm kiếm, xem chi tiết, đánh giá và mua sách trực tuyến, theo dõi trạng thái đơn hàng và nhận thông báo.
- **Phân hệ quản trị (Admin/Staff):** Cung cấp các công cụ để quản lý toàn bộ hệ thống bao gồm sách, danh mục, đơn hàng, khách hàng, nhân viên, thông báo và phân quyền.

---

## ✨ Tính năng

### 👤 Phía Khách hàng (Client)

**Tài khoản**
- Đăng ký, đăng nhập, đăng xuất
- Quên mật khẩu (gửi email xác nhận)
- Chỉnh sửa thông tin cá nhân, đổi mật khẩu

**Duyệt & Tìm kiếm sách**
- Tìm kiếm sách theo tên, tác giả, danh mục
- Lọc sách theo số sao đánh giá
- Sắp xếp theo giá, bảng chữ cái, bán chạy nhất, đánh giá cao nhất
- Xem bình luận và đánh giá sao của từng đầu sách

**Mua hàng**
- Thêm sách vào giỏ hàng, quản lý giỏ hàng
- Đặt hàng và thanh toán qua **COD** hoặc **VNPay**
- Theo dõi trạng thái đơn hàng theo thời gian thực

**Tương tác**
- Đánh giá sao và bình luận sách sau khi mua
- Nhận thông báo cập nhật đơn hàng, khuyến mãi và thông báo hệ thống

---

### 🛠️ Phía Admin / Nhân viên

**Tài khoản**
- Đăng nhập, đăng xuất
- Chỉnh sửa thông tin cá nhân, đổi mật khẩu

**Quản lý sách**
- CRUD đầy đủ: thêm, sửa, xóa, xem danh sách sách
- Tìm kiếm theo tên, tác giả; sắp xếp theo số lượng bán, giá, chữ cái, đánh giá cao
- Lọc theo số sao
- Xem, xóa và trả lời bình luận của khách hàng

**Quản lý danh mục**
- CRUD danh mục sách
- Hỗ trợ phân cấp cha – con

**Quản lý khách hàng**
- Xem danh sách, tìm kiếm khách hàng theo tên hoặc số điện thoại

**Quản lý đơn hàng**
- Xem, cập nhật trạng thái, chỉnh sửa và xóa đơn hàng
- Tìm kiếm theo mã đơn hàng
- Lọc theo khoảng thời gian (ngày bắt đầu – ngày kết thúc)

**Quản lý thông báo**
- CRUD thông báo
- Hỗ trợ lên lịch gửi và lưu bản nháp

**Quản lý nhân viên**
- CRUD thông tin nhân viên

**Phân quyền**
- Quản lý nhóm quyền (CRUD)
- Phân quyền chi tiết: mỗi nhóm được cấp quyền thực hiện các chức năng cụ thể

---

## 🛠 Công nghệ sử dụng

### Backend
| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| Java | 21 | Ngôn ngữ lập trình chính |
| Spring Boot | 3.5.10 | Framework backend |
| Spring Security + OAuth2 Resource Server | — | Xác thực & phân quyền |
| Spring Data JPA / Hibernate | — | ORM, thao tác database |
| Spring Boot Validation | — | Validate dữ liệu đầu vào |
| Spring Boot Mail | — | Gửi email (quên mật khẩu) |
| Nimbus JOSE + JWT | 10.6 | Tạo và xác thực JWT |
| MapStruct | 1.5.5 | Mapping DTO ↔ Entity |
| Lombok | — | Giảm boilerplate code |
| Cloudinary | 1.39.0 | Lưu trữ và quản lý hình ảnh |
| VNPay | — | Tích hợp thanh toán trực tuyến |
| SpringDoc OpenAPI (Swagger UI) | 2.8.6 | Tài liệu API tự động |
| PostgreSQL Driver | — | Kết nối database |

### Frontend
| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| React | 19.2.4 | Thư viện UI chính |
| React Router DOM | 7.13.1 | Điều hướng trang |
| Axios | 1.13.6 | Gọi HTTP API |
| Recharts | 3.8.0 | Biểu đồ thống kê (dashboard admin) |
| React Quill JS | 2.0.5 | Trình soạn thảo văn bản rich text |
| React Icons | 5.6.0 | Bộ icon phong phú |

### Database & Infrastructure
| Công nghệ | Mô tả |
|-----------|-------|
| PostgreSQL | Hệ quản trị cơ sở dữ liệu quan hệ |
| Supabase | Hosting database |
| Render | Deploy backend |
| Vercel | Deploy frontend |
| Cloudinary | CDN lưu trữ ảnh |

---

## 🏗 Kiến trúc hệ thống

Dự án áp dụng mô hình **Client – Server** với kiến trúc **Layered Architecture** phía backend:

```
┌─────────────────────────────────────────────┐
│              Frontend (ReactJS)             │
│          Vercel — bookeeshop.vercel.app     │
└──────────────────┬──────────────────────────┘
                   │ HTTP/REST API (JSON)
┌──────────────────▼──────────────────────────┐
│            Backend (Spring Boot)            │
│               Render                        │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │Controller│→ │ Service  │→ │Repository │  │
│  └──────────┘  └──────────┘  └─────┬─────┘  │
└────────────────────────────────────┼────────┘
                                     │ JPA
┌────────────────────────────────────▼────────┐
│           Database (PostgreSQL)             │
│                 Supabase                    │
└─────────────────────────────────────────────┘
         │                     │
    ┌────▼─────┐          ┌────▼────┐
    │Cloudinary│          │ VNPay   │
    │  (ảnh)   │          │(thanh   │
    └──────────┘          │ toán)   │
                          └─────────┘
```

---

## 🗄 Cơ sở dữ liệu

### Sơ đồ ERD

> 📎 _Sơ đồ ERD đầy đủ (vẽ bằng Visual Paradigm):_

<!-- TODO: Thêm ảnh ERD vào đây -->
```
[ERD_IMAGE_PLACEHOLDER]
```

### Các bảng chính

| Bảng | Mô tả |
|------|-------|
| `users` | Thông tin tài khoản (khách hàng + nhân viên/admin) |
| `roles` / `permissions` | Nhóm quyền và các quyền hạn cụ thể |
| `books` | Thông tin sách |
| `categories` | Danh mục sách (phân cấp cha – con) |
| `orders` | Đơn hàng |
| `order_items` | Chi tiết từng sản phẩm trong đơn hàng |
| `reviews` | Đánh giá sao và bình luận của khách hàng |
| `notifications` | Thông báo hệ thống và khuyến mãi |
| `carts` / `cart_items` | Giỏ hàng |
| `payments` | Thông tin giao dịch thanh toán |

---

## 🚀 Cài đặt & Chạy dự án

> ⚠️ **Lưu ý:** Dự án đã được deploy online. Phần hướng dẫn dưới đây dành cho developer muốn chạy dự án ở môi trường local.

### Yêu cầu môi trường

- Java 21+
- Node.js 18+
- PostgreSQL 14+
- Maven 3.8+

### 1. Clone dự án
```bash
git clone <repo-url>
```

### 2. Cấu hình Backend
```bash
cd bookeeshop
mvn clean install
mvn spring-boot:run
```
Backend sẽ chạy tại: `http://localhost:8080`

### 3. Cấu hình Frontend
Tạo file `.env` trong thư mục `frontend`:

```env
REACT_APP_API_URL=http://localhost:8080/bookeeshop
REACT_APP_API_PREFIX_ADMIN=admin
REACT_APP_ADMIN_ROUTE=admin
```

Chạy frontend:

```bash
cd frontend
npm install
npm start
```

Frontend sẽ chạy tại: `http://localhost:3000`

> ✅ **Thứ tự khởi động:** Chạy **backend trước**, sau đó mới chạy **frontend**.

---

## 📁 Cấu trúc thư mục

### Backend

```
backend/
├── src/
│   └── main/
│       ├── java/com/huyen/bookeeshop/
│       │   ├── configuration/   # Cấu hình Spring Security, CORS, JWT...
|       |   ├── constant/        # Các hằng số toàn cục
│       │   ├── controller/      # REST API Controllers
│       │   ├── dto/             # Data Transfer Objects
│       │   ├── entity/          # JPA Entities (ánh xạ bảng DB)
│       │   ├── enums/           # Các enum dùng trong project
│       │   ├── exception/       # Xử lý ngoại lệ toàn cục
|       |   ├── mapper/          # MapStruct Mappers
|       |   ├── repository/      # JPA Repositories
|       |   ├── scheduler/       # Các task scheduler định kỳ
|       |   ├── service/         # Business logic
|       |   ├── specification/   # JPA Specifications
│       │   ├── util/            # Các hàm tiện ích chung
│       │   └── validator/       # Custom validators
│       └── resources/
│           ├── application.yml
│           └── application-prod.yml
└── pom.xml
```

### Frontend

```
frontend/
├── public/
├── src/
│   ├── components/      # Các component dùng chung
|   ├── constants/       # Chứa các hằng số toàn cục
│   ├── context/         # React Context (Auth, Cart...)
│   ├── pages/           # Các trang (Client & Admin)
│   ├── routes/          # Cấu hình route
│   ├── services/        # Gọi API (Axios)
|   ├── styles/          # File CSS
│   ├── utils/           # Hàm tiện ích
│   └── App.js           # Entry point React app
├── .env
└── package.json
```

---

## 📖 Tài liệu API

Dự án sử dụng **SpringDoc OpenAPI (Swagger UI)** để tự động sinh tài liệu API.

Sau khi chạy backend, truy cập Swagger UI tại:

```
http://localhost:8080/swagger-ui/index.html
```

---

## 🧭 Hướng dẫn sử dụng

### Tài khoản demo

| Vai trò | Thông tin đăng nhập |
|---------|---------------------|
| **Admin** | Username: `admin` / Password: `admin` |
| **Khách hàng** | Tự đăng ký tài khoản mới tại trang chủ |

### Truy cập hệ thống

| Phân hệ | Đường dẫn |
|---------|-----------|
| Giao diện khách hàng | [https://bookeeshop.vercel.app/](https://bookeeshop.vercel.app/) |
| Giao diện quản trị | [https://bookeeshop.vercel.app/admin](https://bookeeshop.vercel.app/admin) |

### Luồng sử dụng chính

**Khách hàng:**
1. Truy cập trang chủ → Tìm kiếm sách
2. Đăng ký / Đăng nhập tài khoản
3. Thêm sách vào giỏ hàng → Tiến hành đặt hàng
4. Chọn phương thức thanh toán: **COD** hoặc **VNPay**
5. Theo dõi trạng thái đơn hàng trong trang cá nhân
6. Đánh giá sách sau khi nhận hàng

**Admin/Nhân viên:**
1. Đăng nhập vào hệ thống quản trị
2. Quản lý sách, danh mục, đơn hàng, thông báo, khách hàng theo phân quyền được cấp
3. Gửi thông báo đến khách hàng (có thể đặt lịch)
4. Xem thống kê doanh thu, sô lượng đơn hàng, khách hàng, sách,...

---

## 🖼 Screenshots

> 📸 _Giao diện ứng dụng:_

<!-- TODO: Thêm ảnh giao diện vào đây -->

| Trang | Ảnh minh họa |
|-------|-------------|
| Trang chủ (Client) | `[SCREENSHOT_HOME]` |
| Trang chi tiết sách | `[SCREENSHOT_BOOK_DETAIL]` |
| Giỏ hàng & Thanh toán | `[SCREENSHOT_CART_CHECKOUT]` |
| Theo dõi đơn hàng | `[SCREENSHOT_ORDER_TRACKING]` |
| Dashboard Admin | `[SCREENSHOT_ADMIN_DASHBOARD]` |
| Quản lý sách (Admin) | `[SCREENSHOT_ADMIN_BOOKS]` |
| Quản lý đơn hàng (Admin) | `[SCREENSHOT_ADMIN_ORDERS]` |
| Phân quyền (Admin) | `[SCREENSHOT_ADMIN_ROLES]` |

---

## ☁️ Deploy

| Thành phần | Platform |
|-----------|----------|
| Frontend | [Vercel](https://vercel.com/) |
| Backend | [Render](https://render.com/) | 
| Database | [Supabase](https://supabase.com/) |
| Image Storage | [Cloudinary](https://cloudinary.com/) |

---


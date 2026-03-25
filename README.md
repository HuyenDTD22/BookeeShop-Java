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

**BookeeShop** là một hệ thống thương mại điện tử bán sách trực tuyến. Hệ thống được chia thành hai giao diện rõ ràng:

- **Giao diện mua sắm dành cho khách hàng (Client):** Cho phép người dùng tìm kiếm, xem chi tiết, đánh giá và mua sách trực tuyến, theo dõi trạng thái đơn hàng và nhận thông báo.
- **Giao diện quản trị dành cho Admin/Nhân viên (Admin/Staff):** Cung cấp các công cụ để quản lý toàn bộ hệ thống bao gồm sách, danh mục, đơn hàng, khách hàng, nhân viên, thông báo, nhóm quyền và phân quyền.

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

![ERD](https://github.com/user-attachments/assets/93acaa0f-9f5f-424d-8639-e8ef71c4c6e2)

### Các bảng chính

| Bảng | Mô tả |
|------|-------|
| `users` | Thông tin tài khoản dùng chung cho khách hàng, nhân viên và admin |
| `roles` | Nhóm quyền (USER, ADMIN, STAFF_MANAGER, STAFF_SUPPORT...) |
| `permissions` | Các quyền hạn cụ thể trong hệ thống (BOOK_CREATE, ORDER_VIEW...) |
| `user_roles` | Liên kết người dùng với nhóm quyền (many-to-many) |
| `role_permissions` | Liên kết nhóm quyền với các quyền hạn (many-to-many) |
| `categories` | Danh mục sách, hỗ trợ phân cấp cha – con |
| `books` | Thông tin sách (giá, tác giả, NXB, tồn kho, ảnh bìa...) |
| `carts` | Giỏ hàng, mỗi khách hàng có một giỏ duy nhất |
| `cart_items` | Chi tiết từng sách trong giỏ hàng |
| `orders` | Đơn hàng, bao gồm thông tin thanh toán (COD / VNPay) và trạng thái |
| `order_items` | Chi tiết từng sách trong đơn hàng (lưu giá tại thời điểm mua) |
| `ratings` | Đánh giá sao của khách hàng cho từng đầu sách |
| `comments` | Bình luận của khách hàng, hỗ trợ trả lời dạng thread (parent – child) |
| `notifications` | Thông báo hệ thống, đơn hàng và khuyến mãi (có lên lịch gửi, bản nháp) |
| `user_notifications` | Theo dõi trạng thái đã đọc / chưa đọc thông báo của từng người dùng |
| `forgot_passwords` | Lưu OTP xác thực cho chức năng quên mật khẩu |
| `invalidated_token` | Danh sách JWT token đã bị thu hồi (đăng xuất) |

---

## 🚀 Cài đặt & Chạy dự án

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

### 1. Giao diện phía khách hàng

**Giao diện đăng ký**

![SCREENSHOT_SIGNUP](https://github.com/user-attachments/assets/17c45242-9f2c-4667-86f8-cd848b26e827)

**Giao diện đăng nhập**

![SCREENSHOT_LOGIN](https://github.com/user-attachments/assets/a00e5d98-e120-4506-8ecd-a3d9d01a9cdc)

**Giao diện quên mật khẩu**

![SCREENSHOT_FORGOTPASSWORD](https://github.com/user-attachments/assets/09a81d3d-80cc-47ec-92cc-05963fb4426a)

**Giao diện tramg chủ**

![SCREENSHOT_HOMEPAGE_1](https://github.com/user-attachments/assets/4ab41fce-44bd-492c-a4e9-27a449c2bafa)
![SCREENSHOT_HOMEPAGE_2](https://github.com/user-attachments/assets/505ded87-5411-4534-b569-b2477b6fa661)
![SCREENSHOT_HOMEPAGE_3](https://github.com/user-attachments/assets/b744bf07-ef99-465e-a099-c5712e7dfd90)

**Giao diện chi tiết sách**

![SCREENSHOT_BOOKDETAIL_1](https://github.com/user-attachments/assets/29efc37a-761f-4a32-aabd-2bf2c6e06127)
![SCREENSHOT_BOOKDETAIL_2](https://github.com/user-attachments/assets/043182d2-6592-42e1-bc6d-2b54335e4cfa)

**Giao diện giỏ hàng**

![SCREENSHOT_CART](https://github.com/user-attachments/assets/74709f41-f708-458b-802b-25295eea4992)

**Giao diện thanh toán**

![SCREENSHOT_CHECKOUT_1](https://github.com/user-attachments/assets/e2ce1ef3-e281-4cf8-9e39-0e9d8b7846cf)
![SCREENSHOT_CHECKOUT_2](https://github.com/user-attachments/assets/03e7a45c-85d1-4581-9f85-c0369c0cf8a1)

**Giao diện theo dõi đơn hàng**

![SCREENSHOT_ORDER](https://github.com/user-attachments/assets/b720d22d-7286-438f-abba-036a7f75aaf1)

**Giao diện thông báo**

![SCREENSHOT_NOTIFICATION](https://github.com/user-attachments/assets/83e4708b-98a0-49a7-81e1-867e444071d5)

### 2. Giao diện phía Admin/Nhân viên

**Giao diện đăng nhập**

![SCREENSHOT_LOGIN_ADMIN](https://github.com/user-attachments/assets/ebf36850-e484-4838-9cb9-3839e1a6dcde)

**Giao diện Dashboard**

![SCREENSHOT_ADMIN_DASHBOARD_1](https://github.com/user-attachments/assets/d48399e8-e580-4254-89fc-1a55dd985313)
![SCREENSHOT_ADMIN_DASHBOARD_2](https://github.com/user-attachments/assets/54d0a177-2c31-49e9-81a4-a07da10e28f9)

**Giao diện quản lý sách**

![SCREENSHOT_BOOK_MANAGER](https://github.com/user-attachments/assets/10309f67-0b08-4c72-9c24-219e839e6cd9)

**Giao diện quản lý danh mục**

![SCREENSHOT_CATEGORY_MANAGER](https://github.com/user-attachments/assets/199d87bc-956b-4586-96a2-633fb63f72d5)

**Giao diện quản lý khách hàng**

![SCREENSHOT_CUSTOMER_MANAGER](https://github.com/user-attachments/assets/f5cfa550-9d8d-4f4d-8107-92cc55123182)

**Giao diện quản lý đơn hàng**

![SCREENSHOT_ORDER_MANAGER](https://github.com/user-attachments/assets/f1228bda-073a-4352-b876-470ec946550b)

**Giao diện quản lý thông báo**

![SCREENSHOT_NOTIFICATION_MANAGER](https://github.com/user-attachments/assets/4bcbc6df-d714-4dcc-ae07-b9127db2555d)

**Giao diện quản lý nhân viên**

![SCREENSHOT_STAFF_MANAGER](https://github.com/user-attachments/assets/3a4db1c3-6b24-4015-83a0-18669a796174)

**Giao diện quản lý nhóm quyền**

![SCREENSHOT_ROLE_MANAGER](https://github.com/user-attachments/assets/1259eb9d-d4f4-4c5f-8dc0-416ee9cff048)

**Giao diện phân quyền**

![SCREENSHOT_PERMISSION_MANAGER](https://github.com/user-attachments/assets/dc07c4e0-7f60-42a4-9ce0-3d7e18fac56b)

---

## ☁️ Deploy

| Thành phần | Platform |
|-----------|----------|
| Frontend | [Vercel](https://vercel.com/) |
| Backend | [Render](https://render.com/) | 
| Database | [Supabase](https://supabase.com/) |
| Image Storage | [Cloudinary](https://cloudinary.com/) |

---


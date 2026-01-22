# Auth Service

Dịch vụ xác thực (Authentication Service) cho hệ thống microservices, cung cấp JWT authentication, OTP verification, quản lý user, và event-driven architecture với RabbitMQ.

## 📋 Tính Năng

### Authentication & Authorization

- ✅ **Đăng ký tài khoản** với OTP verification qua email
- ✅ **Đăng nhập** với email/password
- ✅ **Refresh token** để cấp access token mới
- ✅ **Token verification** cho các services khác
- ✅ **Quản lý multiple sessions** (nhiều refresh tokens)

### Password Management

- ✅ **Quên mật khẩu** và reset mật khẩu qua OTP
- ✅ **Resend OTP** khi hết hạn hoặc không nhận được

### User Management

- ✅ **Lấy thông tin user profile**
- ✅ **Role-based access** (USER/ADMIN)

### Event-Driven Architecture

- ✅ **RabbitMQ integration** cho event publishing
- ✅ **USER_CREATED event** được publish sau khi verify OTP thành công

## 🏗️ Kiến Trúc

```
┌─────────────────────────────────────────────────────────────┐
│                      Auth Service                            │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ Controllers  │───▶│  Services    │───▶│ Repositories │  │
│  │              │    │              │    │              │  │
│  │ - register   │    │ - Business   │    │ - Database   │  │
│  │ - login      │    │   Logic      │    │   Queries    │  │
│  │ - verify     │    │ - Validation │    │              │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                    │                              │
│         │                    ▼                              │
│         │            ┌──────────────┐                       │
│         │            │  EventBus    │                       │
│         │            │  (RabbitMQ)  │                       │
│         │            └──────────────┘                       │
│         │                    │                              │
│         ▼                    ▼                              │
│  ┌──────────────┐    ┌──────────────┐                      │
│  │  Middleware  │    │   Models     │                      │
│  │              │    │              │                      │
│  │ - Auth       │    │ - User       │                      │
│  │ - Error      │    │ - RefreshTkn │                      │
│  └──────────────┘    └──────────────┘                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
         │                                    │
         ▼                                    ▼
   ┌──────────┐                        ┌──────────┐
   │ MongoDB  │                        │ RabbitMQ │
   └──────────┘                        └──────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 7.0+
- RabbitMQ 3.12+

### Local Development

```bash
# Cài đặt dependencies
npm install

# Tạo file .env từ template
cp .env.example .env

# Cấu hình .env (xem phần Environment Variables)
# Chỉnh sửa file .env với thông tin của bạn

# Chạy development (với auto-reload)
npm run dev

# Chạy production
npm start
```

### Docker (Recommended)

```bash
# Chạy với Docker Compose (bao gồm MongoDB và RabbitMQ)
docker compose up --build

# Xem logs
docker logs -f auth-service

# Dừng services
docker compose down

# Dừng và xóa volumes
docker compose down -v
```

## ⚙️ Environment Variables

Tạo file `.env` trong root folder với các biến sau:

```env
# Server Configuration
PORT=3001

# Database
MONGO_URL=mongodb://admin:password@mongodb:27017/auth_db?authSource=admin

# JWT Secrets
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this_in_production

# Email Configuration (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
```

### Giải Thích Biến Môi Trường

| Biến                 | Mô Tả                        | Ví Dụ                               |
| -------------------- | ---------------------------- | ----------------------------------- |
| `PORT`               | Port mà service chạy         | `3001`                              |
| `MONGO_URL`          | MongoDB connection string    | `mongodb://localhost:27017/auth_db` |
| `JWT_SECRET`         | Secret key cho access token  | Chuỗi ngẫu nhiên dài                |
| `JWT_REFRESH_SECRET` | Secret key cho refresh token | Chuỗi ngẫu nhiên dài khác           |
| `EMAIL_USER`         | Gmail address để gửi OTP     | `yourapp@gmail.com`                 |
| `EMAIL_PASS`         | Gmail App Password           | Xem hướng dẫn bên dưới              |
| `RABBITMQ_URL`       | RabbitMQ connection URL      | `amqp://localhost:5672`             |

### 📧 Cấu Hình Gmail App Password

1. Vào [Google Account Settings](https://myaccount.google.com/)
2. Chọn **Security** → **2-Step Verification** (bật nếu chưa có)
3. Tìm **App passwords** → Tạo password mới
4. Chọn **Mail** và **Other (Custom name)**
5. Copy password và paste vào `EMAIL_PASS`

**⚠️ Lưu ý:** `EMAIL_PASS` phải là App Password, không phải password Gmail thường.

### 🔒 Security Notes

> **QUAN TRỌNG:** Trong production:
>
> - Đổi tất cả secrets thành chuỗi ngẫu nhiên mạnh
> - Không commit file `.env` vào Git
> - Sử dụng secret management tools (AWS Secrets Manager, HashiCorp Vault, etc.)
> - Đổi MongoDB và RabbitMQ credentials mặc định

## 📡 API Endpoints

Base URL: `http://localhost:3001/api/v1/auth`

### Public Endpoints

| Method | Endpoint           | Mô Tả                            | Body                            |
| ------ | ------------------ | -------------------------------- | ------------------------------- |
| `POST` | `/register`        | Đăng ký tài khoản mới            | `email`, `password`, `fullName` |
| `POST` | `/verify-otp`      | Xác thực OTP và hoàn tất đăng ký | `email`, `otp`                  |
| `POST` | `/resend-otp`      | Gửi lại OTP                      | `email`                         |
| `POST` | `/login`           | Đăng nhập                        | `email`, `password`             |
| `POST` | `/refresh`         | Refresh access token             | `refreshToken`                  |
| `POST` | `/forgot-password` | Gửi OTP để reset password        | `email`                         |
| `POST` | `/reset-password`  | Reset password với OTP           | `email`, `otp`, `newPassword`   |
| `POST` | `/verify`          | Xác thực token                   | Header: `Authorization`         |

### Protected Endpoints

| Method | Endpoint           | Mô Tả                        | Auth         |
| ------ | ------------------ | ---------------------------- | ------------ |
| `GET`  | `/me`              | Lấy thông tin user hiện tại  | Bearer Token |
| `POST` | `/register-admin`  | Đăng ký tài khoản Admin mới  | Bearer Token |
| `GET`  | `/all-admin`       | Lấy danh sách tài công Admin | Bearer Token |
| `POST` | `/fcm-token`       | Cập nhật FCM token cho user  | Bearer Token |
| `POST` | `/change-password` | Thay đổi mật khẩu            | Bearer Token |

## 📝 API Usage Examples

### 1. Complete Registration Flow

#### Step 1: Register

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe"
}
```

**Response:**

```json
{
  "message": "OTP sent to email. Please verify your account."
}
```

**📧 Email nhận được:**

```
Subject: Your OTP Code

Your OTP code is: 123456

This code will expire in 5 minutes.
```

#### Step 2: Verify OTP

```http
POST /api/v1/auth/verify-otp
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "otp": "123456"
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWE...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MDU..."
}
```

**🔔 Event Published:**

```json
{
  "event": "USER_CREATED",
  "payload": {
    "userId": "65a1b2c3d4e5f6g7h8i9j0k1"
  }
}
```

#### Step 3 (Optional): Resend OTP

```http
POST /api/v1/auth/resend-otp
Content-Type: application/json

{
  "email": "john.doe@example.com"
}
```

**Response:**

```json
{
  "message": "OTP resent to email"
}
```

---

### 2. Login Flow

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 3. Refresh Token

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 4. Get User Profile

```http
GET /api/v1/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**

```json
{
  "id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "email": "john.doe@example.com",
  "fullName": "John Doe",
  "role": "USER"
}
```

---

### 5. Forgot Password Flow

#### Step 1: Request OTP

```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "john.doe@example.com"
}
```

**Response:**

```json
{
  "message": "OTP sent to email"
}
```

#### Step 2: Reset Password

```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePass456!"
}
```

**Response:**

```json
{
  "message": "Password reset successful"
}
```

---

### 6. Change Password (Protected)

```http
POST /api/v1/auth/change-password
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "oldPassword": "SecurePass123!",
  "newPassword": "BrandNewPass789!"
}
```

**Response:**

```json
{
  "message": "Password changed successfully"
}
```

---

### 7. Verify Token (For Other Services)

```http
POST /api/v1/auth/verify
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (Valid Token):**

```json
{
  "valid": true,
  "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "role": "USER"
}
```

**Response (Invalid Token):**

```json
{
  "valid": false
}
```

---

### 8. Register Admin (Protected)

```http
POST /api/v1/auth/register-admin
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "AdminSecurePass123!",
  "fullName": "System Admin"
}
```

**Response:**

```json
{
  "message": "Admin created successfully"
}
```

---

### 9. Get All Admins (Protected)

```http
GET /api/v1/auth/all-admin
Authorization: Bearer <admin_token>
```

**Response:**

```json
[
  {
    "_id": "65a1b2c3...",
    "email": "Z@example.com",
    "fullName": "System ",
    "role": "ADMIN"
  }
]
```

---

### 10. Update FCM Token (Protected)

```http
POST /api/v1/auth/fcm-token
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "fcmToken": "fcm_token_string_here"
}
```

**Response:**

```json
{
  "message": "FCM token updated successfully"
}
```

---

## 👥 User Management Endpoints (Protected)

Tất cả endpoints dưới đây yêu cầu authentication với `Authorization: Bearer <admin_or_user_token>`

### 11. Get All Users (Protected)

```http
GET /api/v1/auth/users?page=1&limit=10&isVerified=true&search=john
Authorization: Bearer <token>
```

**Query Parameters:**

- `page` (optional): Trang, mặc định 1
- `limit` (optional): Số bản ghi/trang, mặc định 10
- `role` (optional): Filter by role (USER, ADMIN)
- `isVerified` (optional): Filter by verification status (true/false)
- `search` (optional): Tìm kiếm theo email hoặc fullName

**Response:**

```json
{
  "data": [
    {
      "_id": "65a1b2c3...",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "USER",
      "isVerified": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

### 15. Delete User (Protected - Admin Only)

```http
DELETE /api/v1/auth/users/:userId
Authorization: Bearer <admin_token>
```

**Response:**

```json
{
  "message": "User deleted successfully"
}
```

---

### 16. Deactivate User (Protected)

```http
PUT /api/v1/auth/users/:userId/deactivate
Authorization: Bearer <token>
```

**Response:**

```json
{
  "_id": "65a1b2c3...",
  "email": "user@example.com",
  "fullName": "John Doe",
  "role": "USER",
  "isVerified": false,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-16T12:00:00Z"
}
```

---

### 17. Reactivate User (Protected)

```http
PUT /api/v1/auth/users/:userId/reactivate
Authorization: Bearer <token>
```

**Response:**

```json
{
  "_id": "65a1b2c3...",
  "email": "user@example.com",
  "fullName": "John Doe",
  "role": "USER",
  "isVerified": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-16T12:00:00Z"
}
```

## 🔐 Token Configuration

### Access Token

- **Thời hạn:** 15 phút
- **Secret:** `JWT_SECRET`
- **Payload:** `{ userId, role }`
- **Stateless:** Không lưu database
- **Usage:** Gửi trong header `Authorization: Bearer <token>`

### Refresh Token

- **Thời hạn:** 7 ngày
- **Secret:** `JWT_REFRESH_SECRET`
- **Lưu trữ:** Database (RefreshToken collection)
- **Multiple sessions:** User có thể có nhiều refresh tokens (đăng nhập nhiều thiết bị)
- **Revocable:** Có thể revoke bằng cách set `isRevoked: true`

### Token Flow

```
┌─────────┐                                    ┌─────────┐
│ Client  │                                    │ Service │
└────┬────┘                                    └────┬────┘
     │                                              │
     │  1. Login (email, password)                  │
     ├─────────────────────────────────────────────▶│
     │                                              │
     │  2. AccessToken + RefreshToken               │
     │◀─────────────────────────────────────────────┤
     │                                              │
     │  3. API Call (Authorization: Bearer AT)      │
     ├─────────────────────────────────────────────▶│
     │                                              │
     │  4. Response                                 │
     │◀─────────────────────────────────────────────┤
     │                                              │
     │  ... 15 minutes later ...                    │
     │                                              │
     │  5. API Call (expired AT)                    │
     ├─────────────────────────────────────────────▶│
     │                                              │
     │  6. 401 Unauthorized                         │
     │◀─────────────────────────────────────────────┤
     │                                              │
     │  7. Refresh (refreshToken)                   │
     ├─────────────────────────────────────────────▶│
     │                                              │
     │  8. New AccessToken                          │
     │◀─────────────────────────────────────────────┤
     │                                              │
```

## 🔄 Event-Driven Architecture

Service này sử dụng **RabbitMQ** để publish events cho các services khác trong hệ thống microservices.

### Event Bus Configuration

```javascript
// EventBus được khởi tạo trong index.js
const EventBus = require("./src/infra/event-bus/event-bus");
const bus = new EventBus(env.rabbitMQ_url);
await bus.connect();
```

### Published Events

#### USER_CREATED

**Khi nào:** Sau khi user verify OTP thành công (hoàn tất đăng ký)

**Payload:**

```json
{
  "userId": "65a1b2c3d4e5f6g7h8i9j0k1"
}
```

**Exchange:** `domain_events` (topic)

**Routing Key:** `USER_CREATED`

**Use Cases:**

- User Service lắng nghe để tạo user profile
- Notification Service gửi welcome email
- Analytics Service track user registration

### Consuming Events (Ví Dụ)

Các services khác có thể subscribe vào events:

```javascript
// Trong service khác
const EventBus = require("./event-bus");
const bus = new EventBus(process.env.RABBITMQ_URL);
await bus.connect();

// Subscribe to USER_CREATED event
await bus.subscribe("USER_CREATED", async (payload) => {
  console.log("New user created:", payload.userId);
  // Xử lý logic (tạo profile, gửi email, etc.)
});
```

## 📊 Database Models

### User Model

```javascript
{
  email: String,              // unique, required
  passwordHash: String,       // required, bcrypt hashed
  fullName: String,           // optional
  role: String,               // enum: ["USER", "ADMIN"], default: "USER"
  isVerified: Boolean,        // default: false
  otpHash: String,            // select: false (không trả về mặc định)
  otpExpiredAt: Date,         // select: false
  refreshTokens: [ObjectId],  // references to RefreshToken
  createdAt: Date,            // auto-generated
  updatedAt: Date             // auto-generated
}
```

**Indexes:**

- `email`: unique index

### RefreshToken Model

```javascript
{
  token: String,              // required, indexed
  user: ObjectId,             // required, ref: "User"
  expiresAt: Date,            // required
  isRevoked: Boolean,         // default: false
  createdAt: Date,            // auto-generated
  updatedAt: Date             // auto-generated
}
```

**Indexes:**

- `token`: index for fast lookup

## 🏗️ Cấu Trúc Dự Án

```
auth-service/
├── index.js                          # Entry point, khởi tạo DB, EventBus, routes
├── package.json                      # Dependencies và scripts
├── Dockerfile                        # Docker image configuration
├── .env.example                      # Template cho environment variables
├── .dockerignore                     # Files bỏ qua khi build Docker
└── src/
    ├── app.js                        # Express app setup
    │
    ├── config/
    │   ├── database.js              # MongoDB connection
    │   └── env.js                   # Environment variables loader
    │
    ├── controllers/
    │   └── auth.controller.js       # Request handlers (register, login, etc.)
    │
    ├── middlewares/
    │   ├── auth.middleware.js       # JWT verification middleware
    │   └── errorHandler.middleware.js # Global error handler
    │
    ├── models/
    │   ├── User.model.js            # User schema
    │   └── RefreshToken.model.js    # RefreshToken schema
    │
    ├── repositories/
    │   └── User.repository.js       # Database queries (findByEmail, create, etc.)
    │
    ├── routes/
    │   └── auth.route.js            # Route definitions
    │
    ├── services/
    │   ├── Auth.service.js          # Business logic (register, login, verify, etc.)
    │   └── Email.service.js         # Email sending với Nodemailer
    │
    ├── utils/
    │   ├── hash.js                  # Password hashing (bcrypt)
    │   ├── jwt.js                   # JWT utilities (sign, verify)
    │   ├── otp.js                   # OTP generation và hashing
    │   ├── appError.js              # Custom error class
    │   └── asyncHandler.js          # Async error wrapper
    │
    └── infra/
        └── event-bus/
            └── event-bus.js         # RabbitMQ EventBus implementation
```

## 🚨 Error Handling

Service sử dụng global error middleware để xử lý tất cả errors.

### Error Response Format

```json
{
  "message": "Error description",
  "status": 400
}
```

### Common Errors

| Status | Message                    | Nguyên Nhân                                 |
| ------ | -------------------------- | ------------------------------------------- |
| `400`  | `Email already exists`     | Email đã được đăng ký                       |
| `400`  | `Invalid or expired OTP`   | OTP sai hoặc hết hạn (>5 phút)              |
| `400`  | `Account already verified` | Tài khoản đã verify, không thể resend OTP   |
| `401`  | `Invalid credentials`      | Email hoặc password sai                     |
| `401`  | `Account not verified`     | Chưa verify OTP sau khi đăng ký             |
| `401`  | `Invalid refresh token`    | Refresh token không tồn tại hoặc đã revoked |
| `401`  | `Refresh token expired`    | Refresh token hết hạn (>7 ngày)             |
| `401`  | `Unauthorized`             | Không có token trong header                 |
| `401`  | `Invalid token`            | Access token không hợp lệ hoặc hết hạn      |
| `404`  | `User not found`           | User không tồn tại trong database           |

### Error Handling Example

```javascript
// Client-side error handling
try {
  const response = await fetch("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error(`Error ${error.status}: ${error.message}`);
    // Handle specific errors
    if (error.status === 401 && error.message === "Account not verified") {
      // Redirect to OTP verification page
    }
  }

  const data = await response.json();
  // Success handling
} catch (err) {
  console.error("Network error:", err);
}
```

## 🔄 Authentication Flow

### Registration Flow

```
1. Client gửi POST /register với email, password, fullName
2. Service kiểm tra email đã tồn tại chưa
3. Hash password với bcrypt
4. Generate OTP 6 chữ số
5. Hash OTP và lưu vào User (isVerified: false)
6. Gửi OTP qua email
7. Return success message

8. Client gửi POST /verify-otp với email, otp
9. Service verify OTP (kiểm tra hash và expiration)
10. Set isVerified: true, clear OTP
11. Generate AccessToken + RefreshToken
12. Lưu RefreshToken vào database
13. Publish USER_CREATED event to RabbitMQ
14. Return tokens
```

### Login Flow

```
1. Client gửi POST /login với email, password
2. Service tìm user theo email
3. Kiểm tra isVerified === true
4. Compare password với passwordHash
5. Generate AccessToken + RefreshToken
6. Lưu RefreshToken vào database
7. Return tokens
```

### Token Refresh Flow

```
1. Client gửi POST /refresh với refreshToken
2. Service tìm RefreshToken trong database
3. Kiểm tra isRevoked === false
4. Kiểm tra expiresAt > now
5. Generate AccessToken mới
6. Return accessToken
```

### Protected Route Flow

```
1. Client gửi request với header: Authorization: Bearer <accessToken>
2. Auth middleware extract token từ header
3. Verify token với JWT_SECRET
4. Attach user info (userId, role) vào req.user
5. Controller xử lý request
```

## 📦 Dependencies

### Production Dependencies

| Package        | Version | Mô Tả                 |
| -------------- | ------- | --------------------- |
| `express`      | ^5.2.1  | Web framework         |
| `mongoose`     | ^9.0.1  | MongoDB ODM           |
| `jsonwebtoken` | ^9.0.3  | JWT handling          |
| `bcrypt`       | ^6.0.0  | Password hashing      |
| `nodemailer`   | ^7.0.12 | Email sending         |
| `dotenv`       | ^17.2.3 | Environment variables |
| `morgan`       | ^1.10.1 | HTTP request logger   |
| `amqplib`      | ^0.10.9 | RabbitMQ client       |

### Development Dependencies

| Package   | Version | Mô Tả                         |
| --------- | ------- | ----------------------------- |
| `nodemon` | ^3.1.11 | Auto-reload trong development |

## 🐳 Docker Setup

### Docker Compose Services

File `docker-compose.yml` (nếu có) bao gồm:

1. **MongoDB 7.0** - Database
   - Port: 27017
   - Username: `admin`
   - Password: `password`
   - Database: `auth_db`

2. **RabbitMQ 3.12** - Message Broker
   - Port: 5672 (AMQP)
   - Management UI: 15672
   - Username: `guest`
   - Password: `guest`

3. **Auth Service** - Node.js application
   - Port: 3001
   - Depends on: MongoDB, RabbitMQ

### Docker Commands

```bash
# Build image
docker build -t auth-service .

# Run container
docker run -p 3001:3001 --env-file .env auth-service

# View logs
docker logs -f auth-service

# Stop container
docker stop auth-service
```

## 🔧 Development

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Server sẽ chạy trên `http://localhost:3001` với auto-reload khi code thay đổi.

### Run Production Server

```bash
npm start
```

### Environment Setup

```bash
# Copy template
cp .env.example .env

# Edit .env với editor
nano .env  # hoặc notepad .env trên Windows
```

## 🧪 Testing với Postman/Thunder Client

### 1. Import Collection

Tạo collection với các endpoints ở trên.

### 2. Environment Variables

Tạo environment với:

```
baseUrl: http://localhost:3001/api/v1/auth
accessToken: (sẽ set sau khi login)
refreshToken: (sẽ set sau khi login)
```

### 3. Test Flow

1. **Register** → Lưu email để dùng cho các bước sau
2. **Check email** → Lấy OTP
3. **Verify OTP** → Lưu accessToken và refreshToken vào environment
4. **Get Profile** → Test với accessToken
5. **Refresh Token** → Test refresh flow
6. **Login** → Test với account đã verify

## 🔒 Security Best Practices

### Implemented

- ✅ Passwords được hash với bcrypt (salt rounds: 10)
- ✅ OTP được hash trước khi lưu database
- ✅ JWT tokens có expiration time
- ✅ Refresh tokens có thể revoke
- ✅ Email verification required để login
- ✅ OTP expires sau 5 phút
- ✅ Sensitive fields (otpHash, otpExpiredAt) có `select: false`

### Recommendations for Production

- 🔐 Sử dụng HTTPS cho tất cả connections
- 🔐 Implement rate limiting (express-rate-limit)
- 🔐 Add CORS configuration
- 🔐 Implement account lockout sau nhiều lần login failed
- 🔐 Add request validation (express-validator)
- 🔐 Implement refresh token rotation
- 🔐 Add security headers (helmet)
- 🔐 Monitor và log suspicious activities
- 🔐 Regular security audits

## 🐛 Troubleshooting

### MongoDB Connection Failed

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Giải pháp:**

- Kiểm tra MongoDB đang chạy: `mongod --version`
- Kiểm tra `MONGO_URL` trong `.env`
- Nếu dùng Docker: đảm bảo service name đúng (`mongodb` thay vì `localhost`)

### RabbitMQ Connection Failed

```
Error: connect ECONNREFUSED 127.0.0.1:5672
```

**Giải pháp:**

- Kiểm tra RabbitMQ đang chạy: `rabbitmq-server`
- Kiểm tra `RABBITMQ_URL` trong `.env`
- Nếu dùng Docker: đảm bảo service name đúng (`rabbitmq` thay vì `localhost`)

### Email Not Sending

```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

**Giải pháp:**

- Đảm bảo dùng **App Password**, không phải password Gmail thường
- Bật 2-Step Verification trong Google Account
- Tạo App Password mới và update `.env`

### JWT_SECRET Not Defined

```
Error: JWT_SECRET is not defined
```

**Giải pháp:**

- Kiểm tra file `.env` có tồn tại không
- Đảm bảo `JWT_SECRET` và `JWT_REFRESH_SECRET` được set
- Restart server sau khi thay đổi `.env`

### OTP Always Invalid

**Giải pháp:**

- Kiểm tra OTP chưa hết hạn (5 phút)
- Đảm bảo gửi đúng email đã đăng ký
- Check email spam folder
- Thử resend OTP

## 📄 License

ISC

## 👥 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

Nếu gặp vấn đề hoặc có câu hỏi, vui lòng:

- Tạo issue trên GitHub repository
- Liên hệ team qua email
  vvq0522@gmail.com

---

**Made with ❤️ for Microservices Architecture**

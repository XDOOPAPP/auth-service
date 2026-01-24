# Hướng dẫn Chi tiết Sử dụng Endpoint Auth Service

## 📋 Mục lục

1. [Giới thiệu](#giới-thiệu)
2. [Xác thực](#xác-thực)
3. [Endpoints Công khai](#endpoints-công-khai)
4. [Endpoints Người dùng](#endpoints-người-dùng)
5. [Endpoints Admin](#endpoints-admin)
6. [Quản lý Mật khẩu](#quản-lý-mật-khẩu)
7. [Các ví dụ thực tế](#các-ví-dụ-thực-tế)
8. [Mã lỗi](#mã-lỗi)
9. [Events](#events)

---

## 🚀 Giới thiệu

Auth Service cung cấp các endpoint để xác thực người dùng, quản lý tài khoản, quản lý token và xác minh OTP. Service này là nền tảng cho toàn bộ hệ thống microservices.

### Base URL

```
http://localhost:PORT/api/v1/auth
```

### Các tính năng chính:

- ✅ Đăng ký người dùng mới với OTP verification
- ✅ Đăng nhập với email/password
- ✅ Refresh token để lấy access token mới
- ✅ Quay lại mật khẩu quên
- ✅ Đổi mật khẩu
- ✅ Quản lý token FCM
- ✅ Quản lý admin users
- ✅ Token verification cho các services khác

---

## 🔐 Xác thực

### Kiểu Token

Service sử dụng **JWT (JSON Web Tokens)** với 2 loại token:

1. **Access Token** (ngắn hạn)
   - Hết hạn: 1 giờ
   - Dùng để xác thực requests
   - Chứa: `userId`, `role`

2. **Refresh Token** (dài hạn)
   - Hết hạn: 7 ngày
   - Dùng để lấy access token mới
   - Được lưu trong database

### Request Headers (khi cần xác thực)

```http
Authorization: Bearer {accessToken}
```

### Token Payload

```json
{
  "userId": "user_id_123",
  "role": "USER",
  "iat": 1705932600,
  "exp": 1705936200
}
```

### Endpoints không cần xác thực:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/verify-otp`
- `POST /api/v1/auth/resend-otp`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `POST /api/v1/auth/verify`
- `GET /api/v1/auth/health`

### Endpoints cần xác thực:

- `GET /api/v1/auth/me`
- `POST /api/v1/auth/fcm-token`
- `POST /api/v1/auth/change-password`
- `POST /api/v1/auth/register-admin` (Admin)
- `GET /api/v1/auth/all-admin` (Admin)

---

## 📋 Endpoints Công khai

### 1. Đăng ký Tài khoản

Tạo tài khoản người dùng mới với OTP verification qua email.

**Endpoint:**

```http
POST /api/v1/auth/register
```

**Yêu cầu xác thực:** ❌ Không

**Headers:**

```http
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "fullName": "John Doe"
}
```

**Body Parameters:**

| Field      | Type   | Required | Description                                |
| ---------- | ------ | -------- | ------------------------------------------ |
| `email`    | string | ✅       | Email đăng ký (phải unique, format hợp lệ) |
| `password` | string | ✅       | Mật khẩu (ít nhất 6 ký tự)                 |
| `fullName` | string | ✅       | Tên đầy đủ của người dùng                  |

**Response - 200 OK:**

```json
{
  "message": "OTP sent to email. Please verify your account."
}
```

**Error Responses:**

```json
// 400 Bad Request - Email đã tồn tại
{
  "message": "Email already exists",
  "statusCode": 400
}

// 400 Bad Request - Email không hợp lệ
{
  "message": "Invalid email format",
  "statusCode": 400
}

// 400 Bad Request - Mật khẩu quá yếu
{
  "message": "Password must be at least 6 characters",
  "statusCode": 400
}

// 400 Bad Request - Thiếu trường bắt buộc
{
  "message": "email, password, fullName are required",
  "statusCode": 400
}
```

**Example cURL:**

```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123!",
    "fullName": "New User"
  }'
```

**Workflow:**

1. Validate input fields
2. Check if email already exists
3. Hash password with bcrypt
4. Generate 6-digit OTP
5. Save user with `isVerified: false`
6. Send OTP to email
7. OTP expires after 5 minutes

**Note:**

- Gửi OTP qua email
- OTP hết hạn sau 5 phút
- User phải verify OTP để kích hoạt account
- Không thể đăng nhập cho đến khi verify

---

### 2. Xác minh OTP

Xác minh OTP để kích hoạt tài khoản sau khi đăng ký.

**Endpoint:**

```http
POST /api/v1/auth/verify-otp
```

**Yêu cầu xác thực:** ❌ Không

**Headers:**

```http
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Body Parameters:**

| Field   | Type   | Required | Description           |
| ------- | ------ | -------- | --------------------- |
| `email` | string | ✅       | Email đã đăng ký      |
| `otp`   | string | ✅       | OTP 6 chữ số từ email |

**Response - 200 OK:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

```json
// 404 Not Found - User không tồn tại
{
  "message": "User not found",
  "statusCode": 404
}

// 400 Bad Request - OTP không hợp lệ
{
  "message": "Invalid OTP",
  "statusCode": 400
}

// 400 Bad Request - OTP đã hết hạn
{
  "message": "OTP expired. Please request a new one",
  "statusCode": 400
}

// 400 Bad Request - Account đã được verify
{
  "message": "Account already verified",
  "statusCode": 400
}
```

**Example cURL:**

```bash
curl -X POST http://localhost:3001/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "otp": "123456"
  }'
```

**Workflow:**

1. Validate email and OTP
2. Check if user exists and not yet verified
3. Verify OTP matches and not expired (< 5 minutes)
4. Set `isVerified: true`
5. Generate access token (expires 1h) and refresh token (expires 7 days)
6. Save refresh token to database
7. Emit `USER_CREATED` event
8. Return tokens

**Note:**

- Sau khi verify thành công, account được kích hoạt
- Trả về cả access token và refresh token
- Phát hành sự kiện `USER_CREATED` cho các services khác
- Token ngay lập tức có thể sử dụng để authenticate

---

### 3. Gửi lại OTP

Gửi lại OTP mới nếu OTP cũ hết hạn hoặc không nhận được.

**Endpoint:**

```http
POST /api/v1/auth/resend-otp
```

**Yêu cầu xác thực:** ❌ Không

**Headers:**

```http
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Body Parameters:**

| Field   | Type   | Required | Description      |
| ------- | ------ | -------- | ---------------- |
| `email` | string | ✅       | Email đã đăng ký |

**Response - 200 OK:**

```json
{
  "message": "OTP resent to email"
}
```

**Error Responses:**

```json
// 404 Not Found
{
  "message": "User not found",
  "statusCode": 404
}

// 400 Bad Request - Account đã verify
{
  "message": "Account already verified",
  "statusCode": 400
}
```

**Example cURL:**

```bash
curl -X POST http://localhost:3001/api/v1/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

**Use Cases:**

- OTP cũ đã hết hạn (> 5 phút)
- Không nhận được email OTP
- Nhập sai OTP quá nhiều lần

**Note:**

- Gửi OTP mới qua email (OTP cũ bị vô hiệu hóa)
- OTP mới hết hạn sau 5 phút
- Có thể gọi nhiều lần không giới hạn
- Rate limiting nên được implement ở Gateway level

---

### 4. Đăng nhập

Đăng nhập vào hệ thống với email và mật khẩu.

**Endpoint:**

```http
POST /api/v1/auth/login
```

**Yêu cầu xác thực:** ❌ Không

**Headers:**

```http
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Body Parameters:**

| Field      | Type   | Required | Description   |
| ---------- | ------ | -------- | ------------- |
| `email`    | string | ✅       | Email đăng ký |
| `password` | string | ✅       | Mật khẩu      |

**Response - 200 OK:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

```json
// 404 Not Found - Email không tồn tại
{
  "message": "User not found",
  "statusCode": 404
}

// 400 Bad Request - Mật khẩu sai
{
  "message": "Invalid password",
  "statusCode": 400
}

// 400 Bad Request - Account chưa verify
{
  "message": "Please verify your account first",
  "statusCode": 400
}

// 400 Bad Request - Thiếu trường bắt buộc
{
  "message": "email and password are required",
  "statusCode": 400
}
```

**Example cURL:**

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

**Workflow:**

1. Validate email and password
2. Check if user exists
3. Check if account is verified
4. Compare password with hashed password (bcrypt)
5. Generate new access token (1h) and refresh token (7 days)
6. Save refresh token to database
7. Return tokens

**Note:**

- Có thể đăng nhập nhiều lần (multiple sessions)
- Mỗi lần đăng nhập tạo refresh token mới
- Refresh token cũ vẫn còn hoạt động cho đến khi hết hạn
- Không có logout endpoint - client tự xóa tokens

---

### 5. Refresh Access Token

Lấy access token mới khi access token hiện tại hết hạn.

**Endpoint:**

```http
POST /api/v1/auth/refresh
```

**Yêu cầu xác thực:** ❌ Không (sử dụng refresh token)

**Headers:**

```http
Content-Type: application/json
```

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Body Parameters:**

| Field          | Type   | Required | Description                       |
| -------------- | ------ | -------- | --------------------------------- |
| `refreshToken` | string | ✅       | Refresh token từ login/verify-otp |

**Response - 200 OK:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

```json
// 400 Bad Request - Token không hợp lệ
{
  "message": "Invalid refresh token",
  "statusCode": 400
}

// 400 Bad Request - Token đã hết hạn
{
  "message": "Refresh token expired",
  "statusCode": 400
}

// 400 Bad Request - Token bị revoke
{
  "message": "Refresh token has been revoked",
  "statusCode": 400
}

// 404 Not Found - Token không tồn tại trong DB
{
  "message": "Refresh token not found",
  "statusCode": 404
}
```

**Example cURL:**

```bash
curl -X POST http://localhost:3001/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Workflow:**

1. Validate refresh token format
2. Verify JWT signature
3. Check if refresh token exists in database
4. Check if refresh token is not expired
5. Generate new access token (1h)
6. Return new access token

**Note:**

- Dùng khi access token hết hạn (sau 1 giờ)
- Refresh token hợp lệ 7 ngày
- Có thể refresh bất kỳ lúc nào trong 7 ngày
- Refresh token KHÔNG được tạo mới, chỉ access token mới
- Nên implement tự động refresh trước khi access token hết hạn

---

### 6. Xác minh Token (Internal)

```http
POST /api/v1/auth/verify
```

**Yêu cầu xác thực:** ❌ Không

**Headers:**

```http
Authorization: Bearer {token}
```

**Request Body:** (không cần)

```json
{}
```

**Response (200):**

```json
{
  "userId": "user_123",
  "role": "USER",
  "iat": 1705932600,
  "exp": 1705936200
}
```

**Lỗi:**

- `400` - Token không hợp lệ
- `400` - Token đã hết hạn

**Ghi chú:**

- Endpoint này dùng cho các services khác verify token
- Trả về decoded payload của token

---

## 👤 Endpoints Người dùng

### 1. Lấy Thông tin Profile

```http
GET /api/v1/auth/me
```

**Yêu cầu xác thực:** ✅ Có

**Headers:**

```http
Authorization: Bearer {accessToken}
```

**Response (200):**

```json
{
  "_id": "user_123",
  "email": "user@example.com",
  "fullName": "John Doe",
  "role": "USER",
  "isVerified": true,
  "fcmToken": "token_firebase",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-22T14:00:00Z"
}
```

**Lỗi:**

- `401` - Token không hợp lệ
- `404` - User không tìm thấy

---

### 2. Cập nhật FCM Token

```http
POST /api/v1/auth/fcm-token
```

**Yêu cầu xác thực:** ✅ Có

**Headers:**

```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**

```json
{
  "fcmToken": "APA91bH-Firebase_Cloud_Messaging_Device_Token"
}
```

**Các trường:**
| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|---------|-------|
| `fcmToken` | String | ✅ | Firebase Cloud Messaging Token |

**Response (200):**

```json
{
  "message": "FCM token updated successfully"
}
```

**Lỗi:**

- `401` - Token không hợp lệ
- `404` - User không tìm thấy

**Ghi chú:**

- Dùng để gửi push notifications
- Phát hành sự kiện `FCM_TOKEN_UPDATED`

---

### 3. Đổi Mật khẩu

```http
POST /api/v1/auth/change-password
```

**Yêu cầu xác thực:** ✅ Có

**Headers:**

```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**

```json
{
  "oldPassword": "OldPassword123!",
  "newPassword": "NewPassword456!"
}
```

**Các trường:**
| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|---------|-------|
| `oldPassword` | String | ✅ | Mật khẩu hiện tại |
| `newPassword` | String | ✅ | Mật khẩu mới |

**Response (200):**

```json
{
  "message": "Password changed successfully"
}
```

**Lỗi:**

- `401` - Token không hợp lệ
- `400` - Mật khẩu cũ sai
- `400` - Mật khẩu mới quá yếu

**Ghi chú:**

- Mật khẩu phải khác mật khẩu cũ
- Mật khẩu mới phải ít nhất 6 ký tự

---

## 🛡️ Endpoints Admin

### 1. Đăng ký Admin

```http
POST /api/v1/auth/register-admin
```

**Yêu cầu xác thực:** ✅ Có (phải là Admin)

**Headers:**

```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "admin@example.com",
  "password": "SecurePassword123!",
  "fullName": "Admin User"
}
```

**Response (200):**

```json
{
  "message": "Admin created successfully"
}
```

**Lỗi:**

- `401` - Token không hợp lệ hoặc không phải admin
- `400` - Email đã tồn tại

**Ghi chú:**

- Chỉ admin hiện tại mới có thể tạo admin mới
- Admin được tạo ngay với trạng thái verified

---

### 2. Xem Danh sách Admin

```http
GET /api/v1/auth/all-admin
```

**Yêu cầu xác thực:** ✅ Có (phải là Admin)

**Headers:**

```http
Authorization: Bearer {accessToken}
```

**Response (200):**

```json
[
  {
    "_id": "admin_123",
    "email": "admin1@example.com",
    "fullName": "Admin One",
    "role": "ADMIN",
    "isVerified": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  {
    "_id": "admin_456",
    "email": "admin2@example.com",
    "fullName": "Admin Two",
    "role": "ADMIN",
    "isVerified": true,
    "createdAt": "2024-01-16T12:00:00Z",
    "updatedAt": "2024-01-16T12:00:00Z"
  }
]
```

**Lỗi:**

- `401` - Token không hợp lệ hoặc không phải admin

---

## 🔑 Quản lý Mật khẩu

### 1. Quên Mật khẩu

```http
POST /api/v1/auth/forgot-password
```

**Yêu cầu xác thực:** ❌ Không

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Các trường:**
| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|---------|-------|
| `email` | String | ✅ | Email tài khoản |

**Response (200):**

```json
{
  "message": "OTP sent to email. Please reset your password."
}
```

**Lỗi:**

- `404` - Email không tìm thấy

**Ghi chú:**

- Gửi OTP qua email
- OTP hết hạn sau 5 phút
- Không cần access token

---

### 2. Reset Mật khẩu

```http
POST /api/v1/auth/reset-password
```

**Yêu cầu xác thực:** ❌ Không

**Request Body:**

```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "NewPassword456!"
}
```

**Các trường:**
| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|---------|-------|
| `email` | String | ✅ | Email tài khoản |
| `otp` | String | ✅ | OTP từ email (6 chữ số) |
| `newPassword` | String | ✅ | Mật khẩu mới |

**Response (200):**

```json
{
  "message": "Password reset successfully"
}
```

**Lỗi:**

- `404` - Email không tìm thấy
- `400` - OTP không hợp lệ hoặc hết hạn
- `400` - Mật khẩu mới quá yếu

**Ghi chú:**

- Phải gọi `/forgot-password` trước
- OTP hết hạn sau 5 phút
- Mật khẩu phải ít nhất 6 ký tự

---

## 💡 Các ví dụ thực tế

### Ví dụ 1: Quy trình Đăng ký và Xác minh

#### Bước 1: Đăng ký

```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123!",
    "fullName": "New User"
  }'
```

Response:

```json
{
  "message": "OTP sent to email. Please verify your account."
}
```

#### Bước 2: Kiểm tra email và lấy OTP (ví dụ: 123456)

#### Bước 3: Xác minh OTP

```bash
curl -X POST http://localhost:3001/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "otp": "123456"
  }'
```

Response:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Ví dụ 2: Đăng nhập và Refresh Token

#### Bước 1: Đăng nhập

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

Response:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Bước 2: Sau 1 giờ, refresh access token

```bash
curl -X POST http://localhost:3001/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

Response:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Ví dụ 3: Quên Mật khẩu

#### Bước 1: Yêu cầu reset password

```bash
curl -X POST http://localhost:3001/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

Response:

```json
{
  "message": "OTP sent to email. Please reset your password."
}
```

#### Bước 2: Kiểm tra email và lấy OTP

#### Bước 3: Reset mật khẩu

```bash
curl -X POST http://localhost:3001/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "otp": "123456",
    "newPassword": "NewPassword456!"
  }'
```

Response:

```json
{
  "message": "Password reset successfully"
}
```

---

### Ví dụ 4: Cập nhật FCM Token

```bash
curl -X POST http://localhost:3001/api/v1/auth/fcm-token \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "fcmToken": "APA91bH-Firebase_Cloud_Messaging_Device_Token"
  }'
```

Response:

```json
{
  "message": "FCM token updated successfully"
}
```

---

## ❌ Mã lỗi

### 400 Bad Request

**Nguyên nhân:**

- Thiếu trường bắt buộc
- Giá trị không hợp lệ (email format, mật khẩu yếu, v.v.)
- Dữ liệu business logic không hợp lệ

**Ví dụ:**

```json
{
  "message": "Email already exists"
}
```

### 401 Unauthorized

**Nguyên nhân:**

- Thiếu JWT token
- Token không hợp lệ
- Token đã hết hạn

**Ví dụ:**

```json
{
  "message": "Unauthorized"
}
```

### 404 Not Found

**Nguyên nhân:**

- User không tìm thấy
- Email không tồn tại

**Ví dụ:**

```json
{
  "message": "User not found"
}
```

### 500 Internal Server Error

**Nguyên nhân:**

- Lỗi database
- Lỗi gửi email
- Lỗi hệ thống khác

**Ví dụ:**

```json
{
  "message": "Internal server error"
}
```

---

## 📢 Events

Auth Service phát hành các sự kiện qua RabbitMQ:

### 1. USER_CREATED

Phát hành khi user đăng ký thành công và xác minh OTP

```json
{
  "userId": "user_123",
  "email": "user@example.com",
  "fullName": "John Doe"
}
```

**Subscribers:**

- Subscription Service (tạo free subscription)
- Notification Service (gửi welcome message)
- Analytics Service (tracking)

### 2. FCM_TOKEN_UPDATED

Phát hành khi user cập nhật FCM token

```json
{
  "userId": "user_123",
  "fcmToken": "token_firebase",
  "role": "USER"
}
```

**Subscribers:**

- Notification Service (cập nhật device token)

---

## 📝 Ghi chú quan trọng

1. **OTP Expiration**
   - OTP hết hạn sau 5 phút
   - Có thể gửi lại OTP bằng endpoint `/resend-otp`

2. **Token Expiration**
   - Access Token: 1 giờ
   - Refresh Token: 7 ngày
   - Refresh token mới được tạo mỗi lần đăng nhập

3. **Password Requirements**
   - Ít nhất 6 ký tự
   - Nên có chữ hoa, chữ thường, số và ký tự đặc biệt

4. **Multiple Sessions**
   - User có thể đăng nhập từ nhiều thiết bị cùng lúc
   - Mỗi lần đăng nhập tạo refresh token mới

5. **FCM Token**
   - Dùng cho Firebase Cloud Messaging
   - Cần cập nhật mỗi khi token thay đổi trên client

---

## 🧪 Health Check

```http
GET /api/v1/auth/health
```

**Response (200):**

```json
{
  "status": "ok",
  "service": "auth-service"
}
```

---

## 📞 Support

Nếu có bất kỳ câu hỏi hoặc vấn đề, vui lòng liên hệ với team phát triển.

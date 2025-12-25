# Auth Service

Dịch vụ xác thực (Authentication) cung cấp các tính năng quản lý người dùng, JWT tokens, và OTP verification.

## 📋 Tính Năng

- ✅ **Đăng ký tài khoản** với OTP verification
- ✅ **Đăng nhập** với email/password
- ✅ **Refresh token** để cấp access token mới
- ✅ **Lấy thông tin user** (Profile)
- ✅ **Token verification**
- ✅ **Quản lý multiple sessions** (Multiple refresh tokens per user)
- ✅ **Quên mật khẩu** với OTP verification
- ✅ **Reset mật khẩu** qua OTP

## 🏗️ Cấu Trúc Dự Án

```
auth-service/
├── index.js                          # Entry point
├── package.json                      # Dependencies
├── src/
│   ├── app.js                        # Express app setup
│   ├── config/
│   │   ├── database.js              # MongoDB connection
│   │   └── env.js                   # Environment config
│   ├── controllers/
│   │   └── auth.controller.js       # Auth endpoints handlers
│   ├── middlewares/
│   │   ├── auth.middleware.js       # JWT verification
│   │   └── error.middleware.js      # Global error handler
│   ├── models/
│   │   ├── User.model.js            # User schema
│   │   └── RefreshToken.model.js    # Refresh token schema
│   ├── repositories/
│   │   └── User.repository.js       # Database queries
│   ├── routes/
│   │   └── auth.route.js            # Auth routes
│   ├── services/
│   │   ├── Auth.service.js          # Auth business logic
│   │   └── Email.service.js         # Email sending
│   └── utils/
│       ├── hash.js                  # Password hashing (bcrypt)
│       ├── jwt.js                   # JWT token utils
│       └── otp.js                   # OTP generation & hashing
```

## 🚀 Cài Đặt

### 1. Cài đặt Dependencies

```bash
npm install
```

### 2. Cấu hình Environment

Tạo file `.env` trong root folder:

```env
PORT=3001
MONGO_URL=mongodb://localhost:27017/auth-service
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=your_email@gmail.com
```

### 3. Chạy Ứng Dụng

**Development (with auto-reload):**

```bash
npm run dev
```

**Production:**

```bash
npm start
```

## 🐳 Docker Setup

### Cách 1: Chạy với Docker Compose (Recommended)

```bash
docker-compose up --build
```

**Services sẽ chạy:**

- Auth Service: `http://localhost:3000`
- MongoDB: `localhost:27017`

**Dừng services:**

```bash
docker-compose down
```

**Xóa volume (database):**

```bash
docker-compose down -v
```

### Cách 2: Build & Run Manual

**Build image:**

```bash
docker build -t auth-service:latest .
```

**Run container:**

```bash
docker run -p 3000:3000 \
  -e MONGO_URL=mongodb://your-mongo-host:27017/auth-service \
  -e JWT_SECRET=your_secret \
  -e JWT_REFRESH_SECRET=your_refresh_secret \
  auth-service:latest
```

### Docker Compose Environment

File `docker-compose.yml` bao gồm:

- **MongoDB 7.0** - Database
- **Auth Service** - Node.js app
- **Network** - Internal communication
- **Volumes** - Persistent data storage
- **Health Checks** - Tự động restart nếu service down

**Cấu hình MongoDB:**

- Username: `admin`
- Password: `password`
- Database: `auth-service`

⚠️ **Lưu ý:** Thay đổi default credentials và secrets trong production!

```bash
npm start
```

## 📡 API Endpoints

### 1. Đăng Ký Tài Khoản

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe"
}
```

**Response:**

```json
{
  "message": "OTP sent to email. Please verify your account."
}
```

### 2. Xác Thực OTP

```http
POST /api/v1/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Đăng Nhập

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4. Cấp Access Token Mới

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

### 5. Lấy Thông Tin User

```http
GET /api/v1/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**

```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "fullName": "John Doe",
  "role": "USER"
}
```

### 6. Quên Mật Khẩu

```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "message": "OTP sent to email"
}
```

### 7. Reset Mật Khẩu

```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newPassword123"
}
```

**Response:**

```json
{
  "message": "Password reset successful"
}
```

### 8. Xác Thực Token

```http
POST /api/v1/auth/verify
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (Valid):**

```json
{
  "valid": true,
  "userId": "507f1f77bcf86cd799439011",
  "role": "USER"
}
```

**Response (Invalid):**

```json
{
  "valid": false
}
```

## 🔐 Token Configuration

### Access Token

- **Thời hạn:** 15 phút
- **Secret:** `JWT_SECRET`
- **Payload:** `{ id, role }`

### Refresh Token

- **Thời hạn:** 7 ngày
- **Secret:** `JWT_REFRESH_SECRET`
- **Lưu trữ:** Database (RefreshToken collection)
- **Liên kết:** User model (refreshTokens array)

## 🛡️ Authentication Flow

```
1. User đăng ký → Gửi OTP qua email
2. User verify OTP → Tạo RefreshToken + AccessToken
3. User login → Tạo RefreshToken mới + AccessToken
4. AccessToken hết hạn → Dùng RefreshToken để cấp AccessToken mới
5. Gọi API authenticated → Gửi AccessToken trong header
```

## 📊 Database Models

### User Schema

```javascript
{
  email: String (unique),
  passwordHash: String,
  fullName: String,
  role: String (USER/ADMIN),
  isVerified: Boolean,
  otpHash: String,
  otpExpiredAt: Date,
  refreshTokens: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

### RefreshToken Schema

```javascript
{
  token: String,
  user: ObjectId, // Liên kết User
  expiresAt: Date,
  isRevoked: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚨 Error Handling

Tất cả errors được catch bởi global error middleware và trả về format:

```json
{
  "message": "Error description",
  "status": 400
}
```

**Common Errors:**

- `Email already exists` - Tài khoản đã tồn tại
- `Invalid credentials` - Email/Password sai
- `Account not verified` - Tài khoản chưa xác thực
- `Invalid or expired OTP` - OTP sai hoặc hết hạn
- `Invalid refresh token` - Token không hợp lệ
- `Refresh token expired` - Token hết hạn
- `Unauthorized` - Không có Authorization header
- `Invalid token` - AccessToken không hợp lệ

## 🔧 Utils

### `hash.js`

- `hash(password)` - Hash password với bcrypt
- `compare(password, hash)` - So sánh password

### `jwt.js`

- `signAccessToken(payload)` - Tạo access token (15m)
- `signRefreshToken()` - Tạo refresh token (7d)
- `verifyToken(token, secret)` - Xác thực token

### `otp.js`

- `generateOtp()` - Tạo OTP 6 chữ số
- `hashOtp(otp)` - Hash OTP để lưu database

## 📝 Notes

- Password được hash với bcrypt trước khi lưu database
- OTP gửi qua email (Nodemailer)
- Refresh tokens được lưu database để có thể revoke
- User có thể có multiple refresh tokens (multiple devices)
- AccessToken không lưu database (stateless)

## 📄 License

ISC

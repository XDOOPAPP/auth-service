# Auth Service

Dịch vụ xác thực (Authentication Service) cho hệ thống microservices, cung cấp JWT authentication, OTP verification, và quản lý user.

## 📋 Tính Năng

- ✅ Đăng ký tài khoản với OTP verification qua email
- ✅ Đăng nhập với email/password
- ✅ Refresh token để cấp access token mới
- ✅ Lấy thông tin user profile
- ✅ Token verification
- ✅ Quên mật khẩu và reset mật khẩu qua OTP
- ✅ Resend OTP
- ✅ Quản lý multiple sessions (nhiều refresh tokens)

## 🚀 Quick Start

### Local Development

```bash
# Cài đặt dependencies
npm install

# Tạo file .env
cp .env.example .env  # (nếu có) hoặc tạo file .env

# Chạy development (với auto-reload)
npm run dev

# Chạy production
npm start
```

### Docker

```bash
# Chạy với Docker Compose (bao gồm MongoDB)
docker-compose up -d

# Xem logs
docker logs -f auth-service

# Dừng services
docker-compose down
```

## ⚙️ Environment Variables

Tạo file `.env` trong root folder:

```env
# Server
PORT=3001

# Database
MONGO_URL=mongodb://admin:password@mongodb:27017/auth_db?authSource=admin

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here

# Email (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

**Lưu ý:**
- `EMAIL_PASS` phải là App Password (không phải password thường)
- Đổi tất cả secrets trong production
- MongoDB connection string phải dùng service name trong Docker (`mongodb`), không phải `localhost`

## 📡 API Endpoints

Base URL: `http://localhost:3001/api/v1/auth`

### Public Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/register` | Đăng ký tài khoản mới |
| `POST` | `/verify-otp` | Xác thực OTP và hoàn tất đăng ký |
| `POST` | `/resend-otp` | Gửi lại OTP |
| `POST` | `/login` | Đăng nhập |
| `POST` | `/refresh` | Refresh access token |
| `POST` | `/forgot-password` | Gửi OTP để reset password |
| `POST` | `/reset-password` | Reset password với OTP |
| `POST` | `/verify` | Xác thực token |
| `GET` | `/health` | Health check |

### Protected Endpoints

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/me` | Lấy thông tin user hiện tại | Bearer Token |

## 📝 API Examples

### 1. Đăng Ký

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

### 2. Verify OTP

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

### 4. Refresh Token

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

### 5. Get Profile

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

### 6. Reset Password

```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newPassword123"
}
```

## 🔐 Token Configuration

### Access Token
- **Thời hạn:** 15 phút
- **Secret:** `JWT_SECRET`
- **Payload:** `{ id, role }`
- **Stateless:** Không lưu database

### Refresh Token
- **Thời hạn:** 7 ngày
- **Secret:** `JWT_REFRESH_SECRET`
- **Lưu trữ:** Database (RefreshToken collection)
- **Multiple sessions:** User có thể có nhiều refresh tokens

## 🏗️ Cấu Trúc Dự Án

```
auth-service/
├── index.js                    # Entry point
├── package.json
├── Dockerfile
├── docker-compose.yml
└── src/
    ├── app.js                  # Express app setup
    ├── config/
    │   ├── database.js        # MongoDB connection
    │   └── env.js             # Environment config
    ├── controllers/
    │   └── auth.controller.js  # Request handlers
    ├── middlewares/
    │   ├── auth.middleware.js # JWT verification
    │   └── error.middleware.js # Error handler
    ├── models/
    │   ├── User.model.js      # User schema
    │   └── RefreshToken.model.js # RefreshToken schema
    ├── repositories/
    │   └── User.repository.js  # Database queries
    ├── routes/
    │   └── auth.route.js      # Route definitions
    ├── services/
    │   ├── Auth.service.js    # Business logic
    │   └── Email.service.js   # Email sending
    └── utils/
        ├── hash.js            # Password hashing (bcrypt)
        ├── jwt.js             # JWT utilities
        └── otp.js             # OTP generation
```

## 📊 Database Models

### User
```javascript
{
  email: String (unique, required),
  passwordHash: String (required),
  fullName: String (required),
  role: String (USER/ADMIN, default: USER),
  isVerified: Boolean (default: false),
  otpHash: String,
  otpExpiredAt: Date,
  refreshTokens: [ObjectId], // References to RefreshToken
  createdAt: Date,
  updatedAt: Date
}
```

### RefreshToken
```javascript
{
  token: String (required),
  user: ObjectId (required, ref: User),
  expiresAt: Date (required),
  isRevoked: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

## 🐳 Docker Setup

### Docker Compose (Recommended)

File `docker-compose.yml` bao gồm:
- **MongoDB 7.0** - Database
- **Auth Service** - Node.js application
- **Network** - Internal communication
- **Volumes** - Persistent data

**Chạy:**
```bash
docker-compose up -d
```

**MongoDB Config:**
- Username: `admin`
- Password: `password`
- Database: `auth_db`
- Connection: `mongodb://admin:password@mongodb:27017/auth_db?authSource=admin`

⚠️ **Lưu ý:** Đổi credentials trong production!

## 🚨 Error Handling

Tất cả errors được xử lý bởi global error middleware:

```json
{
  "message": "Error description",
  "status": 400
}
```

**Common Errors:**
- `400` - `Email already exists` - Email đã tồn tại
- `401` - `Invalid credentials` - Email/Password sai
- `401` - `Account not verified` - Tài khoản chưa xác thực
- `400` - `Invalid or expired OTP` - OTP sai hoặc hết hạn
- `401` - `Invalid refresh token` - Refresh token không hợp lệ
- `401` - `Unauthorized` - Không có token
- `401` - `Invalid token` - Token không hợp lệ

## 🔄 Authentication Flow

```
1. Register → Gửi OTP qua email
2. Verify OTP → Tạo AccessToken + RefreshToken
3. Login → Tạo AccessToken + RefreshToken mới
4. AccessToken hết hạn → Dùng RefreshToken để lấy AccessToken mới
5. API calls → Gửi AccessToken trong Authorization header
```

## 🔧 Development

```bash
# Install dependencies
npm install

# Run with auto-reload
npm run dev

# Run production
npm start
```

## 📦 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **jsonwebtoken** - JWT handling
- **bcrypt** - Password hashing
- **nodemailer** - Email sending
- **dotenv** - Environment variables
- **morgan** - HTTP request logger

## 🔒 Security Notes

- Passwords được hash với bcrypt (salt rounds: 10)
- OTP được hash trước khi lưu database
- JWT tokens có expiration time
- Refresh tokens có thể revoke
- Email verification required để login
- OTP expires sau 5 phút

## 📄 License

ISC

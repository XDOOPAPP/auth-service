const AuthService = require("../services/Auth.service");

class AuthController {
  constructor(eventBus) {
    this.authService = new AuthService(eventBus);
  }

  // [POST] /api/v1/auth/register
  register = async (req, res) => {
    const { email, password, fullName } = req.body;
    const result = await this.authService.register(email, password, fullName);
    res.json(result);
  }

  // [POST] /api/v1/auth/register-admin
  registerAdmin = async (req, res) => {
    const { email, password, fullName } = req.body;
    const result = await this.authService.registerAdmin(email, password, fullName);
    res.json(result);
  }

  // [GET] /api/v1/auth/all-admin
  getAllAdmin = async (req, res) => {
    const result = await this.authService.getAllAdmin();
    res.json(result);
  }

  // [POST] /api/v1/auth/fcm-token
  fcmToken = async (req, res) => {
    const { fcmToken } = req.body;
    const result = await this.authService.fcmToken(req.user.userId, fcmToken);
    res.json(result);
  }

  // [POST] /api/v1/auth/verify-otp
  verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    const result = await this.authService.verifyOtp(email, otp);
    res.json(result);
  }

  // [POST] /api/v1/auth/resend-otp
  resendOtp = async (req, res) => {
    const { email } = req.body;
    const result = await this.authService.resendOtp(email);
    res.json(result);
  }

  // [POST] /api/v1/auth/login
  login = async (req, res) => {
    const { email, password } = req.body;
    const result = await this.authService.login(email, password);
    res.json(result);
  }

  // [POST] /api/v1/auth/refresh
  refresh = async (req, res) => {
    const { refreshToken } = req.body;
    const result = await this.authService.refresh(refreshToken);
    res.json(result);
  }

  // [GET] /api/v1/auth/me
  me = async (req, res) => {
    const profile = await this.authService.getProfile(req.user.userId);
    res.json(profile);
  }

  // [POST] /api/v1/auth/forgot-password
  forgotPassword = async (req, res) => {
    const { email } = req.body;
    const result = await this.authService.forgotPassword(email);
    res.json(result);
  }

  // [POST] /api/v1/auth/reset-password
  resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const result = await this.authService.resetPassword(
      email,
      otp,
      newPassword
    );
    res.json(result);
  }

  // [POST] /api/v1/auth/change-password
  changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const result = await this.authService.changePassword(
      req.user.userId,
      oldPassword,
      newPassword
    );
    res.json(result);
  }

  // [POST] /api/v1/auth/verify
  verifyToken = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    const result = await this.authService.verifyToken(token);
    res.json(result);
  }

  // User Management CRUD Methods

  // [GET] /api/v1/auth/users
  getAllUsers = async (req, res) => {
    const { page = 1, limit = 10, isVerified, search } = req.query;
    const filters = {};
    
    if (isVerified !== undefined) filters.isVerified = isVerified === "true";
    if (search) filters.search = search;

    const result = await this.authService.getAllUsers(
      parseInt(page),
      parseInt(limit),
      filters
    );
    res.json(result);
  }

  // [DELETE] /api/v1/auth/users/:userId
  deleteUser = async (req, res) => {
    const { userId } = req.params;
    const result = await this.authService.deleteUser(userId);
    res.json(result);
  }

  // [PATCH] /api/v1/auth/users/:userId/deactivate
  deactivateUser = async (req, res) => {
    const { userId } = req.params;
    const result = await this.authService.deactivateUser(userId);
    res.json(result);
  }

  // [PATCH] /api/v1/auth/users/:userId/reactivate
  reactivateUser = async (req, res) => {
    const { userId } = req.params;
    const result = await this.authService.reactivateUser(userId);
    res.json(result);
  }

}

module.exports = AuthController;

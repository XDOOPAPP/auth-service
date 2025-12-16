const authService = require("../services/Auth.service");

class AuthController {

  // [POST] /api/v1/auth/register
  register = async (req, res, next) => {
    try {
      const { email, password, fullName } = req.body;
      const result = await authService.register(email, password, fullName);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  // [POST] /api/v1/auth/verify-otp
  verifyOtp = async (req, res, next) => {
    try {
      const { email, otp } = req.body;
      const result = await authService.verifyOtp(email, otp);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  // [POST] /api/v1/auth/login
  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  // [POST] /api/v1/auth/refresh
  refresh = async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refresh(refreshToken);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  // [GET] /api/v1/auth/me
  me = async (req, res, next) => {
    try {
      const profile = await authService.getProfile(req.user.id);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  };

  // [POST] /api/v1/auth/forgot-password
  forgotPassword = async (req, res, next) => {
    try {
      const { email } = req.body;
      const result = await authService.forgotPassword(email);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  // [POST] /api/v1/auth/reset-password
  resetPassword = async (req, res, next) => {
    try {
      const { email, otp, newPassword } = req.body;
      const result = await authService.resetPassword(
        email,
        otp,
        newPassword
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  // [POST] /api/v1/auth/verify
  verifyToken = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    const result = await authService.verifyToken(token);
    res.json(result);
  };

}

module.exports = new AuthController();

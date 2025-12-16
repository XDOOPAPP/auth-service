const authService = require("../services/Auth.service");

class AuthController {

// [POST] /api/v1/auth/register
  register = async (req, res, next) => {
    try{
      const { email, password } = req.body;
      const result = await authService.register(email, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

// [POST] /api/v1/auth/login
  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

// [POST] /api/v1/auth/refresh
  refresh = async (req, res, next) => {
    try {
      const result = await authService.refresh(req.body.refreshToken);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

// [GET] /api/v1/auth/me
  me = async (req, res, next) => {
    try {
      const profile = await authService.getProfile(req.user.id);
      res.json(profile);
    } catch (err) {
      next(err);
    }
  };

}

module.exports = new AuthController();
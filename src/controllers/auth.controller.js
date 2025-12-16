const authService = require("../services/Auth.service");

class AuthController {

// [POST] /api/v1/auth/register
  register = async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.register(email, password);
    res.json(result);
  };

}

module.exports = new AuthController();
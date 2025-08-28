const AuthService = require('../services/auth.service');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    await AuthService.registerUser(name, email, password);
    res.status(201).json({ msg: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.loginUser(email, password);
    res.json(result);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

module.exports = {
  register,
  login,
};
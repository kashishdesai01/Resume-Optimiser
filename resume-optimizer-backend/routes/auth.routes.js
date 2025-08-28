const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { validateRegistration, validateLogin } = require('../middleware/validation.middleware'); // <-- Import

// @route   POST /api/auth/register
router.post('/register', validateRegistration, AuthController.register);

// @route   POST /api/auth/login
router.post('/login', validateLogin, AuthController.login);

module.exports = router;
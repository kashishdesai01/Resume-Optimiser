// middleware/validation.middleware.js
const { check, validationResult } = require('express-validator');

const validateRegistration = [
    check('name', 'Name is required').not().isEmpty(),
    
    // Stricter email validation and normalization
    check('email', 'Please include a valid email').isEmail().normalizeEmail(),
    
    // New, strong password validation
    check('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
        .matches(/\d/).withMessage('Password must contain at least one number.')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter.')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character.'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

const validateLogin = [
    check('email', 'Please include a valid email').isEmail().normalizeEmail(),
    check('password', 'Password is required').exists(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

module.exports = {
    validateRegistration,
    validateLogin,
};
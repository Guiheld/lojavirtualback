const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const Auth = require('../auth/authMiddleware');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile', Auth, userController.getProfile);

module.exports = router;
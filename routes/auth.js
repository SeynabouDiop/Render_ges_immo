const express = require('express');
const { register, login, getMe, loginAdmin } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/admin/login', loginAdmin); 
router.get('/me', auth, getMe);

module.exports = router;



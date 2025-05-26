const express = require('express');
const router = express.Router();
const { getAllUsers, getAllTransactions, banUser } = require('../controllers/adminController');
const adminAuth = require('../middleware/adminMiddleware');

router.get('/users', adminAuth, getAllUsers);
router.get('/transactions', adminAuth, getAllTransactions);
router.post('/ban/:userId', adminAuth, banUser);

module.exports = router;

const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware); // Protect all routes

router.get('/balance', walletController.getBalance);
router.post('/add', walletController.addMoney);
router.post('/send', walletController.sendMoney);
router.get('/transactions', walletController.getTransactions);

module.exports = router;

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['add', 'send', 'receive'], required: true },
  amount: { type: Number, required: true },
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now }
});

const walletSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  balance: { type: Number, default: 0 },
  transactions: [transactionSchema]
});

module.exports = mongoose.model('Wallet', walletSchema);

const Wallet = require('../models/Wallet');
const User = require('../models/User');

// 1. Get Wallet Balance
exports.getBalance = async (req, res) => {
  const wallet = await Wallet.findOne({ user: req.user.id });
  res.json({ balance: wallet?.balance || 0 });
};

// 2. Add Money to Wallet (simulate)
exports.addMoney = async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

  let wallet = await Wallet.findOne({ user: req.user.id });
  if (!wallet) wallet = new Wallet({ user: req.user.id });

  wallet.balance += amount;
  wallet.transactions.push({ type: 'add', amount });
  await wallet.save();

  res.json({ message: 'Money added', balance: wallet.balance });
};

// 3. Send Money to another user
exports.sendMoney = async (req, res) => {
  const { toPhone, amount } = req.body;
  if (!toPhone || !amount || amount <= 0) return res.status(400).json({ message: 'Invalid input' });

  const senderWallet = await Wallet.findOne({ user: req.user.id });
  if (!senderWallet || senderWallet.balance < amount) return res.status(400).json({ message: 'Insufficient balance' });

  const recipient = await User.findOne({ phone: toPhone });
  if (!recipient) return res.status(404).json({ message: 'Recipient not found' });

  let recipientWallet = await Wallet.findOne({ user: recipient._id });
  if (!recipientWallet) recipientWallet = new Wallet({ user: recipient._id });

  // Update balances
  senderWallet.balance -= amount;
  recipientWallet.balance += amount;

  // Add transaction logs
  senderWallet.transactions.push({ type: 'send', amount, to: recipient._id });
  recipientWallet.transactions.push({ type: 'receive', amount, from: req.user.id });

  await senderWallet.save();
  await recipientWallet.save();

  res.json({ message: `Sent ₹${amount} to ${toPhone}`, balance: senderWallet.balance });
};

// 4. Get Transactions
exports.getTransactions = async (req, res) => {
  const wallet = await Wallet.findOne({ user: req.user.id }).populate('transactions.from transactions.to', 'phone email');
  res.json(wallet?.transactions || []);
};

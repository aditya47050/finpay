const User = require('../models/User');


exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const currentUserId = req.user.id;

    if (!query) {
      return res.status(400).json({ message: 'Search query required' });
    }

    const users = await User.find({
      $and: [
        {
          $or: [
            { email: { $regex: query, $options: 'i' } },
            { phone: { $regex: query, $options: 'i' } }
          ]
        },
        { _id: { $ne: currentUserId } }
      ]
    }).select('name email phone');

    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (email) user.email = email; // You can re-trigger OTP flow if email changes
    if (phone) user.phone = phone;

    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

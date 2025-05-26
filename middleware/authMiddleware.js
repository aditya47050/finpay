const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token missing from authorization header' });
    }


    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {

        return res.status(403).json({ message: 'Invalid or expired token' });
      }

      req.user = user;
      next();
    });
  } catch (error) {

    console.error('Error in authenticateToken middleware:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = authenticateToken;

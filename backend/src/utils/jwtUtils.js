const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

// Set JWT cookie in response
const setTokenCookie = (res, token) => {
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true, // Prevent XSS attacks
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict', // CSRF protection
    path: '/' // Available for all routes
  };

  res.cookie('jwt', token, cookieOptions);
};

// Clear JWT cookie
const clearTokenCookie = (res) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
};

// Generate and set token with cookie
const generateAndSetToken = (res, userId) => {
  const token = generateToken(userId);
  setTokenCookie(res, token);
  return token;
};

// Verify token
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  generateToken,
  setTokenCookie,
  clearTokenCookie,
  generateAndSetToken,
  verifyToken
};

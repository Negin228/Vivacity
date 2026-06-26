const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

const optionalAuth = (req, res, next) => {
  const token = req.cookies['st-token'] || (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return next();
  try {
    req.currentUser = jwt.verify(token, JWT_SECRET);
  } catch (_) {}
  next();
};

const requireAuth = (req, res, next) => {
  const token = req.cookies['st-token'] || (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ errors: [{ status: 401, code: 'unauthorized', title: 'Unauthorized' }] });
  }
  try {
    req.currentUser = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ errors: [{ status: 401, code: 'token-expired', title: 'Token expired or invalid' }] });
  }
};

const signToken = (user) => {
  return jwt.sign(
    { userId: user.id, email: user.email, userType: user.user_type },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

const setTokenCookie = (res, token) => {
  res.cookie('st-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

const clearTokenCookie = (res) => {
  res.clearCookie('st-token');
};

module.exports = { requireAuth, optionalAuth, signToken, setTokenCookie, clearTokenCookie };
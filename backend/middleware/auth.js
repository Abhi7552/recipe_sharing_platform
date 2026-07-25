const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'You need to sign in to do that.' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: 'Your session is invalid. Please sign in again.' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
  }
}

// Attaches req.user if a valid token is present, but doesn't block the request otherwise.
async function optionalAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return next();
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (user) req.user = user;
    next();
  } catch (err) {
    next();
  }
}

module.exports = { requireAuth, optionalAuth };

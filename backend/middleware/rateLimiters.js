const rateLimit = require('express-rate-limit');

// Generous limit for general API traffic.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again in a few minutes.' },
});

// Tighter limit specifically on auth endpoints to slow down credential stuffing / brute force.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please wait a few minutes and try again.' },
});

module.exports = { apiLimiter, authLimiter };

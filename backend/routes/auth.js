const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function signToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').isEmail().withMessage('Enter a valid email address.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    try {
      const { name, email, password } = req.body;
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) return res.status(409).json({ message: 'An account with that email already exists.' });

      const user = await User.create({ name, email, password });
      const token = signToken(user);
      res.status(201).json({ token, user: user.toPublicJSON() });
    } catch (err) {
      res.status(500).json({ message: 'Could not create the account. Please try again.' });
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Enter a valid email address.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (!user) return res.status(401).json({ message: 'Incorrect email or password.' });

      const match = await user.comparePassword(password);
      if (!match) return res.status(401).json({ message: 'Incorrect email or password.' });

      const token = signToken(user);
      res.json({ token, user: user.toPublicJSON() });
    } catch (err) {
      res.status(500).json({ message: 'Could not sign in. Please try again.' });
    }
  }
);

router.get('/me', requireAuth, async (req, res) => {
  res.json({ user: req.user.toPublicJSON() });
});

module.exports = router;

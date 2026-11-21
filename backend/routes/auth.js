// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const { loadConfig } = require('../config');

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (typeof username !== 'string' || username.trim().length < 3 || typeof email !== 'string' || !email.includes('@') || typeof password !== 'string' || password.length < 12 || Buffer.byteLength(password, 'utf8') > 72) return res.status(400).json({ error: 'Use a username, valid email and password of at least 12 characters (max 72 UTF-8 bytes).' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(error.code === 11000 ? 409 : 500).json({ error: error.code === 11000 ? 'Account already exists' : 'Request failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string') return res.status(400).json({ error: 'Email and password required' });
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(400).json({ message: 'Wrong email or password' });
    }
    const token = jwt.sign({ id: user._id }, loadConfig().jwtSecret, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(error.code === 11000 ? 409 : 500).json({ error: error.code === 11000 ? 'Account already exists' : 'Request failed' });
  }
});

module.exports = router;

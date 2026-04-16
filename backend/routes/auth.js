const express = require('express');
const { db } = require('../database');
const { hashPassword, comparePassword, generateToken } = require('../middleware/auth');

const router = express.Router();

// Registration
router.post('/register', async (req, res) => {
  try {
    const { username, password, role, base_id } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const hashedPassword = await hashPassword(password);

    db.run(
      'INSERT INTO users (username, password, role, base_id) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, role, base_id],
      function(err) {
        if (err) {
          return res.status(400).json({ error: 'User already exists or invalid input' });
        }
        res.status(201).json({ message: 'User registered successfully', userId: this.lastID });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
      if (err || !user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = generateToken(user);
      res.json({ 
        message: 'Login successful', 
        token, 
        user: { id: user.id, username: user.username, role: user.role, base_id: user.base_id } 
      });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

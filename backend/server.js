const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const db = require('./database');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const purchaseRoutes = require('./routes/purchases');
const transferRoutes = require('./routes/transfers');
const assignmentRoutes = require('./routes/assignments');
const { authMiddleware } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize Database
db.initDatabase();

// Public Routes
app.use('/api/auth', authRoutes);

// Protected Routes
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/purchases', authMiddleware, purchaseRoutes);
app.use('/api/transfers', authMiddleware, transferRoutes);
app.use('/api/assignments', authMiddleware, assignmentRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`Military Asset Management System Backend running on port ${PORT}`);
});

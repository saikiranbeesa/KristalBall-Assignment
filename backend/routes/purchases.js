const express = require('express');
const { db } = require('../database');
const { authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Create Purchase
router.post('/', (req, res) => {
  try {
    const { base_id, equipment_type_id, quantity, purchase_date, cost } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    const userBaseId = req.user.base_id;

    // Check authorization
    if (userRole === 'LogisticsOfficer' && base_id !== userBaseId) {
      return res.status(403).json({ error: 'Unauthorized: Can only record purchases for your base' });
    }

    if (!base_id || !equipment_type_id || !quantity || !purchase_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    db.run(
      'INSERT INTO purchases (base_id, equipment_type_id, quantity, purchase_date, cost, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [base_id, equipment_type_id, quantity, purchase_date, cost || null, userId],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Audit Log
        db.run(
          'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
          [userId, 'CREATE', 'Purchase', this.lastID, JSON.stringify(req.body)],
          (auditErr) => {
            if (!auditErr) {
              res.status(201).json({ message: 'Purchase recorded successfully', purchaseId: this.lastID });
            } else {
              res.status(201).json({ message: 'Purchase recorded but audit log failed', purchaseId: this.lastID });
            }
          }
        );
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Purchases
router.get('/', (req, res) => {
  try {
    const { base_id, equipment_type_id, date_from, date_to } = req.query;
    const userRole = req.user.role;
    const userBaseId = req.user.base_id;

    let query = `
      SELECT p.*, et.name as equipment_name, b.name as base_name, u.username as created_by_username
      FROM purchases p
      JOIN equipment_types et ON p.equipment_type_id = et.id
      JOIN bases b ON p.base_id = b.id
      JOIN users u ON p.created_by = u.id
      WHERE 1=1
    `;
    let params = [];

    if (userRole === 'LogisticsOfficer' || userRole === 'BaseCommander') {
      query += ' AND p.base_id = ?';
      params.push(userBaseId);
    }

    if (base_id) {
      query += ' AND p.base_id = ?';
      params.push(base_id);
    }

    if (equipment_type_id) {
      query += ' AND p.equipment_type_id = ?';
      params.push(equipment_type_id);
    }

    if (date_from) {
      query += ' AND p.purchase_date >= ?';
      params.push(date_from);
    }

    if (date_to) {
      query += ' AND p.purchase_date <= ?';
      params.push(date_to);
    }

    query += ' ORDER BY p.purchase_date DESC';

    db.all(query, params, (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Purchase by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;

    db.get(
      `SELECT p.*, et.name as equipment_name, b.name as base_name, u.username as created_by_username
       FROM purchases p
       JOIN equipment_types et ON p.equipment_type_id = et.id
       JOIN bases b ON p.base_id = b.id
       JOIN users u ON p.created_by = u.id
       WHERE p.id = ?`,
      [id],
      (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (!row) {
          return res.status(404).json({ error: 'Purchase not found' });
        }
        res.json(row);
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

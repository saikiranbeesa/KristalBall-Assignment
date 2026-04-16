const express = require('express');
const { db } = require('../database');

const router = express.Router();

// Create Transfer
router.post('/', (req, res) => {
  try {
    const { from_base_id, to_base_id, equipment_type_id, quantity, transfer_date } = req.body;
    const userId = req.user.id;

    if (!from_base_id || !to_base_id || !equipment_type_id || !quantity || !transfer_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (from_base_id === to_base_id) {
      return res.status(400).json({ error: 'Source and destination bases must be different' });
    }

    db.run(
      'INSERT INTO transfers (from_base_id, to_base_id, equipment_type_id, quantity, transfer_date, initiated_by) VALUES (?, ?, ?, ?, ?, ?)',
      [from_base_id, to_base_id, equipment_type_id, quantity, transfer_date, userId],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Audit Log
        db.run(
          'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
          [userId, 'CREATE', 'Transfer', this.lastID, JSON.stringify(req.body)],
          (auditErr) => {
            if (!auditErr) {
              res.status(201).json({ message: 'Transfer recorded successfully', transferId: this.lastID });
            } else {
              res.status(201).json({ message: 'Transfer recorded but audit log failed', transferId: this.lastID });
            }
          }
        );
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Transfers
router.get('/', (req, res) => {
  try {
    const { from_base_id, to_base_id, equipment_type_id, date_from, date_to } = req.query;
    const userRole = req.user.role;
    const userBaseId = req.user.base_id;

    let query = `
      SELECT t.*, 
             et.name as equipment_name,
             fb.name as from_base_name,
             tb.name as to_base_name,
             u.username as initiated_by_username
      FROM transfers t
      JOIN equipment_types et ON t.equipment_type_id = et.id
      JOIN bases fb ON t.from_base_id = fb.id
      JOIN bases tb ON t.to_base_id = tb.id
      JOIN users u ON t.initiated_by = u.id
      WHERE 1=1
    `;
    let params = [];

    if (userRole === 'Logistics Officer' || userRole === 'BaseCommander') {
      query += ' AND (t.from_base_id = ? OR t.to_base_id = ?)';
      params.push(userBaseId, userBaseId);
    }

    if (from_base_id) {
      query += ' AND t.from_base_id = ?';
      params.push(from_base_id);
    }

    if (to_base_id) {
      query += ' AND t.to_base_id = ?';
      params.push(to_base_id);
    }

    if (equipment_type_id) {
      query += ' AND t.equipment_type_id = ?';
      params.push(equipment_type_id);
    }

    if (date_from) {
      query += ' AND t.transfer_date >= ?';
      params.push(date_from);
    }

    if (date_to) {
      query += ' AND t.transfer_date <= ?';
      params.push(date_to);
    }

    query += ' ORDER BY t.transfer_date DESC';

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

// Get Transfer by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;

    db.get(
      `SELECT t.*, 
              et.name as equipment_name,
              fb.name as from_base_name,
              tb.name as to_base_name,
              u.username as initiated_by_username
       FROM transfers t
       JOIN equipment_types et ON t.equipment_type_id = et.id
       JOIN bases fb ON t.from_base_id = fb.id
       JOIN bases tb ON t.to_base_id = tb.id
       JOIN users u ON t.initiated_by = u.id
       WHERE t.id = ?`,
      [id],
      (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (!row) {
          return res.status(404).json({ error: 'Transfer not found' });
        }
        res.json(row);
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

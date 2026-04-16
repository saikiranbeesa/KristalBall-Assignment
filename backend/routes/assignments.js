const express = require('express');
const { db } = require('../database');

const router = express.Router();

// Create Assignment
router.post('/', (req, res) => {
  try {
    const { base_id, personnel_id, equipment_type_id, quantity, assignment_date } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    const userBaseId = req.user.base_id;

    // Authorization check
    if (userRole === 'BaseCommander' && base_id !== userBaseId) {
      return res.status(403).json({ error: 'Unauthorized: Can only assign for your base' });
    }

    if (!base_id || !personnel_id || !equipment_type_id || !quantity || !assignment_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    db.run(
      'INSERT INTO assignments (base_id, personnel_id, equipment_type_id, quantity, assignment_date, assigned_by) VALUES (?, ?, ?, ?, ?, ?)',
      [base_id, personnel_id, equipment_type_id, quantity, assignment_date, userId],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Audit Log
        db.run(
          'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
          [userId, 'CREATE', 'Assignment', this.lastID, JSON.stringify(req.body)],
          (auditErr) => {
            if (!auditErr) {
              res.status(201).json({ message: 'Assignment recorded successfully', assignmentId: this.lastID });
            } else {
              res.status(201).json({ message: 'Assignment recorded but audit log failed', assignmentId: this.lastID });
            }
          }
        );
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Assignments
router.get('/', (req, res) => {
  try {
    const { base_id, equipment_type_id, date_from, date_to } = req.query;
    const userRole = req.user.role;
    const userBaseId = req.user.base_id;

    let query = `
      SELECT a.*, et.name as equipment_name, b.name as base_name, u.username as assigned_by_username
      FROM assignments a
      JOIN equipment_types et ON a.equipment_type_id = et.id
      JOIN bases b ON a.base_id = b.id
      JOIN users u ON a.assigned_by = u.id
      WHERE 1=1
    `;
    let params = [];

    if (userRole === 'BaseCommander') {
      query += ' AND a.base_id = ?';
      params.push(userBaseId);
    }

    if (base_id) {
      query += ' AND a.base_id = ?';
      params.push(base_id);
    }

    if (equipment_type_id) {
      query += ' AND a.equipment_type_id = ?';
      params.push(equipment_type_id);
    }

    if (date_from) {
      query += ' AND a.assignment_date >= ?';
      params.push(date_from);
    }

    if (date_to) {
      query += ' AND a.assignment_date <= ?';
      params.push(date_to);
    }

    query += ' ORDER BY a.assignment_date DESC';

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

// Record Expenditure
router.post('/expenditure', (req, res) => {
  try {
    const { base_id, equipment_type_id, quantity, expended_date, reason } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    const userBaseId = req.user.base_id;

    // Authorization check
    if (userRole === 'BaseCommander' && base_id !== userBaseId) {
      return res.status(403).json({ error: 'Unauthorized: Can only record expenditures for your base' });
    }

    if (!base_id || !equipment_type_id || !quantity || !expended_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    db.run(
      'INSERT INTO expenditures (base_id, equipment_type_id, quantity, expended_date, reason, recorded_by) VALUES (?, ?, ?, ?, ?, ?)',
      [base_id, equipment_type_id, quantity, expended_date, reason || null, userId],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Audit Log
        db.run(
          'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
          [userId, 'CREATE', 'Expenditure', this.lastID, JSON.stringify(req.body)],
          (auditErr) => {
            if (!auditErr) {
              res.status(201).json({ message: 'Expenditure recorded successfully', expenditureId: this.lastID });
            } else {
              res.status(201).json({ message: 'Expenditure recorded but audit log failed', expenditureId: this.lastID });
            }
          }
        );
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Expenditures
router.get('/expenditure', (req, res) => {
  try {
    const { base_id, equipment_type_id, date_from, date_to } = req.query;
    const userRole = req.user.role;
    const userBaseId = req.user.base_id;

    let query = `
      SELECT e.*, et.name as equipment_name, b.name as base_name, u.username as recorded_by_username
      FROM expenditures e
      JOIN equipment_types et ON e.equipment_type_id = et.id
      JOIN bases b ON e.base_id = b.id
      JOIN users u ON e.recorded_by = u.id
      WHERE 1=1
    `;
    let params = [];

    if (userRole === 'BaseCommander') {
      query += ' AND e.base_id = ?';
      params.push(userBaseId);
    }

    if (base_id) {
      query += ' AND e.base_id = ?';
      params.push(base_id);
    }

    if (equipment_type_id) {
      query += ' AND e.equipment_type_id = ?';
      params.push(equipment_type_id);
    }

    if (date_from) {
      query += ' AND e.expended_date >= ?';
      params.push(date_from);
    }

    if (date_to) {
      query += ' AND e.expended_date <= ?';
      params.push(date_to);
    }

    query += ' ORDER BY e.expended_date DESC';

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

module.exports = router;

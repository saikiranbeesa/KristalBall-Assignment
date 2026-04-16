const express = require('express');
const { db } = require('../database');
const { authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Get Dashboard Metrics
router.get('/metrics', (req, res) => {
  try {
    const { base_id, equipment_type_id, date_from, date_to } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;
    const userBaseId = req.user.base_id;

    // Build query based on user role
    let baseFilter = '';
    let params = [];

    if (userRole === 'BaseCommander') {
      baseFilter = 'AND ai.base_id = ?';
      params.push(userBaseId);
    } else if (base_id) {
      baseFilter = 'AND ai.base_id = ?';
      params.push(base_id);
    }

    const query = `
      SELECT 
        et.id,
        et.name as equipment_name,
        ai.base_id,
        b.name as base_name,
        ai.opening_balance,
        ai.closing_balance,
        COALESCE(SUM(CASE WHEN p.purchase_date >= ? AND (? IS NULL OR p.purchase_date <= ?) THEN p.quantity ELSE 0 END), 0) as purchases,
        COALESCE(SUM(CASE WHEN t.from_base_id = ai.base_id AND t.transfer_date >= ? AND (? IS NULL OR t.transfer_date <= ?) THEN t.quantity ELSE 0 END), 0) as transfers_out,
        COALESCE(SUM(CASE WHEN t.to_base_id = ai.base_id AND t.transfer_date >= ? AND (? IS NULL OR t.transfer_date <= ?) THEN t.quantity ELSE 0 END), 0) as transfers_in,
        COALESCE(SUM(CASE WHEN assign.assignment_date >= ? AND (? IS NULL OR assign.assignment_date <= ?) THEN assign.quantity ELSE 0 END), 0) as assigned,
        COALESCE(SUM(CASE WHEN exp.expended_date >= ? AND (? IS NULL OR exp.expended_date <= ?) THEN exp.quantity ELSE 0 END), 0) as expended
      FROM asset_inventory ai
      JOIN equipment_types et ON ai.equipment_type_id = et.id
      JOIN bases b ON ai.base_id = b.id
      LEFT JOIN purchases p ON ai.equipment_type_id = p.equipment_type_id AND ai.base_id = p.base_id
      LEFT JOIN transfers t ON ai.equipment_type_id = t.equipment_type_id
      LEFT JOIN assignments assign ON ai.equipment_type_id = assign.equipment_type_id AND ai.base_id = assign.base_id
      LEFT JOIN expenditures exp ON ai.equipment_type_id = exp.equipment_type_id AND ai.base_id = exp.base_id
      WHERE 1=1 ${baseFilter} ${equipment_type_id ? 'AND et.id = ?' : ''}
      GROUP BY et.id, ai.base_id
    `;

    const dateFrom = date_from || '2023-01-01';
    const dateTo = date_to || new Date().toISOString().split('T')[0];

    let queryParams = [dateFrom, dateTo, dateTo, dateFrom, dateTo, dateFrom, dateTo, dateFrom, dateTo, dateFrom, dateTo];
    queryParams = queryParams.concat(params);
    if (equipment_type_id) queryParams.push(equipment_type_id);

    db.all(query, queryParams, (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const processedMetrics = rows.map(row => ({
        equipment_id: row.id,
        equipment_name: row.equipment_name,
        base_id: row.base_id,
        base_name: row.base_name,
        opening_balance: row.opening_balance,
        closing_balance: row.closing_balance,
        purchases: row.purchases,
        transfers_in: row.transfers_in,
        transfers_out: row.transfers_out,
        net_movement: (row.purchases + row.transfers_in - row.transfers_out),
        assigned: row.assigned,
        expended: row.expended
      }));

      res.json(processedMetrics);
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Net Movement Details (Purchases, Transfers In, Transfers Out)
router.get('/net-movement/:base_id/:equipment_type_id', (req, res) => {
  try {
    const { base_id, equipment_type_id } = req.params;
    const { date_from, date_to } = req.query;

    const dateFrom = date_from || '2023-01-01';
    const dateTo = date_to || new Date().toISOString().split('T')[0];

    const detailedQuery = `
      SELECT 
        'Purchase' as type,
        p.id,
        p.quantity,
        p.purchase_date as date,
        et.name as equipment_name,
        b.name as base_name,
        u.username as recorded_by
      FROM purchases p
      JOIN equipment_types et ON p.equipment_type_id = et.id
      JOIN bases b ON p.base_id = b.id
      JOIN users u ON p.created_by = u.id
      WHERE p.base_id = ? AND p.equipment_type_id = ? AND p.purchase_date BETWEEN ? AND ?

      UNION ALL

      SELECT 
        'Transfer In' as type,
        t.id,
        t.quantity,
        t.transfer_date as date,
        et.name as equipment_name,
        b.name as base_name,
        u.username as recorded_by
      FROM transfers t
      JOIN equipment_types et ON t.equipment_type_id = et.id
      JOIN bases b ON t.to_base_id = b.id
      JOIN users u ON t.initiated_by = u.id
      WHERE t.to_base_id = ? AND t.equipment_type_id = ? AND t.transfer_date BETWEEN ? AND ?

      UNION ALL

      SELECT 
        'Transfer Out' as type,
        t.id,
        t.quantity,
        t.transfer_date as date,
        et.name as equipment_name,
        b.name as base_name,
        u.username as recorded_by
      FROM transfers t
      JOIN equipment_types et ON t.equipment_type_id = et.id
      JOIN bases b ON t.from_base_id = b.id
      JOIN users u ON t.initiated_by = u.id
      WHERE t.from_base_id = ? AND t.equipment_type_id = ? AND t.transfer_date BETWEEN ? AND ?
      
      ORDER BY date DESC
    `;

    db.all(detailedQuery, [base_id, equipment_type_id, dateFrom, dateTo, base_id, equipment_type_id, dateFrom, dateTo, base_id, equipment_type_id, dateFrom, dateTo], (err, rows) => {
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

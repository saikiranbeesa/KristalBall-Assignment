const path = require('path');
require('dotenv').config();

// Detect environment and select database
const usePostgres = process.env.DATABASE_URL ? true : false;

let db;

if (usePostgres) {
  // PostgreSQL for production (Render)
  const { Pool } = require('pg');
  
  db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  // Wrap pool methods to match sqlite3 API
  db.run = function(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    this.query(sql, params, (err, result) => {
      if (err) return callback(err);
      callback(err, { lastID: result?.rows?.[0]?.id });
    });
  };

  db.get = function(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    this.query(sql, params, (err, result) => {
      if (err) return callback(err);
      callback(err, result?.rows?.[0]);
    });
  };

  db.all = function(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    this.query(sql, params, (err, result) => {
      if (err) return callback(err);
      callback(err, result?.rows);
    });
  };

  db.serialize = function(callback) {
    callback();
  };

} else {
  // SQLite for local development
  const sqlite3 = require('sqlite3').verbose();
  const dbPath = path.join(__dirname, 'military_assets.db');
  db = new sqlite3.Database(dbPath);
}

const initDatabase = () => {
  if (usePostgres) {
    console.log('Using PostgreSQL database');
  }
  db.serialize(() => {
    // Users Table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('Admin', 'BaseCommander', 'LogisticsOfficer')),
        base_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Bases Table
    db.run(`
      CREATE TABLE IF NOT EXISTS bases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        location TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Equipment Types Table
    db.run(`
      CREATE TABLE IF NOT EXISTS equipment_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Asset Inventory Table
    db.run(`
      CREATE TABLE IF NOT EXISTS asset_inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        base_id INTEGER NOT NULL,
        equipment_type_id INTEGER NOT NULL,
        opening_balance INTEGER DEFAULT 0,
        closing_balance INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(base_id) REFERENCES bases(id),
        FOREIGN KEY(equipment_type_id) REFERENCES equipment_types(id)
      )
    `);

    // Purchases Table
    db.run(`
      CREATE TABLE IF NOT EXISTS purchases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        base_id INTEGER NOT NULL,
        equipment_type_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        purchase_date DATETIME NOT NULL,
        cost REAL,
        created_by INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(base_id) REFERENCES bases(id),
        FOREIGN KEY(equipment_type_id) REFERENCES equipment_types(id),
        FOREIGN KEY(created_by) REFERENCES users(id)
      )
    `);

    // Transfers Table
    db.run(`
      CREATE TABLE IF NOT EXISTS transfers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_base_id INTEGER NOT NULL,
        to_base_id INTEGER NOT NULL,
        equipment_type_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        transfer_date DATETIME NOT NULL,
        initiated_by INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(from_base_id) REFERENCES bases(id),
        FOREIGN KEY(to_base_id) REFERENCES bases(id),
        FOREIGN KEY(equipment_type_id) REFERENCES equipment_types(id),
        FOREIGN KEY(initiated_by) REFERENCES users(id)
      )
    `);

    // Assignments Table
    db.run(`
      CREATE TABLE IF NOT EXISTS assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        base_id INTEGER NOT NULL,
        personnel_id TEXT NOT NULL,
        equipment_type_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        assignment_date DATETIME NOT NULL,
        assigned_by INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(base_id) REFERENCES bases(id),
        FOREIGN KEY(equipment_type_id) REFERENCES equipment_types(id),
        FOREIGN KEY(assigned_by) REFERENCES users(id)
      )
    `);

    // Expenditures Table
    db.run(`
      CREATE TABLE IF NOT EXISTS expenditures (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        base_id INTEGER NOT NULL,
        equipment_type_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        expended_date DATETIME NOT NULL,
        reason TEXT,
        recorded_by INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(base_id) REFERENCES bases(id),
        FOREIGN KEY(equipment_type_id) REFERENCES equipment_types(id),
        FOREIGN KEY(recorded_by) REFERENCES users(id)
      )
    `);

    // Audit Log Table
    db.run(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id INTEGER,
        details TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    console.log('Database initialized successfully');
  });
};

const getDb = () => db;

module.exports = {
  db,
  getDb,
  initDatabase
};

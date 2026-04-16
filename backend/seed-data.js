const { db } = require('./database');
const { hashPassword } = require('./middleware/auth');

const seedDatabase = async () => {
  try {
    // Insert Demo Users
    const hashedAdminPass = await hashPassword('admin123');
    const hashedCommanderPass = await hashPassword('pass123');
    const hashedLogisticsPass = await hashPassword('pass123');

    db.run('INSERT INTO users (username, password, role, base_id) VALUES (?, ?, ?, ?)',
      ['admin', hashedAdminPass, 'Admin', null],
      function(err) {
        if (!err) console.log('✓ Admin user created');
      }
    );

    db.run('INSERT INTO users (username, password, role, base_id) VALUES (?, ?, ?, ?)',
      ['commander', hashedCommanderPass, 'BaseCommander', 1],
      function(err) {
        if (!err) console.log('✓ Base Commander created (Base 1)');
      }
    );

    db.run('INSERT INTO users (username, password, role, base_id) VALUES (?, ?, ?, ?)',
      ['logistics', hashedLogisticsPass, 'LogisticsOfficer', 1],
      function(err) {
        if (!err) console.log('✓ Logistics Officer created (Base 1)');
      }
    );

    // Insert Demo Bases
    db.run('INSERT INTO bases (name, location) VALUES (?, ?)',
      ['Base Alpha', 'Northern Region'],
      function(err) {
        if (!err) console.log('✓ Base Alpha created');
      }
    );

    db.run('INSERT INTO bases (name, location) VALUES (?, ?)',
      ['Base Bravo', 'Eastern Region'],
      function(err) {
        if (!err) console.log('✓ Base Bravo created');
      }
    );

    db.run('INSERT INTO bases (name, location) VALUES (?, ?)',
      ['Base Charlie', 'Southern Region'],
      function(err) {
        if (!err) console.log('✓ Base Charlie created');
      }
    );

    // Insert Equipment Types
    db.run('INSERT INTO equipment_types (name, description) VALUES (?, ?)',
      ['Rifles', 'Military-grade rifles for personnel'],
      function(err) {
        if (!err) console.log('✓ Equipment type: Rifles');
      }
    );

    db.run('INSERT INTO equipment_types (name, description) VALUES (?, ?)',
      ['Vehicles', 'Military vehicles and transport'],
      function(err) {
        if (!err) console.log('✓ Equipment type: Vehicles');
      }
    );

    db.run('INSERT INTO equipment_types (name, description) VALUES (?, ?)',
      ['Ammunition', 'Ammunition and munitions'],
      function(err) {
        if (!err) console.log('✓ Equipment type: Ammunition');
      }
    );

    db.run('INSERT INTO equipment_types (name, description) VALUES (?, ?)',
      ['Medical Supplies', 'Medical equipment and supplies'],
      function(err) {
        if (!err) console.log('✓ Equipment type: Medical Supplies');
      }
    );

    // Insert Asset Inventory
    db.run('INSERT INTO asset_inventory (base_id, equipment_type_id, opening_balance, closing_balance) VALUES (?, ?, ?, ?)',
      [1, 1, 100, 95],
      function(err) {
        if (!err) console.log('✓ Asset inventory: Base Alpha - Rifles');
      }
    );

    db.run('INSERT INTO asset_inventory (base_id, equipment_type_id, opening_balance, closing_balance) VALUES (?, ?, ?, ?)',
      [1, 2, 20, 19],
      function(err) {
        if (!err) console.log('✓ Asset inventory: Base Alpha - Vehicles');
      }
    );

    db.run('INSERT INTO asset_inventory (base_id, equipment_type_id, opening_balance, closing_balance) VALUES (?, ?, ?, ?)',
      [2, 1, 80, 78],
      function(err) {
        if (!err) console.log('✓ Asset inventory: Base Bravo - Rifles');
      }
    );

    db.run('INSERT INTO asset_inventory (base_id, equipment_type_id, opening_balance, closing_balance) VALUES (?, ?, ?, ?)',
      [3, 3, 5000, 4900],
      function(err) {
        if (!err) console.log('✓ Asset inventory: Base Charlie - Ammunition');
      }
    );

    // Insert Sample Purchases
    db.run(`INSERT INTO purchases (base_id, equipment_type_id, quantity, purchase_date, cost, created_by)
            VALUES (?, ?, ?, ?, ?, ?)`,
      [1, 1, 50, '2024-01-15', 15000, 1],
      function(err) {
        if (!err) console.log('✓ Sample purchase: 50 Rifles for Base Alpha');
      }
    );

    db.run(`INSERT INTO purchases (base_id, equipment_type_id, quantity, purchase_date, cost, created_by)
            VALUES (?, ?, ?, ?, ?, ?)`,
      [2, 1, 30, '2024-02-10', 9000, 1],
      function(err) {
        if (!err) console.log('✓ Sample purchase: 30 Rifles for Base Bravo');
      }
    );

    // Insert Sample Transfer
    db.run(`INSERT INTO transfers (from_base_id, to_base_id, equipment_type_id, quantity, transfer_date, initiated_by)
            VALUES (?, ?, ?, ?, ?, ?)`,
      [1, 2, 1, 5, '2024-03-01', 1],
      function(err) {
        if (!err) console.log('✓ Sample transfer: 5 Rifles from Base Alpha to Base Bravo');
      }
    );

    // Insert Sample Assignment
    db.run(`INSERT INTO assignments (base_id, personnel_id, equipment_type_id, quantity, assignment_date, assigned_by)
            VALUES (?, ?, ?, ?, ?, ?)`,
      [1, 'PERS001', 1, 1, '2024-03-05', 1],
      function(err) {
        if (!err) console.log('✓ Sample assignment: 1 Rifle to Personnel PERS001');
      }
    );

    // Insert Sample Expenditure
    db.run(`INSERT INTO expenditures (base_id, equipment_type_id, quantity, expended_date, reason, recorded_by)
            VALUES (?, ?, ?, ?, ?, ?)`,
      [1, 1, 5, '2024-03-10', 'Equipment maintenance and disposal', 1],
      function(err) {
        if (!err) console.log('✓ Sample expenditure: 5 Rifles expended at Base Alpha');
      }
    );

    console.log('\n✓ Database seeding completed successfully!');
    console.log('\nDemo credentials:');
    console.log('  Admin: admin / admin123');
    console.log('  Commander: commander / pass123 (Base 1)');
    console.log('  Logistics: logistics / pass123 (Base 1)');

  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    db.close();
  }
};

// Run seeding
seedDatabase();

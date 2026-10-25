const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
  console.log('Connecting to database host:', process.env.DB_HOST);
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    console.log('Altering "orders" table to add "payment_method" column...');

    try {
      await connection.execute(`
        ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50) DEFAULT 'Prepaid';
      `);
      console.log('✓ Added column "payment_method" to orders table.');
    } catch (err) {
      if (err.code === 'ER_DUP_COLUMN_NAME') {
        console.log('✓ Column "payment_method" already exists.');
      } else {
        throw err;
      }
    }

    // Update any existing orders without payment_method to 'Prepaid'
    await connection.execute(`
      UPDATE orders SET payment_method = 'Prepaid' WHERE payment_method IS NULL OR payment_method = ''
    `);
    console.log('✓ Initialized existing orders with payment_method = "Prepaid".');

    console.log('\nMigration complete!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await connection.end();
  }
}

migrate().catch(err => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});

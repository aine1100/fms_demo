const { Client } = require('pg');

async function dropAllTables() {
  const databases = ['fms_auth', 'fms_customer', 'fms_extinguisher', 'fms_inspection', 'fms_notification', 'fms_payment', 'fms_rules'];

  for (const db of databases) {
    const client = new Client({
      connectionString: `postgres://postgres:aine@localhost:5432/${db}`
    });

    try {
      await client.connect();
      console.log(`Connected to ${db}`);

      // Get all tables
      const result = await client.query(`
        SELECT tablename FROM pg_tables WHERE schemaname = 'public';
      `);

      // Drop all tables
      for (const { tablename } of result.rows) {
        try {
          await client.query(`DROP TABLE IF EXISTS "${tablename}" CASCADE;`);
          console.log(`✓ Dropped table '${tablename}' from ${db}`);
        } catch (err) {
          console.error(`Error dropping table '${tablename}':`, err.message);
        }
      }
    } catch (err) {
      console.error(`Error connecting to ${db}:`, err.message);
    } finally {
      await client.end();
    }
  }
}

dropAllTables();

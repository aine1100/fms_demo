const { Client } = require('pg');

async function dropOldSchemas() {
  const services = [
    { db: 'fms_auth', schemas: ['auth'] },
    { db: 'fms_customer', schemas: ['customer'] },
    { db: 'fms_extinguisher', schemas: ['extinguisher'] },
    { db: 'fms_inspection', schemas: ['inspection'] },
    { db: 'fms_notification', schemas: ['notification'] },
    { db: 'fms_payment', schemas: ['payment'] },
    { db: 'fms_rules', schemas: ['rules'] }
  ];

  for (const { db, schemas } of services) {
    const client = new Client({
      connectionString: `postgres://postgres:aine@localhost:5432/${db}`
    });

    try {
      await client.connect();
      console.log(`Connected to ${db}`);

      for (const schema of schemas) {
        try {
          await client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE;`);
          console.log(`✓ Dropped schema '${schema}' from ${db}`);
        } catch (err) {
          console.error(`Error dropping schema '${schema}':`, err.message);
        }
      }
    } catch (err) {
      console.error(`Error connecting to ${db}:`, err.message);
    } finally {
      await client.end();
    }
  }
}

dropOldSchemas();

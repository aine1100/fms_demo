const { Client } = require('pg');

async function createDatabases() {
  const client = new Client({
    connectionString: 'postgres://postgres:aine@localhost:5432/postgres'
  });

  try {
    await client.connect();
    console.log('Connected to Postgres');

    const databases = [
      'fms_auth',
      'fms_customer',
      'fms_extinguisher',
      'fms_notification',
      'fms_payment',
      'fms_inspection',
      'fms_rules'
    ];

    for (const db of databases) {
      try {
        await client.query(`CREATE DATABASE ${db};`);
        console.log(`Created database: ${db}`);
      } catch (err) {
        if (err.code === '42P04') {
          console.log(`Database ${db} already exists.`);
        } else {
          console.error(`Error creating database ${db}:`, err.message);
        }
      }
    }
  } catch (err) {
    console.error('Error connecting to postgres:', err.message);
  } finally {
    await client.end();
  }
}

createDatabases();

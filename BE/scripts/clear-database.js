const { Client } = require('pg');
require('dotenv').config();

async function clearDatabaseEntries() {
  const client = new Client({
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    await client.connect();
    console.log('[INFO] Connected to the database.');

    // Alle Einträge in den Tabellen löschen
    const clearTablesQuery = `
      DO $$ DECLARE
          r RECORD;
      BEGIN
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
              EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE';
          END LOOP;
      END $$;
    `;
    await client.query(clearTablesQuery);
    console.log(
      '[SUCCESS] All entries in the database tables have been cleared.',
    );

    await client.end();
    console.log('[INFO] Disconnected from the database.');
  } catch (err) {
    console.error(
      `[ERROR] Failed to clear the database entries: ${err.message}`,
    );
    process.exit(1); // Exit with failure
  }
}

clearDatabaseEntries();

import 'dotenv/config';

import { db, pool } from './index';
import * as schema from './schema';

import { getTableName, sql, Table } from 'drizzle-orm';
import * as readline from 'readline';

// Reset a single table
async function resetTable(table: Table) {
  return db.execute(
    sql.raw(`TRUNCATE TABLE ${getTableName(table)} RESTART IDENTITY CASCADE`)
  );
}

async function confirm(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

async function main() {
  const agreed = await confirm(
    '⚠️  WARNING: This will TRUNCATE ALL tables and restart identity.\nAre you sure you want to continue? (y/n): '
  );

  if (!agreed) {
    console.log('Aborted. No changes were made.');
    return;
  }

  try {
    for (const table of [
      schema.standsDriveTable,
      schema.standsGroupTable,
      schema.standsGuestTable,
      schema.trainingCertificatesTable,
      schema.licensesTable,
      schema.standsTable,
      schema.areasTable,
      schema.drivesTable,
      schema.groupsTable,
      schema.usersTable,
      schema.invitationsTable,
      schema.eventsTable,
      schema.guestsTable,
      schema.estatesTable,
    ]) {
      await resetTable(table);
    }
    console.log('> truncated tables \n> restarted identity \n ');
  } catch (error) {
    console.error('Error resetting tables:', error);
    process.exit(1);
  }
}

main()
  .then(async () => {
    if (pool) await pool.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error(err);
    if (pool) await pool.end();
    process.exit(1);
  });

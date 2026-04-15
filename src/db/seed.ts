import 'dotenv/config';
import { db, pool } from './index';
import * as schema from './schema';
import { usersTable } from './schema/users';
import { getTableName, sql, Table } from 'drizzle-orm';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

async function resetTable(table: Table) {
  return db.execute(
    sql.raw(`TRUNCATE TABLE ${getTableName(table)} RESTART IDENTITY CASCADE`)
  );
}

async function main() {
  try {
    for (const table of [
      schema.standsDriveTable,
      schema.standsGroupTable,
      schema.standsGuestTable,
      schema.trainingCertificatesTable,
      schema.licensesTable,
      schema.standsTable,
      schema.territoriesTable,
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
    console.log('> truncated tables \n> restarted identity \n');
  } catch (error) {
    console.error('Error resetting tables:', error);
    process.exit(1);
  }

  console.log('> seeding started');
  const startTime = Date.now();

  // Admin (always seeded)
  await db
    .insert(usersTable)
    .values({
      firstName: process.env.ADMIN_FIRST_NAME!,
      lastName: process.env.ADMIN_LAST_NAME!,
      email: process.env.ADMIN_EMAIL!,
      role: 'admin',
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD!, SALT_ROUNDS),
    })
    .returning();
  console.log('  Admin user inserted');

  // Mock data (only if SEED_MOCK_DATA=true)
  if (process.env.SEED_MOCK_DATA === 'true') {
    console.log('> SEED_MOCK_DATA enabled — seeding mock data...');
    const { seedMockData } = await import('./seed.mock');
    await seedMockData();
  } else {
    console.log('> SEED_MOCK_DATA disabled — skipping mock data');
  }

  const endTime = Date.now();
  const duration = endTime - startTime;
  console.log('\n \x1b[32m%s\x1b[0m', `\n> seeding finished (${duration} ms) \n`);
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

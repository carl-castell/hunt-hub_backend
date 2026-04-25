import 'dotenv/config';
import { db, pool } from './index';
import * as schema from './schema';
import { usersTable } from './schema/users';
import { accountsTable } from './schema/accounts';
import { getTableName, sql, Table } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import * as readline from 'readline';

const SALT_ROUNDS = 10;

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

async function resetTable(table: Table) {
  return db.execute(
    sql.raw(`TRUNCATE TABLE ${getTableName(table)} RESTART IDENTITY CASCADE`)
  );
}

async function main() {
  console.log('\x1b[33m%s\x1b[0m', '⚠️  WARNING: This will delete all data and reseed the database.');
  console.log(`   DB_PROVIDER: ${process.env.DB_PROVIDER}`);
  console.log(`   Admin email: ${process.env.ADMIN_EMAIL}\n`);

  const confirmed = await confirm('Are you sure you want to continue? (y/N): ');
  if (!confirmed) {
    console.log('Aborted.');
    process.exit(0);
  }

  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS postgis`);
  console.log('> PostGIS extension enabled');

  try {
    await db.execute(sql.raw(`TRUNCATE TABLE session`));
    console.log('> truncated session table');

    for (const table of [
      schema.driveStandAssignmentsTable,
      schema.driveGroupsTable,
      schema.templateStandAssignmentsTable,
      schema.templateGroupsTable,
      schema.templatesTable,
      schema.trainingCertificateAttachmentsTable,
      schema.huntingLicenseAttachmentsTable,
      schema.trainingCertificatesTable,
      schema.huntingLicensesTable,
      schema.drivesTable,
      schema.standsTable,
      schema.areasTable,
      schema.invitationsTable,
      schema.eventsTable,
      schema.userAuthTokensTable,
      schema.auditLogsTable,
      schema.accountsTable,
      schema.contactsTable,
      schema.usersTable,
      schema.estatesTable,
    ]) {
      await resetTable(table);
    }

    console.log('> truncated tables \n> restarted identity \n');
  } catch (error) {
    console.error('Error resetting tables:', error);
    process.exit(1);
  }

  await db.execute(sql`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'areas'
          AND column_name = 'geofile'
          AND data_type != 'USER-DEFINED'
      ) THEN
        ALTER TABLE areas
        ALTER COLUMN geofile
        SET DATA TYPE geometry(GeometryCollection, 4326)
        USING CASE
          WHEN geofile IS NOT NULL THEN ST_GeomFromGeoJSON(geofile)
          ELSE NULL
        END;
      END IF;
    END $$;
  `);
  console.log('> areas.geofile checked/migrated to geometry(GeometryCollection, 4326)');

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS areas_geofile_gist ON areas USING GIST (geofile)
  `);
  console.log('> GIST index created on areas.geofile');

  console.log('> seeding started');
  const startTime = Date.now();

  // Admin user
  const [adminUser] = await db
    .insert(usersTable)
    .values({
      firstName: process.env.ADMIN_FIRST_NAME!,
      lastName: process.env.ADMIN_LAST_NAME!,
      role: 'admin',
    })
    .returning();

  await db
    .insert(accountsTable)
    .values({
      userId: adminUser.id,
      email: process.env.ADMIN_EMAIL!,
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD!, SALT_ROUNDS),
      active: true,
    });

  console.log('  Admin user inserted');

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

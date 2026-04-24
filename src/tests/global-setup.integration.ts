import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import path from 'path';

export async function setup() {
  const url = 'postgresql://app:app@localhost:5434/appdb_test';
  const pool = new Pool({ connectionString: url, ssl: false });
  const db = drizzle(pool);
  await migrate(db, { migrationsFolder: path.resolve('./drizzle') });
  await pool.end();
}

// src/db/index.ts
import 'dotenv/config';
import * as schema from './schema';
import { Pool } from 'pg';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { neon } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';

const provider = process.env.DB_PROVIDER ?? 'local';

let pool: Pool | null = null;

const db =
  provider === 'neon'
    ? drizzleNeon(neon(process.env.NEON_DATABASE_URL!), { schema })
    : (() => {
        pool = new Pool({
          connectionString: process.env.LOCAL_DATABASE_URL!,
          ssl: false,
        });
        return drizzlePg(pool, { schema });
      })();

export { db, pool };
export type Db = typeof db;
export default db;

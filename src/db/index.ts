import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';


async function main() {
    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql);
}
main();
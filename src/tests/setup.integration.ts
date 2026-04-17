import { afterAll, beforeAll } from 'vitest';
import { db } from '@/db';
import { userAuthTokensTable, usersTable, estatesTable } from '@/db/schema';

beforeAll(async () => {
  await db.delete(userAuthTokensTable);
  await db.delete(usersTable);
  await db.delete(estatesTable);
});

afterAll(async () => {
  await db.delete(userAuthTokensTable);
  await db.delete(usersTable);
  await db.delete(estatesTable);
});

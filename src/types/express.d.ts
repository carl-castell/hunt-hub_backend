// src/types/express.d.ts
import type { InferSelectModel } from 'drizzle-orm';
import type { usersTable } from '../db/schema/users';
import type { accountsTable } from '../db/schema/accounts';

type SessionUser =
  InferSelectModel<typeof usersTable> &
  Pick<InferSelectModel<typeof accountsTable>, 'email' | 'active'>;

declare module 'express-session' {
  interface SessionData {
    user?: SessionUser;
  }
}

export {};

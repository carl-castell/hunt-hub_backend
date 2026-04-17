// src/types/express.d.ts
import type { InferSelectModel } from 'drizzle-orm';
import type { usersTable } from '../db/schema';

type User = Omit<InferSelectModel<typeof usersTable>, 'password'>;

declare module 'express-session' {
  interface SessionData {
    user?: User;
  }
}

export {};

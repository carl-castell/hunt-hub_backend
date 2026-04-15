// src/types/express.d.ts
import type { InferSelectModel } from 'drizzle-orm';
import type { usersTable } from '../db/schema';

type User = InferSelectModel<typeof usersTable>;

declare module 'express-session' {
  interface SessionData {
    user?: User;
  }
}

export {};

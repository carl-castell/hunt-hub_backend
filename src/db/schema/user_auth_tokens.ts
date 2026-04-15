import { pgTable, integer, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { usersTable } from './users';

export const tokenTypeEnum = pgEnum('token_type', ['activation', 'password_reset']);

export const userAuthTokensTable = pgTable('user_auth_tokens', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  token: varchar({ length: 255 }).notNull().unique(),
  type: tokenTypeEnum().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});

export const userAuthTokensRelations = relations(userAuthTokensTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [userAuthTokensTable.userId],
    references: [usersTable.id],
  }),
}));

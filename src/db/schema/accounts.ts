import { pgTable, integer, varchar, boolean, check } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { usersTable } from "./users";

export const accountsTable = pgTable("accounts", {
  userId: integer('user_id').primaryKey().references(() => usersTable.id, { onDelete: 'cascade' }),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }), // nullable — user sets password after clicking magic link invitation
  active: boolean().notNull().default(false),
}, (table) => ({
  activeRequiresPassword: check(
    'active_requires_password',
    sql`${table.active} = false OR ${table.password} IS NOT NULL`
  ),
}));

export const accountsRelations = relations(accountsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [accountsTable.userId],
    references: [usersTable.id],
  }),
}));

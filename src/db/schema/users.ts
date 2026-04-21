import { integer, pgTable, pgEnum, varchar, timestamp, check } from "drizzle-orm/pg-core";
import { relations, sql } from 'drizzle-orm';
import { estatesTable } from "./estates";
import { userAuthTokensTable } from "./user_auth_tokens";
import { accountsTable } from "./accounts";
import { guestsTable } from "./guests";
import { auditLogsTable } from "./audit_logs";

export const roleEnum = pgEnum('role', ['admin', 'manager', 'staff', 'guest']);

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }).notNull(),
  role: roleEnum().notNull(),
  estateId: integer('estate_id').references(() => estatesTable.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  estateIdRequiredForNonAdmin: check(
    'estate_id_required_for_non_admin',
    sql`${table.role} = 'admin' OR ${table.estateId} IS NOT NULL`
  ),
}));

export const usersRelations = relations(usersTable, ({ one, many }) => ({
  estate: one(estatesTable, {
    fields: [usersTable.estateId],
    references: [estatesTable.id],
  }),
  account: one(accountsTable, {
    fields: [usersTable.id],
    references: [accountsTable.userId],
  }),
  guest: one(guestsTable, {
    fields: [usersTable.id],
    references: [guestsTable.userId],
  }),

  authTokens: many(userAuthTokensTable),
  auditLogs: many(auditLogsTable),
}));

import { integer, pgTable, pgEnum, varchar, timestamp, check } from "drizzle-orm/pg-core";
import { relations, sql } from 'drizzle-orm';
import { estatesTable } from "./estates";
import { userAuthTokensTable } from "./user_auth_tokens";
import { accountsTable } from "./accounts";
import { contactsTable } from "./contacts";
import { auditLogsTable } from "./audit_logs";
import { driveGroupsTable } from "./drive_groups";
import { driveStandAssignmentsTable } from "./drive_stand_assignments";
import { huntingLicensesTable, trainingCertificatesTable } from "./licenses";

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
  contact: one(contactsTable, {
    fields: [usersTable.id],
    references: [contactsTable.userId],
  }),

  authTokens: many(userAuthTokensTable),
  auditLogs: many(auditLogsTable),
  ledGroups: many(driveGroupsTable),
  standAssignments: many(driveStandAssignmentsTable),
  huntingLicenses: many(huntingLicensesTable),
  trainingCertificates: many(trainingCertificatesTable),
}));

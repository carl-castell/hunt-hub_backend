import { integer, pgTable, pgEnum, varchar, check } from "drizzle-orm/pg-core";
import { relations, sql } from 'drizzle-orm';
import { estatesTable } from "./estates";
import { groupsTable } from "./groups";

export const roleEnum = pgEnum('role', ['admin', 'manager', 'staff']);

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  estateId: integer('estate_id'),
  firstName: varchar('first_name',{ length: 255 }).notNull(),
  lastName: varchar('last_name',{ length: 255 }).notNull(),
  email: varchar({ length: 255 }).unique().notNull(),
  role: roleEnum().notNull(),
  password: varchar({ length: 255 }),
}, (table) => ({
  estateIdRequiredForNonAdmin: check(
    'estate_id_required_for_non_admin',
    sql`${table.role} = 'admin' OR ${table.estateId} IS NOT NULL`
  ),
}));

export const usersRelations = relations(usersTable, ({ one, many  }) => ({
  group: many(groupsTable),
  estate: one(estatesTable, {
    fields: [usersTable.estateId],
    references: [estatesTable.id],
  })
}));

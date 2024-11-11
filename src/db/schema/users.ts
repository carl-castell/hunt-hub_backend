import { integer, pgTable, pgEnum, varchar } from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';
import { estatesTable } from "./estates";

export const roleEnum = pgEnum('role', ['admin', 'user', 'group_leader']);


export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  estateId: integer('estate_id'),
  firstName: varchar('first_name',{ length: 255 }).notNull(),
  lastName: varchar('last_name',{ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  role: roleEnum().notNull(),
  password: varchar({ length: 255 }),
});

export const usersRelations = relations(usersTable, ({ one }) => ({
  estate: one(estatesTable, {
    fields: [usersTable.estateId],
    references: [estatesTable.id],
  })
}));
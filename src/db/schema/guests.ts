import { integer, pgTable, varchar, date } from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';
import { usersTable } from "./users";
import { huntingLicensesTable, trainingCertificatesTable } from "./licenses";

export const guestsTable = pgTable("guests", {
  userId: integer('user_id').primaryKey().references(() => usersTable.id, { onDelete: 'cascade' }),
  email: varchar({ length: 255 }).notNull(),
  phone: varchar({ length: 255 }),
  dateOfBirth: date('date_of_birth'),
  rating: integer(),
});

export const guestsRelations = relations(guestsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [guestsTable.userId],
    references: [usersTable.id],
  }),
}));
